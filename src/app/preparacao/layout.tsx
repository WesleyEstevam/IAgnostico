import type { ReactNode } from "react";
import { ProtectedRoute } from "@/presentation/auth/protected-route";

export default function PreparacaoLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
