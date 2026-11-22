import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { QrThumb } from "@/components/QrThumb";
import { IconAndroid, IconApple, IconGlobe, IconLink, IconPlus, IconQr, IconSearch } from "@/components/icons";
import { publicUrl } from "@/lib/env";
import { listQrs } from "@/lib/qr-repo";

export const dynamic = "force-dynamic";

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums" title={label}>
      {icon}
      {value.toLocaleString("tr-TR")}
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const qrs = await listQrs(q);

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight">Dinamik kodlar</h1>
          <p className="mt-1 text-sm text-muted">Basıldıktan sonra da hedefini değiştirebileceğin QR kodlar.</p>
        </div>
        <Link href="/qr/new" className="btn btn-primary">
          <IconPlus />
          Yeni dinamik QR
        </Link>
      </div>

      <form className="relative max-w-sm">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={q} placeholder="Ada göre ara" className="input pl-10" aria-label="Ada göre ara" />
      </form>

      {qrs.length === 0 ? (
        <div className="panel stage flex flex-col items-center px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-accent shadow-panel">
            <IconQr className="h-7 w-7" />
          </span>
          <p className="mt-5 font-display text-lg font-medium">{q ? "Aramana uyan kod yok" : "İlk kodunu oluştur"}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {q
              ? "Farklı bir ad dene ya da aramayı temizle."
              : "Tek bir QR ile iPhone kullananları App Store'a, Android kullananları Play Store'a gönder."}
          </p>
          {!q && (
            <Link href="/qr/new" className="btn btn-primary mt-6">
              <IconPlus />
              Yeni dinamik QR
            </Link>
          )}
        </div>
      ) : (
        <ul className="panel divide-y divide-line overflow-hidden">
          {qrs.map((qr) => {
            const url = publicUrl(qr.slug);
            return (
              <li key={qr.id} className="group relative flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:px-5">
                <QrThumb data={url} style={qr.style} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/qr/${qr.id}`} className="truncate font-medium after:absolute after:inset-0 group-hover:text-accent">
                      {qr.name}
                    </Link>
                    {!qr.active && <span className="chip bg-surface-2 text-muted ring-1 ring-line">Pasif</span>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      {qr.kind === "store" ? <IconApple /> : <IconLink className="h-3.5 w-3.5" />}
                      {qr.kind === "store" ? "Mağaza" : "Tek link"}
                    </span>
                    <span className="hidden truncate font-mono text-xs opacity-80 md:inline">/r/{qr.slug}</span>
                  </div>
                </div>
                <div className="hidden items-center gap-4 text-sm text-muted sm:flex">
                  <Stat icon={<IconApple />} value={qr.scanCountIos} label="iOS okutma" />
                  <Stat icon={<IconAndroid />} value={qr.scanCountAndroid} label="Android okutma" />
                  <Stat icon={<IconGlobe />} value={qr.scanCountOther} label="Diğer okutma" />
                </div>
                <div className="relative z-[1]">
                  <CopyButton text={url} label="Link" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
