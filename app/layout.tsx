import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/providers";
import ExtensionAttributeGuard from "@/components/extension-attribute-guard";
import RouteProgress from "@/components/route-progress";
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
  title: {
    default: "FixItNow | Your Trusted Home Service Platform",
    template: "%s | FixItNow",
  },
  description:
    "Book vetted technicians for plumbing, electrical, and repair work. Compare rates, pick a time slot, and pay securely online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ExtensionAttributeGuard />
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
