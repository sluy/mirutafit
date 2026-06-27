# Contact module

Lets public visitors send messages through a configurable **Contact widget**, with
an admin inbox (read/unread) and email notifications to a configurable recipient.

## Pieces

- **DB:** `ContactMessage` (`prisma/schema.prisma`, table `contact_message`).
  Fields: `mode` (`person` | `brand`), `name`, `email`, `phone?`, `topic?`,
  `subject`, `message`, `isRead`, `readAt?`, `createdAt`.
- **Settings** (`src/lib/settings.ts`, key `contact`): `recipientEmail`
  (default `sluy1283@gmail.com`), `fromEmail` (default `contacto@mirutafit.com`),
  `fromName`, `notify`. All editable at **`/admin/contact/settings`**.
- **Logic** (`src/lib/contact.ts`): `submitContactMessage` (validate → save →
  best-effort notify), `listContactMessages`, `getUnreadContactCount`,
  `setContactMessageRead`, `markAllContactRead`, `deleteContactMessage`.
- **Email:** reuses `sendMail` (`src/lib/mailer.ts`), now with an optional
  `from` override + `replyTo`. Contact notifications are sent **from** the
  configured `fromEmail`, **to** `recipientEmail`, with **Reply-To** set to the
  visitor — so replying goes straight back to them. Delivery still uses the SMTP
  account from System → Email; a failed send never fails the submission.

## The widget (page builder)

Registry key `contact` (`src/widgets/contact/*`) — a configurable banner + form,
placed in any layout like the other widgets. Two modes (**person** / **brand**,
i.e. regular vs. sponsor) each with their own banner copy, selling points, and
topic list. Config (`ContactConfig` in `src/widgets/types.ts`) covers the
eyebrow/heading/subtitle, section background, the mode toggle + default mode,
banner contact info, and per-mode content. Form chrome (field labels, buttons,
success/error) is translated under `widgets.contact.*`.

Submission goes through the public server action
`submitContactMessageAction` (`src/widgets/contact/actions.ts`), which includes a
hidden **honeypot** field (`website`) to deflect bots.

## Admin inbox — `/admin/contact/messages`

Lists the latest messages, filterable **All / Unread / Read**. Each row expands
to show the full message + the visitor's email/phone (click-to-mail/call);
opening an unread message marks it read (stamping `readAt`). Per-message
**mark read/unread** and **delete**, plus **mark all as read**. Unread count is
shown on the filter tab. Sidebar group **"Contact"** → Messages, Settings.

## Notes / open items

- Widget text is single-language (stored in config), matching the other widgets;
  the i18n migration of widget copy is a separate roadmap item.
- The legacy marketing `src/components/Contact.tsx` (simulated submit) is
  superseded by this widget and is only used by the default home fallback.
