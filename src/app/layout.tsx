import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Note: Mona Sans isn't available on Google Fonts, so we'll use Public Sans for both
// and can add Mona Sans manually if needed via CSS or local fonts
const monaSans = Public_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Apex Affinity Group - Distributor Network",
  description: "Join Apex Affinity Group's distributor network and build your business",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apex-star.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
      </head>
      <body
        className={`${publicSans.variable} ${monaSans.variable} antialiased font-[family-name:var(--font-public-sans)]`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
