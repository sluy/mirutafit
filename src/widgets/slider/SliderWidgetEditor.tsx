"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MediaPicker from "@/components/admin/media/MediaPicker";
import { mediaUrl } from "@/components/admin/media/types";
import { inputClass } from "@/components/ui/Field";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { TrashIcon, ChevronDownIcon, ImageIcon } from "@/components/icons";
import { useLocalized } from "../LocaleContext";
import type {
  SliderConfig,
  SliderEffect,
  SliderSlide,
  ImagePosition,
  WidgetEditorProps,
} from "../types";

/* eslint-disable @next/next/no-img-element */

const EFFECTS: SliderEffect[] = ["slide", "fade", "cube", "coverflow", "flip", "shatter"];
const IMAGE_POSITIONS: ImagePosition[] = ["left", "top", "center", "bottom", "right"];
const POSITION_ICONS: Record<ImagePosition, string> = {
  left: "←",
  top: "↑",
  center: "•",
  bottom: "↓",
  right: "→",
};

export default function SliderWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<SliderConfig>) {
  const t = useTranslations("admin.widgets.slider");
  const lt = useLocalized();
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [mobilePickerFor, setMobilePickerFor] = useState<string | null>(null);

  const slides = config.slides ?? [];
  const set = (patch: Partial<SliderConfig>) => onChange({ ...config, ...patch });
  const setSlide = (id: string, patch: Partial<SliderSlide>) =>
    set({ slides: slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const addSlide = () =>
    set({
      slides: [
        ...slides,
        {
          id: crypto.randomUUID(),
          image: null,
          imagePosition: "center",
          content: "",
          overlayColor: "#000000",
          overlayOpacity: 35,
          mobileEnabled: false,
          mobileImage: null,
          mobileImagePosition: "center",
          mobileContent: "",
          mobileOverlayColor: "#000000",
          mobileOverlayOpacity: 35,
        },
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
      {/* Global options */}
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
            {/* Header */}
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

            {/* Image + position */}
            <div className="mb-4 grid gap-3 sm:grid-cols-[160px_1fr]">
              <div className="space-y-2">
                {/* Image picker button */}
                <button
                  type="button"
                  onClick={() => setPickerFor(slide.id)}
                  className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink/20 bg-white text-ink/40 hover:border-brand hover:text-brand"
                >
                  {slide.image ? (
                    <img src={mediaUrl(slide.image, { thumb: true })} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon width={24} height={24} />
                  )}
                </button>
                {/* Image position selector */}
                <div>
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("imagePosition")}</span>
                  <div className="flex gap-0.5">
                    {IMAGE_POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setSlide(slide.id, { imagePosition: pos })}
                        title={t(`position.${pos}`)}
                        className={`grid h-7 w-7 place-items-center rounded text-xs font-bold transition-colors ${
                          (slide.imagePosition ?? "center") === pos
                            ? "bg-brand text-white"
                            : "bg-white text-ink/50 hover:bg-ink/5"
                        }`}
                      >
                        {POSITION_ICONS[pos]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overlay controls */}
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("overlayColor")}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={slide.overlayColor ?? "#000000"}
                        onChange={(e) => setSlide(slide.id, { overlayColor: e.target.value })}
                        className="h-9 w-9 cursor-pointer rounded border border-ink/10"
                      />
                      <input
                        type="text"
                        value={slide.overlayColor ?? "#000000"}
                        onChange={(e) => setSlide(slide.id, { overlayColor: e.target.value })}
                        className={`${inputClass()} flex-1 font-mono text-xs`}
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("overlayOpacity")} ({slide.overlayOpacity ?? 35}%)</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={slide.overlayOpacity ?? 35}
                      onChange={(e) => setSlide(slide.id, { overlayOpacity: Number(e.target.value) })}
                      className="mt-2 w-full accent-brand"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Rich content editor */}
            <div className="mb-3">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("content")}</span>
              <RichTextEditor
                value={lt.g(slide.content)}
                onChange={(html) => setSlide(slide.id, { content: lt.s(slide.content, html) })}
              />
            </div>

            {/* Mobile variant toggle */}
            <div className="rounded-xl border border-ink/10 bg-white p-3">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={slide.mobileEnabled ?? false}
                  onChange={(e) => setSlide(slide.id, { mobileEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
                />
                <span className="font-medium">{t("mobileEnabled")}</span>
                <span className="text-[10px] text-ink/30">(&lt; 768px)</span>
              </label>

              {(slide.mobileEnabled ?? false) && (
                <div className="mt-3 space-y-4 border-t border-ink/10 pt-3">
                  {/* Mobile image + position */}
                  <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                    <div className="space-y-2">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("mobileImage")}</span>
                      <button
                        type="button"
                        onClick={() => setMobilePickerFor(slide.id)}
                        className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink/20 bg-gray-50 text-ink/40 hover:border-brand hover:text-brand"
                      >
                        {slide.mobileImage ? (
                          <img src={mediaUrl(slide.mobileImage, { thumb: true })} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon width={24} height={24} />
                        )}
                      </button>
                      {/* Mobile image position */}
                      <div>
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("imagePosition")}</span>
                        <div className="flex gap-0.5">
                          {IMAGE_POSITIONS.map((pos) => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setSlide(slide.id, { mobileImagePosition: pos })}
                              title={t(`position.${pos}`)}
                              className={`grid h-7 w-7 place-items-center rounded text-xs font-bold transition-colors ${
                                (slide.mobileImagePosition ?? "center") === pos
                                  ? "bg-brand text-white"
                                  : "bg-gray-50 text-ink/50 hover:bg-ink/5"
                              }`}
                            >
                              {POSITION_ICONS[pos]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mobile overlay controls */}
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("overlayColor")}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={slide.mobileOverlayColor ?? "#000000"}
                              onChange={(e) => setSlide(slide.id, { mobileOverlayColor: e.target.value })}
                              className="h-9 w-9 cursor-pointer rounded border border-ink/10"
                            />
                            <input
                              type="text"
                              value={slide.mobileOverlayColor ?? "#000000"}
                              onChange={(e) => setSlide(slide.id, { mobileOverlayColor: e.target.value })}
                              className={`${inputClass()} flex-1 font-mono text-xs`}
                            />
                          </div>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("overlayOpacity")} ({slide.mobileOverlayOpacity ?? 35}%)</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={slide.mobileOverlayOpacity ?? 35}
                            onChange={(e) => setSlide(slide.id, { mobileOverlayOpacity: Number(e.target.value) })}
                            className="mt-2 w-full accent-brand"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Mobile content */}
                  <div>
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("mobileContent")}</span>
                    <RichTextEditor
                      value={lt.g(slide.mobileContent)}
                      onChange={(html) => setSlide(slide.id, { mobileContent: lt.s(slide.mobileContent, html) })}
                    />
                  </div>
                </div>
              )}
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

      {/* Media pickers */}
      <MediaPicker
        open={pickerFor !== null}
        accept="image"
        onClose={() => setPickerFor(null)}
        onSelect={(file) => {
          if (pickerFor) setSlide(pickerFor, { image: file.fileName });
        }}
      />
      <MediaPicker
        open={mobilePickerFor !== null}
        accept="image"
        onClose={() => setMobilePickerFor(null)}
        onSelect={(file) => {
          if (mobilePickerFor) setSlide(mobilePickerFor, { mobileImage: file.fileName });
        }}
      />
    </div>
  );
}
