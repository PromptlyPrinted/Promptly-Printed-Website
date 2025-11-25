/**
 * UTM and Campaign Tracking Utilities
 * Automatically captures and processes marketing attribution data
 */

export type UTMParams = {
  utm_source?: string;      // e.g., 'tiktok', 'facebook', 'google'
  utm_medium?: string;      // e.g., 'organic', 'cpc', 'paid_social'
  utm_campaign?: string;    // e.g., 'black-friday-2025'
  utm_content?: string;     // e.g., 'video_1', 'carousel_ad'
  utm_term?: string;        // e.g., 'custom tshirts'
};

export type CustomTrackingParams = {
  fbclid?: string;          // Facebook Click ID
  gclid?: string;           // Google Click ID
  ttclid?: string;          // TikTok Click ID
  referrer?: string;        // Document referrer
};

export type TrackingData = UTMParams & CustomTrackingParams & {
  landingPage: string;
  timestamp: string;
};

/**
 * Extract UTM parameters from URL
 */
export function getUTMParams(url?: string): UTMParams {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(url || window.location.search);

  return {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
  };
}

/**
 * Extract platform-specific click IDs
 */
export function getClickIDs(url?: string): CustomTrackingParams {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(url || window.location.search);

  return {
    fbclid: searchParams.get('fbclid') || undefined,
    gclid: searchParams.get('gclid') || undefined,
    ttclid: searchParams.get('ttclid') || undefined,
    referrer: document.referrer || undefined,
  };
}

/**
 * Get all tracking data for current session
 */
export function getAllTrackingData(): TrackingData {
  return {
    ...getUTMParams(),
    ...getClickIDs(),
    landingPage: window.location.pathname,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Store tracking data in localStorage for attribution
 * This persists across page navigation
 */
export function storeTrackingData(data?: TrackingData) {
  if (typeof window === 'undefined') return;

  const trackingData = data || getAllTrackingData();

  // Only store if we have actual tracking parameters
  if (Object.values(trackingData).some(v => v !== undefined)) {
    localStorage.setItem('tracking_data', JSON.stringify(trackingData));
    localStorage.setItem('tracking_timestamp', new Date().toISOString());
  }
}

/**
 * Get stored tracking data
 */
export function getStoredTrackingData(): TrackingData | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('tracking_data');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Build tracking URL with UTM parameters
 */
export function buildTrackingURL(
  baseUrl: string,
  params: Partial<UTMParams>
): string {
  const url = new URL(baseUrl, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

/**
 * Get campaign source in human-readable format
 */
export function getCampaignSource(trackingData?: TrackingData): string {
  const data = trackingData || getStoredTrackingData();
  if (!data) return 'Direct';

  // Check for platform click IDs first (most reliable)
  if (data.fbclid) return 'Facebook Ads';
  if (data.gclid) return 'Google Ads';
  if (data.ttclid) return 'TikTok Ads';

  // Check UTM parameters
  if (data.utm_source) {
    const source = data.utm_source.toLowerCase();
    const medium = data.utm_medium?.toLowerCase();

    // Map to friendly names
    if (source === 'tiktok') {
      return medium === 'organic' ? 'TikTok Organic' : 'TikTok Ads';
    }
    if (source === 'facebook' || source === 'meta') {
      return medium === 'organic' ? 'Facebook Organic' : 'Facebook Ads';
    }
    if (source === 'instagram') {
      return medium === 'organic' ? 'Instagram Organic' : 'Instagram Ads';
    }
    if (source === 'google') {
      return medium === 'organic' ? 'Google Search' : 'Google Ads';
    }

    // Capitalize first letter for other sources
    return source.charAt(0).toUpperCase() + source.slice(1);
  }

  // Check referrer as fallback
  if (data.referrer) {
    const referrerDomain = new URL(data.referrer).hostname;
    if (referrerDomain.includes('tiktok')) return 'TikTok';
    if (referrerDomain.includes('facebook')) return 'Facebook';
    if (referrerDomain.includes('instagram')) return 'Instagram';
    if (referrerDomain.includes('google')) return 'Google';
  }

  return 'Direct';
}

/**
 * Check if traffic is from a paid campaign
 */
export function isPaidTraffic(trackingData?: TrackingData): boolean {
  const data = trackingData || getStoredTrackingData();
  if (!data) return false;

  // Has click ID = paid
  if (data.fbclid || data.gclid || data.ttclid) return true;

  // Check medium
  const medium = data.utm_medium?.toLowerCase();
  const paidMediums = ['cpc', 'ppc', 'paid', 'paid_social', 'spark_ads'];

  return medium ? paidMediums.includes(medium) : false;
}

/**
 * URL templates for each platform
 */
export const TRACKING_TEMPLATES = {
  tiktok_organic: (campaign: string) =>
    `?utm_source=tiktok&utm_medium=organic&utm_campaign=${campaign}`,

  tiktok_spark_ads: (campaign: string, content: string) =>
    `?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=${campaign}&utm_content=${content}`,

  meta_ads: (campaign: string, content: string) =>
    `?utm_source=facebook&utm_medium=paid_social&utm_campaign=${campaign}&utm_content=${content}`,

  instagram_organic: (campaign: string) =>
    `?utm_source=instagram&utm_medium=organic&utm_campaign=${campaign}`,

  google_ads: (campaign: string, content: string) =>
    `?utm_source=google&utm_medium=cpc&utm_campaign=${campaign}&utm_content=${content}`,
};
