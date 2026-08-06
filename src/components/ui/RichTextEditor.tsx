"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

/**
 * Checks if HTML contains custom tags or attributes that Tiptap's standard
 * schema would strip/simplify (e.g. <div>, <section>, class="", style="", etc.)
 */
function hasComplexHtml(html: string): boolean {
  if (!html) return false;
  return (
    /<(div|section|article|span|button|script|style|iframe|svg|form|input|table|tr|td|th|thead|tbody)\b/i.test(html) ||
    /\b(class|style|id|data-[a-z0-9-]+)\s*=/i.test(html)
  );
}

/**
 * Reusable WYSIWYG editor (Tiptap). Emits HTML via `onChange`.
 * Used for rich/html content in widgets, media library, etc.
 *
 * Automatically opens in raw-HTML source view if the content contains complex
 * tags/attributes (like Tailwind classes, divs, inline styles), preserving the
 * exact HTML string without Tiptap stripping or reformatting it.
 */
export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  // If initial value contains custom HTML (divs, classes, etc.), default to source (code) mode
  const isComplex = hasComplexHtml(value);
  const [source, setSource] = useState(isComplex);
  const [draft, setDraft] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    immediatelyRender: false, // avoid SSR hydration mismatch
    onUpdate: ({ editor }) => {
      // Only emit from Tiptap if we are in visual mode
      if (!source) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: { class: "tiptap focus:outline-none" },
    },
  });

  if (!editor) return null;

  const openSource = () => {
    // When switching to source mode, prefer the raw value if present, or editor HTML
    setDraft(value || editor.getHTML());
    setSource(true);
  };

  const closeSource = () => {
    // If draft has complex HTML that Tiptap schema doesn't support, warn before converting
    if (hasComplexHtml(draft)) {
      const confirmSwitch = window.confirm(
        "El código HTML contiene etiquetas o clases avanzadas (como <div>, class, style) que el editor visual podría simplificar. ¿Deseas convertirlo a texto visual de todos modos?"
      );
      if (!confirmSwitch) return;
    }

    // Push the hand-written HTML back into the editor, then report the normalized result
    editor.commands.setContent(draft);
    onChange(editor.getHTML());
    setSource(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10">
      <Toolbar
        editor={editor}
        source={source}
        isComplex={hasComplexHtml(source ? draft : value)}
        onToggleSource={source ? closeSource : openSource}
      />
      {source ? (
        <div>
          <div className="flex items-center justify-between border-b border-ink/10 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300">
            <span>
              <strong>Modo Código HTML Raw:</strong> Editando HTML directo. Se preservarán todas las clases y etiquetas.
            </span>
          </div>
          <textarea
            value={draft}
            onChange={(e) => {
              const val = e.target.value;
              setDraft(val);
              onChange(val);
            }}
            spellCheck={false}
            className="block max-h-[55vh] min-h-[220px] w-full resize-y overflow-y-auto bg-gray-50/60 p-4 font-mono text-xs leading-relaxed text-ink focus:outline-none"
            placeholder="<p>Escribe o pega HTML…</p>"
          />
        </div>
      ) : (
        <EditorContent editor={editor} className="max-h-[55vh] overflow-y-auto p-4" />
      )}
    </div>
  );
}

function Toolbar({
  editor,
  source,
  isComplex,
  onToggleSource,
}: {
  editor: Editor;
  source: boolean;
  isComplex: boolean;
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
      <Btn
        label="</>"
        title={source ? "Cambiar a Editor Visual" : "Ver / Editar Código HTML"}
        active={source}
        on={onToggleSource}
      />
      {isComplex && !source && (
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          HTML Complejo
        </span>
      )}
    </div>
  );
}

