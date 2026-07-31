"use client";

import { useState, useMemo, useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { resolveText } from "../i18n";
import type { MacroCalcConfig, MacroCalcSex, MacroCalcActivity, MacroCalcFloatingPosition } from "../types";

// Activity multipliers for TDEE (Mifflin-St Jeor)
const ACTIVITY_MULTIPLIERS: Record<MacroCalcActivity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  extreme: 1.9,
};

type BmiCategory = "underweight" | "normal" | "overweight" | "obese_1" | "obese_2_3";

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  if (bmi < 35) return "obese_1";
  return "obese_2_3";
}

// Friendly SVG Avatar Badges representing body composition & health status
function BodyAvatar({ category }: { category: BmiCategory }) {
  switch (category) {
    case "underweight":
      return (
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/20 text-white">
          <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2.5" />
            <path d="M12 6.5v7m0 0l-3 4.5m3-4.5l3.5 4M8.5 9.5l3.5 2 3.5-2" />
          </svg>
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-md">
            🦴
          </span>
        </div>
      );
    case "normal":
      return (
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20 text-white">
          <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2.5" />
            <path d="M12 6.5v6.5m-3.5 6.5l3.5-5.5 3.5 5.5M7 10l5-2 5 2" />
          </svg>
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-md">
            ✨
          </span>
        </div>
      );
    case "overweight":
      return (
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 text-white">
          <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2.5" />
            <path d="M12 6.5c-2.5 1-3.5 3-3 6.5s1.5 6 3 6 2.5-2.5 3-6-0.5-5.5-3-6.5Z" />
            <path d="M7.5 10.5h9" />
          </svg>
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-md">
            💪
          </span>
        </div>
      );
    case "obese_1":
      return (
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 shadow-lg shadow-rose-500/20 text-white">
          <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2.5" />
            <path d="M12 6.5c-3.5 1-4.5 4-4 7s2.5 5 4 5 4.5-2 4-5-0.5-6-4-7Z" />
            <path d="M6.5 11.5h11" />
          </svg>
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-md">
            🧘
          </span>
        </div>
      );
    case "obese_2_3":
      return (
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 shadow-lg shadow-red-500/20 text-white">
          <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2.5" />
            <path d="M12 6.5c-4 1-5 4.5-4.5 7.5s3 5 4.5 5 5-2 4.5-5-0.5-6.5-4.5-7.5Z" />
            <path d="M6 12h12" />
          </svg>
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-md">
            🛡️
          </span>
        </div>
      );
  }
}

function getFloatingStyles(pos: MacroCalcFloatingPosition): CSSProperties {
  const styles: CSSProperties = { position: "fixed", zIndex: 60 };
  if (pos.includes("top")) styles.top = "5.5rem";
  if (pos.includes("bottom")) styles.bottom = "1.5rem";
  if (pos.includes("left")) styles.left = "1.5rem";
  if (pos.includes("right")) styles.right = "1.5rem";
  if (pos.includes("center")) {
    styles.left = "50%";
    styles.transform = "translateX(-50%)";
  }
  return styles;
}

export default function MacroCalcWidget({ config }: { config: MacroCalcConfig }) {
  const locale = useLocale();
  const t = useTranslations("widgets.macroCalc");

  // Mount state for SSR safe portal rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Step state: "form" (first screen) or "results" (second screen)
  const [step, setStep] = useState<"form" | "results">("form");

  // Local state for inputs
  const [sex, setSex] = useState<MacroCalcSex>(config.defaultSex ?? "male");
  const [age, setAge] = useState<number>(config.defaultAge ?? 28);
  const [height, setHeight] = useState<number>(config.defaultHeight ?? 175);
  const [weight, setWeight] = useState<number>(config.defaultWeight ?? 80);
  const [activity, setActivity] = useState<MacroCalcActivity>(config.defaultActivity ?? "moderate");
  const [selectedGoal, setSelectedGoal] = useState<"moderate" | "mild" | "aggressive" | "maintenance" | "surplus">("moderate");

  // Floating modal state
  const [isOpen, setIsOpen] = useState(false);

  // Calculations
  const bmr = useMemo(() => {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return Math.round(sex === "male" ? base + 5 : base - 161);
  }, [sex, weight, height, age]);

  const tdee = useMemo(() => {
    const mult = ACTIVITY_MULTIPLIERS[activity] ?? 1.55;
    return Math.round(bmr * mult);
  }, [bmr, activity]);

  const bmi = useMemo(() => {
    const hM = height / 100;
    if (hM <= 0) return 0;
    return Number((weight / (hM * hM)).toFixed(1));
  }, [weight, height]);

  const bmiCategory = useMemo(() => getBmiCategory(bmi), [bmi]);

  // Weight thresholds in kg for user height
  const weightThresholds = useMemo(() => {
    const hM = height / 100;
    if (hM <= 0) return { under: 0, normal: 0, over: 0, obese: 0, ideal: 0 };
    return {
      under: Number((18.5 * hM * hM).toFixed(1)),
      normal: Number((24.9 * hM * hM).toFixed(1)),
      over: Number((29.9 * hM * hM).toFixed(1)),
      obese: Number((34.9 * hM * hM).toFixed(1)),
      ideal: Number((21.7 * hM * hM).toFixed(1)),
    };
  }, [height]);

  // Healthy weight range (BMI 18.5 to 24.9)
  const healthyRange = useMemo(() => {
    return {
      min: weightThresholds.under,
      max: weightThresholds.normal,
      ideal: weightThresholds.ideal,
    };
  }, [weightThresholds]);

  // Difference to healthy range
  const weightStatusInfo = useMemo(() => {
    if (weight > healthyRange.max) {
      const diff = (weight - healthyRange.max).toFixed(1);
      return {
        type: "over",
        diff,
        msg: t("feedbackOver", { diff }),
      };
    } else if (weight < healthyRange.min) {
      const diff = (healthyRange.min - weight).toFixed(1);
      return {
        type: "under",
        diff,
        msg: t("feedbackUnder", { diff }),
      };
    } else {
      return {
        type: "ideal",
        diff: "0",
        msg: t("feedbackIdeal"),
      };
    }
  }, [weight, healthyRange, t]);

  // Deficit levels
  const goalsBreakdown = useMemo(() => {
    return {
      mild: {
        calories: Math.round(tdee * 0.85),
        rate: t("rateMild"),
        desc: t("descMild"),
      },
      moderate: {
        calories: Math.round(tdee * 0.8),
        rate: t("rateModerate"),
        desc: t("descModerate"),
      },
      aggressive: {
        calories: Math.round(tdee * 0.7),
        rate: t("rateAggressive"),
        desc: t("descAggressive"),
      },
      maintenance: {
        calories: tdee,
        rate: t("rateMaintenance"),
        desc: t("descMaintenance"),
      },
      surplus: {
        calories: Math.round(tdee * 1.15),
        rate: t("rateSurplus"),
        desc: t("descSurplus"),
      },
    };
  }, [tdee, t]);

  // Target macros for selected goal
  const currentTargetCals = goalsBreakdown[selectedGoal].calories;
  const targetMacros = useMemo(() => {
    const proteinGrams = Math.round(weight * 2.0);
    const proteinCals = proteinGrams * 4;

    const fatGrams = Math.round(weight * 0.9);
    const fatCals = fatGrams * 9;

    const carbCals = Math.max(0, currentTargetCals - (proteinCals + fatCals));
    const carbGrams = Math.round(carbCals / 4);

    return {
      protein: { grams: proteinGrams, cals: proteinCals, pct: Math.round((proteinCals / currentTargetCals) * 100) },
      fat: { grams: fatGrams, cals: fatCals, pct: Math.round((fatCals / currentTargetCals) * 100) },
      carbs: { grams: carbGrams, cals: carbCals, pct: Math.round((carbCals / currentTargetCals) * 100) },
    };
  }, [weight, currentTargetCals]);

  // BMI Pin Gauge position (15 to 40 scale)
  const pinPercent = Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 2), 98);

  const eyebrowText = resolveText(config.eyebrow, locale) || t("defaultEyebrow");
  const headingText = resolveText(config.heading, locale) || t("defaultHeading");
  const subtitleText = resolveText(config.subtitle, locale) || t("defaultSubtitle");
  const guideLinkText = resolveText(config.guideLinkText, locale) || t("defaultGuideLink");

  const accentColor = config.accentColor || "#16c47f";
  const sectionBg = config.bg && config.bg !== "#ffffff" ? config.bg : "#0a1410";
  const displayMode = config.displayMode || "panel";
  const floatingPos = config.floatingPosition || "bottom-right";

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("results");
  };

  // Shared Header (Eyebrow, Heading, Subtitle)
  const renderHeader = () => (
    <div className="mb-8 sm:mb-12 text-center space-y-3">
      {eyebrowText && (
        <span
          className="inline-block rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          {eyebrowText}
        </span>
      )}
      <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl tracking-tight">
        {headingText}
      </h2>
      {subtitleText && (
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {subtitleText}
        </p>
      )}
    </div>
  );

  // Render Step 1: Form Inputs Screen
  const renderFormStep = () => (
    <form onSubmit={handleFormSubmit} className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-10 backdrop-blur-md space-y-6">
        <h3 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2 mb-6 text-center">
          <span>📝</span> {t("formTitle")}
        </h3>

        {/* Sex Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-300 mb-2">
            {t("labelSex")}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSex("male")}
              className={`flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold transition-all border cursor-pointer ${
                sex === "male"
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"
              }`}
              style={sex === "male" ? { backgroundColor: accentColor } : {}}
            >
              <span className="text-2xl">👨</span> {t("sexMale")}
            </button>
            <button
              type="button"
              onClick={() => setSex("female")}
              className={`flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold transition-all border cursor-pointer ${
                sex === "female"
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"
              }`}
              style={sex === "female" ? { backgroundColor: accentColor } : {}}
            >
              <span className="text-2xl">👩</span> {t("sexFemale")}
            </button>
          </div>
        </div>

        {/* Grid for Age, Height, Weight Inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Age Input */}
          <div className="rounded-2xl bg-white/5 p-4 sm:p-5 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                {t("labelAge")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={14}
                  max={90}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-16 text-right font-black text-lg text-white border border-white/20 rounded-lg px-2 py-1 bg-black/30"
                />
                <span className="text-xs font-bold text-gray-400">{t("years")}</span>
              </div>
            </div>
            <input
              type="range"
              min={14}
              max={90}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Height Input */}
          <div className="rounded-2xl bg-white/5 p-4 sm:p-5 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                {t("labelHeight")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={130}
                  max={220}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-16 text-right font-black text-lg text-white border border-white/20 rounded-lg px-2 py-1 bg-black/30"
                />
                <span className="text-xs font-bold text-gray-400">cm</span>
              </div>
            </div>
            <input
              type="range"
              min={130}
              max={220}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Weight Input */}
          <div className="rounded-2xl bg-white/5 p-4 sm:p-5 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                {t("labelWeight")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={30}
                  max={250}
                  step={0.5}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-20 text-right font-black text-lg text-white border border-white/20 rounded-lg px-2 py-1 bg-black/30"
                />
                <span className="text-xs font-bold text-gray-400">kg</span>
              </div>
            </div>
            <input
              type="range"
              min={35}
              max={200}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Physical Activity */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-300 mb-2">
            {t("labelActivity")}
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as MacroCalcActivity)}
            className="w-full rounded-2xl border border-white/20 bg-black/40 py-4 px-4 text-sm font-semibold text-white shadow-sm focus:border-emerald-400 focus:outline-none"
          >
            <option value="sedentary" className="bg-gray-900 text-white">🛋️ {t("actSedentary")}</option>
            <option value="light" className="bg-gray-900 text-white">🚶 {t("actLight")}</option>
            <option value="moderate" className="bg-gray-900 text-white">🏃 {t("actModerate")}</option>
            <option value="high" className="bg-gray-900 text-white">🚴 {t("actHigh")}</option>
            <option value="extreme" className="bg-gray-900 text-white">🏋️ {t("actExtreme")}</option>
          </select>
        </div>

        {/* Submit CTA Button */}
        <div className="pt-4 text-center">
          <button
            type="submit"
            style={{ backgroundColor: accentColor }}
            className="w-full rounded-2xl py-4 px-8 text-base sm:text-lg font-black text-white shadow-xl shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            {t("calculateSubmit")}
          </button>
        </div>
      </div>
    </form>
  );

  // Render Step 2: Calculated Results Screen
  const renderResultsStep = () => (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Action Bar with User Summary & Recalculate Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white/10 p-4 sm:px-6 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👤</span>
          <span className="text-sm font-bold text-gray-200">
            {sex === "male" ? t("sexMale") : t("sexFemale")}, {age} {t("years")} · {height} cm · {weight} kg
          </span>
        </div>

        <button
          type="button"
          onClick={() => setStep("form")}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-white border border-white/20 hover:bg-white/20 shadow-sm transition-all cursor-pointer"
        >
          {t("recalculate")}
        </button>
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Key Metrics Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-emerald-950/40 p-6 border border-emerald-900/60 text-center shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              🔥 {t("bmrTitle")}
            </span>
            <p className="mt-2 text-3xl sm:text-4xl font-black text-emerald-100">
              {bmr} <span className="text-sm font-normal text-emerald-400">kcal</span>
            </p>
            <p className="mt-1 text-xs text-emerald-400">{t("bmrHint")}</p>
          </div>

          <div className="rounded-3xl bg-teal-950/40 p-6 border border-teal-900/60 text-center shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              ⚡ {t("tdeeTitle")}
            </span>
            <p className="mt-2 text-3xl sm:text-4xl font-black text-teal-100">
              {tdee} <span className="text-sm font-normal text-teal-400">kcal</span>
            </p>
            <p className="mt-1 text-xs text-teal-400">{t("tdeeHint")}</p>
          </div>

          <div className="rounded-3xl bg-sky-950/40 p-6 border border-sky-900/60 text-center shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              🎯 {t("healthyRangeTitle")}
            </span>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-sky-100">
              {healthyRange.min} – {healthyRange.max} <span className="text-sm font-normal text-sky-400">kg</span>
            </p>
            <p className="mt-1 text-xs text-sky-400">{t("healthyRangeHint", { ideal: healthyRange.ideal })}</p>
          </div>
        </div>

        {/* Body Composition Status & Empathetic Avatar */}
        <div className="lg:col-span-12 rounded-3xl bg-white/5 p-6 sm:p-8 border border-white/10 backdrop-blur-md shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <BodyAvatar category={bmiCategory} />
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h4 className="text-xl font-black text-white">
                  {t(`bmiCat_${bmiCategory}`)}
                </h4>
                <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-extrabold text-gray-200">
                  IMC: {bmi}
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-medium">
                {weightStatusInfo.msg}
              </p>
            </div>
          </div>

          {/* BMI Spectrum Gauge with Actual Weight Scale in kg */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex flex-wrap justify-between text-xs font-bold text-gray-300 mb-2 gap-2">
              <span>&lt; {weightThresholds.under} kg ({t("bmiLow")})</span>
              <span>{weightThresholds.under} – {weightThresholds.normal} kg ({t("bmiNormal")})</span>
              <span>{weightThresholds.normal} – {weightThresholds.over} kg ({t("bmiCat_overweight")})</span>
              <span>&gt; {weightThresholds.over} kg ({t("bmiHigh")})</span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-red-500 shadow-inner">
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                style={{ left: `${pinPercent}%` }}
              >
                <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-900 shadow-lg ring-2 ring-emerald-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Caloric Goal & Deficit Selector */}
        <div className="lg:col-span-12 space-y-4">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>📊</span> {t("deficitSectionTitle")}
          </h4>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <button
              type="button"
              onClick={() => setSelectedGoal("moderate")}
              className={`rounded-2xl p-4 text-center transition-all border cursor-pointer ${
                selectedGoal === "moderate"
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="text-xs font-bold">🎯 {t("goalModerate")}</div>
              <div className="text-lg font-black mt-1">{goalsBreakdown.moderate.calories} kcal</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal("mild")}
              className={`rounded-2xl p-4 text-center transition-all border cursor-pointer ${
                selectedGoal === "mild"
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="text-xs font-bold">🌱 {t("goalMild")}</div>
              <div className="text-lg font-black mt-1">{goalsBreakdown.mild.calories} kcal</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal("aggressive")}
              className={`rounded-2xl p-4 text-center transition-all border cursor-pointer ${
                selectedGoal === "aggressive"
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="text-xs font-bold">🔥 {t("goalAggressive")}</div>
              <div className="text-lg font-black mt-1">{goalsBreakdown.aggressive.calories} kcal</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal("maintenance")}
              className={`rounded-2xl p-4 text-center transition-all border cursor-pointer ${
                selectedGoal === "maintenance"
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="text-xs font-bold">⚖️ {t("goalMaintenance")}</div>
              <div className="text-lg font-black mt-1">{goalsBreakdown.maintenance.calories} kcal</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal("surplus")}
              className={`col-span-2 sm:col-span-1 rounded-2xl p-4 text-center transition-all border cursor-pointer ${
                selectedGoal === "surplus"
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="text-xs font-bold">📈 {t("goalSurplus")}</div>
              <div className="text-lg font-black mt-1">{goalsBreakdown.surplus.calories} kcal</div>
            </button>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 border border-white/10 text-xs sm:text-sm text-gray-300 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-bold text-white mr-2">
                {goalsBreakdown[selectedGoal].rate}:
              </span>
              {goalsBreakdown[selectedGoal].desc}
            </div>
            <span className="font-extrabold text-emerald-400 text-base">
              {currentTargetCals} kcal/día
            </span>
          </div>
        </div>

        {/* Macro Breakdown Suggestion */}
        <div className="lg:col-span-12 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-sm space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <span>🥑</span> {t("macrosTitle")} ({currentTargetCals} kcal)
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
            <div className="rounded-2xl bg-rose-950/40 p-4 border border-rose-900/50">
              <span className="block text-xs font-bold uppercase text-rose-300">
                🥩 {t("macroProtein")}
              </span>
              <span className="text-2xl font-black text-rose-100 my-1 block">
                {targetMacros.protein.grams}g
              </span>
              <span className="block text-xs text-rose-400">
                {targetMacros.protein.pct}% ({targetMacros.protein.cals} kcal)
              </span>
            </div>

            <div className="rounded-2xl bg-amber-950/40 p-4 border border-amber-900/50">
              <span className="block text-xs font-bold uppercase text-amber-300">
                🍞 {t("macroCarbs")}
              </span>
              <span className="text-2xl font-black text-amber-100 my-1 block">
                {targetMacros.carbs.grams}g
              </span>
              <span className="block text-xs text-amber-400">
                {targetMacros.carbs.pct}% ({targetMacros.carbs.cals} kcal)
              </span>
            </div>

            <div className="rounded-2xl bg-yellow-950/40 p-4 border border-yellow-900/50">
              <span className="block text-xs font-bold uppercase text-yellow-300">
                🥑 {t("macroFats")}
              </span>
              <span className="text-2xl font-black text-yellow-100 my-1 block">
                {targetMacros.fat.grams}g
              </span>
              <span className="block text-xs text-yellow-400">
                {targetMacros.fat.pct}% ({targetMacros.fat.cals} kcal)
              </span>
            </div>
          </div>

          {/* Explanatory note */}
          <p className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-white/10">
            {t("macroNote")}
          </p>
        </div>

        {/* Link to static macro guide */}
        {config.showGuideLink !== false && (
          <div className="lg:col-span-12 text-center pt-2">
            <Link
              href="/static/guia-macros"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 px-6 py-4 text-sm font-bold text-emerald-200 hover:bg-emerald-900/80 transition-colors shadow-sm"
            >
              <span>{guideLinkText}</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  // Floating Mode Rendering
  if (displayMode === "floating") {
    const floatingStyle = getFloatingStyles(floatingPos);

    return (
      <>
        {/* Floating Action Button (Matches GoTop styling, circular with white SVG, expands on hover) */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ ...floatingStyle, backgroundColor: accentColor }}
          className="group flex h-12 items-center gap-2.5 rounded-full px-3.5 text-white shadow-2xl shadow-ink/20 ring-4 ring-white/10 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label={t("floatingButtonLabel")}
        >
          <svg className="h-5 w-5 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="14" />
            <line x1="12" y1="14" x2="12" y2="14" />
            <line x1="8" y1="14" x2="8" y2="14" />
            <line x1="16" y1="18" x2="16" y2="18" />
            <line x1="12" y1="18" x2="12" y2="18" />
            <line x1="8" y1="18" x2="8" y2="18" />
            <line x1="16" y1="10" x2="16" y2="10" />
            <line x1="12" y1="10" x2="12" y2="10" />
            <line x1="8" y1="10" x2="8" y2="10" />
          </svg>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-xs group-hover:pr-1">
            {t("floatingButtonLabel")}
          </span>
        </button>

        {/* Modal Dialog Drawer Overlay using React Portal */}
        {isOpen && mounted && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-5xl my-auto rounded-3xl bg-[#0a1410] p-6 sm:p-10 shadow-2xl border border-white/10 text-white max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 shadow-md cursor-pointer text-lg font-bold"
              >
                ✕
              </button>

              {renderHeader()}
              {step === "form" ? renderFormStep() : renderResultsStep()}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  // Panel Mode Rendering (Full Width Edge-to-Edge)
  return (
    <section
      style={{ backgroundColor: sectionBg }}
      className={`relative w-full py-16 sm:py-24 px-4 sm:px-6 text-white overflow-hidden ${
        config.fullHeight ? "min-h-[100dvh] flex flex-col justify-center" : ""
      }`}
    >
      {/* Ambient background glows */}
      <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto w-full max-w-7xl">
        {renderHeader()}
        {step === "form" ? renderFormStep() : renderResultsStep()}
      </div>
    </section>
  );
}
