import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.remaxpeaks.com"),
  title: "Free Cache Valley home value | RE/MAX Peaks",
  description:
    "Get a free CMA from the RE/MAX Peaks Logan office, or see what monthly payment a home would take.",
  alternates: { canonical: "/your-next-move" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className}`}>{children}</body>
    </html>
  );
}
