import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/r/[slug]/route";
import { createQr, getQr, setActive } from "@/lib/qr-repo";
import { resetDb, storeInput } from "./helpers";

beforeEach(resetDb);

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile";
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0";

function call(slug: string, ua: string) {
  const req = new Request(`http://localhost/r/${slug}`, { headers: { "user-agent": ua } });
  return GET(req, { params: Promise.resolve({ slug }) });
}

describe("GET /r/[slug]", () => {
  it("redirects iPhone to App Store with 302 and no-store", async () => {
    const qr = await createQr(storeInput());
    const res = await call(qr.slug, IPHONE);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(qr.iosUrl);
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("redirects Android to Play Store and desktop to fallback", async () => {
    const qr = await createQr(storeInput());
    expect((await call(qr.slug, ANDROID)).headers.get("location")).toBe(qr.androidUrl);
    expect((await call(qr.slug, DESKTOP)).headers.get("location")).toBe(qr.fallbackUrl);
  });

  it("counts the scan", async () => {
    const qr = await createQr(storeInput());
    await call(qr.slug, IPHONE);
    await new Promise((r) => setTimeout(r, 100));
    expect((await getQr(qr.id))?.scanCountIos).toBe(1);
  });

  it("returns 410 for inactive QR", async () => {
    const qr = await createQr(storeInput());
    await setActive(qr.id, false);
    const res = await call(qr.slug, IPHONE);
    expect(res.status).toBe(410);
    expect(await res.text()).toContain("Bu bağlantı artık aktif değil.");
  });

  it("returns 404 for unknown slug", async () => {
    expect((await call("zzzzzzz", IPHONE)).status).toBe(404);
  });
});
