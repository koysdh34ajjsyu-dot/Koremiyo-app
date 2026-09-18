import { TopPage, AppLayoutWrapper } from '../page';

export const metadata = {
  title: 'Koremiyo | Curated Japanese Doujin, ASMR Audio & Anime Reviews',
  description: 'In-depth English guides & reviews for Japanese ASMR voice works, school swimsuit themes, and top-rated doujin titles from DLsite & FANZA.',
  openGraph: {
    title: 'Koremiyo | Curated Japanese Doujin & ASMR Reviews',
    description: 'In-depth English guides & reviews for top Japanese doujin, ASMR voice dramas, and anime.',
    locale: 'en_US',
  }
};

export default function EnglishTopPage() {
  return (
    <AppLayoutWrapper lang="en">
      <TopPage lang="en" />
    </AppLayoutWrapper>
  );
}
