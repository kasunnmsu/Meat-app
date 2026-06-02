import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beef Choice Study",
  description: "Research data collection app for beef choice experiments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
