import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { SiteHeader } from "@/components/site-header";
import { GA_MEASUREMENT_ID, PORTFOLIO_URL } from "@/lib/analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "India’s 2026 Nifty slide vs past crashes | Bazaarline",
  description:
    "Compare the open Nifty 50 drawdown with 2008, Covid, and other Indian slides using Yahoo Finance daily closes. Price indices only.",
  authors: [{ name: "Joel Hanson", url: PORTFOLIO_URL }],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className={`${GeistMono.className} min-h-full flex flex-col`}>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <p>
            Bazaarline uses public index closes. This is not investment advice.
          </p>
          <p>
            <a href={PORTFOLIO_URL}>Joel Hanson</a>
          </p>
        </footer>
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}
