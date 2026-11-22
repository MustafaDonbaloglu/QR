"use client";

import { useEffect, useRef } from "react";
import { buildQrOptions } from "@/lib/qr-options";
import type { QrStyle } from "@/lib/style";

export function QrThumb({ data, style }: { data: string; style: QrStyle }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    import("qr-code-styling").then(({ default: Qr }) => {
      const el = ref.current;
      if (cancelled || !el) return;
      el.innerHTML = "";
      new Qr(buildQrOptions(data, style, 112)).append(el);
      el.querySelector("svg")?.setAttribute("style", "width:100%;height:100%");
    });
    return () => {
      cancelled = true;
    };
  }, [data, style]);
  return <div ref={ref} aria-hidden className="h-14 w-14 shrink-0 rounded border border-line" style={{ background: style.bg }} />;
}
