import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  generateSEOMetadata,
  generateLocalBusinessStructuredData,
} from "@/lib/seo";
import Script from "next/script";

const crimsonPro = localFont({
  src: "../../public/fonts/crimsonpro.woff2",
  variable: "--font-heading",
  display: "swap",
  weight: "300 700",
});
const sourceSans = localFont({
  src: "../../public/fonts/sourcesans3.woff2",
  variable: "--font-body",
  display: "swap",
  weight: "300 700",
});

export const metadata: Metadata = generateSEOMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = generateLocalBusinessStructuredData();

  return (
    <html lang="en" className={`${crimsonPro.variable} ${sourceSans.variable}`}>
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased bg-brand-parchment text-brand-charcoal">
        {children}
      </body>
    </html>
  );
}
