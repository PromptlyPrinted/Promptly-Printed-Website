'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { storeTrackingData, getAllTrackingData } from '@/lib/tracking';

/**
 * Automatic tracking capture component
 * Place in root layout to capture all UTM parameters and click IDs
 */
export function TrackingCapture() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Only capture on first page load or if tracking params present
    const hasTrackingParams =
      searchParams.get('utm_source') ||
      searchParams.get('utm_medium') ||
      searchParams.get('utm_campaign') ||
      searchParams.get('fbclid') ||
      searchParams.get('gclid') ||
      searchParams.get('ttclid');

    if (hasTrackingParams) {
      const trackingData = getAllTrackingData();

      // Store in localStorage for persistence
      storeTrackingData(trackingData);

      // Log to PostHog if available
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('campaign_attribution', {
          ...trackingData,
          landing_page: pathname,
        });

        // Set user properties for attribution
        (window as any).posthog.people?.set({
          initial_utm_source: trackingData.utm_source,
          initial_utm_medium: trackingData.utm_medium,
          initial_utm_campaign: trackingData.utm_campaign,
          initial_landing_page: pathname,
        });
      }

      // Also send to analytics/backend if needed
      fetch('/api/analytics/attribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData),
      }).catch(err => console.warn('Attribution tracking failed:', err));
    }
  }, [searchParams, pathname]);

  return null; // This component doesn't render anything
}
