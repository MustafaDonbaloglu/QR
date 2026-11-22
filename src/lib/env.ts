export function publicBaseUrl(): string {
  const base = process.env.PUBLIC_BASE_URL;
  if (!base) throw new Error("PUBLIC_BASE_URL tanımlı değil");
  return base.replace(/\/+$/, "");
}

export function publicUrl(slug: string): string {
  return `${publicBaseUrl()}/r/${slug}`;
}
