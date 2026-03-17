import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import { Sidebar } from "@/components/ui/sidebar";
import { LiveTicker } from "@/components/ui/live-ticker";

export const metadata: Metadata = {
  title: "Wikipedia Discovery Hub",
  description: "A magazine-style viral Wikipedia scraper dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-[#0a0a0a] text-zinc-100 font-sans tracking-tight min-h-screen flex flex-col`}
      >
        <LiveTicker />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
