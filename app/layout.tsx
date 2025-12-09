import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DM_Sans, JetBrains_Mono, Fraunces } from "next/font/google";
import type React from "react";
import { Suspense } from "react";
import "./globals.css";

// Body font - DM Sans (clean, modern, distinctive)
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Mono font - JetBrains Mono (distinctive, great for numbers/data)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Display font - Fraunces (elegant serif for headlines)
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wealth.anirudhjwala.in"),
  title: "Wealth",
  description: "Track your expenses, investments and build wealth",
  openGraph: {
    url: "https://wealth.anirudhjwala.in/",
    type: "website",
    title: "Wealth",
    description: "Track your expenses, investments and build wealth",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wealth",
    description: "Track your expenses, investments and build wealth",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <QueryProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </NextThemesProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
