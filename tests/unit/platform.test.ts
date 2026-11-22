import { describe, expect, it } from "vitest";
import { detectPlatform, resolveTarget } from "@/lib/platform";

const UA = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  ipadDesktop: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  androidPhone: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
  androidTablet: "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
};

describe("detectPlatform", () => {
  it("detects iOS devices", () => {
    expect(detectPlatform(UA.iphone)).toBe("ios");
    expect(detectPlatform(UA.ipad)).toBe("ios");
  });
  it("detects Android phones and tablets", () => {
    expect(detectPlatform(UA.androidPhone)).toBe("android");
    expect(detectPlatform(UA.androidTablet)).toBe("android");
  });
  it("treats iPadOS desktop UA, desktops and missing UA as other", () => {
    expect(detectPlatform(UA.ipadDesktop)).toBe("other");
    expect(detectPlatform(UA.desktop)).toBe("other");
    expect(detectPlatform(null)).toBe("other");
  });
});

describe("resolveTarget", () => {
  const store = { kind: "store" as const, iosUrl: "https://apps.apple.com/app/id1", androidUrl: "https://play.google.com/store/apps/details?id=x", fallbackUrl: "https://example.com" };
  it("routes store QR by platform", () => {
    expect(resolveTarget(store, "ios")).toBe(store.iosUrl);
    expect(resolveTarget(store, "android")).toBe(store.androidUrl);
    expect(resolveTarget(store, "other")).toBe(store.fallbackUrl);
  });
  it("falls back when a platform link is missing", () => {
    expect(resolveTarget({ ...store, androidUrl: null }, "android")).toBe(store.fallbackUrl);
    expect(resolveTarget({ ...store, iosUrl: null }, "ios")).toBe(store.fallbackUrl);
  });
  it("url kind ignores platform", () => {
    const u = { kind: "url" as const, iosUrl: "https://x.com/ios", androidUrl: null, fallbackUrl: "https://example.com/a" };
    expect(resolveTarget(u, "ios")).toBe(u.fallbackUrl);
  });
});
