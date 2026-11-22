import { describe, expect, it } from "vitest";
import { buildQrOptions } from "@/lib/qr-options";
import { defaultStyle } from "@/lib/style";

describe("buildQrOptions", () => {
  it("uses ECL M without logo and maps colors", () => {
    const o = buildQrOptions("https://qr.example.com/r/abc", { ...defaultStyle, fg: "#123456", eyeColor: "#ff0000" }, 300);
    expect(o.qrOptions?.errorCorrectionLevel).toBe("M");
    expect(o.dotsOptions?.color).toBe("#123456");
    expect(o.cornersSquareOptions?.color).toBe("#ff0000");
    expect(o.cornersDotOptions?.color).toBe("#ff0000");
    expect(o.image).toBeUndefined();
    expect(o.width).toBe(300);
  });

  it("uses ECL H with logo", () => {
    const o = buildQrOptions("x", { ...defaultStyle, logo: "data:image/png;base64,AAAA" }, 300);
    expect(o.qrOptions?.errorCorrectionLevel).toBe("H");
    expect(o.image).toBe("data:image/png;base64,AAAA");
    expect(o.imageOptions?.imageSize).toBe(0.3);
  });

  it("maps rounded corners to extra-rounded", () => {
    const o = buildQrOptions("x", { ...defaultStyle, cornerType: "rounded", dotType: "dots" }, 300);
    expect(o.cornersSquareOptions?.type).toBe("extra-rounded");
    expect(o.cornersDotOptions?.type).toBe("dot");
    expect(o.dotsOptions?.type).toBe("dots");
  });
});
