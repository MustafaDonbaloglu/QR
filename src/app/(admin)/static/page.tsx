"use client";

import { useState } from "react";
import { QrPreview } from "@/components/QrPreview";
import { StyleControls } from "@/components/StyleControls";
import { defaultStyle } from "@/lib/style";

export default function StaticQrPage() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState(defaultStyle);
  const long = text.length > 900;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statik QR</h1>
        <p className="text-sm text-muted">
          İçerik doğrudan koda yazılır; sonradan değiştirilemez ve hiçbir yere kaydedilmez.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div>
            <label className="label" htmlFor="content">İçerik</label>
            <textarea
              id="content"
              rows={4}
              className="input resize-y"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link, metin, telefon numarası…"
            />
            {long && <p className="mt-1 text-sm text-danger">İçerik uzun; QR çok yoğunlaşır ve zor okunur.</p>}
          </div>
          <StyleControls value={style} onChange={setStyle} />
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <QrPreview data={text} style={style} fileName="statik-qr" />
        </aside>
      </div>
    </div>
  );
}
