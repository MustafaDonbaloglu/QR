import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session";
import { checkPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";

describe("auth", () => {
  it("checks password", () => {
    expect(checkPassword("test-password")).toBe(true);
    expect(checkPassword("wrong")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });

  it("session token roundtrip and tamper detection", async () => {
    const t = await createSessionToken();
    expect(await verifySessionToken(t)).toBe(true);
    expect(await verifySessionToken(t.slice(0, -2) + "xx")).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken("garbage")).toBe(false);
  });

  it("rate limits after 5 attempts", () => {
    const key = "ip-" + Math.random();
    for (let i = 0; i < 5; i++) expect(rateLimit(key)).toBe(true);
    expect(rateLimit(key)).toBe(false);
    expect(rateLimit("other-" + Math.random())).toBe(true);
  });
});

import { clientIp } from "@/lib/rate-limit";

describe("clientIp", () => {
  it("prefers proxy-set x-real-ip over spoofable x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "1.1.1.1, 9.9.9.9", "x-real-ip": "9.9.9.9" });
    expect(clientIp(h)).toBe("9.9.9.9");
  });
  it("falls back to the last x-forwarded-for hop (appended by the proxy)", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.1.1.1, 8.8.8.8" }))).toBe("8.8.8.8");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
