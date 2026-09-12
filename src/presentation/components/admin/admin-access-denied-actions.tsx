"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminAccessDeniedActions({ publicAppUrl }: { publicAppUrl: string }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function switchAccount() {
    setLeaving(true);
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
    router.replace("/login?next=/admin");
    router.refresh();
  }

  return <div className="mt-6 flex flex-col gap-3">
    <button type="button" onClick={switchAccount} disabled={leaving} className="btn-pop bg-primary text-primary-foreground shadow-[var(--shadow-pop)] disabled:opacity-60">
      {leaving ? "Saindo..." : "Entrar com outra conta"}
    </button>
    <a href={`${publicAppUrl}/dashboard`} className="btn-pop bg-muted text-foreground shadow-[var(--shadow-pop-muted)]">Voltar ao aplicativo</a>
  </div>;
}
