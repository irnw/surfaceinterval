import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://surfaceinterval.blog"),
  title: {
    default: "Surface Interval",
    template: "%s · Surface Interval",
  },
  description: "A journal from the deep end of the world.",
  openGraph: {
    title: "Surface Interval",
    description: "A journal from the deep end of the world.",
    siteName: "Surface Interval",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80",
        width: 1800,
        height: 1200,
        alt: "Surface Interval",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Surface Interval",
    description: "A journal from the deep end of the world.",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}