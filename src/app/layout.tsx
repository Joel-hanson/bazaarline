import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "India’s 2026 correction vs past crashes | Bazaarline",
  description:
    "Live Nifty 50, Sensex, Bank Nifty and Nifty IT drawdowns compared with Covid, 2008 and other Indian market crashes — backed by Yahoo Finance daily closes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        {children}
        <footer className="site-footer">
          Bazaarline · India equity insights from public index closes. Not
          investment advice.
        </footer>
      </body>
    </html>
  );
}
