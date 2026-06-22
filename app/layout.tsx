import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Founder Kid",
  description: "A weekly nudge toward producer thinking.",
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
