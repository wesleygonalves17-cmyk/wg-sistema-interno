import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-ink text-paper flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="text-lg font-semibold tracking-tight">WG</div>
          <div className="text-xs text-paper/50 mt-0.5">painel interno</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/" label="Hoje" />
          <NavLink href="/clientes" label="Clientes" />
          <NavLink href="/metas" label="Metas" />
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 px-10 py-8 max-w-4xl">{children}</main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded text-sm text-paper/80 hover:bg-white/5 hover:text-paper transition-colors"
    >
      {label}
    </Link>
  );
}
