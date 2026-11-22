import type { QrRow } from "@/db/schema";

export type Platform = "ios" | "android" | "other";

export function detectPlatform(ua: string | null): Platform {
  if (!ua) return "other";
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export function resolveTarget(
  qr: Pick<QrRow, "kind" | "iosUrl" | "androidUrl" | "fallbackUrl">,
  p: Platform,
): string {
  if (qr.kind === "store") {
    if (p === "ios" && qr.iosUrl) return qr.iosUrl;
    if (p === "android" && qr.androidUrl) return qr.androidUrl;
  }
  return qr.fallbackUrl;
}
