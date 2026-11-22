import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { QrThumb } from "@/components/QrThumb";
import { publicUrl } from "@/lib/env";
import { listQrs } from "@/lib/qr-repo";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const qrs = await listQrs(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dinamik kodlar</h1>
          <p className="text-sm text-muted">Hedefi sonradan değiştirilebilen QR kodların.</p>
        </div>
        <Link href="/qr/new" className="btn btn-primary">
          Yeni dinamik QR
        </Link>
      </div>

      <form className="max-w-sm">
        <input name="q" defaultValue={q} placeholder="Ada göre ara" className="input" aria-label="Ada göre ara" />
      </form>

      {qrs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="font-medium">{q ? "Aramana uyan kod yok." : "Henüz dinamik QR yok."}</p>
          {!q && (
            <p className="mt-1 text-sm text-muted">
              İlk kodunu oluştur; iPhone'dan okutan App Store'a, Android'den okutan Play Store'a gitsin.
            </p>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {qrs.map((qr) => {
            const url = publicUrl(qr.slug);
            const total = qr.scanCountIos + qr.scanCountAndroid + qr.scanCountOther;
            return (
              <li key={qr.id} className="flex items-center gap-4 px-4 py-3 hover:bg-paper/60">
                <QrThumb data={url} style={qr.style} />
                <div className="min-w-0 flex-1">
                  <Link href={`/qr/${qr.id}`} className="font-medium hover:text-accent">
                    {qr.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
                    <span>{qr.kind === "store" ? "Mağaza" : "Tek link"}</span>
                    <span className="hidden truncate font-mono text-xs sm:inline">{url.replace(/^https?:\/\//, "")}</span>
                    <CopyButton text={url} label="Linki kopyala" />
                  </div>
                  <div className="text-xs text-muted tabular-nums sm:hidden">
                    {total.toLocaleString("tr-TR")} okutma, {qr.active ? "aktif" : "pasif"}
                  </div>
                </div>
                <div className="hidden text-right text-sm sm:block">
                  <div className="font-medium tabular-nums">{total.toLocaleString("tr-TR")} okutma</div>
                  <div className="text-xs text-muted tabular-nums">
                    iOS {qr.scanCountIos} / Android {qr.scanCountAndroid} / diğer {qr.scanCountOther}
                  </div>
                </div>
                <span
                  className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline ${qr.active ? "bg-ok/10 text-ok" : "bg-line text-muted"}`}
                >
                  {qr.active ? "Aktif" : "Pasif"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
