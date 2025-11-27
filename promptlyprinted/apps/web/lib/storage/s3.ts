import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import type { StorageProvider } from './interface';

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private endpoint: string;
  private publicUrl: string;

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

    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Needed for some S3-compatible providers like MinIO
    });
  }

  async uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<string> {
    const uniqueFilename = `${randomUUID()}-${filename}`;
    const key = `uploads/images/${uniqueFilename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read', // Make file public
      })
    );

    // Return public URL
    // If S3_PUBLIC_URL is set, use it (e.g. CDN or custom domain)
    // Otherwise construct from endpoint
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    
    // Fallback for R2/S3
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async uploadFromBase64(base64Data: string, filename: string): Promise<string> {
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
    return this.uploadFromBuffer(buffer, filename, mimeType);
  }

  async delete(url: string): Promise<boolean> {
    try {
      // Extract key from URL
      // Assumes URL ends with the key
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1); // Remove leading slash

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
