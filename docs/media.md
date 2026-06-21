# Media & uploads

Two separate file areas:

| Area | Where | Served at | Privacy |
| ---- | ----- | --------- | ------- |
| **Media library** (admin) | `storage/media/` (outside `public/`) | `/media/<fileName>` (route handler) | public or **private** (admins only) |
| **User uploads** (e.g. avatars) | `public/uploads/...` | `/uploads/...` (static) | always public |

Files are stored on disk as `<uuid><ext>`; the friendly display name lives in the
DB (`MediaFile.name`). Image dimensions/thumbnails use `sharp`.

## Admin Media library

- UI: `/admin/media` — a Drive-style file manager (`src/components/admin/media/`).
  Folders (nested), upload (button + drag-drop), grid with thumbnails (image
  thumbs on the fly; videos preview on hover), file details dialog with rename,
  public/private toggle, copy link, basic image edits (rotate/flip), delete.
- Upload endpoint: `POST /api/media/upload` (multipart, admin-only).
- Serving + privacy + on-the-fly thumbnails: `src/app/media/[fileName]/route.ts`
  (`?thumb=1` returns a resized webp). Private files 404 for non-admins.
- Metadata ops: server actions in `src/app/admin/media/actions.ts`.
- Image ops (rotate/flip) + thumbnails: `src/lib/media.ts`; disk IO:
  `src/lib/media-storage.ts`.

## Reusable picker (the "plugin")

`src/components/admin/media/MediaPicker.tsx` — open it from any section to let an
admin pick an existing library file (e.g. a banner background later):

```tsx
const [open, setOpen] = useState(false);
<MediaPicker open={open} accept="image"
  onClose={() => setOpen(false)}
  onSelect={(file) => save(file.fileName)} />
```

It reads `GET /api/media/list?folder=<id>` (admin-only).

## User avatars

`POST /api/account/avatar` (any signed-in user) normalizes the image to a 256×256
webp, stores it under `public/uploads/avatars/`, and sets `User.image`. UI:
`AvatarUploader` on `/account`.

## Production (EasyPanel)

`storage/media` and `public/uploads` hold runtime files — mount them as
**persistent volumes** so uploads survive redeploys. Override the library path
with the `MEDIA_DIR` env var if needed.

## Editing files

From a file's details dialog:

- **Images**: rotate, flip, and **crop** (interactive, `react-image-crop` →
  `sharp.extract`).
- **Text / JSON / SVG**: a plain code editor (textarea).
- **HTML**: the reusable **WYSIWYG** editor (`src/components/ui/RichTextEditor.tsx`,
  Tiptap) — also usable anywhere else in the app.

## Not done yet (follow-ups)

- Static **video thumbnails** (poster) — needs ffmpeg; hover-preview works today.
- HTTP **range requests** for large video streaming.
