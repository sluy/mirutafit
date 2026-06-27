# Community module

A public **comment wall** (testimonials) that visitors can post to, with admin
moderation and admin-seeded comments.

## Pieces

- **DB:** `Comment` (`prisma/schema.prisma`, table `comment`). Fields: `name`,
  `message`, `avatarColor`, `status` (`pending` | `approved` | `hidden`),
  `source` (`community` | `admin`), `createdAt`.
- **Settings** (`src/lib/settings.ts`, key `community`): `autoApprove` — when on,
  new comments are published immediately (post-moderation); default off
  (pre-moderation). Toggled from the moderation page.
- **Logic** (`src/lib/community.ts`): `submitComment` (visitor; pending unless
  auto-approve), `listPublicComments` (approved only), `listAdminComments`,
  `getPendingCommentCount`, `createSeedComment` (admin, auto-approved),
  `setCommentStatus`, `deleteComment`.

## The widget (page builder)

Registry key `community` (`src/widgets/community/*`). Server component renders a
wall of **approved** comments + an optional submission form (`CommentForm`,
client). Config (`CommunityConfig` in `src/widgets/types.ts`): eyebrow / heading /
subtitle, `count` (max comments), `showForm` + form title/subtitle, and
`emptyText`. Submission goes through the public action `submitCommentAction`
(`src/widgets/community/actions.ts`) with a hidden **honeypot**. Form chrome is
translated under `widgets.community.*`. On submit the visitor sees either an
"approved / on the wall" or a "pending review" message depending on the policy.

## Admin moderation — `/admin/community/comments`

A top **auto-approve** toggle, an **add-comment** form (admin-seeded, approved
immediately, `source = admin`), filter tabs **All / Pending / Approved / Hidden**
(pending count badge), and per-comment **Approve / Hide / Show / Delete**. Sidebar
top-level link **"Community"**.

## Notes

- Pre-moderation is the default so spam never reaches the public wall. Flip
  `autoApprove` for low-friction post-moderation.
- Widget text is single-language (config), like the other widgets.
- Supersedes the legacy optimistic `src/components/Community.tsx`.
