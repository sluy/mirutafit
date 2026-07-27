"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import {
  Autoplay,
  EffectFade,
  EffectCube,
  EffectCoverflow,
  EffectFlip,
  Pagination,
  Navigation,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useLocale } from "next-intl";
import { mediaUrl } from "@/components/admin/media/types";
import { resolveText } from "../i18n";
import type { SliderConfig, SliderSlide } from "../types";

/* eslint-disable @next/next/no-img-element */

// ── Swiper effect modules ─────────────────────────────────────

const EFFECT_MODULES = {
  fade: EffectFade,
  cube: EffectCube,
  coverflow: EffectCoverflow,
  flip: EffectFlip,
} as const;

// ── Grid-flip (shatter) constants ─────────────────────────────

/** Target tile edge in px — the grid adapts to the container so tiles are
 *  always ~square at this approximate size. */
const TILE_PX = 55;
const TILE_FLIP_MS = 700;
const STAGGER_MS = 22;

type TileDesc = {
  clipPath: string;
  originX: number;
  originY: number;
  delay: number;
};

/** Build tile grid based on measured container dimensions. */
function buildTiles(containerW: number, containerH: number): {
  tiles: TileDesc[];
  totalMs: number;
} {
  const cols = Math.max(4, Math.round(containerW / TILE_PX));
  const rows = Math.max(3, Math.round(containerH / TILE_PX));
  const cw = 100 / cols;
  const ch = 100 / rows;
  const maxDiag = cols + rows - 2;
  const tiles: TileDesc[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = col * cw;
      const top = row * ch;
      const right = 100 - (col + 1) * cw;
      const bottom = 100 - (row + 1) * ch;

      tiles.push({
        clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)`,
        originX: left + cw / 2,
        originY: top + ch / 2,
        delay: (col + row) * STAGGER_MS,
      });
    }
  }

  return { tiles, totalMs: maxDiag * STAGGER_MS + TILE_FLIP_MS + 300 };
}

// ── Grid-flip overlay ─────────────────────────────────────────

function GridFlipOverlay({
  imageUrl,
  imagePosition,
  containerEl,
  onComplete,
}: {
  imageUrl: string;
  imagePosition: string;
  containerEl: HTMLDivElement | null;
  onComplete: () => void;
}) {
  const [grid, setGrid] = useState<{
    tiles: TileDesc[];
    totalMs: number;
  } | null>(null);

  // Measure container once on mount and build the grid.
  useEffect(() => {
    if (!containerEl) return;
    const { width, height } = containerEl.getBoundingClientRect();
    setGrid(buildTiles(width, height));
  }, [containerEl]);

  // Auto-cleanup after the full animation.
  useEffect(() => {
    if (!grid) return;
    const t = setTimeout(onComplete, grid.totalMs);
    return () => clearTimeout(t);
  }, [grid, onComplete]);

  if (!grid) return null;

  return (
    <>
      <style>{`
        @keyframes _gridFlip {
          0%   { transform: perspective(400px) rotateY(0deg);   opacity: 1; }
          50%  { opacity: 0.8; }
          100% { transform: perspective(400px) rotateY(90deg);  opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {grid.tiles.map((t, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              clipPath: t.clipPath,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: imagePosition,
              transformOrigin: `${t.originX}% ${t.originY}%`,
              backfaceVisibility: "hidden",
              animation: `_gridFlip ${TILE_FLIP_MS}ms ${t.delay}ms ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ── Legacy migration helper ───────────────────────────────────
// Compose HTML from old title/subtitle/buttonText/buttonLink fields when a
// slide still uses the legacy schema (no `content` set).
function migrateLegacyContent(slide: SliderSlide, locale: string): string {
  const title = resolveText(slide.title, locale);
  const subtitle = resolveText(slide.subtitle, locale);
  const buttonText = resolveText(slide.buttonText, locale);
  const link = slide.buttonLink || "#";

  if (!title && !subtitle && !buttonText) return "";

  let html = "";
  if (title)
    html += `<h2 style="font-size:2.5rem;font-weight:800;text-shadow:0 2px 4px rgba(0,0,0,.3)">${title}</h2>`;
  if (subtitle)
    html += `<p style="margin-top:0.75rem;max-width:42rem;font-size:1.125rem;text-shadow:0 1px 3px rgba(0,0,0,.3)">${subtitle}</p>`;
  if (buttonText)
    html += `<a href="${link}" style="display:inline-block;margin-top:1.5rem;padding:0.75rem 1.75rem;border-radius:9999px;background:var(--color-brand,#16c47f);color:#fff;font-weight:600;box-shadow:0 10px 15px rgba(22,196,127,.3);transition:transform .2s">${buttonText}</a>`;
  return html;
}

// ── Overlay rgba helper ───────────────────────────────────────
function overlayRgba(hex: string | undefined, opacity: number | undefined): string {
  const h = (hex ?? "#000000").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const a = Math.min(100, Math.max(0, opacity ?? 35)) / 100;
  return `rgba(${r},${g},${b},${a})`;
}

// ── Single image+content layer ────────────────────────────────
function SlideLayer({
  image,
  imagePosition,
  contentHtml,
  overlayBg,
}: {
  image: string | null;
  imagePosition: string;
  contentHtml: string;
  overlayBg: string;
}) {
  return (
    <div className="relative h-full w-full bg-ink">
      {image && (
        <img
          src={mediaUrl(image)}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: imagePosition }}
        />
      )}
      {/* Overlay + content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white"
        style={{ backgroundColor: overlayBg }}
      >
        {contentHtml && (
          <div
            className="slider-content max-w-3xl"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}
      </div>
    </div>
  );
}

// ── Slide content (with responsive variants) ──────────────────

function SlideContent({ slide }: { slide: SliderSlide }) {
  const locale = useLocale();

  // Resolve content — prefer new `content` field, fall back to legacy migration
  const desktopContent =
    resolveText(slide.content, locale) ||
    migrateLegacyContent(slide, locale);

  const overlayBg = overlayRgba(slide.overlayColor, slide.overlayOpacity);
  const imgPos = slide.imagePosition ?? "center";

  // When mobile is enabled, render two layers with CSS visibility
  if (slide.mobileEnabled) {
    const mobileContent =
      resolveText(slide.mobileContent, locale) || desktopContent;
    const mobileImg = slide.mobileImage ?? slide.image;
    const mobileImgPos = slide.mobileImagePosition ?? imgPos;
    const mobileOverlay = overlayRgba(
      slide.mobileOverlayColor ?? slide.overlayColor,
      slide.mobileOverlayOpacity ?? slide.overlayOpacity,
    );

    return (
      <div className="relative h-full w-full">
        {/* Desktop layer */}
        <div className="hidden h-full w-full md:block">
          <SlideLayer
            image={slide.image}
            imagePosition={imgPos}
            contentHtml={desktopContent}
            overlayBg={overlayBg}
          />
        </div>
        {/* Mobile layer */}
        <div className="block h-full w-full md:hidden">
          <SlideLayer
            image={mobileImg}
            imagePosition={mobileImgPos}
            contentHtml={mobileContent}
            overlayBg={mobileOverlay}
          />
        </div>
      </div>
    );
  }

  // Single (non-responsive) render
  return (
    <SlideLayer
      image={slide.image}
      imagePosition={imgPos}
      contentHtml={desktopContent}
      overlayBg={overlayBg}
    />
  );
}

// ── Main slider ───────────────────────────────────────────────

export default function SliderWidget({ config }: { config: SliderConfig }) {
  const slides = config.slides ?? [];
  if (slides.length === 0) return null;

  const isShatter = config.effect === "shatter";
  const swiperEffect = isShatter ? "fade" : config.effect;

  const modules = [Pagination, Navigation];
  if (config.autoplay) modules.push(Autoplay);
  if (isShatter) {
    modules.push(EffectFade);
  } else if (swiperEffect !== "slide" && swiperEffect in EFFECT_MODULES) {
    modules.push(EFFECT_MODULES[swiperEffect as keyof typeof EFFECT_MODULES]);
  }

  return (
    <div
      className="relative w-full"
      style={{
        height: config.fullHeight ? "100dvh" : `${config.height}px`,
        /* Always clip — prevents cube 3D overflow and shatter scrollbar */
        overflow: "hidden",
      }}
    >
      <SwiperWithShatter
        config={config}
        slides={slides}
        swiperEffect={swiperEffect}
        modules={modules}
        isShatter={isShatter}
      />
    </div>
  );
}

// ── Swiper + shatter wiring ───────────────────────────────────

function SwiperWithShatter({
  config,
  slides,
  swiperEffect,
  modules,
  isShatter,
}: {
  config: SliderConfig;
  slides: SliderSlide[];
  swiperEffect: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modules: any[];
  isShatter: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = useState<{
    url: string;
    position: string;
    key: number;
  } | null>(null);
  const prevRealIdx = useRef(0);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      if (!isShatter) return;
      const prev = prevRealIdx.current;
      prevRealIdx.current = swiper.realIndex;

      const prevSlide = slides[prev];
      if (prevSlide?.image) {
        setOverlay({ url: mediaUrl(prevSlide.image), position: prevSlide.imagePosition ?? "center", key: Date.now() });
      }
    },
    [isShatter, slides],
  );

  const clearOverlay = useCallback(() => setOverlay(null), []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Swiper
        modules={modules}
        effect={swiperEffect}
        autoplay={
          config.autoplay
            ? { delay: config.interval, disableOnInteraction: false }
            : false
        }
        pagination={{ clickable: true }}
        navigation
        loop={slides.length > 1}
        speed={isShatter ? 0 : undefined}
        className="h-full w-full"
        onSlideChangeTransitionStart={handleSlideChange}
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <SlideContent slide={s} />
          </SwiperSlide>
        ))}
      </Swiper>

      {overlay && (
        <GridFlipOverlay
          key={overlay.key}
          imageUrl={overlay.url}
          imagePosition={overlay.position}
          containerEl={containerRef.current}
          onComplete={clearOverlay}
        />
      )}
    </div>
  );
}
