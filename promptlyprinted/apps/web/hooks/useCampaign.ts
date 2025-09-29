'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentCampaign, getCampaignByUtm, getLocationFromIP, type Campaign } from '@/lib/campaigns';

export function useCampaign() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [location, setLocation] = useState<string>('GB');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        // Get user location
        const userLocation = await getLocationFromIP();
        setLocation(userLocation);

        // Check for UTM campaign parameter first
        const utmCampaign = searchParams.get('utm_campaign');
        let activeCampaign = getCampaignByUtm(utmCampaign || '');

        // Fallback to location-based campaign
        if (!activeCampaign) {
          activeCampaign = getCurrentCampaign(userLocation);
        }

        setCampaign(activeCampaign);
      } catch (error) {
        console.error('Failed to load campaign:', error);
        // Fallback to default location campaign
        setCampaign(getCurrentCampaign('GB'));
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [searchParams]);

  const trackCampaignEvent = (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(event, {
        campaign_id: campaign?.id,
        campaign_name: campaign?.name,
        user_location: location,
        ...properties,
      });
    }
  };

  return {
    campaign,
    location,
    loading,
    trackCampaignEvent,
  };
}