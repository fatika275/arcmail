import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Cormorant_Garamond } from "next/font/google";
import SiteHeader from "@/components/site-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "ArcMail",
  description:
    "ArcMail helps agencies and founders turn cold leads into replies with structured outreach systems.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <div className="siteShell">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}