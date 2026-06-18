import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "20260618 Next.js App",
  description: "Next.js / React / TypeScript starter app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
