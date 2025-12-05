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

// Maximum body size for Vercel API routes (with safety margin)
const MAX_UPLOAD_SIZE = 4 * 1024 * 1024; // 4MB to stay under Vercel's 4.5MB limit
const COMPRESSION_QUALITY = 0.85; // JPEG quality for compression
const MAX_DIMENSION = 2048; // Max width/height for compression

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
// IMAGE COMPRESSION (Client-side)
// ============================================================================

/**
 * Validate that a compressed data URL contains valid image data
 * by checking for proper structure and minimum content
 */
function validateCompressedDataUrl(dataUrl: string): boolean {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return false;
  }
  
  const base64Marker = ';base64,';
  const markerIndex = dataUrl.indexOf(base64Marker);
  if (markerIndex === -1) {
    return false;
  }
  
  const base64Data = dataUrl.substring(markerIndex + base64Marker.length);
  
  // Check minimum size (a valid JPEG/PNG should be at least a few hundred bytes)
  if (base64Data.length < 200) {
    console.warn('[validateCompressedDataUrl] Data URL too short:', base64Data.length);
    return false;
  }
  
  // Validate base64 characters
  const invalidChars = base64Data.match(/[^A-Za-z0-9+/=]/);
  if (invalidChars) {
    console.warn('[validateCompressedDataUrl] Invalid base64 characters found');
    return false;
  }
  
  // Try to decode a sample to verify it's valid base64
  try {
    const sample = base64Data.substring(0, Math.min(100, base64Data.length));
    atob(sample);
    
    // Check for JPEG magic bytes in decoded data
    const fullDecoded = atob(base64Data.substring(0, 20));
    const firstBytes = Array.from(fullDecoded).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    
    // Valid JPEG starts with ffd8ff, valid PNG starts with 89504e47
    const isValidJpeg = firstBytes.startsWith('ffd8ff');
    const isValidPng = firstBytes.startsWith('89504e47');
    
    if (!isValidJpeg && !isValidPng) {
      console.warn('[validateCompressedDataUrl] Invalid magic bytes:', firstBytes);
      return false;
    }
    
    return true;
  } catch (e) {
    console.warn('[validateCompressedDataUrl] Base64 decode failed:', e);
    return false;
  }
}

/**
 * Compress an image data URL to reduce size for upload
 * Uses canvas to resize and compress images that exceed the upload limit
 * 
 * @param dataUrl - The original data URL
 * @param maxSize - Maximum size in bytes (default: 4MB for Vercel limit)
 * @returns Compressed data URL (as PNG to preserve quality, or JPEG as fallback)
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxSize: number = MAX_UPLOAD_SIZE
): Promise<string> {
  // Only process if it's a data URL
  if (!isDataUrl(dataUrl)) {
    return dataUrl;
  }

  // Check if compression is needed
  const currentSize = dataUrl.length;
  console.log('[compressImage] Current size:', Math.round(currentSize / 1024), 'KB');
  
  if (currentSize <= maxSize) {
    console.log('[compressImage] No compression needed, under limit');
    return dataUrl;
  }

  console.log('[compressImage] Compressing image, over', Math.round(maxSize / 1024), 'KB limit');

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Set a timeout for image loading
    const loadTimeout = setTimeout(() => {
      console.error('[compressImage] Image load timeout');
      resolve(dataUrl); // Return original on timeout
    }, 30000); // 30 second timeout
    
    img.onload = () => {
      clearTimeout(loadTimeout);
      
      try {
        let { width, height } = img;
        console.log('[compressImage] Original dimensions:', width, 'x', height);
        
        // Validate image dimensions are valid
        if (width === 0 || height === 0) {
          console.error('[compressImage] Invalid image dimensions: 0x0');
          resolve(dataUrl);
          return;
        }
        
        // Calculate scaling factor to stay within max dimensions
        let scale = 1;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          console.log('[compressImage] Scaled dimensions:', width, 'x', height);
        }
        
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('[compressImage] Failed to get canvas context');
          resolve(dataUrl); // Return original if canvas fails
          return;
        }
        
        // Draw with white background (for transparent PNGs converting to JPEG)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // First try PNG with reduced dimensions (preserves quality better)
        let compressed = canvas.toDataURL('image/png');
        console.log('[compressImage] PNG size:', Math.round(compressed.length / 1024), 'KB');
        
        // If PNG is still too large, switch to JPEG
        if (compressed.length > maxSize) {
          console.log('[compressImage] PNG too large, switching to JPEG...');
          
          // Try different quality levels until we're under the limit
          let quality = COMPRESSION_QUALITY;
          compressed = canvas.toDataURL('image/jpeg', quality);
          
          // Progressively reduce quality if still too large
          while (compressed.length > maxSize && quality > 0.5) {
            quality -= 0.1;
            compressed = canvas.toDataURL('image/jpeg', quality);
            console.log('[compressImage] Reduced quality to', quality.toFixed(1), 
                        'size:', Math.round(compressed.length / 1024), 'KB');
          }
          
          // If still too large, reduce dimensions further
          if (compressed.length > maxSize && quality <= 0.5) {
            console.log('[compressImage] Still too large, reducing dimensions...');
            const newScale = 0.7;
            const newWidth = Math.round(width * newScale);
            const newHeight = Math.round(height * newScale);
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // Redraw at new size
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, newWidth, newHeight);
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            compressed = canvas.toDataURL('image/jpeg', 0.75);
            console.log('[compressImage] After dimension reduction:', 
                        Math.round(compressed.length / 1024), 'KB');
          }
        }
        
        // CRITICAL: Validate the compressed output
        if (!validateCompressedDataUrl(compressed)) {
          console.error('[compressImage] Compressed output validation failed, returning original');
          resolve(dataUrl);
          return;
        }
        
        console.log('[compressImage] Final size:', Math.round(compressed.length / 1024), 'KB',
                    '(reduced by', Math.round((1 - compressed.length / currentSize) * 100) + '%)');
        
        resolve(compressed);
      } catch (error) {
        console.error('[compressImage] Compression error:', error);
        resolve(dataUrl); // Return original on error
      }
    };
    
    img.onerror = (error) => {
      clearTimeout(loadTimeout);
      console.error('[compressImage] Failed to load image:', error);
      resolve(dataUrl); // Return original on error
    };
    
    img.src = dataUrl;
  });
}

/**
 * Check if an image data URL needs compression
 */
export function needsCompression(dataUrl: string, maxSize: number = MAX_UPLOAD_SIZE): boolean {
  return isDataUrl(dataUrl) && dataUrl.length > maxSize;
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
  // Three-folder system: /temp (24h), /saved (permanent), /orders (permanent)
  return (
    url.includes('.r2.dev') ||
    url.includes('cloudflare') ||
    url.includes('images.promptlyprinted.com') ||
    url.startsWith('/api/images/') ||
    url.includes('/saved/') ||
    url.includes('/orders/') ||
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
  
  // If it's a three-folder system URL (/temp, /saved, /orders), return as-is
  if (imageUrl.includes('/temp/') || imageUrl.includes('/saved/') || imageUrl.includes('/orders/')) {
    return { url: imageUrl, previewUrl: imageUrl, printReadyUrl: imageUrl };
  }
  
  // For other permanent URLs, return as-is
  return { url: imageUrl, previewUrl: imageUrl, printReadyUrl: imageUrl };
}

/**
 * Thoroughly validate a data URL before upload
 * Returns true if valid, false otherwise
 */
function preflightValidateDataUrl(dataUrl: string): { valid: boolean; error?: string } {
  if (!dataUrl || !isDataUrl(dataUrl)) {
    return { valid: false, error: 'Not a valid data URL' };
  }
  
  try {
    // Parse the data URL
    const parsed = parseDataUrl(dataUrl);
    
    // Check format is supported
    if (parsed.format === 'unknown') {
      return { valid: false, error: 'Unknown image format' };
    }
    
    // Decode and check magic bytes
    const decodedSample = atob(parsed.base64.substring(0, 20));
    const magicBytes = Array.from(decodedSample)
      .slice(0, 8)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    
    const isPng = magicBytes.startsWith('89504e47');
    const isJpeg = magicBytes.startsWith('ffd8ff');
    const isGif = magicBytes.startsWith('47494638');
    const isWebp = magicBytes.startsWith('52494646'); // RIFF header
    
    if (!isPng && !isJpeg && !isGif && !isWebp) {
      return { 
        valid: false, 
        error: `Invalid image magic bytes: ${magicBytes}. Expected PNG, JPEG, GIF, or WebP.` 
      };
    }
    
    // Check base64 length is reasonable (at least 1KB of image data)
    if (parsed.base64.length < 1000) {
      return { valid: false, error: 'Image data too small to be valid' };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Execute the actual upload request
 * 
 * IMPORTANT: We use JSON with base64 instead of binary Blob because:
 * 1. Binary Blob uploads are unreliable across browsers
 * 2. Some proxies/middleware corrupt binary data
 * 3. JSON is more debuggable and predictable
 * 
 * Images are automatically compressed if they exceed the upload limit.
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
    console.log('[image-utils] Preparing image for upload...');
    console.log('[image-utils] Image URL type:', isDataUrl(imageUrl) ? 'data URL' : 'regular URL');
    
    let urlToUpload = imageUrl;
    
    if (isDataUrl(imageUrl)) {
      // First, validate the original image
      const originalValidation = preflightValidateDataUrl(imageUrl);
      if (!originalValidation.valid) {
        console.error('[image-utils] Original image validation failed:', originalValidation.error);
        throw new ImageUtilsError(
          `Image data is invalid: ${originalValidation.error}`,
          'INVALID_INPUT'
        );
      }
      
      // Check size and compress if needed
      const originalSize = imageUrl.length;
      console.log('[image-utils] Original data URL size:', Math.round(originalSize / 1024), 'KB');
      
      if (needsCompression(imageUrl)) {
        console.log('[image-utils] Image exceeds upload limit, compressing...');
        try {
          const compressed = await compressImageDataUrl(imageUrl);
          console.log('[image-utils] Compressed size:', Math.round(compressed.length / 1024), 'KB');
          
          // Validate the compressed result
          const compressedValidation = preflightValidateDataUrl(compressed);
          if (compressedValidation.valid) {
            urlToUpload = compressed;
            console.log('[image-utils] Compressed image validated successfully');
          } else {
            console.warn('[image-utils] Compressed image validation failed:', compressedValidation.error);
            console.warn('[image-utils] Using original image instead');
            // Keep urlToUpload as original imageUrl
          }
        } catch (compressError) {
          console.error('[image-utils] Compression failed, using original:', compressError);
          // Continue with original if compression fails
        }
      }
      
      // Final validation before sending
      const finalValidation = preflightValidateDataUrl(urlToUpload);
      if (!finalValidation.valid) {
        console.error('[image-utils] Final validation failed:', finalValidation.error);
        throw new ImageUtilsError(
          `Cannot upload image: ${finalValidation.error}`,
          'INVALID_INPUT'
        );
      }
      
      // Log parsed info
      try {
        const parsed = parseDataUrl(urlToUpload);
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
      imageUrl: urlToUpload,  // Send the (possibly compressed) data URL or regular URL
      name, 
      productCode 
    });
    
    console.log('[image-utils] Request body size:', Math.round(body.length / 1024), 'KB');

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
