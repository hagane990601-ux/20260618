import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今日の献立配信MVP | 夕飯決めを毎日3分で",
  description: "主菜・副菜・汁物、食材、買い物リスト、1週間分の献立をまとめて確認できる献立配信MVPです。",
  openGraph: {
    title: "今日の献立配信MVP",
    description: "夕飯決めを毎日3分で。献立と買い物リストをまとめて確認できます。",
    type: "website",
  },
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
