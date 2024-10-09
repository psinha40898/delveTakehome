import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Nav";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Takehome",
  description: "Pyush Sinha Takehome",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#111113] dark bg-no-repeat`}
      >
        {/* <Navbar/> */}

        {children}
        <Analytics />
      </body>
    </html>
  );
}
