"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveQrAction } from "@/app/(admin)/qr/actions";
import { QrPreview } from "./QrPreview";
import { StyleControls } from "./StyleControls";
import { IconAndroid, IconApple, IconCheck, IconGlobe, IconLink, IconRoute, IconTag, IconWarn } from "./icons";
import { defaultStyle, type QrStyle } from "@/lib/style";

export type QrFormValue = {
  name: string;
  kind: "store" | "url";
  iosUrl: string;
  androidUrl: string;
  fallbackUrl: string;
  style: QrStyle;
};

export const emptyQrForm: QrFormValue = {
  name: "",
  kind: "store",
  iosUrl: "",
  androidUrl: "",
  fallbackUrl: "",
  style: defaultStyle,
};

type Props = {
  id: string | null;
  initial: QrFormValue;
  /** Short link encoded in the QR; null before the first save. */
  shortUrl: string | null;
  slug?: string;
  aside?: React.ReactNode;
};

function UrlField({ id, icon, label, value, onChange, placeholder, hint, required }: {
  id: string; icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string; hint?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        <input id={id} type="url" className="input pl-10" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function QrForm({ id, initial, shortUrl, slug, aside }: Props) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (patch: Partial<QrFormValue>) => {
    setSaved(false);
    setV((cur) => ({ ...cur, ...patch }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveQrAction(id, v);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      if (!id) router.push(`/qr/${res.id}?created=1`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
      <div className="space-y-6">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon"><IconTag /></span>
            <div>
              <h2 className="text-base font-medium">Temel bilgiler</h2>
              <p className="text-xs text-muted">Ad sadece sana görünür.</p>
            </div>
          </div>
          <div className="panel-body">
            <div>
              <label className="label" htmlFor="name">Ad</label>
              <input id="name" className="input" value={v.name} onChange={(e) => set({ name: e.target.value })} placeholder="Örn. Uygulama X, mağaza broşürü" required maxLength={100} />
            </div>
            <fieldset>
              <legend className="label">Tür</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  ["store", "Mağaza", "Cihaza göre App Store veya Play Store'a gönderir.", <IconApple key="i" className="h-4 w-4" />],
                  ["url", "Tek link", "Herkesi aynı adrese gönderir.", <IconLink key="i" />],
                ] as const).map(([k, title, desc, icon]) => {
                  const on = v.kind === k;
                  return (
                    <label key={k} className={`relative flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors ${on ? "border-accent bg-accent-soft/60 ring-4 ring-accent/10" : "border-line bg-surface-2 hover:border-muted/40"}`}>
                      <input type="radio" name="kind" value={k} checked={on} onChange={() => set({ kind: k })} className="sr-only" />
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${on ? "bg-accent text-accent-ink" : "bg-surface text-muted ring-1 ring-line"}`}>{icon}</span>
                      <span>
                        <span className="block text-sm font-medium">{title}</span>
                        <span className="block text-xs leading-relaxed text-muted">{desc}</span>
                      </span>
                      {on && <IconCheck className="absolute right-3 top-3 h-4 w-4 text-accent" />}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="panel-icon"><IconRoute /></span>
            <div>
              <h2 className="text-base font-medium">Yönlendirme</h2>
              <p className="text-xs text-muted">İstediğin zaman değiştir; basılmış QR aynı kalır.</p>
            </div>
          </div>
          <div className="panel-body">
            {v.kind === "store" ? (
              <>
                <UrlField id="ios" icon={<IconApple className="h-4 w-4" />} label="App Store linki" value={v.iosUrl} onChange={(iosUrl) => set({ iosUrl })} placeholder="https://apps.apple.com/tr/app/…" />
                <UrlField id="android" icon={<IconAndroid className="h-4 w-4" />} label="Play Store linki" value={v.androidUrl} onChange={(androidUrl) => set({ androidUrl })} placeholder="https://play.google.com/store/apps/details?id=…" />
                <UrlField id="fallback" icon={<IconGlobe className="h-4 w-4" />} label="Diğer cihazlar için link" value={v.fallbackUrl} onChange={(fallbackUrl) => set({ fallbackUrl })} placeholder="https://uygulaman.com" required hint="Bilgisayardan açanlar ve linki boş bırakılan platform buraya gider." />
              </>
            ) : (
              <UrlField id="fallback" icon={<IconLink />} label="Hedef link" value={v.fallbackUrl} onChange={(fallbackUrl) => set({ fallbackUrl })} placeholder="https://…" required />
            )}
          </div>
        </section>

        <StyleControls value={v.style} onChange={(style) => set({ style })} />

        <div className="sticky bottom-4 z-[2] flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-panel backdrop-blur">
          <button className="btn btn-primary" disabled={pending}>
            {pending ? "Kaydediliyor…" : id ? "Değişiklikleri kaydet" : "QR oluştur"}
          </button>
          {saved && id && (
            <span className="chip bg-ok-soft text-ok" role="status"><IconCheck /> Kaydedildi</span>
          )}
          {error && (
            <span className="notice bg-danger-soft py-1.5 text-danger" role="alert"><IconWarn />{error}</span>
          )}
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        {shortUrl ? (
          <QrPreview data={shortUrl} style={v.style} fileName={`qr-${slug ?? "kod"}`} />
        ) : (
          <QrPreview data="" style={v.style} showDownloads={false} emptyText="Kısa link ilk kayıtta oluşur. QR ve indirme düğmeleri o zaman açılır." />
        )}
        {aside}
      </aside>
    </form>
  );
}
