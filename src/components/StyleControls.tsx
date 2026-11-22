"use client";

import { useState } from "react";
import { contrastWarning } from "@/lib/contrast";
import { MAX_LOGO_BYTES, type QrStyle } from "@/lib/style";

type Props = { value: QrStyle; onChange: (s: QrStyle) => void };

const DOTS: { v: QrStyle["dotType"]; l: string }[] = [
  { v: "square", l: "Kare" },
  { v: "rounded", l: "Yuvarlak" },
  { v: "dots", l: "Nokta" },
];
const CORNERS: { v: QrStyle["cornerType"]; l: string }[] = [
  { v: "square", l: "Kare" },
  { v: "rounded", l: "Yuvarlak" },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
        aria-label={label}
      />
      <span className="flex-1 text-sm">{label}</span>
      <span className="font-mono text-xs text-muted">{value.toUpperCase()}</span>
    </label>
  );
}

function Segmented<T extends string>({ options, value, onChange, label }: { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div>
      <span className="label">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line bg-surface p-0.5">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={value === o.v}
            onClick={() => onChange(o.v)}
            className={`rounded-md px-3 py-1.5 text-sm ${value === o.v ? "bg-ink text-white" : "text-ink hover:bg-paper"}`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StyleControls({ value, onChange }: Props) {
  const [logoError, setLogoError] = useState<string | null>(null);
  const warning = contrastWarning(value.fg, value.bg) ?? contrastWarning(value.eyeColor, value.bg);
  const set = (patch: Partial<QrStyle>) => onChange({ ...value, ...patch });

  function onLogo(file: File | undefined) {
    setLogoError(null);
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      setLogoError("Logo PNG, JPEG veya SVG olmalı.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo en fazla 200 KB olabilir.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set({ logo: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 font-display text-base font-medium">Görünüm</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        <ColorField label="Noktalar" value={value.fg} onChange={(fg) => set({ fg })} />
        <ColorField label="Köşeler" value={value.eyeColor} onChange={(eyeColor) => set({ eyeColor })} />
        <ColorField label="Arka plan" value={value.bg} onChange={(bg) => set({ bg })} />
      </div>
      {warning && <p className="rounded-lg bg-danger/8 px-3 py-2 text-sm text-danger">{warning}</p>}
      <div className="flex flex-wrap gap-6">
        <Segmented label="Nokta şekli" options={DOTS} value={value.dotType} onChange={(dotType) => set({ dotType })} />
        <Segmented label="Köşe şekli" options={CORNERS} value={value.cornerType} onChange={(cornerType) => set({ cornerType })} />
      </div>
      <div>
        <span className="label">Ortadaki logo</span>
        <div className="flex flex-wrap items-center gap-3">
          {value.logo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.logo} alt="Seçili logo" className="h-10 w-10 rounded border border-line object-contain" />
              <button type="button" className="btn btn-ghost" onClick={() => set({ logo: undefined })}>
                Logoyu kaldır
              </button>
            </>
          ) : (
            <label className="btn btn-ghost cursor-pointer">
              Logo seç
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={(e) => onLogo(e.target.files?.[0])} />
            </label>
          )}
          <span className="text-xs text-muted">PNG, JPEG veya SVG, en fazla 200 KB.</span>
        </div>
        {logoError && <p className="mt-1 text-sm text-danger">{logoError}</p>}
      </div>
    </fieldset>
  );
}
