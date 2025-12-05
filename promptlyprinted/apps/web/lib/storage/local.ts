import { mkdir, writeFile, unlink, copyFile, readFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { StorageProvider, StorageFolder, UploadOptions } from './interface';

/**
 * Local filesystem storage implementation with Three-Folder System
 * 
 * Folder Structure (no legacy uploads/images):
 * - uploads/temp/{sessionId}/ - Session drafts
 * - uploads/saved/{userId}/ - User favorites (permanent)
 * - uploads/orders/{orderId}/ - Print files 300 DPI (permanent)
 * 
 * Note: Local storage doesn't enforce 24h lifecycle rules.
 * Use S3 with lifecycle policies for production.
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadsDir: string;

  constructor() {
    // Store in uploads/ directory in project root
    this.uploadsDir = join(process.cwd(), 'uploads');
  }

  /**
   * Build the file path based on folder and options
   * 
   * Three-Folder System (no legacy uploads/images):
   * - /temp/{sessionId}/ - Session drafts
   * - /saved/{userId}/ - User saved designs, permanent
   * - /orders/{orderId}/ - Print files 300 DPI, permanent
   */
  private buildPath(filename: string, options?: UploadOptions): { dir: string; fullPath: string; relativePath: string } {
    const folder = options?.folder || 'temp';
    const uniqueFilename = options?.skipUuid ? filename : `${randomUUID()}-${filename}`;
    
    let subDir: string;
    
    switch (folder) {
      case 'temp':
        const sessionId = options?.sessionId || 'anonymous';
        subDir = `temp/${sessionId}`;
        break;
      
      case 'saved':
        const userId = options?.userId || 'guest';
        subDir = `saved/${userId}`;
        break;
      
      case 'orders':
        const orderId = options?.orderId || `order-${Date.now()}`;
        subDir = `orders/${orderId}`;
        break;
      
      default:
        // Default to temp folder (no more uploads/images legacy path)
        const defaultSessionId = options?.sessionId || 'anonymous';
        subDir = `temp/${defaultSessionId}`;
    }
    
    const dir = join(this.uploadsDir, subDir);
    const fullPath = join(dir, uniqueFilename);
    const relativePath = `${subDir}/${uniqueFilename}`;
    
    return { dir, fullPath, relativePath };
  }

  /**
   * Extract path info from a URL
   */
  private extractPathFromUrl(url: string): string {
    // Handle /api/images/... URLs
    if (url.includes('/api/images/')) {
      return url.split('/api/images/').pop() || '';
    }
    // Handle direct paths
    return url.replace(/^\/+/, '');
  }

  async uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<string> {
    const { dir, fullPath, relativePath } = this.buildPath(filename, options);
    
    // Create directory structure
    await mkdir(dir, { recursive: true });

    // Write file to disk
    await writeFile(fullPath, buffer);

    console.log(`[Local Storage] Uploaded to ${options?.folder || 'temp'}: ${relativePath}`);

    // Return API URL that serves the file
    return `/api/images/${relativePath}`;
  }

  async uploadFromBase64(
    base64Data: string, 
    filename: string,
    options?: UploadOptions
  ): Promise<string> {
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);

    let mimeType: string;
    let base64String: string;

    if (matches) {
      const [, extension, data] = matches;
      mimeType = `image/${extension}`;
      base64String = data;

      if (!filename.includes('.')) {
        filename = `${filename}.${extension}`;
      }
    } else {
      base64String = base64Data;
      mimeType = 'image/png';

      if (!filename.includes('.')) {
        filename = `${filename}.png`;
      }
    }

    const buffer = Buffer.from(base64String, 'base64');
    return this.uploadFromBuffer(buffer, filename, mimeType, options);
  }

  /**
   * Copy a file from one location to another
   * Used for copying from /temp to /saved when user saves to favorites
   */
  async copy(
    sourceUrl: string,
    targetFolder: StorageFolder,
    options?: { userId?: string; orderId?: string }
  ): Promise<string> {
    try {
      const sourcePath = this.extractPathFromUrl(sourceUrl);
      const sourceFullPath = join(this.uploadsDir, sourcePath);
      
      // Extract original filename
      const originalFilename = sourcePath.split('/').pop() || `copied-${Date.now()}.png`;
      
      // Build target path
      const { dir, fullPath, relativePath } = this.buildPath(originalFilename, {
        folder: targetFolder,
        userId: options?.userId,
        orderId: options?.orderId,
        skipUuid: true, // Keep original UUID
      });
      
      // Create target directory
      await mkdir(dir, { recursive: true });
      
      // Copy file
      await copyFile(sourceFullPath, fullPath);
      
      console.log(`[Local Storage] Copied from ${sourcePath} to ${relativePath}`);
      
      return `/api/images/${relativePath}`;
    } catch (error) {
      console.error('[Local Storage] Error copying file:', error);
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(url: string): Promise<boolean> {
    try {
      const relativePath = this.extractPathFromUrl(url);
      if (!relativePath) {
        return false;
      }

      const filePath = join(this.uploadsDir, relativePath);
      await unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}
