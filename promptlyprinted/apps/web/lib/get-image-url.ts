import { env } from '@repo/env';

export function getImageUrl(path: string): string {
  if (!path) return '';

  // If it's already a full URL or base64 data, return it as is
  if (path.startsWith('http') || path.startsWith('data:image')) {
    return path;
  }

  // If it's an API route, make it publicly accessible
  if (path.startsWith('/api/')) {
    // Use the public web URL for API routes
    return `${env.NEXT_PUBLIC_WEB_URL}${path}`;
  }

  // For local development, serve from the public directory
  if (process.env.NODE_ENV === 'development') {
    return `${env.NEXT_PUBLIC_WEB_URL}/images${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // For production, use the CDN or storage URL
  return `${env.NEXT_PUBLIC_APP_URL}/images${path.startsWith('/') ? '' : '/'}${path}`;
}
