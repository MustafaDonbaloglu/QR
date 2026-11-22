"use client";

import { useState, useTransition } from "react";
import { deleteQrAction, toggleActiveAction } from "@/app/(admin)/qr/actions";
import { CopyButton } from "./CopyButton";
import { IconAndroid, IconApple, IconChart, IconGlobe } from "./icons";

type Props = {
  id: string;
  active: boolean;
  shortUrl: string;
  scans: { ios: number; android: number; other: number };
};

export function QrManage({ id, active, shortUrl, scans }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const total = scans.ios + scans.android + scans.other;
  const rows = [
    { k: "iOS", n: scans.ios, icon: <IconApple /> },
    { k: "Android", n: scans.android, icon: <IconAndroid /> },
    { k: "Diğer", n: scans.other, icon: <IconGlobe /> },
  ];

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="panel-head">
          <span className="panel-icon"><IconChart /></span>
          <div className="flex-1">
            <h2 className="text-base font-medium">Okutmalar</h2>
            <p className="text-xs text-muted">Toplam {total.toLocaleString("tr-TR")}</p>
          </div>
        </div>
        <div className="space-y-3 p-5">
          {rows.map((r) => (
            <div key={r.k} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted">{r.icon}{r.k}</span>
                <span className="font-medium tabular-nums">{r.n.toLocaleString("tr-TR")}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2 ring-1 ring-line">
                <div className="h-full rounded-full bg-accent" style={{ width: total ? `${(r.n / total) * 100}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel divide-y divide-line">
        <div className="p-5">
          <span className="label">Kısa link</span>
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 ring-1 ring-line">
            <a href={shortUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-[13px] hover:text-accent">
              {shortUrl.replace(/^https?:\/\//, "")}
            </a>
            <CopyButton text={shortUrl} />
          </div>
          <p className="hint">QR&apos;ın içindeki adres bu ve hiç değişmez.</p>
        </div>

        <div className="flex items-center justify-between gap-3 p-5">
          <div>
            <span className="block text-sm font-medium">{active ? "Aktif" : "Pasif"}</span>
            <span className="block text-xs text-muted">
              {active ? "Okutan kişi hedefe yönlenir." : "Okutan kişi “aktif değil” sayfası görür."}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label="Aktif"
            disabled={pending}
            onClick={() => start(() => toggleActiveAction(id, !active))}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${active ? "bg-ok" : "bg-line"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="p-5">
          {confirming ? (
            <div className="space-y-3 rounded-xl bg-danger-soft p-3.5">
              <p className="text-sm text-danger">Basılmış kodlar çalışmaz hale gelir. Bu işlem geri alınamaz.</p>
              <div className="flex gap-2">
                <button type="button" className="btn btn-danger px-3 py-2" disabled={pending} onClick={() => start(() => deleteQrAction(id))}>
                  Kalıcı olarak sil
                </button>
                <button type="button" className="btn btn-ghost px-3 py-2" onClick={() => setConfirming(false)}>
                  Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="text-sm font-medium text-danger hover:underline" onClick={() => setConfirming(true)}>
              QR&apos;ı sil
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
