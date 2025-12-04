/**
 * Shared image processing utilities for AI-generated images
 * Ensures all generated images have print-ready versions for T-shirt printing
 * 
 * Uses centralized image-utils for consistent data URL handling.
 */

import sharp from 'sharp';
import { storage } from '@/lib/storage';
import { randomUUID } from 'crypto';
import { PRODUCT_IMAGE_SIZES } from '@/constants/product-sizes';
import { 
  fetchImageAsBuffer as fetchImageAsBufferUtil,
  detectImageFormat,
  isDataUrl,
  ImageUtilsError,
} from '@/lib/image-utils';

// Default print-ready dimensions for 300 DPI at 15.6" x 19.3" (standard t-shirt print area)
const DEFAULT_PRINT_WIDTH = 4680;  // 15.6 inches * 300 DPI
const DEFAULT_PRINT_HEIGHT = 5790; // 19.3 inches * 300 DPI

/**
 * Generate a 300 DPI print-ready version of an image
 * 
 * @param imageBuffer - The source image buffer
 * @param productCode - Optional product code for specific dimensions
 * @returns Buffer containing the print-ready image
 */
export async function generatePrintReadyVersion(
  imageBuffer: Buffer,
  productCode?: string
): Promise<Buffer> {
  try {
    // Validate input
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Image buffer is empty');
    }

    // Validate it's a valid image format
    const format = detectImageFormat(imageBuffer);
    if (format === 'unknown') {
      console.warn('[Image Processing] Warning: Could not detect image format from magic bytes');
    }

    // Get product-specific dimensions or use defaults
    const dimensions = productCode && PRODUCT_IMAGE_SIZES[productCode as keyof typeof PRODUCT_IMAGE_SIZES]
      ? PRODUCT_IMAGE_SIZES[productCode as keyof typeof PRODUCT_IMAGE_SIZES]
      : { width: DEFAULT_PRINT_WIDTH, height: DEFAULT_PRINT_HEIGHT };

    console.log(`[Image Processing] Generating print-ready version: ${dimensions.width}x${dimensions.height}${productCode ? ` for product ${productCode}` : ' (default)'}`);

    return await sharp(imageBuffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        withoutEnlargement: false, // Allow upscaling for print quality
      })
      .png({
        quality: 100,
        compressionLevel: 6,
        force: true,
      })
      .withMetadata({ density: 300 }) // Explicitly set DPI metadata
      .timeout({ seconds: 60 }) // Longer timeout for print processing
      .toBuffer();
  } catch (error) {
    console.error('[Image Processing] Print-ready generation error:', error);
    throw new Error(`Failed to generate print-ready version: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch image from URL and convert to buffer
 * Uses centralized image-utils for consistent handling.
 * 
 * @param url - URL to fetch (can be data URL or HTTP URL)
 * @returns Buffer containing image data
 */
export async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  try {
    return await fetchImageAsBufferUtil(url);
  } catch (error) {
    // Re-throw with consistent error format
    if (error instanceof ImageUtilsError) {
      throw new Error(`Failed to fetch image: ${error.message} (${error.code})`);
    }
    throw new Error(`Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process AI-generated image and create print-ready version
 * Returns both the original URL and the print-ready URL
 * 
 * @param imageUrl - Source image URL (can be data URL or HTTP URL)
 * @param productCode - Optional product code for specific dimensions
 * @returns Object containing originalUrl and printReadyUrl
 */
export async function processAIGeneratedImage(
  imageUrl: string,
  productCode?: string
): Promise<{ originalUrl: string; printReadyUrl: string }> {
  try {
    console.log('[Image Processing] Processing AI-generated image...');
    console.log('[Image Processing] URL type:', isDataUrl(imageUrl) ? 'data URL' : 'HTTP URL');

    // Fetch the generated image using centralized utility
    const imageBuffer = await fetchImageAsBuffer(imageUrl);
    console.log('[Image Processing] Fetched image buffer, size:', imageBuffer.length);

    // Validate the buffer
    const format = detectImageFormat(imageBuffer);
    console.log('[Image Processing] Detected format:', format);

    // Generate print-ready version
    const printReadyBuffer = await generatePrintReadyVersion(imageBuffer, productCode);
    console.log('[Image Processing] Generated print-ready buffer, size:', printReadyBuffer.length);

    // Upload print-ready version to storage
    const fileName = `ai-generated-print-ready-${randomUUID()}.png`;
    const printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, fileName, 'image/png');

    console.log('[Image Processing] Print-ready version uploaded:', printReadyUrl);

    return {
      originalUrl: imageUrl,
      printReadyUrl: printReadyUrl,
    };
  } catch (error) {
    console.error('[Image Processing] Error processing AI-generated image:', error);
    throw new Error(`Failed to process AI-generated image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate that a URL points to a valid image
 * 
 * @param url - URL to validate
 * @returns True if URL points to a valid image
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const buffer = await fetchImageAsBuffer(url);
    const metadata = await sharp(buffer).metadata();
    return !!(metadata.format && metadata.width && metadata.height);
  } catch (error) {
    console.error('[Image Processing] Invalid image URL:', error);
    return false;
  }
}

/**
 * Generate a preview version of an image (smaller JPEG)
 * 
 * @param imageBuffer - Source image buffer
 * @param maxWidth - Maximum width (default 800)
 * @param quality - JPEG quality (default 80)
 * @returns Buffer containing preview image
 */
export async function generatePreviewVersion(
  imageBuffer: Buffer,
  maxWidth = 800,
  quality = 80
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
        progressive: true,
      })
      .toBuffer();
  } catch (error) {
    console.error('[Image Processing] Preview generation error:', error);
    throw new Error(`Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
