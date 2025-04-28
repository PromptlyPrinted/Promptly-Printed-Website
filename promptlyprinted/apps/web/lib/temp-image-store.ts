// Temporary in-memory storage for uploaded images
interface TemporaryImageStore extends Map<string, { url: string; timestamp: number; isPublic?: boolean }> {
  IMAGE_TTL: number;
  CLEANUP_INTERVAL: number;
}

export const temporaryImageStore = new Map<string, { url: string; timestamp: number; isPublic?: boolean }>() as TemporaryImageStore;

// Cleanup old images every hour
temporaryImageStore.CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
temporaryImageStore.IMAGE_TTL = 24 * 60 * 60 * 1000; // 24 hours

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of temporaryImageStore.entries()) {
    if (now - entry.timestamp > temporaryImageStore.IMAGE_TTL) {
      temporaryImageStore.delete(id);
    }
  }
}, temporaryImageStore.CLEANUP_INTERVAL);

export type { TemporaryImageStore };
