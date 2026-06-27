import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Custom Tiptap node for videos inside articles. Two flavours, both stored as a
 * single `<div class="article-video">` wrapper so the public page can render the
 * exact same markup (responsive via CSS):
 *
 *   • A Media-library file → `<video controls src="/media/<file>">`.
 *   • An external embed (YouTube / Vimeo) → `<iframe src="…/embed/…">`.
 */
export interface VideoAttributes {
  src: string | null;
  embed: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      /** Insert a video node (media file or embed). */
      setVideo: (options: { src: string; embed?: boolean }) => ReturnType;
    };
  }
}

export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      embed: { default: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.article-video",
        getAttrs: (el) => ({
          src: (el as HTMLElement).getAttribute("data-src"),
          embed: (el as HTMLElement).getAttribute("data-embed") === "true",
        }),
      },
    ];
  },

  renderHTML({ node }) {
    const src = (node.attrs.src as string) ?? "";
    const embed = Boolean(node.attrs.embed);
    const inner = embed
      ? [
          "iframe",
          {
            src,
            frameborder: "0",
            allowfullscreen: "true",
            allow:
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          },
        ]
      : ["video", { src, controls: "true", preload: "metadata" }];

    return [
      "div",
      mergeAttributes({
        class: "article-video",
        "data-src": src,
        "data-embed": embed ? "true" : "false",
      }),
      inner,
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { src: options.src, embed: options.embed ?? false },
          }),
    };
  },
});

/** Normalise a YouTube/Vimeo watch URL into its embeddable form. */
export function toEmbedUrl(raw: string): string {
  const url = raw.trim();
  // YouTube: youtu.be/ID or youtube.com/watch?v=ID
  const yt =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/) ??
    url.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo: vimeo.com/ID
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  // Already an embed/other URL — use as-is.
  return url;
}
