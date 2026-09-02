import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import RegisterServiceWorker from "@/components/app/RegisterServiceWorker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-inter-tight",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://niftit.example";

export const viewport: Viewport = {
  themeColor: "#08090C",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Niftit — Your chart draws its own levels",
    template: "%s · Niftit",
  },
  description:
    "Support, resistance, and confirmed breakouts — found automatically on your TradingView chart, candle by candle.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Niftit — Your chart draws its own levels",
    description:
      "Support, resistance, and confirmed breakouts — found automatically on your TradingView chart, candle by candle.",
    url: siteUrl,
    siteName: "Niftit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Niftit — Your chart draws its own levels",
    description:
      "Support, resistance, and confirmed breakouts — found automatically on your TradingView chart, candle by candle.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
