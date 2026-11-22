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
