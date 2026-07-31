import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { CarrinhoProvider } from "@/lib/cart-context";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Forziul — Eletrônicos",
  description: "Forziul: eletrônicos selecionados, entregues rápido.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <CarrinhoProvider>
          <header className="sticky top-0 z-40 border-b border-base-line bg-base/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="font-display text-xl font-bold tracking-tight">
                FOR<span className="text-volt">ZIUL</span>
              </Link>
              <nav className="flex items-center gap-6 text-sm text-ink-muted">
                <Link href="/loja" className="hover:text-ink">Loja</Link>
                <Link href="/carrinho" className="hover:text-ink">Carrinho</Link>
              </nav>
            </div>
            <div className="trace" />
          </header>
          <main>{children}</main>
          <footer className="mt-24 border-t border-base-line">
            <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-muted">
              <p>Forziul — eletrônicos selecionados. Entrega rastreada em todo o Brasil.</p>
            </div>
          </footer>
        </CarrinhoProvider>
      </body>
    </html>
  );
}
