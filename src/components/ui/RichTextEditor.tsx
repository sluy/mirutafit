"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

/**
 * Reusable WYSIWYG editor (Tiptap). Emits HTML via `onChange`.
 * Used for rich/html content in the Media library and reusable anywhere else.
 *
 * The "</>" toolbar button toggles a raw-HTML source view: a textarea where you
 * can hand-write/paste HTML. Editing there saves the HTML verbatim; switching
 * back to the visual editor re-parses it through Tiptap (which may normalize or
 * drop tags its schema doesn't support).
 */
export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [source, setSource] = useState(false);
  const [draft, setDraft] = useState(value); // raw HTML while in source mode

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

  const openSource = () => {
    setDraft(editor.getHTML());
    setSource(true);
  };

  const closeSource = () => {
    // Push the hand-written HTML back into the editor, then report the
    // normalized result to the parent.
    editor.commands.setContent(draft);
    onChange(editor.getHTML());
    setSource(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10">
      <Toolbar
        editor={editor}
        source={source}
        onToggleSource={source ? closeSource : openSource}
      />
      {source ? (
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange(e.target.value);
          }}
          spellCheck={false}
          className="block max-h-[55vh] min-h-[180px] w-full resize-y overflow-y-auto bg-gray-50/60 p-4 font-mono text-xs leading-relaxed text-ink focus:outline-none"
          placeholder="<p>Escribe o pega HTML…</p>"
        />
      ) : (
        <EditorContent editor={editor} className="max-h-[55vh] overflow-y-auto p-4" />
      )}
    </div>
  );
}

function Toolbar({
  editor,
  source,
  onToggleSource,
}: {
  editor: Editor;
  source: boolean;
  onToggleSource: () => void;
}) {
  const Btn = ({
    on,
    active,
    label,
    disabled,
    title,
  }: {
    on: () => void;
    active?: boolean;
    label: string;
    disabled?: boolean;
    title?: string;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) on();
      }}
      className={`min-w-8 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
        active ? "bg-brand text-white" : "text-ink/70 hover:bg-ink/5"
      } ${disabled ? "cursor-not-allowed opacity-30 hover:bg-transparent" : ""}`}
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

  // In source (HTML) mode the visual buttons act on the hidden editor and would
  // desync from the textarea, so they are disabled.
  const off = source;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 bg-gray-50 p-2">
      <Btn label="B" disabled={off} on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
      <Btn label="I" disabled={off} on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
      <Btn label="S" disabled={off} on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} />
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <Btn label="H1" disabled={off} on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} />
      <Btn label="H2" disabled={off} on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} />
      <Btn label="¶" disabled={off} on={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} />
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <Btn label="• List" disabled={off} on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
      <Btn label="1. List" disabled={off} on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
      <Btn label="❝" disabled={off} on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} />
      <Btn label="🔗" disabled={off} on={setLink} active={editor.isActive("link")} />
      <span className="mx-1 h-5 w-px bg-ink/10" />
      <Btn label="↶" disabled={off} on={() => editor.chain().focus().undo().run()} />
      <Btn label="↷" disabled={off} on={() => editor.chain().focus().redo().run()} />
      <span className="ml-auto h-5 w-px bg-ink/10" />
      <Btn label="</>" title="Editar HTML" active={source} on={onToggleSource} />
    </div>
  );
}
