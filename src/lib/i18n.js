// i18n 多言語辞書およびヘルパーモジュール

export const translations = {
  ja: {
    siteName: '次、コレ見よ',
    siteCatch: '音声作品・スク水・フェラ オススメ同人作品レビュー＆DMMツール',
    nav: {
      home: 'ホーム',
      ranking: '🏆 ランキング',
      campaign: '🌟 キャンペーン',
      dmm: 'DMMブログ',
      dlsite: 'DLsiteブログ',
      admin: '管理者 🔒',
      switchLang: 'Language',
    },
    hero: {
      badge: '厳選された同人作品ポータル',
      title: '次に楽しむ、最高の1作を見つけよう',
      subtitle: '音声作品、スクール水着、フェラ特化同人など、ニッチで濃密な作品をDLsite・FANZAから徹底レビュー。',
      exploreRanking: '人気ランキングを見る',
      viewCampaign: 'セール中の作品',
    },
    categories: {
      all: 'すべて',
      game3d: '3Dゲーム',
      audio: '音声・ASMR',
      rpg: '同人RPG・ゲーム',
      vtuber: 'VTuber・声優',
      comic: 'マンガ・CG集',
      schoolSwimsuit: 'スク水エロ',
      blowjob: 'フェラ特化',
      fanzaVideo: '動画・アニメ',
      dlsiteDoujin: 'DLsite同人',
    },
    labels: {
      latestReviews: '最新レビュー記事',
      rankingTop: 'デイリー総合ランキング Top 20',
      dmmRanking: 'DMM / FANZA 人気ランキング',
      dlsiteRanking: 'DLsite 同人人気ランキング',
      readReview: 'レビューを読む',
      officialSite: '公式サイトで見る',
      backToList: '← 記事一覧に戻る',
      campaignActive: '🔥 期間限定セール・割引中！',
      originalPrice: '定価',
      discountPrice: '特別価格',
      discountRate: 'OFF',
      searchPlaceholder: '作品名・キーワードで検索...',
      loading: '読み込み中...',
      noResults: '該当する作品が見つかりませんでした。',
      cv: 'CV / 声優',
      actress: '出演',
      maker: 'サークル / メーカー',
      genre: 'ジャンル',
      highlights: '見どころ・抜きどころ',
      synopsis: 'あらすじ・解説',
      officialGallery: '公式サンプル画像',
      watchTrailer: '公式PV / サンプル動画',
    },
    footer: {
      rights: '© 2026 次、コレ見よ. All rights reserved.',
      disclaimer: '本サイトは18歳以上の成人向けコンテンツを含みます。',
    }
  },
  en: {
    siteName: 'Koremiyo',
    siteCatch: 'Curated Japanese Doujin, ASMR Audio & Hentai Reviews',
    nav: {
      home: 'Home',
      ranking: '🏆 Rankings',
      campaign: '🌟 Sales & Offers',
      dmm: 'FANZA Reviews',
      dlsite: 'DLsite Reviews',
      admin: 'Admin 🔒',
      switchLang: 'Language',
    },
    hero: {
      badge: 'Curated Japanese Adult Works & Doujin Portal',
      title: 'Find Your Next Obsession in Japanese Doujin & Audio',
      subtitle: 'In-depth English guides & reviews for Japanese ASMR voice works, school swimsuit themes, and top-rated doujin titles from DLsite & FANZA.',
      exploreRanking: 'Explore Top Rankings',
      viewCampaign: 'View On-Sale Deals',
    },
    categories: {
      all: 'All',
      game3d: '3D Games',
      audio: 'ASMR & Audio',
      rpg: 'RPG & Games',
      vtuber: 'VTuber & Talents',
      comic: 'Comics & CG',
      schoolSwimsuit: 'School Swimsuit',
      blowjob: 'Specialty Voice',
      fanzaVideo: 'Video & Anime',
      dlsiteDoujin: 'DLsite Doujin',
    },
    labels: {
      latestReviews: 'Latest Reviews & Features',
      rankingTop: 'Top 20 Daily Rankings',
      dmmRanking: 'DMM / FANZA Popular Rankings',
      dlsiteRanking: 'DLsite Doujin Rankings',
      readReview: 'Read Review',
      officialSite: 'View on Official Store',
      backToList: '← Back to Articles',
      campaignActive: '🔥 Limited Time Sale / Discount Active!',
      originalPrice: 'Regular',
      discountPrice: 'Sale Price',
      discountRate: 'OFF',
      searchPlaceholder: 'Search by title, circle, or keyword...',
      loading: 'Loading...',
      noResults: 'No works found matching your criteria.',
      cv: 'CV / Voice Actor',
      actress: 'Cast / Actress',
      maker: 'Circle / Maker',
      genre: 'Genre / Tags',
      highlights: 'Key Highlights & Verdict',
      synopsis: 'Synopsis & Story',
      officialGallery: 'Official Preview Gallery',
      watchTrailer: 'Official Video Preview',
    },
    footer: {
      rights: '© 2026 Koremiyo. All rights reserved.',
      disclaimer: 'This website contains 18+ adult content. All models and fictional characters are 18 years of age or older.',
    }
  }
};

/**
 * 現在の言語に応じた翻訳辞書を取得
 * @param {'ja'|'en'} lang
 * @returns {typeof translations.ja}
 */
export function getTranslation(lang = 'ja') {
  return translations[lang] || translations.ja;
}
