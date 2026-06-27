# Auth & roles

Powered by **better-auth** (`src/lib/auth.ts`). **Email + password**, plus
**Google OAuth** (admin-configurable — see "Social login" below). Facebook
slots in the same way.

## Roles & ban

The better-auth **admin plugin** provides roles and ban out of the box.

- `role` is a comma-separated string, so a user can hold several roles.
  Defaults to `"user"`. Admins have `"admin"`.
- Banning is a separate state (`banned` boolean + `banReason` + `banExpires`),
  not a role. A banned user keeps their role but cannot sign in.

### Forced admins

Emails in the `ADMIN_EMAILS` env var (`admin@mirutafit.com`,
`sluy1283@gmail.com`) are promoted to `admin` automatically on signup, via a
`databaseHooks.user.create.before` hook in `src/lib/auth.ts`.

## Reading the session

Server (Server Components, route handlers, server actions):

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
// session?.user.role, session?.user.banned, ...
```

Client:

```ts
import { useSession } from "@/lib/auth-client";
const { data: session } = useSession();
```

## Protecting admin routes

`src/app/admin/layout.tsx` reads the session server-side and redirects to
`/login` unless the user is a non-banned admin. Helpers live in
`src/lib/auth-guard.ts`.

## Password recovery

Custom **code-based** flow at `/forgot-password` (not better-auth's link/token
flow): enter email → receive a one-time code by email → enter code → set a new
password. Built on the reusable verification-code module
(`src/lib/verification-codes.ts`, purpose `password_reset`) and the mailer.

- The new password is written with better-auth's own hasher
  (`hashPassword` from `better-auth/crypto`) onto the `credential` account — see
  `src/lib/account-password.ts` — so normal sign-in keeps working.
- Code rules (length, charset, expiry, max attempts) are admin-configurable at
  `/admin/system/codes` (stored under the `codePolicy` setting).
- The verification-code module is generic: reuse it for any "send a code, then
  check it" flow by choosing a unique `purpose`.

## Custom profile fields

`firstName, lastName, country, phone` are declared as `user.additionalFields`
in `src/lib/auth.ts` and mirrored as columns in `prisma/schema.prisma`. The
browser client keeps them typed via `inferAdditionalFields`. `language` is also
an additional field, set automatically at signup (see [i18n](i18n.md)).

## Social login (OAuth)

Configured from the **admin**, not env. Credentials live in the `oauth`
`system_setting` (`getOauthSettings`/`saveOauthSettings`), edited under
**Admin → Users → Settings** (`GoogleLoginSettings`): an enable toggle + Client
ID + Secret (the secret is write-only, like the SMTP password).

- `src/lib/auth.ts` reads the settings via **top-level await** and passes
  `socialProviders.google` to better-auth. Because better-auth builds the
  provider config at startup, **changing the Client ID/Secret needs a server
  restart**; the enable toggle only controls the button (live).
- Login/register render `<SocialLoginButtons>` which shows "Continue with Google"
  when `getSocialLoginConfig().google` is true, then calls
  `signIn.social({ provider: "google", callbackURL: "/" })`.
- **Redirect URI** to whitelist in Google Cloud Console:
  `{origin}/api/auth/callback/google` (e.g. `http://localhost:3000/...` in dev).
- Facebook follows the identical pattern (add a `facebook` provider + fields).

## Env vars

- `BETTER_AUTH_SECRET` — signing secret (generate with
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`).
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` — canonical app URL.
- `ADMIN_EMAILS` — comma-separated forced-admin emails.
