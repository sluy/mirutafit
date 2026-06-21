import type { RichTextConfig } from "../types";

/** Frontend render for the Rich Text widget. Server component. */
export default function RichTextWidget({ config }: { config: RichTextConfig }) {
  return (
    <div
      className="tiptap mx-auto w-full max-w-3xl px-4"
      // Content is authored by admins in the WYSIWYG editor.
      dangerouslySetInnerHTML={{ __html: config.html ?? "" }}
    />
  );
}
