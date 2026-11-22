"use client";

import { useState } from "react";
import { QrPreview } from "@/components/QrPreview";
import { StyleControls } from "@/components/StyleControls";
import { IconBolt, IconWarn } from "@/components/icons";
import { defaultStyle } from "@/lib/style";

export default function StaticQrPage() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState(defaultStyle);
  const long = text.length > 900;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[28px] font-bold leading-tight">Statik QR</h1>
        <p className="mt-1 text-sm text-muted">İçerik doğrudan koda yazılır. Sonradan değiştirilemez ve hiçbir yere kaydedilmez.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="space-y-6">
          <section className="panel">
            <div className="panel-head">
              <span className="panel-icon"><IconBolt className="h-4 w-4" /></span>
              <div>
                <h2 className="text-base font-medium">İçerik</h2>
                <p className="text-xs text-muted">Link, metin, telefon numarası; ne istersen.</p>
              </div>
            </div>
            <div className="panel-body">
              <textarea
                id="content"
                aria-label="İçerik"
                rows={4}
                className="input resize-y"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://…"
              />
              {long && (
                <p className="notice bg-danger-soft text-danger"><IconWarn />İçerik uzun; QR çok yoğunlaşır ve zor okunur.</p>
              )}
            </div>
          </section>
          <StyleControls value={style} onChange={setStyle} />
        </div>
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <QrPreview data={text} style={style} fileName="statik-qr" />
        </aside>
      </div>
    </div>
  );
}
