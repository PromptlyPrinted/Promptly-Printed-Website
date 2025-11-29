/**
 * Shared image processing utilities for AI-generated images
 * Ensures all generated images have print-ready versions for T-shirt printing
 */

import sharp from 'sharp';
import { storage } from '@/lib/storage';
import { randomUUID } from 'crypto';
import { PRODUCT_IMAGE_SIZES } from '@/constants/product-sizes';

// Default print-ready dimensions for 300 DPI at 15.6" x 19.3" (standard t-shirt print area)
const DEFAULT_PRINT_WIDTH = 4680;  // 15.6 inches * 300 DPI
const DEFAULT_PRINT_HEIGHT = 5790; // 19.3 inches * 300 DPI

/**
 * Generate a 300 DPI print-ready version of an image
 */
export async function generatePrintReadyVersion(
  imageBuffer: Buffer,
  productCode?: string
): Promise<Buffer> {
  try {
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
 */
export async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  try {
    // If it's a base64 data URL, parse it directly
    if (url.startsWith('data:image/')) {
      const matches = url.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const base64Data = matches[2];
        return Buffer.from(base64Data, 'base64');
      }
    }

    // Otherwise fetch from URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Image-Processing-Service/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Image fetch timeout');
    }
    throw new Error(`Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process AI-generated image and create print-ready version
 * Returns both the original URL and the print-ready URL
 */
export async function processAIGeneratedImage(
  imageUrl: string,
  productCode?: string
): Promise<{ originalUrl: string; printReadyUrl: string }> {
  try {
    console.log('[Image Processing] Processing AI-generated image...');

    // Fetch the generated image
    const imageBuffer = await fetchImageAsBuffer(imageUrl);

    // Generate print-ready version
    const printReadyBuffer = await generatePrintReadyVersion(imageBuffer, productCode);

    // Upload print-ready version to storage
    const fileName = `ai-generated-print-ready-${randomUUID()}.png`;
    const printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, fileName, 'image/png');

    console.log('[Image Processing] Print-ready version created:', printReadyUrl);

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
 * Validate that a URL is a valid image
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
