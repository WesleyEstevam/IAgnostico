import Link from "next/link";
import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center ${className}`}>
      <Image
        src="/iagnostico-logo-green-transparente.png"
        width={2035}
        height={773}
        alt="IAgnóstico"
        className="h-12 w-auto object-contain transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.03] group-active:translate-y-0.5"
      />
    </Link>
  );
}
