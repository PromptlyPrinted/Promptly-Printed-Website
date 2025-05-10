export function getImageUrl(path: string): string {
  if (!path) return ''
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) return path
  
  // For local development, serve from the public directory
  if (process.env.NODE_ENV === 'development') {
    return `/images/${path}`
  }
  
  // For production, use the CDN or storage URL
  return `${process.env.NEXT_PUBLIC_APP_URL}/images/${path}`
} 