import type { StorageProvider } from './interface';
import { LocalStorageProvider } from './local';
import { S3StorageProvider } from './s3';

/**
 * Storage factory
 * Returns the appropriate storage provider based on environment
 *
 * To switch to S3-compatible storage (for Hetzner/Vercel):
 * 1. Set STORAGE_PROVIDER=s3 in .env
 * 2. Add S3 credentials to .env (S3_ENDPOINT, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)
 */
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'local':
      return new LocalStorageProvider();
    case 's3':
      return new S3StorageProvider();
    default:
      console.warn(`Unknown storage provider: ${provider}, falling back to local`);
      return new LocalStorageProvider();
  }
}

// Export a singleton instance
export const storage = getStorageProvider();
