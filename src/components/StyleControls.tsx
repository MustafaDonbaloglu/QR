"use client";

import { useState } from "react";
import { contrastWarning } from "@/lib/contrast";
import { MAX_LOGO_BYTES, type QrStyle } from "@/lib/style";
import { IconPalette, IconWarn } from "./icons";

type Props = { value: QrStyle; onChange: (s: QrStyle) => void };

const PRESETS: { name: string; fg: string; eyeColor: string; bg: string }[] = [
  { name: "Klasik", fg: "#111827", eyeColor: "#111827", bg: "#ffffff" },
  { name: "Okyanus", fg: "#0c4a6e", eyeColor: "#0284c7", bg: "#ffffff" },
  { name: "Orman", fg: "#14532d", eyeColor: "#16a34a", bg: "#f7fbf8" },
  { name: "Mürdüm", fg: "#4c1d95", eyeColor: "#9333ea", bg: "#fcfaff" },
  { name: "Kiremit", fg: "#7c2d12", eyeColor: "#ea580c", bg: "#fffaf5" },
  { name: "Grafit", fg: "#334155", eyeColor: "#0f172a", bg: "#f8fafc" },
];

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
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5 transition-colors hover:border-muted/40">
      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={label} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-tight">{label}</span>
        <span className="block font-mono text-[11px] text-muted">{value.toUpperCase()}</span>
      </span>
    </label>
  );
}

function Segmented<T extends string>({ options, value, onChange, label }: { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div>
      <span className="label">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-surface-2 p-1 ring-1 ring-line">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={value === o.v}
            onClick={() => onChange(o.v)}
            className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors ${
              value === o.v ? "bg-surface font-medium text-ink shadow-panel ring-1 ring-line" : "text-muted hover:text-ink"
            }`}
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
    <section className="panel">
      <div className="panel-head">
        <span className="panel-icon"><IconPalette /></span>
        <div>
          <h2 className="text-base font-medium">Görünüm</h2>
          <p className="text-xs text-muted">Renkler, şekiller ve ortadaki logo.</p>
        </div>
      </div>
      <div className="panel-body">
        <div>
          <span className="label">Hazır paletler</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const selected = p.fg === value.fg && p.eyeColor === value.eyeColor && p.bg === value.bg;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => set({ fg: p.fg, eyeColor: p.eyeColor, bg: p.bg })}
                  aria-pressed={selected}
                  className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-sm transition-colors ${
                    selected ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface-2 hover:border-muted/40"
                  }`}
                >
                  <span className="flex -space-x-1.5">
                    {[p.bg, p.fg, p.eyeColor].map((c, i) => (
                      <span key={i} className="h-4 w-4 rounded-full ring-2 ring-surface" style={{ background: c, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.12)" }} />
                    ))}
                  </span>
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <ColorField label="Noktalar" value={value.fg} onChange={(fg) => set({ fg })} />
          <ColorField label="Köşeler" value={value.eyeColor} onChange={(eyeColor) => set({ eyeColor })} />
          <ColorField label="Arka plan" value={value.bg} onChange={(bg) => set({ bg })} />
        </div>
        {warning && (
          <p className="notice bg-danger-soft text-danger">
            <IconWarn />
            {warning}
          </p>
        )}

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <Segmented label="Nokta şekli" options={DOTS} value={value.dotType} onChange={(dotType) => set({ dotType })} />
          <Segmented label="Köşe şekli" options={CORNERS} value={value.cornerType} onChange={(cornerType) => set({ cornerType })} />
        </div>

        <div>
          <span className="label">Ortadaki logo</span>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-line bg-surface-2 p-3">
            {value.logo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value.logo} alt="Seçili logo" className="h-11 w-11 rounded-lg bg-white object-contain p-1 ring-1 ring-line" />
                <button type="button" className="btn btn-ghost px-3 py-2" onClick={() => set({ logo: undefined })}>
                  Logoyu kaldır
                </button>
              </>
            ) : (
              <label className="btn btn-ghost cursor-pointer px-3 py-2">
                Logo seç
                <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={(e) => onLogo(e.target.files?.[0])} />
              </label>
            )}
            <span className="text-xs text-muted">PNG, JPEG veya SVG, en fazla 200 KB. Uygulama ikonun iyi durur.</span>
          </div>
          {logoError && <p className="mt-2 text-sm text-danger">{logoError}</p>}
        </div>
      </div>
    </section>
  );
}
