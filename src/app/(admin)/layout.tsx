import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { logoutAction } from "../login/actions";
import { Brand } from "@/components/Brand";
import { NavLink } from "@/components/NavLink";
import { IconBolt, IconLogout, IconQr } from "@/components/icons";

function Nav() {
  return (
    <>
      <NavLink href="/" icon={<IconQr className="h-[18px] w-[18px]" />}>Dinamik kodlar</NavLink>
      <NavLink href="/static" icon={<IconBolt className="h-[18px] w-[18px]" />}>Statik QR</NavLink>
    </>
  );
}

function Logout({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logoutAction}>
      <button
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        aria-label="Çıkış yap"
      >
        <IconLogout />
        {!compact && "Çıkış yap"}
      </button>
    </form>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/" className="px-2">
          <Brand />
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          <Nav />
        </nav>
        <div className="mt-auto border-t border-line pt-4">
          <Logout />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/"><Brand /></Link>
          <Logout compact />
        </div>
        <nav className="flex gap-1 px-3 pb-2">
          <Nav />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
