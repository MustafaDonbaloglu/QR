import { z } from "zod";
import { qrStyleSchema } from "./style";

export function isHttpUrl(s: string): boolean {
  if (/\s/.test(s)) return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const urlField = z.string().trim().refine(isHttpUrl, "Link http:// veya https:// ile başlamalı");

const optionalUrl = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isHttpUrl(v), "Link http:// veya https:// ile başlamalı");

export const qrInputSchema = z
  .object({
    name: z.string().trim().min(1, "Ad gerekli").max(100, "Ad en fazla 100 karakter"),
    kind: z.enum(["store", "url"]),
    iosUrl: optionalUrl,
    androidUrl: optionalUrl,
    fallbackUrl: urlField,
    style: qrStyleSchema,
  })
  .transform((v) => (v.kind === "url" ? { ...v, iosUrl: null, androidUrl: null } : v))
  .refine((v) => v.kind === "url" || v.iosUrl !== null || v.androidUrl !== null, {
    message: "App Store veya Play Store linklerinden en az biri gerekli",
    path: ["iosUrl"],
  });

export type QrInput = z.output<typeof qrInputSchema>;
