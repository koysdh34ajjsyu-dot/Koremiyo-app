import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "次、コレ見よ(DMMツール＆DLsiteブログポータル)",
  description: "ニッチな創作作品をもっと身近にしたい、あなたに高機能なツールと作品紹介ブログを提供します。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PQBTDZSEZZ"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PQBTDZSEZZ');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
