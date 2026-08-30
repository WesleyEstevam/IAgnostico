import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-2 ${className}`}>
      <div className="relative h-9 w-9 rounded-xl bg-primary grid place-items-center shadow-[0_3px_0_0_var(--primary-dark)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-12 group-active:translate-y-0.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>
      <span className="text-xl font-extrabold tracking-tight">
        IAgnóstico
      </span>
    </Link>
  );
}
