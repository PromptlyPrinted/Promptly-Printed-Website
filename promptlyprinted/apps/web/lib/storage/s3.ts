import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import type { StorageProvider, StorageFolder, UploadOptions } from './interface';

/**
 * S3 Storage Provider with Three-Folder System
 * Compatible with AWS S3, Cloudflare R2, and other S3-compatible services
 * 
 * Folder Structure:
 * - /temp/{sessionId}/ - Session drafts, 24h lifecycle rule
 * - /saved/{userId}/ - User favorites, permanent
 * - /orders/{orderId}/ - Print files, permanent (300 DPI)
 * 
 * R2 Notes:
 * - R2 doesn't support ACLs - use bucket-level public access instead
 * - R2 uses different CopySource format
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private endpoint: string;
  private publicUrl: string;
  private isR2: boolean;

  constructor() {
    const region = process.env.S3_REGION || 'auto';
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    this.bucket = process.env.S3_BUCKET_NAME || '';
    this.publicUrl = process.env.S3_PUBLIC_URL || '';

    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucket) {
      throw new Error('S3 storage configuration missing. Please check S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET_NAME.');
    }

    this.endpoint = endpoint;
    // Detect if this is Cloudflare R2
    this.isR2 = endpoint.includes('r2.cloudflarestorage.com') || endpoint.includes('.r2.dev');

    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Needed for R2 and MinIO
    });
    
    if (this.isR2) {
      console.log('[S3] Detected Cloudflare R2 - using R2-compatible settings');
    }
  }

  /**
   * Build the S3 key path based on folder and options
   * 
   * Three-Folder System (no legacy uploads/images):
   * - /temp/{sessionId}/ - Session drafts, 24h lifecycle
   * - /saved/{userId}/ - User saved designs, permanent
   * - /orders/{orderId}/ - Print files 300 DPI, permanent
   */
  private buildKey(filename: string, options?: UploadOptions): string {
    const folder = options?.folder || 'temp';
    const uniqueFilename = options?.skipUuid ? filename : `${randomUUID()}-${filename}`;
    
    switch (folder) {
      case 'temp':
        // /temp/{sessionId}/filename or /temp/anonymous/filename
        const sessionId = options?.sessionId || 'anonymous';
        return `temp/${sessionId}/${uniqueFilename}`;
      
      case 'saved':
        // /saved/{userId}/filename
        const userId = options?.userId || 'guest';
        return `saved/${userId}/${uniqueFilename}`;
      
      case 'orders':
        // /orders/{orderId}/filename
        const orderId = options?.orderId || `order-${Date.now()}`;
        return `orders/${orderId}/${uniqueFilename}`;
      
      default:
        // Default to temp folder (no more uploads/images legacy path)
        const defaultSessionId = options?.sessionId || 'anonymous';
        return `temp/${defaultSessionId}/${uniqueFilename}`;
    }
  }

  /**
   * Extract S3 key from a URL
   */
  private extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      let key = urlObj.pathname;
      
      // Remove leading slash
      if (key.startsWith('/')) {
        key = key.substring(1);
      }
      
      // Remove bucket name if present in path
      if (key.startsWith(this.bucket + '/')) {
        key = key.substring(this.bucket.length + 1);
      }
      
      return key;
    } catch {
      // If URL parsing fails, assume it's already a key
      return url;
    }
  }

  /**
   * Build public URL from key
   */
  private buildPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<string> {
    const key = this.buildKey(filename, options);

    console.log(`[S3] Uploading to ${options?.folder || 'temp'} folder: ${key}`);

    // Build command - R2 doesn't support ACLs (uses bucket-level public access)
    const command: any = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Add metadata for lifecycle management
      Metadata: {
        'x-folder': options?.folder || 'temp',
        'x-session-id': options?.sessionId || '',
        'x-user-id': options?.userId || '',
        'x-order-id': options?.orderId || '',
        'x-created-at': new Date().toISOString(),
      },
    };

    // Only add ACL for non-R2 providers (R2 uses bucket-level public access)
    if (!this.isR2) {
      command.ACL = 'public-read';
    }

    await this.client.send(new PutObjectCommand(command));

    return this.buildPublicUrl(key);
  }

  async uploadFromBase64(
    base64Data: string, 
    filename: string,
    options?: UploadOptions
  ): Promise<string> {
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    let mimeType = 'image/png';
    let base64String = base64Data;

    if (matches) {
      const [, extension, data] = matches;
      mimeType = `image/${extension}`;
      base64String = data;
      if (!filename.includes('.')) filename = `${filename}.${extension}`;
    } else {
      if (!filename.includes('.')) filename = `${filename}.png`;
    }

    const buffer = Buffer.from(base64String, 'base64');
    return this.uploadFromBuffer(buffer, filename, mimeType, options);
  }

  /**
   * Copy a file from one location to another
   * Used for copying from /temp to /saved when user saves to favorites
   * 
   * Note: R2 supports CopyObject but with some limitations
   */
  async copy(
    sourceUrl: string,
    targetFolder: StorageFolder,
    options?: { userId?: string; orderId?: string }
  ): Promise<string> {
    const sourceKey = this.extractKeyFromUrl(sourceUrl);
    
    // Extract original filename from source key
    const originalFilename = sourceKey.split('/').pop() || `copied-${Date.now()}.png`;
    
    try {
      // Build new key for target folder
      const targetKey = this.buildKey(originalFilename, {
        folder: targetFolder,
        userId: options?.userId,
        orderId: options?.orderId,
        skipUuid: true, // Keep original UUID from source
      });

      console.log(`[S3] Copying from ${sourceKey} to ${targetKey}`);

      // R2 requires URL-encoded CopySource and doesn't support ACL
      // Format: bucket/key (URL-encoded)
      const copySource = encodeURIComponent(`${this.bucket}/${sourceKey}`);
      
      const command: any = {
        Bucket: this.bucket,
        CopySource: this.isR2 ? copySource : `${this.bucket}/${sourceKey}`,
        Key: targetKey,
        MetadataDirective: 'REPLACE',
        Metadata: {
          'x-folder': targetFolder,
          'x-user-id': options?.userId || '',
          'x-order-id': options?.orderId || '',
          'x-copied-from': sourceKey,
          'x-copied-at': new Date().toISOString(),
        },
      };
      
      // Only add ACL for non-R2 providers
      if (!this.isR2) {
        command.ACL = 'public-read';
      }

      await this.client.send(new CopyObjectCommand(command));

      return this.buildPublicUrl(targetKey);
    } catch (error) {
      console.error('[S3] Error copying file:', error);
      
      // Fallback: If copy fails (some R2 edge cases), download and re-upload
      if (this.isR2) {
        console.log('[S3] Copy failed on R2, trying download+upload fallback...');
        try {
          const response = await fetch(sourceUrl);
          if (!response.ok) throw new Error('Failed to fetch source');
          const buffer = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get('content-type') || 'image/png';
          
          return this.uploadFromBuffer(buffer, originalFilename, contentType, {
            folder: targetFolder,
            userId: options?.userId,
            orderId: options?.orderId,
            skipUuid: true,
          });
        } catch (fallbackError) {
          console.error('[S3] Fallback also failed:', fallbackError);
        }
      }
      
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(url: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(url);

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      return false;
    }
  }
}
