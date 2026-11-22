import { desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { qrCodes, type QrRow } from "@/db/schema";
import type { Platform } from "./platform";
import { generateSlug } from "./slug";
import type { QrInput } from "./validate";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SLUG_ATTEMPTS = 5;

function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

export async function listQrs(search?: string): Promise<QrRow[]> {
  const q = search?.trim();
  return db
    .select()
    .from(qrCodes)
    .where(q ? ilike(qrCodes.name, `%${q.replace(/[\\%_]/g, "\\$&")}%`) : undefined)
    .orderBy(desc(qrCodes.createdAt));
}

export async function getQr(id: string): Promise<QrRow | null> {
  if (!UUID_RE.test(id)) return null;
  const [row] = await db.select().from(qrCodes).where(eq(qrCodes.id, id));
  return row ?? null;
}

export async function findBySlug(slug: string): Promise<QrRow | null> {
  const [row] = await db.select().from(qrCodes).where(eq(qrCodes.slug, slug));
  return row ?? null;
}

export async function createQr(input: QrInput, slugFn: () => string = generateSlug): Promise<QrRow> {
  let lastError: unknown;
  for (let i = 0; i < MAX_SLUG_ATTEMPTS; i++) {
    try {
      const [row] = await db.insert(qrCodes).values({ ...input, slug: slugFn() }).returning();
      return row;
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
      lastError = e;
    }
  }
  throw new Error("Benzersiz kısa kod üretilemedi", { cause: lastError });
}

export async function updateQr(id: string, input: QrInput): Promise<QrRow | null> {
  if (!UUID_RE.test(id)) return null;
  const [row] = await db
    .update(qrCodes)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(qrCodes.id, id))
    .returning();
  return row ?? null;
}

export async function setActive(id: string, active: boolean): Promise<void> {
  if (!UUID_RE.test(id)) return;
  await db.update(qrCodes).set({ active, updatedAt: new Date() }).where(eq(qrCodes.id, id));
}

export async function deleteQr(id: string): Promise<void> {
  if (!UUID_RE.test(id)) return;
  await db.delete(qrCodes).where(eq(qrCodes.id, id));
}

const SCAN_COLUMN = {
  ios: qrCodes.scanCountIos,
  android: qrCodes.scanCountAndroid,
  other: qrCodes.scanCountOther,
} as const;

const SCAN_KEY = { ios: "scanCountIos", android: "scanCountAndroid", other: "scanCountOther" } as const;

export async function incrementScan(id: string, p: Platform): Promise<void> {
  await db
    .update(qrCodes)
    .set({ [SCAN_KEY[p]]: sql`${SCAN_COLUMN[p]} + 1` })
    .where(eq(qrCodes.id, id));
}
