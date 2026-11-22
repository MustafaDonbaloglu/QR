const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function generateSlug(len = 7): string {
  // Rejection sampling avoids modulo bias (248 = 62 * 4).
  const out: string[] = [];
  while (out.length < len) {
    const bytes = crypto.getRandomValues(new Uint8Array(len * 2));
    for (const b of bytes) {
      if (b < 248) out.push(ALPHABET[b % 62]);
      if (out.length === len) break;
    }
  }
  return out.join("");
}
