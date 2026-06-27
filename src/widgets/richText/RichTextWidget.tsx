import type { CSSProperties } from "react";
import { getLocale } from "next-intl/server";
import { resolveText } from "../i18n";
import type { RichTextConfig } from "../types";

/** Frontend render for the Rich Text widget. Server component. */
export default async function RichTextWidget({ config }: { config: RichTextConfig }) {
  const locale = await getLocale();
  const html = resolveText(config.html, locale);
  const heightMode = config.heightMode ?? "auto";
  const bg = config.bg ?? "transparent";

  const style: CSSProperties = {};
  if (bg && bg !== "transparent") style.backgroundColor = bg;
  if (heightMode === "fixed") {
    style.height = `${config.height ?? 400}px`;
    style.overflowY = "auto";
  } else if (heightMode === "full") {
    style.height = "100dvh";
    style.overflowY = "auto";
  }
  // "auto": no height set → the widget is exactly as tall as its content.

  return (
    <div style={style}>
      <div
        className="tiptap mx-auto w-full max-w-3xl px-4 py-8"
        // Content is authored by admins in the WYSIWYG editor.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
