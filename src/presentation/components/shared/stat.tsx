import type { ReactNode } from "react";

export function Stat({
  icon, label, value, tone = "default",
}: { icon: ReactNode; label: string; value: ReactNode; tone?: "default" | "xp" | "streak" | "info" }) {
  const tones: Record<string, string> = {
    default: "bg-card text-foreground",
    xp: "bg-xp/15 text-xp-foreground",
    streak: "bg-streak/15 text-streak",
    info: "bg-info/15 text-info",
  };
  return (
    <div className={`card-pop card-jelly flex items-center gap-3 px-4 py-3`}>
      <div className={`h-10 w-10 rounded-xl grid place-items-center transition-transform duration-200 group-hover:scale-110 ${tones[tone]}`}>{icon}</div>
      <div className="leading-tight">
        <div className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">{label}</div>
        <div className="text-lg font-extrabold">{value}</div>
      </div>
    </div>
  );
}
