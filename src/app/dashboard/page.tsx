import Image from "next/image";
import { Navbar } from "@/presentation/components/shared/navbar";
import { Stat } from "@/presentation/components/shared/stat";
import { CardDealSound } from "@/presentation/components/sound/card-deal-sound";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";
import { getPlayerProgress } from "@/core/player/player-progress-service";
import { redirect } from "next/navigation";
import { getRefreshedShiftBalance } from "@/core/shifts/shift-service";
import { ShiftCta } from "@/presentation/components/dashboard/shift-cta";

export default async function Dashboard() {
  const user = await getCurrentFirebaseUser();
  if (!user) redirect("/login");
  const [{ stats }, shifts] = await Promise.all([
    getPlayerProgress(user.uid),
    getRefreshedShiftBalance(user.uid),
  ]);
  const number = new Intl.NumberFormat("pt-BR");
  return (
    <div className="min-h-screen bg-background">
      <CardDealSound />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger">
          <Stat tone="streak" icon={<Image src="/dashboard-streak-3d.png" alt="" width={38} height={38} className="dashboard-icon-streak h-[38px] w-[38px] object-contain" />} label="Streak" value={`${stats.streak} ${stats.streak === 1 ? "dia" : "dias"}`} />
          <Stat tone="xp" icon={<Image src="/dashboard-xp-3d.png" alt="" width={38} height={38} className="dashboard-icon-xp h-[38px] w-[38px] object-contain" />} label="XP total" value={number.format(stats.xp)} />
          <Stat icon={<Image src="/dashboard-accuracy-3d.png" alt="" width={38} height={38} className="dashboard-icon-accuracy h-[38px] w-[38px] object-contain" />} label="Acerto médio" value={`${stats.averageAccuracy}%`} />
        </div>

        <div className="pointer-events-none fixed inset-0 z-20 grid place-items-center p-4">
          <div className="pointer-events-auto flex w-full max-w-md justify-center">
            <ShiftCta shiftsAvailable={shifts.current} />
          </div>
        </div>

      </main>
    </div>
  );
}
