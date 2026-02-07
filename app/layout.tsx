import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SwRegistration } from "./components/SwRegistration";

export const metadata: Metadata = {
  title: "Chores Today",
  description: "What to do today",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Chores" },
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <SwRegistration />
        {children}
      </body>
    </html>
  );
}
