import { CampaignsPage, AppLayoutWrapper } from '../../page';

export const metadata = {
  title: 'Sales & Deals | Koremiyo',
  description: 'Special offers, discount campaigns, and featured promotions on Japanese adult games, audio, and videos.',
  openGraph: {
    title: 'Sales & Discount Campaigns | Koremiyo',
    description: 'Check active sales and special discounts for DLsite and FANZA works.',
    locale: 'en_US',
  }
};

export default function EnglishCampaignsPage() {
  return (
    <AppLayoutWrapper lang="en">
      <CampaignsPage lang="en" />
    </AppLayoutWrapper>
  );
}
