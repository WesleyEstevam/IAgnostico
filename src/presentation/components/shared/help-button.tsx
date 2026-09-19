import Link from "next/link";
import { CircleHelp } from "lucide-react";

export function HelpButton({ floating = false }: { floating?: boolean }) {
  return <Link
    href="/ajuda"
    aria-label="Ajuda e suporte"
    title="Ajuda e suporte"
    className={`${floating ? "fixed right-4 top-4 z-50 sm:right-6 sm:top-6" : "relative"} group grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-primary/20 bg-card/95 text-primary shadow-[0_3px_0_0_color-mix(in_srgb,var(--primary)_25%,transparent)] backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20`}
  >
    <CircleHelp className="h-5 w-5" aria-hidden="true" />
    <span className="pointer-events-none absolute right-[calc(100%+0.6rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-border bg-card px-3 py-2 text-xs font-extrabold text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
      Ajuda e suporte
    </span>
  </Link>;
}
