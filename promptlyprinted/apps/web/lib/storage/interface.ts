/**
 * Storage interface for image uploads
 * This abstraction allows switching between local filesystem and cloud storage (S3, R2, etc.)
 */

export interface StorageProvider {
  /**
   * Upload a file from a buffer
   * @param buffer - File buffer
   * @param filename - Desired filename (with extension)
   * @param mimeType - MIME type of the file
   * @param options - Upload options
   * @returns Public URL to access the file
   */
  uploadFromBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options?: { skipUuid?: boolean }
  ): Promise<string>;

  /**
   * Upload a file from a base64 string
   * @param base64Data - Base64 encoded file data (with or without data URI prefix)
   * @param filename - Desired filename (with extension)
   * @param options - Upload options
   * @returns Public URL to access the file
   */
  uploadFromBase64(
    base64Data: string, 
    filename: string,
    options?: { skipUuid?: boolean }
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
