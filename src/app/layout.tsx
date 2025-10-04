import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ServerMetaTags, ServerFooterScripts } from "@/components/shared/ServerMetaTags";
import { ServerAdsScript } from "@/components/shared/ServerAdsScript";
import { defaultMetadata } from "@/lib/metadata";

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: 'swap',
  fallback: ['Tajawal', 'Arial', 'sans-serif'],
});

const inter = Inter({
  variable: "--font-english",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  ...defaultMetadata,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta charSet="UTF-8" />
        <ServerMetaTags />
        <ServerAdsScript />
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} font-arabic antialiased`}
      >
        <ServerFooterScripts />
        <ErrorBoundary>
          <SessionProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
