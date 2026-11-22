import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { logoutAction } from "../login/actions";
import { NavLink } from "@/components/NavLink";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/" className="whitespace-nowrap font-display text-lg font-bold">
            QR Yönetimi
          </Link>
          <nav className="flex flex-1 gap-1 text-sm">
            <NavLink href="/">Kodlar</NavLink>
            <NavLink href="/static">Statik QR</NavLink>
          </nav>
          <form action={logoutAction}>
            <button className="text-sm text-muted hover:text-ink">Çıkış yap</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
