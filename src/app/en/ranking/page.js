import { RankedProductsPage, AppLayoutWrapper } from '../../page';

export const metadata = {
  title: 'Top Rankings | Koremiyo',
  description: 'Daily popular rankings for Japanese doujin works and adult entertainment from DLsite and FANZA with estimated USD pricing.',
  openGraph: {
    title: 'Top Daily Rankings | Koremiyo',
    description: 'Check daily popular Japanese doujin and anime rankings with USD price conversions.',
    locale: 'en_US',
  }
};

export default function EnglishRankingPage() {
  return (
    <AppLayoutWrapper lang="en">
      <RankedProductsPage lang="en" />
    </AppLayoutWrapper>
  );
}
