import type { ReactNode } from "react";
import { ProtectedRoute } from "@/presentation/auth/protected-route";

export default function EspecialidadeLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
