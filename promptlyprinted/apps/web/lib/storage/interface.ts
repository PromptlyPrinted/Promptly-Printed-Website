/**
 * Storage interface for image uploads
 * This abstraction allows switching between local filesystem and cloud storage (S3, R2, etc.)
 * 
 * Three-Folder System for Lazy Upscaling:
 * - /temp: Session drafts (low-res), auto-delete after 24h
 * - /saved: User favorites (low-res), keep indefinitely
 * - /orders: Print files (high-res 300 DPI), keep forever
 */

export type StorageFolder = 'temp' | 'saved' | 'orders';

export interface UploadOptions {
  /** Skip UUID prefix for filename */
  skipUuid?: boolean;
  /** Target folder (temp, saved, orders) - defaults to 'temp' */
  folder?: StorageFolder;
  /** Session ID for temp folder organization */
  sessionId?: string;
  /** User ID for saved folder organization */
  userId?: string;
  /** Order ID for orders folder organization */
  orderId?: string;
}

export interface StorageProvider {
  /**
   * Upload a file from a buffer
   * @param buffer - File buffer
   * @param filename - Desired filename (with extension)
   * @param mimeType - MIME type of the file
   * @param options - Upload options including folder
   * @returns Public URL to access the file
   */
  uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<string>;

  /**
   * Upload a file from a base64 string
   * @param base64Data - Base64 encoded file data (with or without data URI prefix)
   * @param filename - Desired filename (with extension)
   * @param options - Upload options including folder
   * @returns Public URL to access the file
   */
  uploadFromBase64(
    base64Data: string, 
    filename: string,
    options?: UploadOptions
  ): Promise<string>;

  /**
   * Copy a file from one location to another
   * Used for copying from /temp to /saved when user saves to favorites
   * @param sourceUrl - Source file URL
   * @param targetFolder - Target folder
   * @param options - Additional options
   * @returns New URL of the copied file
   */
  copy(
    sourceUrl: string,
    targetFolder: StorageFolder,
    options?: { userId?: string; orderId?: string }
  ): Promise<string>;

  /**
   * Delete a file
   * @param url - URL or key of the file to delete
   * @returns true if successful
   */
  delete(url: string): Promise<boolean>;

  /**
   * Get a signed URL for private files (optional, for cloud storage)
   * @param url - URL or key of the file
   * @param expiresIn - Expiration time in seconds
   * @returns Signed URL
   */
  getSignedUrl?(url: string, expiresIn: number): Promise<string>;
}
