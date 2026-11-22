import Link from "next/link";
import { notFound } from "next/navigation";
import { QrForm } from "@/components/QrForm";
import { QrManage } from "@/components/QrManage";
import { publicUrl } from "@/lib/env";
import { getQr } from "@/lib/qr-repo";
import { IconArrowLeft, IconCheck } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditQrPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const qr = await getQr(id);
  if (!qr) notFound();
  const shortUrl = publicUrl(qr.slug);

  return (
    <div className="space-y-7">
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <IconArrowLeft /> Dinamik kodlar
        </Link>
        <h1 className="mt-2 text-[28px] font-bold leading-tight">{qr.name}</h1>
        {created && (
          <p className="notice mt-3 inline-flex bg-ok-soft text-ok" role="status">
            <IconCheck className="mt-0.5 h-4 w-4" /> QR oluşturuldu. Şimdi indirebilirsin.
          </p>
        )}
      </div>
      <QrForm
        id={qr.id}
        slug={qr.slug}
        shortUrl={shortUrl}
        initial={{
          name: qr.name,
          kind: qr.kind,
          iosUrl: qr.iosUrl ?? "",
          androidUrl: qr.androidUrl ?? "",
          fallbackUrl: qr.fallbackUrl,
          style: qr.style,
        }}
        aside={
          <QrManage
            id={qr.id}
            active={qr.active}
            shortUrl={shortUrl}
            scans={{ ios: qr.scanCountIos, android: qr.scanCountAndroid, other: qr.scanCountOther }}
          />
        }
      />
    </div>
  );
}
