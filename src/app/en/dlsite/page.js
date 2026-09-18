import { DlsiteBlogPage, AppLayoutWrapper } from '../../page';

export const metadata = {
  title: 'DLsite Doujin & ASMR Reviews | Koremiyo',
  description: 'Curated English reviews, guides, and highlights for top-selling Japanese DLsite doujin voice works, games, and comics.',
  openGraph: {
    title: 'DLsite Doujin & Audio Reviews | Koremiyo',
    description: 'Explore curated reviews for DLsite doujin works and ASMR voice dramas.',
    locale: 'en_US',
  }
};

export default function EnglishDlsiteBlogPage() {
  return (
    <AppLayoutWrapper lang="en">
      <DlsiteBlogPage lang="en" />
    </AppLayoutWrapper>
  );
}
