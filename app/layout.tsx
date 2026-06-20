import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://20260618-gules.vercel.app"),
  title: "今日のごはん、もう迷わない | 今日の献立配信",
  description:
    "主菜・副菜・汁物から買い物リストまで。冷蔵庫の食材に合わせて、今日の献立をまとめて提案します。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "今日の献立配信",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "今日のごはん、もう迷わない",
    description:
      "主菜・副菜・汁物から買い物リストまで、毎日の食卓にちょうどいい献立を提案します。",
    url: "https://20260618-gules.vercel.app",
    siteName: "今日の献立配信",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "今日のごはん、もう迷わない | 今日の献立配信",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "今日のごはん、もう迷わない | 今日の献立配信",
    description:
      "主菜・副菜・汁物から買い物リストまで、毎日の食卓にちょうどいい献立を提案します。",
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-WQXR6NSDJ3" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag("js", new Date());
          gtag("config", "G-WQXR6NSDJ3");
        `}</Script>
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
