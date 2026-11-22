import { beforeEach, describe, expect, it } from "vitest";
import { createQr, deleteQr, findBySlug, getQr, incrementScan, listQrs, setActive, updateQr } from "@/lib/qr-repo";
import { resetDb, storeInput } from "./helpers";

beforeEach(resetDb);

describe("qr-repo", () => {
  it("creates and reads back a QR", async () => {
    const qr = await createQr(storeInput());
    expect(qr.slug).toMatch(/^[0-9A-Za-z]{7}$/);
    expect((await getQr(qr.id))?.name).toBe("Uygulama X");
    expect((await findBySlug(qr.slug))?.id).toBe(qr.id);
  });

  it("update keeps slug and changes target", async () => {
    const qr = await createQr(storeInput());
    const up = await updateQr(qr.id, storeInput({ iosUrl: "https://apps.apple.com/app/id2" }));
    expect(up?.slug).toBe(qr.slug);
    expect(up?.iosUrl).toBe("https://apps.apple.com/app/id2");
    expect(up!.updatedAt.getTime()).toBeGreaterThanOrEqual(qr.updatedAt.getTime());
  });

  it("retries on slug collision", async () => {
    const first = await createQr(storeInput(), () => "AAAAAAA");
    const seq = ["AAAAAAA", "AAAAAAA", "BBBBBBB"];
    const second = await createQr(storeInput(), () => seq.shift()!);
    expect(first.slug).toBe("AAAAAAA");
    expect(second.slug).toBe("BBBBBBB");
  });

  it("gives up after 5 collisions", async () => {
    await createQr(storeInput(), () => "AAAAAAA");
    await expect(createQr(storeInput(), () => "AAAAAAA")).rejects.toThrow();
  });

  it("increments scan counters per platform", async () => {
    const qr = await createQr(storeInput());
    await incrementScan(qr.id, "ios");
    await incrementScan(qr.id, "ios");
    await incrementScan(qr.id, "other");
    const r = await getQr(qr.id);
    expect([r?.scanCountIos, r?.scanCountAndroid, r?.scanCountOther]).toEqual([2, 0, 1]);
  });

  it("lists with search, toggles active, deletes", async () => {
    const a = await createQr(storeInput({ name: "Broşür" }));
    await createQr(storeInput({ name: "Afiş" }));
    expect((await listQrs("broş")).map((q) => q.id)).toEqual([a.id]);
    expect(await listQrs()).toHaveLength(2);
    await setActive(a.id, false);
    expect((await getQr(a.id))?.active).toBe(false);
    await deleteQr(a.id);
    expect(await getQr(a.id)).toBeNull();
  });

  it("getQr returns null for malformed id", async () => {
    expect(await getQr("not-a-uuid")).toBeNull();
  });
});
