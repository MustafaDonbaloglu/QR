import { describe, expect, it } from "vitest";
import { generateSlug } from "@/lib/slug";
import { contrastRatio, contrastWarning } from "@/lib/contrast";

describe("generateSlug", () => {
  it("returns 7 base62 chars by default", () => {
    for (let i = 0; i < 50; i++) expect(generateSlug()).toMatch(/^[0-9A-Za-z]{7}$/);
  });
  it("is random", () => {
    expect(new Set(Array.from({ length: 100 }, () => generateSlug())).size).toBe(100);
  });
});

describe("contrast", () => {
  it("computes WCAG ratio", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });
  it("warns on low contrast", () => {
    expect(contrastWarning("#777777", "#888888")).toBe("Kontrast düşük, QR okunmayabilir.");
  });
  it("warns on light-on-dark", () => {
    expect(contrastWarning("#ffffff", "#000000")).toBe("Ön plan arka plandan açık; bazı okuyucular okuyamaz.");
  });
  it("no warning for dark-on-light", () => {
    expect(contrastWarning("#111111", "#ffffff")).toBeNull();
  });
});
