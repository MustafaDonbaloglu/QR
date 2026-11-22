"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createQr, deleteQr, setActive, updateQr } from "@/lib/qr-repo";
import { qrInputSchema } from "@/lib/validate";

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveQrAction(id: string | null, input: unknown): Promise<SaveResult> {
  await requireAuth();
  const parsed = qrInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi" };
  try {
    const row = id ? await updateQr(id, parsed.data) : await createQr(parsed.data);
    if (!row) return { ok: false, error: "QR bulunamadı." };
    revalidatePath("/");
    revalidatePath(`/qr/${row.id}`);
    return { ok: true, id: row.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Kaydedilemedi. Veritabanı bağlantısını kontrol edin." };
  }
}

export async function toggleActiveAction(id: string, active: boolean): Promise<void> {
  await requireAuth();
  await setActive(id, active);
  revalidatePath("/");
  revalidatePath(`/qr/${id}`);
}

export async function deleteQrAction(id: string): Promise<void> {
  await requireAuth();
  await deleteQr(id);
  revalidatePath("/");
  redirect("/");
}
