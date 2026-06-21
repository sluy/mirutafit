"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

/**
 * Reusable WYSIWYG editor (Tiptap). Emits HTML via `onChange`.
 * Used for rich/html content in the Media library and reusable anywhere else.
 */
export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
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
      <EditorContent editor={editor} className="max-h-[55vh] overflow-y-auto p-4" />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const Btn = ({
    on,
    active,
    label,
  }: {
    on: () => void;
    active?: boolean;
    label: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        on();
      }}
      className={`min-w-8 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
        active ? "bg-brand text-white" : "text-ink/70 hover:bg-ink/5"
      }`}
    >
      {label}
    </button>
  );

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 bg-gray-50 p-2">
      <Btn label="B" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
      <Btn label="I" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
      <Btn label="S" on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} />
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <Btn label="H1" on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} />
      <Btn label="H2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} />
      <Btn label="¶" on={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} />
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <Btn label="• List" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
      <Btn label="1. List" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
      <Btn label="❝" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} />
      <Btn label="🔗" on={setLink} active={editor.isActive("link")} />
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <Btn label="↶" on={() => editor.chain().focus().undo().run()} />
      <Btn label="↷" on={() => editor.chain().focus().redo().run()} />
    </div>
  );
}
