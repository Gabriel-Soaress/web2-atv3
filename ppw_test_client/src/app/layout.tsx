import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ambiente de Pratica PPW",
  description: "Clone virgem para pratica de Programacao Para Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
