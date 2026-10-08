export function renderCampaign(contentRaw) {
  let campaign = null;
  let cleanContent = contentRaw || '';
  const match = cleanContent.match(/<!--CAMPAIGN:(.*?)-->/);
  if (match) {
    try {
      campaign = JSON.parse(match[1]);
    } catch (e) {}
    cleanContent = cleanContent.replace(/<!--CAMPAIGN:.*?-->\n?/g, '');
  }

  let showCampaign = false;
  if (campaign && campaign.discountExpiry) {
    const expiryDate = new Date(`${campaign.discountExpiry}T23:59:59`);
    const now = new Date();
    if (now <= expiryDate) {
      showCampaign = true;
    }
  }
  return { campaign, showCampaign, cleanContent };
}
