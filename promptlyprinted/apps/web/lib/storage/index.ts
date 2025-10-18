import type { StorageProvider } from './interface';
import { LocalStorageProvider } from './local';

/**
 * Storage factory
 * Returns the appropriate storage provider based on environment
 *
 * To switch to S3-compatible storage (for Hetzner):
 * 1. Set STORAGE_PROVIDER=s3 in .env
 * 2. Create s3.ts implementing StorageProvider
 * 3. Add S3 credentials to .env (S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY)
 * 4. Update this factory to return the S3 provider
 */
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'local':
      return new LocalStorageProvider();
    // When you're ready to use S3-compatible storage:
    // case 's3':
    //   return new S3StorageProvider();
    default:
      console.warn(`Unknown storage provider: ${provider}, falling back to local`);
      return new LocalStorageProvider();
  }
}

// Export a singleton instance
export const storage = getStorageProvider();
