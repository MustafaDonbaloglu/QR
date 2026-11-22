import Link from "next/link";
import { emptyQrForm, QrForm } from "@/components/QrForm";

export default function NewQrPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-ink">← Dinamik kodlar</Link>
        <h1 className="text-2xl font-bold">Yeni dinamik QR</h1>
      </div>
      <QrForm id={null} initial={emptyQrForm} shortUrl={null} />
    </div>
  );
}
