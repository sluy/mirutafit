"use client";

import { useState, useMemo } from "react";
import SearchableSelect, { type SelectOption } from "./SearchableSelect";

/**
 * Phone input with country code selector and flag emoji.
 *
 * Value format: full international number, e.g. "+1 555-123-4567"
 * Internally splits into dial code + local number.
 */

type Country = {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  dial: string; // e.g. "+1"
  flag: string; // emoji
};

const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "GT", name: "Guatemala", dial: "+502", flag: "🇬🇹" },
  { code: "SV", name: "El Salvador", dial: "+503", flag: "🇸🇻" },
  { code: "HN", name: "Honduras", dial: "+504", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", dial: "+505", flag: "🇳🇮" },
  { code: "CR", name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { code: "PA", name: "Panama", dial: "+507", flag: "🇵🇦" },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { code: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { code: "PE", name: "Peru", dial: "+51", flag: "🇵🇪" },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", dial: "+595", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", dial: "+591", flag: "🇧🇴" },
  { code: "DO", name: "Dominican Republic", dial: "+1", flag: "🇩🇴" },
  { code: "CU", name: "Cuba", dial: "+53", flag: "🇨🇺" },
  { code: "PR", name: "Puerto Rico", dial: "+1", flag: "🇵🇷" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
];

function parsePhone(value: string): { countryCode: string; local: string } {
  if (!value) return { countryCode: "US", local: "" };

  // Try to match a dial code at the start
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (value.startsWith(c.dial)) {
      return {
        countryCode: c.code,
        local: value.slice(c.dial.length).trim(),
      };
    }
  }
  return { countryCode: "US", local: value.replace(/^\+/, "") };
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "555 123 4567",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const parsed = parsePhone(value);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [local, setLocal] = useState(parsed.local);

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];

  const countryOptions: SelectOption[] = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        value: c.code,
        label: `${c.flag} ${c.name} (${c.dial})`,
        icon: <span className="text-lg">{c.flag}</span>,
      })),
    [],
  );

  const emitChange = (code: string, num: string) => {
    const c = COUNTRIES.find((cc) => cc.code === code) ?? COUNTRIES[0];
    const full = num.trim() ? `${c.dial} ${num.trim()}` : "";
    onChange(full);
  };

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    emitChange(code, local);
  };

  const handleLocalChange = (num: string) => {
    setLocal(num);
    emitChange(countryCode, num);
  };

  return (
    <div className="flex gap-2">
      {/* Country selector */}
      <div className="w-[140px] shrink-0">
        <SearchableSelect
          options={countryOptions}
          value={countryCode}
          onChange={handleCountryChange}
          placeholder={country.flag}
          searchPlaceholder="Search country…"
          disabled={disabled}
          className="!py-3"
        />
      </div>

      {/* Number input */}
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-ink/40">
          {country.dial}
        </span>
        <input
          value={local}
          onChange={(e) => handleLocalChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border border-ink/10 bg-gray-50 py-3 pl-14 pr-4 text-sm text-ink transition-colors placeholder:text-ink/30 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
          type="tel"
        />
      </div>
    </div>
  );
}
