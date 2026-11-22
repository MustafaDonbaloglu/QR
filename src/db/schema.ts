import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { QrStyle } from "@/lib/style";

export const qrKind = pgEnum("qr_kind", ["store", "url"]);

export const qrCodes = pgTable("qr_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: qrKind("kind").notNull(),
  iosUrl: text("ios_url"),
  androidUrl: text("android_url"),
  fallbackUrl: text("fallback_url").notNull(),
  style: jsonb("style").$type<QrStyle>().notNull(),
  active: boolean("active").notNull().default(true),
  scanCountIos: integer("scan_count_ios").notNull().default(0),
  scanCountAndroid: integer("scan_count_android").notNull().default(0),
  scanCountOther: integer("scan_count_other").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type QrRow = typeof qrCodes.$inferSelect;
export type NewQr = typeof qrCodes.$inferInsert;
export type QrKind = (typeof qrKind.enumValues)[number];
