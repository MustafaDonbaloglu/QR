import { describe, expect, it } from "vitest";
import { isHttpUrl, qrInputSchema } from "@/lib/validate";
import { defaultStyle, qrStyleSchema } from "@/lib/style";

describe("isHttpUrl", () => {
  it("accepts http(s) only", () => {
    expect(isHttpUrl("https://apps.apple.com/app/id1")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("ftp://x")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
    expect(isHttpUrl("https://exa mple.com")).toBe(false);
  });
});

describe("qrInputSchema", () => {
  const base = { name: "Uygulama", kind: "store", fallbackUrl: "https://example.com", style: defaultStyle };
  it("rejects store QR without any store link", () => {
    expect(qrInputSchema.safeParse(base).success).toBe(false);
  });
  it("accepts store QR with only iOS link and normalises empty strings", () => {
    const r = qrInputSchema.safeParse({ ...base, iosUrl: "https://apps.apple.com/app/id1", androidUrl: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.androidUrl).toBeNull();
  });
  it("rejects javascript: targets", () => {
    expect(qrInputSchema.safeParse({ ...base, kind: "url", fallbackUrl: "javascript:alert(1)" }).success).toBe(false);
  });
  it("trims and requires a name", () => {
    expect(qrInputSchema.safeParse({ ...base, kind: "url", name: "   " }).success).toBe(false);
  });
  it("url kind drops store links", () => {
    const r = qrInputSchema.parse({ ...base, kind: "url", iosUrl: "https://apps.apple.com/app/id1" });
    expect(r.iosUrl).toBeNull();
  });
});

describe("qrStyleSchema", () => {
  it("rejects bad colors and oversized logos", () => {
    expect(qrStyleSchema.safeParse({ ...defaultStyle, fg: "red" }).success).toBe(false);
    const big = "data:image/png;base64," + "A".repeat(300 * 1024);
    expect(qrStyleSchema.safeParse({ ...defaultStyle, logo: big }).success).toBe(false);
    expect(qrStyleSchema.safeParse({ ...defaultStyle, logo: "data:image/png;base64,iVBORw0KGgo=" }).success).toBe(true);
  });
});
