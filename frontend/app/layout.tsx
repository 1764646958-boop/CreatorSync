import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorSync | Multi-platform Publishing Assistant",
  description:
    "CreatorSync frontend application shell for planning, previewing, and preparing content across platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
