import { ShieldX } from "lucide-react";
import { getCurrentStaff } from "@/core/admin/admin-service";
import { AdminShell } from "@/presentation/components/admin/admin-shell";
import { AdminAccessDeniedActions } from "@/presentation/components/admin/admin-access-denied-actions";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const staff = await getCurrentStaff();
  if (!staff) {
    const publicAppUrl = process.env.APP_URL || "http://localhost:3000";
    return <main className="grid min-h-svh place-items-center bg-background px-4">
      <section className="card-pop max-w-md p-7 text-center sm:p-9">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/15 text-destructive"><ShieldX className="h-8 w-8" /></div>
        <h1 className="mt-5 text-2xl font-black">Acesso administrativo restrito</h1>
        <p className="mt-2 font-bold text-muted-foreground">Sua conta está autenticada, mas não possui um papel administrativo autorizado.</p>
        <AdminAccessDeniedActions publicAppUrl={publicAppUrl} />
      </section>
    </main>;
  }
  const displayName = typeof staff.profile.displayName === "string" ? staff.profile.displayName : staff.user.email ?? "Equipe";
  return <AdminShell role={staff.role} displayName={displayName}>{children}</AdminShell>;
}
