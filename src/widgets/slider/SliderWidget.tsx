"use client";

import { Swiper, SwiperSlide } from "swiper/react";
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
import { mediaUrl } from "@/components/admin/media/types";
import type { SliderConfig } from "../types";

/* eslint-disable @next/next/no-img-element */

const EFFECT_MODULES = {
  fade: EffectFade,
  cube: EffectCube,
  coverflow: EffectCoverflow,
  flip: EffectFlip,
} as const;

/** Frontend render for the Slider widget (Swiper). Client component. */
export default function SliderWidget({ config }: { config: SliderConfig }) {
  const slides = config.slides ?? [];
  if (slides.length === 0) return null;

  const modules = [Pagination, Navigation];
  if (config.autoplay) modules.push(Autoplay);
  if (config.effect !== "slide" && config.effect in EFFECT_MODULES) {
    modules.push(EFFECT_MODULES[config.effect as keyof typeof EFFECT_MODULES]);
  }

  return (
    <Swiper
      modules={modules}
      effect={config.effect}
      autoplay={config.autoplay ? { delay: config.interval, disableOnInteraction: false } : false}
      pagination={{ clickable: true }}
      navigation
      loop={slides.length > 1}
      style={{ height: config.fullHeight ? "100dvh" : `${config.height}px` }}
      className="w-full"
    >
      {slides.map((s) => (
        <SwiperSlide key={s.id}>
          <div className="relative h-full w-full bg-ink">
            {s.image && (
              <img src={mediaUrl(s.image)} alt={s.title} className="h-full w-full object-cover" />
            )}
            {(s.title || s.subtitle || s.buttonText) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 p-6 text-center text-white">
                {s.title && (
                  <h2 className="font-display text-3xl font-extrabold drop-shadow sm:text-5xl">
                    {s.title}
                  </h2>
                )}
                {s.subtitle && <p className="mt-3 max-w-2xl text-lg drop-shadow">{s.subtitle}</p>}
                {s.buttonText && (
                  <a
                    href={s.buttonLink || "#"}
                    className="mt-6 rounded-full bg-brand px-7 py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105"
                  >
                    {s.buttonText}
                  </a>
                )}
              </div>
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
