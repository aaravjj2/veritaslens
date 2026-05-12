import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import AuthNav from "@/components/AuthNav";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeritasLens — EU misinformation shield",
  description:
    "AI-powered credibility analysis with EU-grounded citations and tactic transparency.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-slate-100 antialiased`}
      >
        <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 text-sm">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold tracking-tight text-white">
                VeritasLens
              </Link>
              <div className="flex gap-4 text-slate-300">
                <Link href="/analyse" className="hover:text-white">
                  Analyse
                </Link>
                <Link href="/dashboard" className="hover:text-white">
                  History
                </Link>
                <Link href="/settings" className="hover:text-white">
                  Settings
                </Link>
                <Link href="/extension/connect" className="hover:text-white">
                  Extension
                </Link>
              </div>
            </div>
            <AuthNav />
          </nav>
        </div>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
