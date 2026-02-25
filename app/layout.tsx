export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/nav-bar";
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
  title: "Terhességkövető",
  description: "Kövesd terhességi méréseidet — testsúly, haskörfogat és pocakfotók.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavBar />
        <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
