import type { Metadata, Viewport } from "next";
import { Jacquard_12, Silkscreen, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

/** Display: a bitmap blackletter. The pixel grid and the engraved court card in one face. */
const jacquard = Jacquard_12({
  variable: "--font-jacquard",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/** Interface: labels, ranks, totals, chart cells. */
const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

/** Reading: every sentence the coach speaks. A trainer that is hard to read has failed. */
const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vico Blackjack — Basic Strategy Trainer",
  description:
    "Practice blackjack and learn perfect basic strategy. Get the optimal 'by the book' play, live stats and Hi-Lo card counting drills.",
};

export const viewport: Viewport = {
  themeColor: "#171320",
  // The table is sized to the viewport; zooming would break the one-screen fit.
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jacquard.variable} ${silkscreen.variable} ${plex.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
