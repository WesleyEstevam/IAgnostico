import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentFirebaseUser } from "@/infrastructure/firebase/session";

export async function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = await getCurrentFirebaseUser();
  if (!user) redirect("/login");
  return children;
}
