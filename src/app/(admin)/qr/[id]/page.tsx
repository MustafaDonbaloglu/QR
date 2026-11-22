import Link from "next/link";
import { notFound } from "next/navigation";
import { QrForm } from "@/components/QrForm";
import { QrManage } from "@/components/QrManage";
import { publicUrl } from "@/lib/env";
import { getQr } from "@/lib/qr-repo";

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
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-ink">← Dinamik kodlar</Link>
        <h1 className="text-2xl font-bold">{qr.name}</h1>
        {created && <p className="mt-1 text-sm text-ok" role="status">QR oluşturuldu. Şimdi indirebilirsin.</p>}
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
