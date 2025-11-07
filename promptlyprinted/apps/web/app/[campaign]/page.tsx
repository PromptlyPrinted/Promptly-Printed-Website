import { notFound, redirect } from 'next/navigation';
import { activeCampaigns } from '@/lib/campaigns';
import { CampaignLandingPage } from './components/CampaignLandingPage';

interface CampaignPageProps {
  params: Promise<{
    campaign: string;
  }>;
  searchParams: Promise<{
    utm_source?: string;
    utm_medium?: string;
    utm_content?: string;
  }>;
}

export default async function CampaignPage({ params, searchParams }: CampaignPageProps) {
  const { campaign: campaignSlug } = await params;
  const utmParams = await searchParams;

  // Find campaign by slug or redirect patterns
  let campaign = Object.values(activeCampaigns).find(c =>
    c.id === campaignSlug ||
    c.name.toLowerCase().replace(/\s+/g, '-') === campaignSlug
  );

  // Handle common campaign URLs
  if (!campaign) {
    const redirectMap: Record<string, string> = {
      'halloween': 'halloween-2025-uk',
      'halloween-shirts': 'halloween-2025-uk',
      'christmas': 'christmas-2025-global',
      'summer': 'summer-2026-au',
    };

    const redirectCampaign = redirectMap[campaignSlug];
    if (redirectCampaign) {
      campaign = activeCampaigns[redirectCampaign];
    }
  }

  if (!campaign) {
    notFound();
  }

  // Check if campaign is active
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const isActive = currentDate >= campaign.dates.start && currentDate <= campaign.dates.end;

  if (!isActive) {
    // Redirect to main design page if campaign is not active
    redirect('/design');
  }

  return (
    <CampaignLandingPage
      campaign={campaign}
      utmParams={utmParams}
    />
  );
}

export async function generateStaticParams() {
  // Generate static params for all active campaigns
  return Object.values(activeCampaigns).flatMap(campaign => [
    { campaign: campaign.id },
    { campaign: campaign.name.toLowerCase().replace(/\s+/g, '-') },
  ]);
}