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

const SITE_NAME = "次、コレ見よ";
const SITE_URL = "https://koremiyo-anime.online";
const DESCRIPTION =
  "音声作品・フェラ・スク水・スクール水着などのオススメ同人作品をDLsite・FANZA・DMMから厳選紹介。管理者イチオシのフェラ音声・スクール水着エロ作品レビューブログと、DMMツール・FANZAツールを提供するポータルサイトです。";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | 音声作品・スク水・フェラ オススメ同人作品レビュー＆DMMツール`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "音声作品 オススメ",
    "フェラ オススメ",
    "スク水 オススメ",
    "スクール水着 オススメ",
    "DMM ツール",
    "FANZA ツール",
    "DLsite オススメ 作品",
    "フェラ 音声",
    "スク水 エロ",
    "スクール水着 エロ",
    "同人作品 紹介",
    "FANZA 動画 おすすめ",
    "DLsite 音声作品",
    "フェラチオ 同人",
    "水着 エロ 音声",
    "R18 同人 おすすめ",
    "成人向け 作品 レビュー",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | 音声作品・スク水・フェラ オススメ同人作品レビュー`,
    description: DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - 音声作品・スク水・フェラ オススメ同人作品レビュー`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | 音声作品・スク水・フェラ オススメ`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      inLanguage: "ja",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
    },
    {
      "@type": "Blog",
      "@id": `${SITE_URL}/#blog`,
      name: `${SITE_NAME} - DLsite・DMMオススメ作品レビューブログ`,
      url: SITE_URL,
      description:
        "フェラ・スク水・音声作品などニッチなジャンルの同人作品を厳選してレビューするブログ。スクール水着エロ・フェラ音声・DLsiteオススメ作品を紹介。",
      inLanguage: "ja",
      author: {
        "@type": "Person",
        name: "次コレ管理人",
      },
      keywords:
        "音声作品,フェラ,スク水,スクール水着,DLsite,FANZA,DMM,エロ同人,オススメ",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-PQBTDZSEZZ"
        ></script>
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
        {/* 構造化データ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* 追加SEOタグ */}
        <meta name="theme-color" content="#ffb3c6" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
