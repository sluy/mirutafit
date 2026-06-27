"use client";

import { useState, type ReactNode } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import { useTranslations } from "next-intl";
import MediaPicker from "@/components/admin/media/MediaPicker";
import {
  ImageIcon,
  VideoIcon,
  LinkIcon,
  ExternalLinkIcon,
  QuoteIcon,
} from "@/components/icons";
import { Video, toEmbedUrl } from "./tiptapVideo";

/**
 * Full Word-like article body editor (Tiptap). Emits HTML via `onChange`.
 * Images and videos are inserted from the Media library (MediaPicker); videos
 * can also be embedded from a YouTube/Vimeo URL.
 */
export default function ArticleEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false }),
      Video,
    ],
    content: value,
    immediatelyRender: false, // avoid SSR hydration mismatch
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "tiptap focus:outline-none" },
    },
  });

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="max-h-[65vh] overflow-y-auto p-4" />
    </div>
  );
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];

function Toolbar({ editor }: { editor: Editor }) {
  const t = useTranslations("admin.articles.editor");
  const [imageOpen, setImageOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(t("linkUrl"), prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const embedVideo = () => {
    const url = window.prompt(t("videoUrl"), "https://");
    if (!url) return;
    editor.chain().focus().setVideo({ src: toEmbedUrl(url), embed: true }).run();
  };

  const inTable = editor.isActive("table");

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 bg-gray-50 p-2">
        {/* Headings */}
        <Btn label="¶" title={t("paragraph")} on={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} />
        <Btn label="H1" on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} />
        <Btn label="H2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} />
        <Btn label="H3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} />

        <Sep />

        {/* Inline marks */}
        <Btn label="B" className="font-bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
        <Btn label="I" className="italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
        <Btn label="U" className="underline" on={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} />
        <Btn label="S" className="line-through" on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} />
        <Btn label="</>" title={t("code")} on={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} />

        <Sep />

        {/* Color + highlight + font size */}
        <ColorControl
          title={t("color")}
          value={(editor.getAttributes("textStyle").color as string) ?? "#0a1410"}
          onChange={(c) => editor.chain().focus().setColor(c).run()}
          onClear={() => editor.chain().focus().unsetColor().run()}
        />
        <ColorControl
          title={t("highlight")}
          swatch="bg"
          value={(editor.getAttributes("highlight").color as string) ?? "#fde68a"}
          onChange={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()}
          onClear={() => editor.chain().focus().unsetHighlight().run()}
        />
        <select
          title={t("fontSize")}
          value={(editor.getAttributes("textStyle").fontSize as string) ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v) editor.chain().focus().setFontSize(v).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
          className="rounded-md border border-ink/10 bg-white px-1.5 py-1 text-xs text-ink/70"
        >
          <option value="">{t("fontSizeDefault")}</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s.replace("px", "")}</option>
          ))}
        </select>

        <Sep />

        {/* Alignment */}
        <Btn label="⬅" title={t("alignLeft")} on={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} />
        <Btn label="⬌" title={t("alignCenter")} on={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} />
        <Btn label="➡" title={t("alignRight")} on={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} />
        <Btn label="≡" title={t("alignJustify")} on={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} />

        <Sep />

        {/* Lists / blocks */}
        <Btn label="• List" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
        <Btn label="1. List" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
        <Btn icon={<QuoteIcon width={15} height={15} />} title={t("blockquote")} on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} />
        <Btn label="{ }" title={t("codeBlock")} on={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} />
        <Btn label="―" title={t("rule")} on={() => editor.chain().focus().setHorizontalRule().run()} />

        <Sep />

        {/* Link / media / table */}
        <Btn icon={<LinkIcon width={15} height={15} />} title={t("link")} on={setLink} active={editor.isActive("link")} />
        <Btn icon={<ImageIcon width={15} height={15} />} title={t("image")} on={() => setImageOpen(true)} />
        <Btn icon={<VideoIcon width={15} height={15} />} title={t("videoLibrary")} on={() => setVideoOpen(true)} />
        <Btn icon={<ExternalLinkIcon width={15} height={15} />} title={t("videoEmbed")} on={embedVideo} />
        <Btn label="⊞" title={t("table")} on={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={inTable} />

        <Sep />

        {/* History / clear */}
        <Btn label="↶" title={t("undo")} on={() => editor.chain().focus().undo().run()} />
        <Btn label="↷" title={t("redo")} on={() => editor.chain().focus().redo().run()} />
        <Btn label="⌫" title={t("clearFormat")} on={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
      </div>

      {/* Contextual table controls */}
      {inTable && (
        <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 bg-brand/5 px-2 py-1.5 text-xs">
          <span className="mr-1 font-semibold uppercase tracking-wide text-ink/40">{t("table")}</span>
          <MiniBtn label={t("addColBefore")} on={() => editor.chain().focus().addColumnBefore().run()} />
          <MiniBtn label={t("addColAfter")} on={() => editor.chain().focus().addColumnAfter().run()} />
          <MiniBtn label={t("delCol")} on={() => editor.chain().focus().deleteColumn().run()} />
          <MiniBtn label={t("addRowBefore")} on={() => editor.chain().focus().addRowBefore().run()} />
          <MiniBtn label={t("addRowAfter")} on={() => editor.chain().focus().addRowAfter().run()} />
          <MiniBtn label={t("delRow")} on={() => editor.chain().focus().deleteRow().run()} />
          <MiniBtn label={t("toggleHeader")} on={() => editor.chain().focus().toggleHeaderRow().run()} />
          <MiniBtn label={t("delTable")} danger on={() => editor.chain().focus().deleteTable().run()} />
        </div>
      )}

      <MediaPicker
        open={imageOpen}
        accept="image"
        onClose={() => setImageOpen(false)}
        onSelect={(file) =>
          editor.chain().focus().setImage({ src: `/media/${file.fileName}`, alt: file.name }).run()
        }
      />
      <MediaPicker
        open={videoOpen}
        accept="video"
        onClose={() => setVideoOpen(false)}
        onSelect={(file) =>
          editor.chain().focus().setVideo({ src: `/media/${file.fileName}`, embed: false }).run()
        }
      />
    </>
  );
}

function Btn({
  on,
  active,
  label,
  icon,
  title,
  className = "",
}: {
  on: () => void;
  active?: boolean;
  label?: string;
  icon?: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        on();
      }}
      className={`grid min-w-8 place-items-center rounded-md px-2 py-1 text-sm font-medium transition-colors ${
        active ? "bg-brand text-white" : "text-ink/70 hover:bg-ink/5"
      } ${className}`}
    >
      {icon ?? label}
    </button>
  );
}

function MiniBtn({
  on,
  label,
  danger,
}: {
  on: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        on();
      }}
      className={`rounded px-2 py-0.5 font-medium transition-colors ${
        danger ? "text-red-600 hover:bg-red-50" : "text-ink/60 hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function ColorControl({
  title,
  value,
  onChange,
  onClear,
  swatch = "fg",
}: {
  title: string;
  value: string;
  onChange: (color: string) => void;
  onClear: () => void;
  swatch?: "fg" | "bg";
}) {
  return (
    <span className="relative inline-flex items-center" title={title}>
      <label className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-sm font-bold text-ink/70 hover:bg-ink/5">
        <span
          className="pointer-events-none flex h-5 w-5 items-center justify-center rounded"
          style={swatch === "bg" ? { backgroundColor: value } : { color: value }}
        >
          A
        </span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <button
        type="button"
        title={`${title} ✕`}
        onMouseDown={(e) => {
          e.preventDefault();
          onClear();
        }}
        className="-ml-0.5 text-[10px] text-ink/30 hover:text-ink/60"
      >
        ✕
      </button>
    </span>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-ink/10" />;
}
