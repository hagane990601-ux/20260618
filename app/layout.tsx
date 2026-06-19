import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://20260618-gules.vercel.app"),
  title: "今日の献立 自動提案 | 冷蔵庫の食材から夕飯を決める",
  description: "冷蔵庫にある食材を入れるだけで、今日の献立、買い物リスト、1週間分の夕飯候補を自動提案します。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "今日の献立",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "今日の献立 自動提案 | 冷蔵庫の食材から夕飯を決める",
    description: "冷蔵庫にある食材から、今日の献立と買い物リストをすぐ確認できます。",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "今日の献立 自動提案",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "今日の献立 自動提案 | 冷蔵庫の食材から夕飯を決める",
    description: "冷蔵庫にある食材から、今日の献立と買い物リストをすぐ確認できます。",
    images: ["/og-image.svg"],
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
      <body>
        <style>{`
          .share-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
          .share-row a, .share-row button { border: 1px solid #ece2d6; border-radius: 999px; padding: 9px 12px; background: #fff; color: #c95438; font-size: 13px; font-weight: 800; text-decoration: none; cursor: pointer; }
          .menu-detail-hero { margin-bottom: 18px; }
        `}</style>
        {children}
      </body>
    </html>
  );
}
