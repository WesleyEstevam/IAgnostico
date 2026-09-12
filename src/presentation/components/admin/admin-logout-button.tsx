"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/infrastructure/firebase/client";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await Promise.all([
        fetch("/api/auth/session", { method: "DELETE" }),
        getFirebaseAuth().then((auth) => signOut(auth)).catch(() => undefined),
      ]);
    } finally {
      router.replace("/login?next=/admin");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loggingOut}
      aria-label="Sair do painel administrativo"
      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-extrabold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{loggingOut ? "Saindo..." : "Sair"}</span>
    </button>
  );
}
