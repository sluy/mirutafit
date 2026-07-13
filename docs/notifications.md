# Notificaciones por Telegram

Envía avisos a un chat de Telegram cuando alguien **visita** una página estática o
una encuesta, y cuando alguien **responde** una encuesta (con un PDF de las
respuestas adjunto). Todo es anecdótico y best-effort: si el bot no está
configurado o Telegram falla, la web sigue funcionando igual.

## Por qué Telegram y por qué no es complicado

La Bot API de Telegram es HTTP plano, sin SDK:

- Mensaje de texto → `POST https://api.telegram.org/bot<TOKEN>/sendMessage`
  con `{ chat_id, text, parse_mode: "HTML" }`.
- Adjuntar un archivo (el PDF) → `POST .../sendDocument` como `multipart/form-data`
  con el campo `document` = el PDF y `chat_id` en el cuerpo.

No hace falta webhook ni servidor a la escucha: nosotros somos los que llamamos.

## Configuración (admin)

`system_setting` gana una clave nueva: **`telegram`**

```ts
type TelegramSettings = {
  enabled: boolean;   // interruptor maestro
  botToken: string;   // token que da @BotFather
  chatId: string;     // id del chat/canal destino (número, o @canal)
};
```

Se edita en **`/admin/site/general`** con un bloque propio (`TelegramSettingsForm`),
independiente del form de SEO para no tocar código estable. Incluye:

- switch "activar", token (campo password con ojo), chat id;
- botón **"Probar"** que manda un mensaje de prueba y muestra el error si lo hay.

### Cómo obtener token y chat id (para el usuario)

1. Hablar con **@BotFather** en Telegram → `/newbot` → copiar el token.
2. Escribirle algo al bot (o añadirlo a un grupo).
3. Chat id: abrir `https://api.telegram.org/bot<TOKEN>/getUpdates` y leer
   `message.chat.id`. Para un canal, usar `@nombre_del_canal`.

## Flags por entidad (schema)

```prisma
model StaticPage { … notifyViews Boolean @default(false) }
model Survey     { … notifyViews Boolean @default(false)
                     notifyResponses Boolean @default(false) }
```

- Página estática: check **"Notificar visitas"** en su editor.
- Encuesta: checks **"Notificar visitas"** y **"Notificar respuestas"**.

Migración: `add_telegram_notifications`.

## Puntos de enganche

| Evento | Dónde | Acción |
|---|---|---|
| Visita a encuesta | `POST /api/views` (key `survey:<id>`) | tras `recordView`, `notifySurveyView` si `notifyViews` |
| Visita a página estática | route handler `/static/[slug]` | `recordView('page:'+slug)` + `notifyStaticPageView` si `notifyViews` |
| Respuesta a encuesta | `submitSurveyResponse` (lib) | si `notifyResponses`: PDF + `sendDocument` + mensaje |

La página estática se sirve como HTML crudo (route handler, sin layout ni React),
así que **no** puede montar el `<ViewCounter>` de cliente: contamos y notificamos
en el servidor. Eso también resuelve el conteo de visitas de páginas estáticas,
que quedaba pendiente.

## Datos anecdóticos ("de dónde")

De las cabeceras de la petición, best-effort:

- IP: `x-forwarded-for` (primera) / `x-real-ip`.
- País: `cf-ipcountry` (Cloudflare) / `x-vercel-ip-country` si el proxy lo pone.
- Navegador: `user-agent`.

No añadimos un servicio externo de geolocalización por ahora (evitamos una
dependencia y un punto de fallo). Si más tarde se quiere ciudad/región exacta,
se puede llamar a una API de geo-IP desde `visitorFromHeaders`. "Luego corregimos".

## PDF de respuestas

Librería: **`pdf-lib`** (JS puro, sin binarios ni ficheros de fuente → compatible
con `output: standalone`). Un helper `buildSurveyResponsePdf` dibuja:

- **Cabecera**: nombre de la encuesta + fecha/hora de la respuesta.
- **Cuerpo**: cada pregunta con su respuesta, con salto de línea y paginación
  automáticos (wrapping manual sobre `StandardFonts.Helvetica`).

**Nombre del archivo**: `YYYY-MM-DD - <encuesta> - <persona>.pdf`.
El "nombre de la persona" se toma de la respuesta a la primera pregunta cuya
etiqueta contenga "nombre"/"name"; si no hay, `Anónimo`.

## Módulos nuevos / tocados

- `src/lib/telegram.ts` — `sendTelegramMessage`, `sendTelegramDocument`, config helpers.
- `src/lib/notify.ts` — `visitorFromHeaders`, `notifyStaticPageView`,
  `notifySurveyView`, `notifySurveyResponse` (orquestan texto + PDF; tragan errores).
- `src/lib/survey-pdf.ts` — `buildSurveyResponsePdf`.
- `src/lib/settings.ts` — `TelegramSettings` + get/save.
- `src/app/api/views/route.ts` — llama a `notify*` tras contar.
- `src/app/static/[slug]/route.ts` — cuenta + notifica visita.
- `src/lib/surveys.ts` — notifica respuesta tras guardar.
- Admin: `TelegramSettingsForm` + acción; checkboxes en editores de encuesta y página.

## Historial detallado de visitas

Además del contador rápido (`PageView.count`), cada visita se guarda como fila en
**`ViewEvent`** (fecha/hora, IP, país/ciudad, navegador, referer). Esto alimenta
la página **`/admin/visits?key=<key>`**, a la que se llega haciendo clic en el
número de "Visitas" (encuestas, páginas estáticas y las tarjetas del dashboard).

- El evento se inserta en `after()` (post-respuesta), nunca frena la carga.
- **Geolocalización por IP** (`src/lib/geo.ts`, `ipwho.is`, HTTPS, sin API key),
  best-effort. Es del lado servidor y silenciosa — no usamos `navigator.geolocation`
  porque dispararía un permiso al visitante. IPs privadas/localhost no dan geo.
- El `referer` (origen de tráfico) del beacon lo manda el cliente como
  `document.referrer`; en la ruta estática viene de la cabecera `referer`.
- La tabla parsea el user-agent a navegador/SO (`src/lib/user-agent.ts`) y muestra
  la bandera del país. Incluye un resumen de países principales.

## Seguridad / robustez

- El token vive solo en la BD (`system_setting`), nunca en el cliente ni en el repo.
- Toda llamada a Telegram y la generación de PDF van en `try/catch`: un fallo
  **nunca** rompe la vista ni el envío de la encuesta.
- Las notificaciones de visita se disparan por visita (el beacon de cliente ya
  deduplica por sesión; las estáticas cuentan cada hit). Si resultara ruidoso,
  se puede añadir un rate-limit por clave más adelante.
