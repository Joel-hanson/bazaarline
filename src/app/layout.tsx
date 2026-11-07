import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "India’s 2026 correction vs past crashes | Bazaarline",
  description:
    "Live Nifty 50, Sensex, Bank Nifty and Nifty IT drawdowns compared with Covid, 2008 and other Indian market crashes — backed by Yahoo Finance daily closes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
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
