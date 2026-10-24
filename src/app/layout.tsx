import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // YE LINE ZAROORI THI JO MISSING THI

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ONXY MDM",
  description: "Enterprise Device Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
