import { findBySlug, incrementScan } from "@/lib/qr-repo";
import { detectPlatform, resolveTarget } from "@/lib/platform";

export const dynamic = "force-dynamic";

const NO_STORE = "no-store, max-age=0";

function page(status: number, title: string, message: string): Response {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>:root{color-scheme:light dark}body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f2f5f3;color:#1d2a28}main{text-align:center;padding:32px 28px;background:#fff;border:1px solid #e0e6e3;border-radius:18px;max-width:340px;margin:16px}h1{font-size:1.2rem;margin:0 0 6px}p{color:#667570;margin:0}@media(prefers-color-scheme:dark){body{background:#111816;color:#e3ebe8}main{background:#18211f;border-color:#2a3633}p{color:#93a49e}}</style></head>
<body><main><h1>${title}</h1><p>${message}</p></main></body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": NO_STORE },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[0-9A-Za-z]{1,32}$/.test(slug)) return page(404, "Bulunamadı", "Bu QR kodu tanımlı değil.");

  const qr = await findBySlug(slug);
  if (!qr) return page(404, "Bulunamadı", "Bu QR kodu tanımlı değil.");
  if (!qr.active) return page(410, "Pasif bağlantı", "Bu bağlantı artık aktif değil.");

  const platform = detectPlatform(req.headers.get("user-agent"));
  incrementScan(qr.id, platform).catch((e) => console.error("scan count failed", e));

  return new Response(null, {
    status: 302,
    headers: { location: resolveTarget(qr, platform), "cache-control": NO_STORE },
  });
}
