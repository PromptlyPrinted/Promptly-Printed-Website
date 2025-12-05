import { env } from '@repo/env';

/**
 * Converts a relative path or various URL formats to a publicly accessible absolute URL.
 *
 * IMPORTANT: For Prodigi API integration, returned URLs MUST be publicly accessible
 * via HTTPS. Localhost URLs will not work with Prodigi's servers.
 */
export function getImageUrl(path: string): string {
  if (!path) return '';

  // If it's already a full HTTP/HTTPS URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Base64 data URIs are not suitable for Prodigi API
  // They need to be converted to uploaded files first
  if (path.startsWith('data:image')) {
    console.warn(
      'Warning: data URI detected in getImageUrl. Prodigi API requires publicly accessible URLs. ' +
      'This image should have been uploaded to storage during checkout.'
    );
    return path; // Return as-is but will fail validation later
  }

  // Determine the base URL
  // In production (Vercel), use the production URL
  // In development, use the configured web URL (but note: localhost won't work with Prodigi)
  let baseUrl: string;

  if (env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    // Ensure the Vercel URL has https:// protocol
    baseUrl = env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL.startsWith('http')
      ? env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      : `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (env.NEXT_PUBLIC_WEB_URL) {
    baseUrl = env.NEXT_PUBLIC_WEB_URL;
  } else {
    console.error('No base URL configured. Set NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL or NEXT_PUBLIC_WEB_URL');
    return path; // Return original path as fallback
  }

  // Remove trailing slash from base URL
  baseUrl = baseUrl.replace(/\/$/, '');

  // If it's an API route or three-folder system path, make it publicly accessible
  // Three-folder system: /temp, /saved, /orders
  if (
    path.startsWith('/api/') ||
    path.includes('/temp/') ||
    path.includes('/saved/') ||
    path.includes('/orders/')
  ) {
    return `${baseUrl}${path}`;
  }

  // For other paths, add /images prefix
  const imagePath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/images${imagePath}`;
}
