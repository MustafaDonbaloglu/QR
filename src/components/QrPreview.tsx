"use client";

import { useEffect, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";
import { buildQrOptions } from "@/lib/qr-options";
import type { QrStyle } from "@/lib/style";
import { IconDownload } from "./icons";

type Props = {
  data: string;
  style: QrStyle;
  size?: number;
  fileName?: string;
  showDownloads?: boolean;
  emptyText?: string;
};

async function makeQr(data: string, style: QrStyle, size: number): Promise<QRCodeStyling> {
  const { default: Qr } = await import("qr-code-styling");
  return new Qr(buildQrOptions(data, style, size));
}

export function QrPreview({
  data,
  style,
  size = 260,
  fileName = "qr",
  showDownloads = true,
  emptyText = "İçerik girildiğinde QR burada görünür.",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const empty = data.trim() === "";

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el || empty) return;
    makeQr(data, style, size).then((qr) => {
      if (cancelled) return;
      el.innerHTML = "";
      qr.append(el);
      const svg = el.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [data, style, size, empty]);

  async function download(ext: "png" | "svg") {
    setBusy(true);
    try {
      const qr = await makeQr(data, style, 1024);
      if (ext === "png") qr.update({ type: "canvas" });
      await qr.download({ name: fileName, extension: ext });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel overflow-hidden">
      <div className="stage px-8 py-9">
        <div className="proof mx-auto w-full" style={{ maxWidth: size + 44, background: empty ? "#fff" : style.bg }}>
          <span className="crop" aria-hidden />
          <div ref={ref} role="img" aria-label="QR önizleme" className="aspect-square w-full">
            {empty && (
              <div className="grid h-full place-items-center px-4 text-center text-sm text-[#7b8a85]">{emptyText}</div>
            )}
          </div>
        </div>
      </div>
      {showDownloads && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3.5">
          <span className="text-xs text-muted">Telefon kamerasıyla okutup dene.</span>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost px-3 py-2" disabled={empty || busy} onClick={() => download("png")}>
              <IconDownload />
              PNG
            </button>
            <button type="button" className="btn btn-ghost px-3 py-2" disabled={empty || busy} onClick={() => download("svg")}>
              <IconDownload />
              SVG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
