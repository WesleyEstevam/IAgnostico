"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { CaseDifficulty } from "@/core/cases/clinical-case-types";

const difficulties: Array<{
  id: CaseDifficulty;
  setting: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    id: "facil",
    setting: "Ambulatório",
    label: "Fácil",
    description: "Casos mais diretos para aquecer o raciocínio clínico.",
    icon: "🩺",
    color: "border-primary/30 bg-primary/5 hover:border-primary",
  },
  {
    id: "intermediario",
    setting: "Urgência",
    label: "Intermediário",
    description: "Decisões mais rápidas e informações que exigem atenção.",
    icon: "🚑",
    color: "border-xp/40 bg-xp/10 hover:border-xp",
  },
  {
    id: "dificil",
    setting: "Emergência / UTI",
    label: "Difícil",
    description: "Cenários complexos para testar seu raciocínio sob pressão.",
    icon: "🏥",
    color: "border-destructive/30 bg-destructive/5 hover:border-destructive",
  },
];

type DifficultyPickerProps = {
  specialtyId: string;
  specialtyName: string;
  className: string;
  children: ReactNode;
};

export function DifficultyPicker({ specialtyId, specialtyName, className, children }: DifficultyPickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const chooseDifficulty = (difficulty: CaseDifficulty) => {
    router.push(`/preparacao/${encodeURIComponent(specialtyId)}?dificuldade=${difficulty}`);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-foreground/60 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="difficulty-title"
            className="card-pop animate-bounce-in relative w-full max-w-2xl p-6 sm:p-8"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar escolha de dificuldade"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
                {specialtyName}
              </span>
              <h2 id="difficulty-title" className="mt-3 text-2xl font-extrabold sm:text-3xl">
                Em qual dificuldade deseja jogar?
              </h2>
              <p className="mt-2 text-sm font-bold text-muted-foreground">
                Escolha o ambiente do seu próximo plantão.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  type="button"
                  onClick={() => chooseDifficulty(difficulty.id)}
                  className={`group flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${difficulty.color}`}
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-card text-3xl shadow-sm" aria-hidden="true">
                    {difficulty.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <strong className="text-lg font-extrabold">{difficulty.setting}</strong>
                      <span className="rounded-full bg-card px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        {difficulty.label}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm font-bold text-muted-foreground">
                      {difficulty.description}
                    </span>
                  </span>
                  <span className="font-extrabold text-primary transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
