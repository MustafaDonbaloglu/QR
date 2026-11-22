"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveQrAction } from "@/app/(admin)/qr/actions";
import { QrPreview } from "./QrPreview";
import { StyleControls } from "./StyleControls";
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
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <label className="label" htmlFor="name">Ad</label>
          <input id="name" className="input" value={v.name} onChange={(e) => set({ name: e.target.value })} placeholder="Örn. Uygulama X — mağaza broşürü" required maxLength={100} />
          <p className="hint">Sadece sen görürsün; kodları ayırt etmek için.</p>
        </div>

        <fieldset>
          <legend className="label">Tür</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["store", "Mağaza", "Cihaza göre App Store veya Play Store'a gönderir."],
              ["url", "Tek link", "Herkesi aynı adrese gönderir."],
            ] as const).map(([k, title, desc]) => (
              <label key={k} className={`cursor-pointer rounded-lg border bg-surface p-3 ${v.kind === k ? "border-accent ring-2 ring-accent/20" : "border-line"}`}>
                <input type="radio" name="kind" value={k} checked={v.kind === k} onChange={() => set({ kind: k })} className="sr-only" />
                <span className="block text-sm font-medium">{title}</span>
                <span className="block text-xs text-muted">{desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {v.kind === "store" ? (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="ios">App Store linki</label>
              <input id="ios" type="url" className="input" value={v.iosUrl} onChange={(e) => set({ iosUrl: e.target.value })} placeholder="https://apps.apple.com/tr/app/…" />
            </div>
            <div>
              <label className="label" htmlFor="android">Play Store linki</label>
              <input id="android" type="url" className="input" value={v.androidUrl} onChange={(e) => set({ androidUrl: e.target.value })} placeholder="https://play.google.com/store/apps/details?id=…" />
            </div>
            <div>
              <label className="label" htmlFor="fallback">Diğer cihazlar için link</label>
              <input id="fallback" type="url" className="input" value={v.fallbackUrl} onChange={(e) => set({ fallbackUrl: e.target.value })} placeholder="https://uygulaman.com" required />
              <p className="hint">Bilgisayardan açanlar ve linki boş bırakılan platform buraya gider.</p>
            </div>
          </div>
        ) : (
          <div>
            <label className="label" htmlFor="fallback">Hedef link</label>
            <input id="fallback" type="url" className="input" value={v.fallbackUrl} onChange={(e) => set({ fallbackUrl: e.target.value })} placeholder="https://…" required />
          </div>
        )}

        <StyleControls value={v.style} onChange={(style) => set({ style })} />

        {error && <p className="rounded-lg bg-danger/8 px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
        <div className="flex items-center gap-3">
          <button className="btn btn-primary" disabled={pending}>
            {pending ? "Kaydediliyor…" : id ? "Değişiklikleri kaydet" : "QR oluştur"}
          </button>
          {saved && id && <span className="text-sm text-ok" role="status">Kaydedildi</span>}
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        {shortUrl ? (
          <QrPreview data={shortUrl} style={v.style} fileName={`qr-${slug ?? "kod"}`} />
        ) : (
          <div className="proof text-center text-sm text-muted">
            <span className="crop" aria-hidden />
            <div className="pointer-events-none opacity-40">
              <QrPreview data="https://ornek" style={v.style} showDownloads={false} />
            </div>
            <p className="mt-4">Kısa link ilk kayıtta oluşur. İndirme kayıttan sonra açılır.</p>
          </div>
        )}
        {aside}
      </aside>
    </form>
  );
}
