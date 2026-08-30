import Link from "next/link";
import { Navbar } from "@/presentation/components/shared/navbar";
import { Stat } from "@/presentation/components/shared/stat";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
          <Stat tone="streak" icon={<span className="text-xl">🔥</span>} label="Streak" value="12 dias" />
          <Stat tone="xp" icon={<span className="text-xl">★</span>} label="XP total" value="2.840" />
          <Stat tone="info" icon={<span className="text-xl">🏅</span>} label="Nível" value="14 · Diagnosta" />
          <Stat icon={<span className="text-xl">🎯</span>} label="Acerto médio" value="87%" />
        </div>

        <div className="fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <Link
            href="/especialidade"
            className="btn-pop animate-float min-w-72 gap-3 bg-primary px-8 py-5 text-base text-primary-foreground shadow-[0_14px_30px_rgba(70,163,2,0.3),0_6px_0_0_var(--primary-dark)] ring-4 ring-primary/15 hover:ring-primary/30 sm:min-w-80 sm:text-lg"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-xl text-white">▶</span>
            Iniciar plantão
          </Link>
        </div>

      </main>
    </div>
  );
}
