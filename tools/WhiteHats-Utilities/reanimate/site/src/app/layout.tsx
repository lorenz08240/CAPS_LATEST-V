import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: "italic" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

// The public URL, for absolute Open Graph and canonical links. Set in .env.production (or the build
// environment) once the Worker has its final domain.
const siteUrl = process.env.SITE_URL || "http://localhost:3000";

const title = "reanimate · a skill for Claude Code";
const description =
  "Point Claude at an animation you like, on a live site, in a video or a gif, and it rebuilds it in your codebase as a starting point for your own.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "reanimate",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Three stripe.com cards rebuilt by reanimate" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export const viewport: Viewport = { themeColor: "#fafafa" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
