import type { ReactNode } from "react";
import { ProtectedRoute } from "@/presentation/auth/protected-route";

export default function CasoLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
