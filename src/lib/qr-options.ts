import type { Options } from "qr-code-styling";
import type { QrStyle } from "./style";

export function buildQrOptions(data: string, style: QrStyle, size: number): Options {
  const rounded = style.cornerType === "rounded";
  return {
    type: "svg",
    width: size,
    height: size,
    data,
    margin: Math.round(size * 0.04),
    qrOptions: { errorCorrectionLevel: style.logo ? "H" : "M" },
    dotsOptions: { color: style.fg, type: style.dotType },
    backgroundOptions: { color: style.bg },
    cornersSquareOptions: { color: style.eyeColor, type: rounded ? "extra-rounded" : "square" },
    cornersDotOptions: { color: style.eyeColor, type: rounded ? "dot" : "square" },
    ...(style.logo
      ? { image: style.logo, imageOptions: { margin: 4, imageSize: 0.3, hideBackgroundDots: true, crossOrigin: "anonymous" } }
      : {}),
  };
}
