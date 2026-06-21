"use client";

import RichTextEditor from "@/components/ui/RichTextEditor";
import type { RichTextConfig, WidgetEditorProps } from "../types";

export default function RichTextWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<RichTextConfig>) {
  return (
    <RichTextEditor
      value={config.html ?? ""}
      onChange={(html) => onChange({ ...config, html })}
    />
  );
}
