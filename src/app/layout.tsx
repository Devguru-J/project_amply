import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amply — 같이 듣는 순간, 방이 된다.",
  description:
    "함께 모여 음악을 트는 소셜 뮤직 룸. DJ가 되고, 곡을 틀고, 채팅하며 같이 듣는다.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Amply",
    description: "같이 듣는 순간, 방이 된다.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="grain font-sans antialiased">{children}</body>
    </html>
  );
}
