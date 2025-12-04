/**
 * Centralized Image Utilities
 * 
 * This is the SINGLE SOURCE OF TRUTH for all image data URL handling.
 * All image processing, parsing, and uploading should use these utilities.
 * 
 * DO NOT create duplicate implementations elsewhere.
 * 
 * @module image-utils
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedDataUrl {
  mimeType: string;
  base64: string;
  format: ImageFormat;
}

export type ImageFormat = 'png' | 'jpeg' | 'gif' | 'webp' | 'tiff' | 'avif' | 'unknown';

export interface UploadResult {
  url: string;
  previewUrl: string;
  printReadyUrl: string;
}

export interface UploadOptions {
  productCode?: string;
  name?: string;
  signal?: AbortSignal;
  maxRetries?: number;
  timeout?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOWED_FORMATS: ImageFormat[] = ['png', 'jpeg', 'gif', 'webp', 'tiff', 'avif'];
const DEFAULT_TIMEOUT = 120000; // 2 minutes
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second

// Magic bytes for image format detection
const MAGIC_BYTES: Record<string, ImageFormat> = {
  '89504e47': 'png',      // PNG
  'ffd8ff': 'jpeg',       // JPEG
  '47494638': 'gif',      // GIF (GIF87a or GIF89a)
  '52494646': 'webp',     // RIFF (WebP container)
  '49492a00': 'tiff',     // TIFF (little endian)
  '4d4d002a': 'tiff',     // TIFF (big endian)
};

// ============================================================================
// DATA URL PARSING
// ============================================================================

/**
 * Parse a data URL and extract the MIME type and base64 data
 * 
 * Handles various formats including:
 * - data:image/png;base64,DATA
 * - data:image/png;charset=utf-8;base64,DATA
 * - data:image/svg+xml;base64,DATA
 * 
 * @param dataUrl - The data URL to parse
 * @returns Parsed data URL components
 * @throws Error if the data URL is invalid
 */
export function parseDataUrl(dataUrl: string): ParsedDataUrl {
  // Validate input
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new ImageUtilsError('Data URL must be a non-empty string', 'INVALID_INPUT');
  }

  if (!dataUrl.startsWith('data:')) {
    throw new ImageUtilsError('Invalid data URL: must start with "data:"', 'INVALID_FORMAT');
  }

  // Log for debugging
  console.log('[parseDataUrl] Input length:', dataUrl.length);
  console.log('[parseDataUrl] First 100 chars:', dataUrl.substring(0, 100));

  // Find the base64 marker
  const base64Index = dataUrl.indexOf(';base64,');
  if (base64Index === -1) {
    throw new ImageUtilsError(
      'Invalid data URL format - missing ";base64," marker',
      'INVALID_FORMAT'
    );
  }

  // Extract mime type (between "data:" and first ";" or ",")
  const headerEnd = dataUrl.indexOf(';');
  if (headerEnd === -1 || headerEnd > base64Index) {
    throw new ImageUtilsError(
      'Invalid data URL format - could not extract MIME type',
      'INVALID_FORMAT'
    );
  }
  
  const mimeType = dataUrl.substring(5, headerEnd); // Skip "data:"
  console.log('[parseDataUrl] Extracted MIME type:', mimeType);

  // Extract base64 data (after ";base64,")
  const rawBase64 = dataUrl.substring(base64Index + 8); // Skip ";base64,"
  console.log('[parseDataUrl] Raw base64 length:', rawBase64.length);
  console.log('[parseDataUrl] Base64 last 20 chars:', rawBase64.substring(rawBase64.length - 20));
  
  // Clean whitespace from base64 string
  const base64 = rawBase64.replace(/[\s\n\r]/g, '');
  console.log('[parseDataUrl] Cleaned base64 length:', base64.length);

  // Check if base64 looks truncated (should be divisible by 4 or end with padding)
  if (base64.length % 4 !== 0 && !base64.endsWith('=') && !base64.endsWith('==')) {
    console.warn('[parseDataUrl] WARNING: Base64 length not divisible by 4, may be truncated');
    console.warn('[parseDataUrl] Length:', base64.length, 'Mod 4:', base64.length % 4);
  }

  // Validate base64 characters (more permissive - just check for obviously invalid chars)
  const invalidCharMatch = base64.match(/[^A-Za-z0-9+/=]/);
  if (invalidCharMatch) {
    console.error('[parseDataUrl] Invalid character found:', invalidCharMatch[0], 'at position around', base64.indexOf(invalidCharMatch[0]));
    throw new ImageUtilsError(`Invalid base64 encoding - found invalid character: ${invalidCharMatch[0]}`, 'INVALID_BASE64');
  }

  if (base64.length === 0) {
    throw new ImageUtilsError('Base64 data is empty', 'EMPTY_DATA');
  }

  // Minimum size check (a valid PNG/JPEG should be at least a few hundred bytes)
  if (base64.length < 100) {
    console.warn('[parseDataUrl] WARNING: Base64 data seems very short:', base64.length);
  }

  // Extract format from MIME type
  const formatMatch = mimeType.match(/^image\/([^+;]+)/);
  const format = formatMatch ? normalizeFormat(formatMatch[1]) : 'unknown';
  console.log('[parseDataUrl] Detected format:', format);

  return { mimeType, base64, format };
}

/**
 * Normalize format string to our standard format type
 */
function normalizeFormat(format: string): ImageFormat {
  const normalized = format.toLowerCase().trim();
  if (normalized === 'jpg') return 'jpeg';
  if (ALLOWED_FORMATS.includes(normalized as ImageFormat)) {
    return normalized as ImageFormat;
  }
  return 'unknown';
}

// ============================================================================
// DATA URL CONVERSION
// ============================================================================

/**
 * Convert a data URL to a Blob (client-side only)
 * This is the preferred method for uploading images from the browser.
 * 
 * @param dataUrl - The data URL to convert
 * @returns Blob containing the image data
 * @throws Error if conversion fails
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const { mimeType, base64 } = parseDataUrl(dataUrl);
  
  try {
    // Decode base64 to binary
    const binaryString = atob(base64);
    const len = binaryString.length;
    
    if (len === 0) {
      throw new ImageUtilsError('Decoded image data is empty', 'EMPTY_DATA');
    }

    // Create ArrayBuffer and fill it
    const arrayBuffer = new ArrayBuffer(len);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Validate magic bytes
    const format = detectImageFormat(uint8Array);
    if (format === 'unknown') {
      console.warn('[image-utils] Warning: Could not detect image format from magic bytes');
      console.warn('[image-utils] First 8 bytes:', bytesToHex(uint8Array.slice(0, 8)));
    }

    return new Blob([arrayBuffer], { type: mimeType });
  } catch (error) {
    if (error instanceof ImageUtilsError) throw error;
    throw new ImageUtilsError(
      `Failed to decode base64 data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DECODE_ERROR'
    );
  }
}

/**
 * Convert a data URL to a Buffer (server-side only)
 * Use this in API routes and server components.
 * 
 * @param dataUrl - The data URL to convert
 * @returns Buffer containing the image data
 * @throws Error if conversion fails
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const { base64, mimeType } = parseDataUrl(dataUrl);
  
  console.log('[dataUrlToBuffer] Converting base64 to buffer...');
  console.log('[dataUrlToBuffer] Base64 length:', base64.length);
  console.log('[dataUrlToBuffer] MIME type:', mimeType);
  
  try {
    const buffer = Buffer.from(base64, 'base64');
    
    console.log('[dataUrlToBuffer] Buffer created, size:', buffer.length);
    
    if (buffer.length === 0) {
      throw new ImageUtilsError('Decoded buffer is empty', 'EMPTY_DATA');
    }
    
    // Validate the buffer contains image data by checking magic bytes
    const magicBytes = buffer.toString('hex', 0, Math.min(8, buffer.length));
    console.log('[dataUrlToBuffer] Magic bytes:', magicBytes);
    
    // Check for known image format magic bytes
    const isPNG = magicBytes.startsWith('89504e47'); // PNG
    const isJPEG = magicBytes.startsWith('ffd8ff');  // JPEG
    const isGIF = magicBytes.startsWith('474946');   // GIF
    const isWebP = magicBytes.startsWith('52494646'); // WebP (RIFF)
    
    if (!isPNG && !isJPEG && !isGIF && !isWebP) {
      console.error('[dataUrlToBuffer] WARNING: Buffer does not start with known image magic bytes');
      console.error('[dataUrlToBuffer] Expected PNG (89504e47), JPEG (ffd8ff), GIF (474946), or WebP (52494646)');
      console.error('[dataUrlToBuffer] Got:', magicBytes);
      
      // Log more context to help debug
      console.error('[dataUrlToBuffer] Buffer first 50 bytes as ASCII:', buffer.toString('ascii', 0, Math.min(50, buffer.length)).replace(/[^\x20-\x7E]/g, '.'));
      
      // Check if it looks like text/HTML (common error when API returns error page)
      const firstChars = buffer.toString('utf8', 0, Math.min(100, buffer.length));
      if (firstChars.includes('<!DOCTYPE') || firstChars.includes('<html') || firstChars.includes('Error')) {
        throw new ImageUtilsError(
          'Received HTML/text instead of image data - the image generation API may have returned an error',
          'INVALID_RESPONSE'
        );
      }
    } else {
      const detectedFormat = isPNG ? 'PNG' : isJPEG ? 'JPEG' : isGIF ? 'GIF' : 'WebP';
      console.log('[dataUrlToBuffer] Detected format from magic bytes:', detectedFormat);
    }
    
    return buffer;
  } catch (error) {
    if (error instanceof ImageUtilsError) throw error;
    throw new ImageUtilsError(
      `Failed to create buffer from base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DECODE_ERROR'
    );
  }
}

// ============================================================================
// FORMAT DETECTION
// ============================================================================

/**
 * Convert bytes to hex string
 */
function bytesToHex(bytes: Uint8Array | Buffer): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Detect image format from magic bytes
 * 
 * @param data - Image data as Uint8Array or Buffer
 * @returns Detected format or 'unknown'
 */
export function detectImageFormat(data: Uint8Array | Buffer): ImageFormat {
  if (!data || data.length < 4) {
    return 'unknown';
  }

  const hex = bytesToHex(data.slice(0, 12));

  // Check each magic byte pattern
  for (const [pattern, format] of Object.entries(MAGIC_BYTES)) {
    if (hex.startsWith(pattern)) {
      // Special case for WebP - need to verify WEBP signature at offset 8
      if (format === 'webp' && data.length >= 12) {
        const webpSig = bytesToHex(data.slice(8, 12));
        if (webpSig !== '57454250') { // 'WEBP' in hex
          continue; // Not actually WebP
        }
      }
      return format;
    }
  }
  
  return 'unknown';
}

/**
 * Validate that data contains a valid image by checking magic bytes
 * 
 * @param data - Image data to validate
 * @returns True if valid image format detected
 */
export function validateImageMagicBytes(data: Uint8Array | Buffer): boolean {
  return detectImageFormat(data) !== 'unknown';
}

/**
 * Check if format is allowed for upload
 */
export function isAllowedFormat(format: ImageFormat): boolean {
  return ALLOWED_FORMATS.includes(format);
}

// ============================================================================
// URL TYPE CHECKS
// ============================================================================

/**
 * Check if a URL is a data URL
 */
export function isDataUrl(url: string | undefined | null): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}

/**
 * Check if a URL is a permanent storage URL (not a data URL or localhost)
 */
export function isPermanentUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  if (isDataUrl(url)) return false;
  if (url.includes('localhost') || url.includes('127.0.0.1')) return false;
  
  // Check for known permanent storage patterns
  return (
    url.includes('.r2.dev') ||
    url.includes('cloudflare') ||
    url.includes('images.promptlyprinted.com') ||
    url.startsWith('/api/images/') ||
    url.startsWith('/uploads/') ||
    (url.startsWith('https://') && !url.includes('localhost'))
  );
}

/**
 * Check if a URL needs to be uploaded to permanent storage
 */
export function needsUpload(url: string | undefined | null): boolean {
  if (!url) return false;
  return isDataUrl(url) || !isPermanentUrl(url);
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

/**
 * Upload an image to permanent storage
 * This is the SINGLE entry point for all image uploads from the client.
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Timeout handling
 * - Data URL to Blob conversion
 * - Permanent URL detection (skips upload if already permanent)
 * 
 * @param imageUrl - Either a data URL or a regular URL
 * @param options - Upload options
 * @returns Object containing url, previewUrl, and printReadyUrl
 * @throws ImageUtilsError if upload fails
 */
export async function uploadImage(
  imageUrl: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    productCode = '',
    name = 'Generated Design',
    signal,
    maxRetries = DEFAULT_MAX_RETRIES,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  // Validate input
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new ImageUtilsError('Image URL is required', 'INVALID_INPUT');
  }

  console.log('[image-utils] uploadImage called:', {
    urlType: isDataUrl(imageUrl) ? 'data URL' : 'regular URL',
    isPermanent: isPermanentUrl(imageUrl),
    productCode,
  });

  // If already a permanent URL, derive the variants without uploading
  if (isPermanentUrl(imageUrl) && !isDataUrl(imageUrl)) {
    return derivePermanentUrls(imageUrl);
  }

  // Upload with retry logic
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[image-utils] Upload attempt ${attempt}/${maxRetries}`);
      
      const result = await executeUpload(imageUrl, {
        productCode,
        name,
        signal,
        timeout,
      });
      
      // Validate result
      if (!result.url || !result.previewUrl || !result.printReadyUrl) {
        throw new ImageUtilsError('Server returned incomplete response', 'INCOMPLETE_RESPONSE');
      }
      
      // Validate returned URLs are not data URLs
      if (isDataUrl(result.url) || isDataUrl(result.previewUrl) || isDataUrl(result.printReadyUrl)) {
        throw new ImageUtilsError('Server returned data URLs instead of permanent URLs', 'INVALID_RESPONSE');
      }
      
      console.log('[image-utils] Upload successful:', result.url.substring(0, 50));
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[image-utils] Upload attempt ${attempt} failed:`, lastError.message);
      
      // Don't retry on certain errors
      if (error instanceof ImageUtilsError) {
        if (['INVALID_INPUT', 'INVALID_FORMAT', 'INVALID_BASE64', 'EMPTY_DATA'].includes(error.code)) {
          throw error; // Don't retry validation errors
        }
      }
      
      // Check if aborted
      if (signal?.aborted) {
        throw new ImageUtilsError('Upload aborted', 'ABORTED');
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
        console.log(`[image-utils] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  throw new ImageUtilsError(
    `Upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    'MAX_RETRIES_EXCEEDED'
  );
}

/**
 * Derive permanent URLs from an existing permanent URL
 */
function derivePermanentUrls(imageUrl: string): UploadResult {
  // If it's a Cloudflare R2 URL, return as-is for all variants
  if (imageUrl.includes('.r2.dev') || imageUrl.includes('cloudflare') || imageUrl.includes('images.promptlyprinted.com')) {
    return { url: imageUrl, previewUrl: imageUrl, printReadyUrl: imageUrl };
  }
  
  // If it's an API URL, derive the variants
  if (imageUrl.startsWith('/api/images/')) {
    const printReadyUrl = imageUrl.replace(/\.png$/, '-300dpi.png');
    const previewUrl = imageUrl.replace(/\.png$/, '-preview.jpg');
    return { url: imageUrl, previewUrl, printReadyUrl };
  }
  
  // If it's a legacy upload URL
  if (imageUrl.startsWith('/uploads/')) {
    return { url: imageUrl, previewUrl: imageUrl, printReadyUrl: imageUrl };
  }
  
  // For other permanent URLs, return as-is
  return { url: imageUrl, previewUrl: imageUrl, printReadyUrl: imageUrl };
}

/**
 * Execute the actual upload request
 * 
 * IMPORTANT: We use JSON with base64 instead of binary Blob because:
 * 1. Binary Blob uploads are unreliable across browsers
 * 2. Some proxies/middleware corrupt binary data
 * 3. JSON is more debuggable and predictable
 */
async function executeUpload(
  imageUrl: string,
  options: { productCode: string; name: string; signal?: AbortSignal; timeout: number }
): Promise<UploadResult> {
  const { productCode, name, signal, timeout } = options;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Combine with external signal
  const combinedSignal = signal 
    ? combineAbortSignals(signal, controller.signal)
    : controller.signal;
  
  try {
    // ALWAYS send as JSON - this is more reliable than binary Blob
    // The server can handle both data URLs and regular URLs
    console.log('[image-utils] Sending image as JSON...');
    console.log('[image-utils] Image URL type:', isDataUrl(imageUrl) ? 'data URL' : 'regular URL');
    
    if (isDataUrl(imageUrl)) {
      // Validate the data URL before sending
      try {
        const parsed = parseDataUrl(imageUrl);
        console.log('[image-utils] Data URL validated:', {
          mimeType: parsed.mimeType,
          format: parsed.format,
          base64Length: parsed.base64.length,
        });
      } catch (parseError) {
        console.error('[image-utils] Data URL validation failed:', parseError);
        throw parseError;
      }
    }
    
    const body = JSON.stringify({ 
      imageUrl,  // Send the full data URL or regular URL
      name, 
      productCode 
    });
    
    console.log('[image-utils] Request body size:', body.length);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[image-utils] Server error response:', errorText);
      
      let errorMessage = `Upload failed: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Use raw text if not JSON
        if (errorText.length < 200) {
          errorMessage = errorText;
        }
      }
      
      throw new ImageUtilsError(errorMessage, 'SERVER_ERROR');
    }

    return await response.json();
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ImageUtilsError) throw error;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ImageUtilsError('Upload timed out', 'TIMEOUT');
      }
      throw new ImageUtilsError(error.message, 'NETWORK_ERROR');
    }
    
    throw new ImageUtilsError('Unknown upload error', 'UNKNOWN_ERROR');
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Combine multiple abort signals
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  
  return controller.signal;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error class for image utilities
 */
export class ImageUtilsError extends Error {
  public readonly code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'ImageUtilsError';
    this.code = code;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ImageUtilsError);
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
    };
  }
}

/**
 * Check if an error is an ImageUtilsError
 */
export function isImageUtilsError(error: unknown): error is ImageUtilsError {
  return error instanceof ImageUtilsError;
}

// ============================================================================
// SERVER-SIDE UTILITIES
// ============================================================================

/**
 * Fetch image from URL and return as Buffer (server-side only)
 * 
 * @param url - URL to fetch image from (can be data URL or HTTP URL)
 * @param timeout - Timeout in milliseconds
 * @returns Buffer containing image data
 */
export async function fetchImageAsBuffer(url: string, timeout = 10000): Promise<Buffer> {
  // Handle data URLs
  if (isDataUrl(url)) {
    console.log('[image-utils] Parsing data URL to buffer...');
    return dataUrlToBuffer(url);
  }

  // Fetch from HTTP URL
  console.log('[image-utils] Fetching image from URL:', url.substring(0, 50));
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Image-Processing-Service/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ImageUtilsError(
        `HTTP ${response.status}: ${response.statusText}`,
        'FETCH_ERROR'
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (buffer.length === 0) {
      throw new ImageUtilsError('Fetched image is empty', 'EMPTY_DATA');
    }
    
    console.log('[image-utils] Fetched image buffer, size:', buffer.length);
    return buffer;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ImageUtilsError) throw error;
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ImageUtilsError('Image fetch timed out', 'TIMEOUT');
    }
    
    throw new ImageUtilsError(
      `Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'FETCH_ERROR'
    );
  }
}
