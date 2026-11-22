import { findBySlug, incrementScan } from "@/lib/qr-repo";
import { detectPlatform, resolveTarget } from "@/lib/platform";

export const dynamic = "force-dynamic";

const NO_STORE = "no-store, max-age=0";

function page(status: number, title: string, message: string): Response {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f6f6f4;color:#222}main{text-align:center;padding:24px}h1{font-size:1.25rem}p{color:#666}</style></head>
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
