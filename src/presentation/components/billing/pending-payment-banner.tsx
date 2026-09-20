"use client";

import Link from "next/link";
import { Clock3, X } from "lucide-react";
import { useEffect, useState } from "react";

type PendingCheckout = { planName: string; href: string; expiresAt: string };
export function PendingPaymentBanner() {
  const [checkout, setCheckout] = useState<PendingCheckout | null>(null); const [seconds, setSeconds] = useState(0);
  useEffect(() => { const read = () => { try { const value = localStorage.getItem("iagnostico-pending-checkout"); const parsed = value ? JSON.parse(value) as PendingCheckout : null; if (!parsed || Date.parse(parsed.expiresAt) <= Date.now()) { localStorage.removeItem("iagnostico-pending-checkout"); setCheckout(null); return; } setCheckout(parsed); setSeconds(Math.max(0, Math.ceil((Date.parse(parsed.expiresAt) - Date.now()) / 1000))); } catch { setCheckout(null); } }; read(); window.addEventListener("iagnostico-checkout-updated", read); const timer = window.setInterval(read, 1000); return () => { window.removeEventListener("iagnostico-checkout-updated", read); window.clearInterval(timer); }; }, []);
  if (!checkout || seconds <= 0) return null; const minutes = Math.floor(seconds / 60); const remainder = seconds % 60;
  return <aside className="border-t border-primary/20 bg-primary/10 px-4 py-2.5"><div className="mx-auto flex max-w-7xl items-center gap-3"><Clock3 className="h-5 w-5 shrink-0 text-primary" /><p className="min-w-0 flex-1 text-xs font-bold text-foreground sm:text-sm">Seu checkout do plano <strong>{checkout.planName}</strong> está aguardando pagamento.</p><strong className="shrink-0 font-mono text-sm text-primary">{String(minutes).padStart(2, "0")}:{String(remainder).padStart(2, "0")}</strong><Link href={checkout.href} className="hidden text-xs font-extrabold text-primary hover:underline sm:block">Continuar</Link><button type="button" aria-label="Fechar aviso" onClick={() => { localStorage.removeItem("iagnostico-pending-checkout"); setCheckout(null); }} className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-background"><X className="h-4 w-4" /></button></div></aside>;
}
