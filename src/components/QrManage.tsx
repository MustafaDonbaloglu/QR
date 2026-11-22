"use client";

import { useState, useTransition } from "react";
import { deleteQrAction, toggleActiveAction } from "@/app/(admin)/qr/actions";
import { CopyButton } from "./CopyButton";

type Props = {
  id: string;
  active: boolean;
  shortUrl: string;
  scans: { ios: number; android: number; other: number };
};

export function QrManage({ id, active, shortUrl, scans }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-5 rounded-xl border border-line bg-surface p-4">
      <div>
        <span className="label">Kısa link</span>
        <div className="flex items-center gap-3">
          <a href={shortUrl} target="_blank" rel="noreferrer" className="truncate font-mono text-sm hover:text-accent">
            {shortUrl.replace(/^https?:\/\//, "")}
          </a>
          <CopyButton text={shortUrl} />
        </div>
        <p className="hint">QR'ın içindeki adres bu. Hiç değişmez; hedefi istediğin zaman değiştirebilirsin.</p>
      </div>

      <div>
        <span className="label">Okutmalar</span>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {([["iOS", scans.ios], ["Android", scans.android], ["Diğer", scans.other]] as const).map(([k, n]) => (
            <div key={k} className="rounded-lg bg-paper py-2">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="font-display text-lg font-medium tabular-nums">{n.toLocaleString("tr-TR")}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="block text-sm font-medium">{active ? "Aktif" : "Pasif"}</span>
          <span className="block text-xs text-muted">
            {active ? "Okutan kişi hedefe yönlenir." : "Okutan kişi \"aktif değil\" sayfası görür."}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label="Aktif"
          disabled={pending}
          onClick={() => start(() => toggleActiveAction(id, !active))}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${active ? "bg-ok" : "bg-line"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>

      <div className="border-t border-line pt-4">
        {confirming ? (
          <div className="space-y-2">
            <p className="text-sm">Basılmış kodlar çalışmaz hale gelir. Bu geri alınamaz.</p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-danger" disabled={pending} onClick={() => start(() => deleteQrAction(id))}>
                Kalıcı olarak sil
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="text-sm text-danger hover:underline" onClick={() => setConfirming(true)}>
            QR'ı sil
          </button>
        )}
      </div>
    </div>
  );
}
