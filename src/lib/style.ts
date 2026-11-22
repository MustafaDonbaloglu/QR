import { z } from "zod";

export const MAX_LOGO_BYTES = 200 * 1024;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçersiz renk");

/** Approximate decoded byte size of a base64 data URL. */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

export const qrStyleSchema = z.object({
  fg: hex,
  bg: hex,
  eyeColor: hex,
  dotType: z.enum(["square", "rounded", "dots"]),
  cornerType: z.enum(["square", "rounded"]),
  logo: z
    .string()
    .regex(/^data:image\/(png|jpeg|svg\+xml);base64,[A-Za-z0-9+/=]+$/, "Logo PNG, JPEG veya SVG olmalı")
    .refine((s) => dataUrlBytes(s) <= MAX_LOGO_BYTES, "Logo en fazla 200 KB olabilir")
    .optional(),
});

export type QrStyle = z.infer<typeof qrStyleSchema>;

export const defaultStyle: QrStyle = {
  fg: "#111111",
  bg: "#ffffff",
  eyeColor: "#111111",
  dotType: "square",
  cornerType: "square",
};
