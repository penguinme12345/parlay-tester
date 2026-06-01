import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parlay Doctor",
  description: "Premium NBA parlay analysis workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
