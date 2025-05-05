// Temporary in-memory storage for uploaded images
interface TemporaryImageStore extends Map<string, { url: string; timestamp: number; isPublic?: boolean }> {
  IMAGE_TTL: number;
  CLEANUP_INTERVAL: number;
}

export const temporaryImageStore = new Map<string, { url: string; timestamp: number; isPublic?: boolean }>() as TemporaryImageStore;

// Cleanup old images every hour
temporaryImageStore.CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
temporaryImageStore.IMAGE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Override set method to ensure proper timestamp
temporaryImageStore.set = function(key: string, value: { url: string; timestamp: number; isPublic?: boolean }) {
  const entry = {
    ...value,
    timestamp: value.timestamp || Date.now(),
    isPublic: value.isPublic ?? true
  };
  console.log('Setting temporary image:', { key, entry });
  return Map.prototype.set.call(this, key, entry);
};

// Override get method to handle missing images
temporaryImageStore.get = function(key: string) {
  const value = Map.prototype.get.call(this, key);
  if (!value) {
    console.error('Temporary image not found:', key);
    return undefined;
  }
  
  // Check if image has expired
  if (Date.now() - value.timestamp > temporaryImageStore.IMAGE_TTL) {
    console.log('Image expired:', key);
    this.delete(key);
    return undefined;
  }
  
  console.log('Getting temporary image:', { key, value });
  return value;
};

// Cleanup function to remove expired images
function cleanupExpiredImages() {
  const now = Date.now();
  let count = 0;
  
  for (const [id, entry] of temporaryImageStore.entries()) {
    if (now - entry.timestamp > temporaryImageStore.IMAGE_TTL) {
      console.log('Cleaning up old image:', id);
      temporaryImageStore.delete(id);
      count++;
    }
  }
  
  console.log(`Cleaned up ${count} expired images`);
}

// Start cleanup interval
setInterval(cleanupExpiredImages, temporaryImageStore.CLEANUP_INTERVAL);

// Initial cleanup
cleanupExpiredImages();

export type { TemporaryImageStore };


