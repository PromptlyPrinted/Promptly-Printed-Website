import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { StorageProvider } from './interface';

/**
 * Local filesystem storage implementation
 * Files are stored in public/uploads directory
 * This can be easily swapped with S3-compatible storage for production
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadsDir: string;

  constructor() {
    // Store in uploads/ directory in project root
    // This keeps user data separate from application code
    this.uploadsDir = join(process.cwd(), 'uploads');
  }

  async uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options?: { skipUuid?: boolean }
  ): Promise<string> {
    // Create uploads directory if it doesn't exist
    await mkdir(this.uploadsDir, { recursive: true });

    // Generate unique filename to avoid collisions unless skipUuid is true
    const uniqueFilename = options?.skipUuid ? filename : `${randomUUID()}-${filename}`;
    const filePath = join(this.uploadsDir, uniqueFilename);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Return API URL that serves the file
    // This matches the new /api/images/[filename] route
    return `/api/images/${uniqueFilename}`;
  }

  async uploadFromBase64(
    base64Data: string, 
    filename: string,
    options?: { skipUuid?: boolean }
  ): Promise<string> {
    // Extract MIME type and base64 data
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);

    let mimeType: string;
    let base64String: string;

    if (matches) {
      // Has data URI prefix
      const [, extension, data] = matches;
      mimeType = `image/${extension}`;
      base64String = data;

      // Add extension if not present in filename
      if (!filename.includes('.')) {
        filename = `${filename}.${extension}`;
      }
    } else {
      // No data URI prefix, assume it's just base64
      base64String = base64Data;
      mimeType = 'image/png'; // Default

      // Add extension if not present
      if (!filename.includes('.')) {
        filename = `${filename}.png`;
      }
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');

    return this.uploadFromBuffer(buffer, filename, mimeType, options);
  }

  async delete(url: string): Promise<boolean> {
    try {
      // Extract filename from URL (handles both /uploads/images/ and /uploads/)
      const filename = url.split('/uploads/images/').pop() || url.split('/uploads/').pop();
      if (!filename) {
        return false;
      }

      const filePath = join(this.uploadsDir, filename);
      await unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}
