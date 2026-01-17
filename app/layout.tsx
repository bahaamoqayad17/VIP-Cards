"use client";

import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  if (pathname.includes("/card") || pathname === "/login") {
    return (
      <html lang="ar" dir="rtl">
        <head>
          <link rel="icon" href="/card.png" />
          <title>بطاقات VIP</title>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} font-sans antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    );
  }

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/card.png" />
        <title>بطاقات VIP</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} font-sans antialiased`}
      >
        <Sidebar>{children}</Sidebar>
        <Toaster />
      </body>
    </html>
  );
}
