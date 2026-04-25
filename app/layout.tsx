import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
      <body className={`${inter.className} antialiased`}>
        <div className="siteShell">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}