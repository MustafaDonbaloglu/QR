import Link from "next/link";
import { emptyQrForm, QrForm } from "@/components/QrForm";
import { IconArrowLeft } from "@/components/icons";

export default function NewQrPage() {
  return (
    <div className="space-y-7">
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <IconArrowLeft /> Dinamik kodlar
        </Link>
        <h1 className="mt-2 text-[28px] font-bold leading-tight">Yeni dinamik QR</h1>
      </div>
      <QrForm id={null} initial={emptyQrForm} shortUrl={null} />
    </div>
  );
}
