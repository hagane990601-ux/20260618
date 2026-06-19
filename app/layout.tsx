import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今日の献立配信MVP | 冷蔵庫から夕飯を提案",
  description: "冷蔵庫の食材から献立を提案し、買い物リスト、履歴、リマインダーまでまとめて使える献立配信MVPです。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "今日の献立",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "今日の献立配信MVP",
    description: "冷蔵庫の食材から、今日の献立と買い物リストをすぐ確認できます。",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff8ee",
  width: "device-width",
  initialScale: 1,
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
