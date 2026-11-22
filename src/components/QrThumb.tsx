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
      new Qr(buildQrOptions(data, style, 128)).append(el);
      el.querySelector("svg")?.setAttribute("style", "width:100%;height:100%");
    });
    return () => {
      cancelled = true;
    };
  }, [data, style]);
  return (
    <div
      ref={ref}
      aria-hidden
      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg shadow-[0_1px_2px_rgb(0_0_0/0.08),0_6px_14px_-8px_rgb(0_0_0/0.3)]"
      style={{ background: style.bg }}
    />
  );
}
