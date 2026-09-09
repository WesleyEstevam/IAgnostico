"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { PRO_PLAN_CTA_HREF } from "@/shared/constants/plans";

type ShiftCtaProps = {
  shiftsAvailable: number;
};

export function ShiftCta({ shiftsAvailable }: ShiftCtaProps) {
  const [showUpgrade, setShowUpgrade] = useState(shiftsAvailable <= 0);

  if (!showUpgrade) {
    return (
      <Link
        href="/especialidade"
        className="btn-pop animate-float mx-auto min-w-72 gap-3 bg-primary px-8 py-5 text-base text-primary-foreground shadow-[0_14px_30px_rgba(70,163,2,0.3),0_6px_0_0_var(--primary-dark)] ring-4 ring-primary/15 hover:ring-primary/30 sm:min-w-80 sm:text-lg"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-xl text-white">▶</span>
        Iniciar plantão
      </Link>
    );
  }

  return (
    <div className="card-pop animate-bounce-in relative border-primary/25 bg-card p-6 text-center sm:p-8">
      <button
        type="button"
        onClick={() => setShowUpgrade(false)}
        aria-label="Fechar oferta do plano Pro"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      >
        <X className="h-5 w-5" strokeWidth={3} />
      </button>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-3xl" aria-hidden="true">⚡</div>
      <h1 className="mt-4 text-2xl font-black">Quer continuar treinando hoje?</h1>
      <p className="mt-2 font-bold text-muted-foreground">Seus plantões gratuitos acabaram. Com o plano Pro, sua rotina de casos não precisa parar.</p>
      <Link href={PRO_PLAN_CTA_HREF} className="btn-pop mt-6 w-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)]">
        Conhecer o plano Pro
      </Link>
      <p className="mt-3 text-xs font-bold text-muted-foreground">Seus plantões gratuitos serão renovados amanhã.</p>
    </div>
  );
}
