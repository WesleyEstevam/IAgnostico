import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Megaphone } from "lucide-react";
import { getApplicationSettings } from "@/core/admin/application-settings-service";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IAgnóstico",
    template: "%s — IAgnóstico",
  },
  description: "Plataforma gamificada de casos clínicos com IA para estudantes de medicina.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  let announcement = "";
  try {
    const settings = await getApplicationSettings();
    if (settings.announcementEnabled) announcement = settings.announcementText;
  } catch {
    // Public pages must remain available when optional settings have not been provisioned yet.
  }
  return (
    <html lang="pt-BR">
      <body>
        {announcement && <aside role="status" className="flex min-h-10 items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-xs font-extrabold text-primary-foreground sm:text-sm"><Megaphone className="h-4 w-4 shrink-0" />{announcement}</aside>}
        {children}
      </body>
    </html>
  );
}
