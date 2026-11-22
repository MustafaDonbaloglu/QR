"use client";

import { useEffect, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";
import { buildQrOptions } from "@/lib/qr-options";
import type { QrStyle } from "@/lib/style";

type Props = {
  data: string;
  style: QrStyle;
  size?: number;
  fileName?: string;
  showDownloads?: boolean;
};

async function makeQr(data: string, style: QrStyle, size: number): Promise<QRCodeStyling> {
  const { default: Qr } = await import("qr-code-styling");
  return new Qr(buildQrOptions(data, style, size));
}

export function QrPreview({ data, style, size = 280, fileName = "qr", showDownloads = true }: Props) {
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
    <div className="space-y-4">
      <div className="proof mx-auto w-full" style={{ maxWidth: size + 58 }}>
        <span className="crop" aria-hidden />
        <div
          ref={ref}
          role="img"
          aria-label="QR önizleme"
          className="aspect-square w-full"
          style={{ background: empty ? "transparent" : style.bg }}
        >
          {empty && (
            <div className="grid h-full place-items-center text-center text-sm text-muted">
              İçerik girildiğinde QR burada görünür.
            </div>
          )}
        </div>
      </div>
      {showDownloads && (
        <div className="flex justify-center gap-2">
          <button type="button" className="btn btn-ghost" disabled={empty || busy} onClick={() => download("png")}>
            PNG indir
          </button>
          <button type="button" className="btn btn-ghost" disabled={empty || busy} onClick={() => download("svg")}>
            SVG indir
          </button>
        </div>
      )}
    </div>
  );
}
