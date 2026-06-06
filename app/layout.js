import { Geist, Geist_Mono } from "next/font/google";
import InstallAppPrompt from "@/components/install-app-prompt";
import NavShell from "@/components/NavShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Twin",
  description: "Your personal wellness companion for daily health tracking.",
  appleWebApp: {
    capable: true,
    title: "Twin",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <NavShell />
        <InstallAppPrompt />
      </body>
    </html>
  );
}
