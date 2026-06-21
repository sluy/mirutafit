"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MediaPicker from "@/components/admin/media/MediaPicker";
import { mediaUrl } from "@/components/admin/media/types";
import { inputClass } from "@/components/ui/Field";
import { TrashIcon, ChevronDownIcon, ImageIcon } from "@/components/icons";
import type {
  SliderConfig,
  SliderEffect,
  SliderSlide,
  WidgetEditorProps,
} from "../types";

/* eslint-disable @next/next/no-img-element */

const EFFECTS: SliderEffect[] = ["slide", "fade", "cube", "coverflow", "flip"];

export default function SliderWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<SliderConfig>) {
  const t = useTranslations("admin.widgets.slider");
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const slides = config.slides ?? [];
  const set = (patch: Partial<SliderConfig>) => onChange({ ...config, ...patch });
  const setSlide = (id: string, patch: Partial<SliderSlide>) =>
    set({ slides: slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const addSlide = () =>
    set({
      slides: [
        ...slides,
        { id: crypto.randomUUID(), image: null, title: "", subtitle: "", buttonText: "", buttonLink: "" },
      ],
    });
  const removeSlide = (id: string) => set({ slides: slides.filter((s) => s.id !== id) });
  const move = (index: number, dir: -1 | 1) => {
    const next = [...slides];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    set({ slides: next });
  };

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("effect")}</span>
          <select
            value={config.effect}
            onChange={(e) => set({ effect: e.target.value as SliderEffect })}
            className={inputClass()}
          >
            {EFFECTS.map((e) => (
              <option key={e} value={e}>{t(`effects.${e}`)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("height")}</span>
          <input
            type="number"
            value={config.height}
            disabled={config.fullHeight}
            onChange={(e) => set({ height: Number(e.target.value) })}
            className={`${inputClass()} disabled:opacity-50`}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("interval")}</span>
          <input type="number" value={config.interval} onChange={(e) => set({ interval: Number(e.target.value) })} className={inputClass()} />
        </label>
        <label className="flex items-end gap-2 pb-2.5 text-sm text-ink/80">
          <input type="checkbox" checked={config.autoplay} onChange={(e) => set({ autoplay: e.target.checked })} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("autoplay")}
        </label>
        <label className="flex items-end gap-2 pb-2.5 text-sm text-ink/80">
          <input type="checkbox" checked={config.fullHeight} onChange={(e) => set({ fullHeight: e.target.checked })} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("fullHeight")}
        </label>
      </div>

      {/* Slides */}
      <div className="space-y-3">
        {slides.map((slide, i) => (
          <div key={slide.id} className="rounded-2xl border border-ink/10 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink/60">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded text-ink/40 hover:bg-ink/5 disabled:opacity-30">
                  <ChevronDownIcon width={15} height={15} className="rotate-180" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="grid h-7 w-7 place-items-center rounded text-ink/40 hover:bg-ink/5 disabled:opacity-30">
                  <ChevronDownIcon width={15} height={15} />
                </button>
                <button type="button" onClick={() => removeSlide(slide.id)} className="grid h-7 w-7 place-items-center rounded text-red-500 hover:bg-red-50">
                  <TrashIcon width={15} height={15} />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
              {/* Image */}
              <button
                type="button"
                onClick={() => setPickerFor(slide.id)}
                className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink/20 bg-white text-ink/40 hover:border-brand hover:text-brand"
              >
                {slide.image ? (
                  <img src={mediaUrl(slide.image, { thumb: true })} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon width={24} height={24} />
                )}
              </button>
              {/* Fields */}
              <div className="grid gap-2">
                <input value={slide.title} onChange={(e) => setSlide(slide.id, { title: e.target.value })} placeholder={t("slideTitle")} className={inputClass()} />
                <input value={slide.subtitle} onChange={(e) => setSlide(slide.id, { subtitle: e.target.value })} placeholder={t("slideSubtitle")} className={inputClass()} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={slide.buttonText} onChange={(e) => setSlide(slide.id, { buttonText: e.target.value })} placeholder={t("buttonText")} className={inputClass()} />
                  <input value={slide.buttonLink} onChange={(e) => setSlide(slide.id, { buttonLink: e.target.value })} placeholder={t("buttonLink")} className={inputClass()} />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSlide}
          className="w-full rounded-2xl border-2 border-dashed border-ink/15 py-3 text-sm font-medium text-ink/50 transition-colors hover:border-brand hover:text-brand"
        >
          + {t("addSlide")}
        </button>
      </div>

      <MediaPicker
        open={pickerFor !== null}
        accept="image"
        onClose={() => setPickerFor(null)}
        onSelect={(file) => {
          if (pickerFor) setSlide(pickerFor, { image: file.fileName });
        }}
      />
    </div>
  );
}
