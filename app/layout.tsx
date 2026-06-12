'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-[var(--font-inter)]">
        {!isAuthPage && <Navbar />}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
