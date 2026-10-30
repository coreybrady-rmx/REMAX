import type { Metadata } from "next";
import { Cabin, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-9L3N8P018T";

export const metadata: Metadata = {
  title: {
    default: "RE/MAX Peaks Agent Microsites",
    template: "%s | RE/MAX Peaks",
  },
  description:
    "High-converting individual agent microsites for RE/MAX Peaks — Cache Valley, Bear Lake, and Southern Idaho.",
  metadataBase: new URL("https://www.remaxpeaks.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cabin.variable} ${inter.variable} antialiased`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
        {children}
      </body>
    </html>
  );
}
