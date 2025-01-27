import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "McDonald's Voice Order",
  description: "Order McDonald's using voice commands",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="bg-transparent">
      <body className="antialiased bg-transparent">{children}</body>
    </html>
  );
}
