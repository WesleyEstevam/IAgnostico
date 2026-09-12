import Link from "next/link";
import { BarChart3, BookOpenText, CreditCard, Headphones, LayoutDashboard, ScrollText, Settings, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/presentation/components/shared/logo";
import type { StaffRole } from "@/core/admin/admin-service";
import { AdminLogoutButton } from "./admin-logout-button";

const roleLabels: Record<StaffRole, string> = { superadmin: "Superadministrador", admin: "Administrador", support: "Atendimento / Suporte" };
const available = [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }, { href: "/admin/casos", label: "Casos clínicos", icon: BookOpenText }];
const upcoming = [{ label: "Usuários", icon: Users }, { label: "Planos e assinaturas", icon: CreditCard }, { label: "Atendimento", icon: Headphones }, { label: "SEO e conteúdo", icon: BarChart3 }, { label: "Auditoria", icon: ScrollText }, { label: "Configurações", icon: Settings }];

export function AdminShell({ children, role, displayName }: { children: React.ReactNode; role: StaffRole; displayName: string }) {
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[17rem_1fr]">
    <aside className="border-b-2 border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r-2">
      <div className="flex h-16 items-center justify-between px-4 lg:h-20 lg:px-6">
        <Logo />
        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-extrabold uppercase text-primary">Admin</span>
      </div>
      <nav aria-label="Navegação administrativa" className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {available.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold text-muted-foreground transition hover:bg-primary/10 hover:text-primary"><Icon className="h-4 w-4" />{label}</Link>)}
        {upcoming.map(({ label, icon: Icon }) => <span key={label} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted-foreground/45"><Icon className="h-4 w-4" />{label}<small className="ml-auto hidden text-[9px] uppercase lg:block">Em breve</small></span>)}
      </nav>
      <div className="hidden border-t border-border p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex lg:items-center lg:justify-between lg:gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-extrabold">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{displayName}</span>
          </div>
          <p className="mt-1 truncate pl-6 text-[11px] font-bold text-muted-foreground">{roleLabels[role]}</p>
        </div>
        <AdminLogoutButton />
      </div>
    </aside>
    <div className="min-w-0">{children}</div>
  </div>;
}
