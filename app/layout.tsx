import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Free Cache Valley home value | RE/MAX Peaks",
  description:
    "Get a free CMA from the RE/MAX Peaks office on Main Street in Logan, see what you can afford, or estimate a monthly payment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className}`}>{children}</body>
    </html>
  );
}
