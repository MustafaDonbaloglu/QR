import { sql } from "drizzle-orm";
import { db } from "@/db";
import { defaultStyle } from "@/lib/style";
import type { QrInput } from "@/lib/validate";

export async function resetDb() {
  await db.execute(sql`truncate table qr_codes`);
}

export function storeInput(over: Partial<QrInput> = {}): QrInput {
  return {
    name: "Uygulama X",
    kind: "store",
    iosUrl: "https://apps.apple.com/app/id1",
    androidUrl: "https://play.google.com/store/apps/details?id=x",
    fallbackUrl: "https://example.com",
    style: defaultStyle,
    ...over,
  };
}
