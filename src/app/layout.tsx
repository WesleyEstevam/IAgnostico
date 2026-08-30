import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IAgnóstico — Treine raciocínio clínico todos os dias",
    template: "%s — IAgnóstico",
  },
  description:
    "Plataforma gamificada de casos clínicos com IA para estudantes de medicina.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
