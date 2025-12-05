/**
 * Lazy Upscaling Utility
 * 
 * LAZY UPSCALING WORKFLOW - Step 3:
 * Only generates high-resolution 300 DPI print files AFTER payment is confirmed.
 * 
 * This saves significant storage and compute costs by:
 * 1. Not upscaling images that users never buy
 * 2. Only processing images for confirmed orders
 * 3. Storing high-res files in /orders folder with the order ID
 * 
 * The upscaled images are sent to Prodigi for printing.
 */

import sharp from 'sharp';
import { storage } from '@/lib/storage';
import { PRODUCT_IMAGE_SIZES } from '@/constants/product-sizes';
import { 
  fetchImageAsBuffer as fetchImageAsBufferUtil,
  detectImageFormat,
} from '@/lib/image-utils';

// Default print-ready dimensions for 300 DPI at 15.6" x 19.3" (standard t-shirt print area)
const DEFAULT_PRINT_WIDTH = 4680;  // 15.6 inches * 300 DPI
const DEFAULT_PRINT_HEIGHT = 5790; // 19.3 inches * 300 DPI

export interface UpscaleOptions {
  /** Product code for specific dimensions */
  productCode?: string;
  /** Order ID for storage path */
  orderId: string;
  /** Order item index for unique naming */
  itemIndex: number;
}

export interface UpscaleResult {
  /** Original low-res URL */
  originalUrl: string;
  /** New high-res 300 DPI URL in /orders folder */
  printReadyUrl: string;
  /** Dimensions of the upscaled image */
  dimensions: { width: number; height: number };
  /** Size of the upscaled file in bytes */
  fileSizeBytes: number;
}

/**
 * Upscale a single image to 300 DPI print quality
 * Called ONLY after payment is confirmed
 * 
 * @param imageUrl - Source image URL (from /temp or /saved folder)
 * @param options - Upscale options including orderId
 * @returns UpscaleResult with the new print-ready URL
 */
export async function upscaleForPrint(
  imageUrl: string,
  options: UpscaleOptions
): Promise<UpscaleResult> {
  console.log(`[Lazy Upscale] Starting upscale for order ${options.orderId}, item ${options.itemIndex}`);
  console.log(`[Lazy Upscale] Source URL: ${imageUrl}`);

  // Fetch the source image
  const sourceBuffer = await fetchImageAsBufferUtil(imageUrl);
  console.log(`[Lazy Upscale] Source image size: ${sourceBuffer.length} bytes`);

  // Detect format
  const format = detectImageFormat(sourceBuffer);
  console.log(`[Lazy Upscale] Detected format: ${format}`);

  // Get product-specific dimensions or use defaults
  const dimensions = options.productCode && PRODUCT_IMAGE_SIZES[options.productCode as keyof typeof PRODUCT_IMAGE_SIZES]
    ? PRODUCT_IMAGE_SIZES[options.productCode as keyof typeof PRODUCT_IMAGE_SIZES]
    : { width: DEFAULT_PRINT_WIDTH, height: DEFAULT_PRINT_HEIGHT };

  console.log(`[Lazy Upscale] Target dimensions: ${dimensions.width}x${dimensions.height} (300 DPI)`);

  // Upscale to 300 DPI print quality
  const printReadyBuffer = await sharp(sourceBuffer)
    .resize(dimensions.width, dimensions.height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      withoutEnlargement: false, // Allow upscaling for print quality
      kernel: 'lanczos3', // High-quality upscaling algorithm
    })
    .png({
      quality: 100,
      compressionLevel: 6,
      force: true,
    })
    .withMetadata({ density: 300 }) // Explicitly set DPI metadata
    .timeout({ seconds: 120 }) // Longer timeout for large images
    .toBuffer();

  console.log(`[Lazy Upscale] Upscaled image size: ${printReadyBuffer.length} bytes`);

  // Save to /orders folder
  const filename = `order-${options.orderId}-item-${options.itemIndex}-300dpi.png`;
  const printReadyUrl = await storage.uploadFromBuffer(
    printReadyBuffer,
    filename,
    'image/png',
    {
      folder: 'orders',
      orderId: options.orderId,
      skipUuid: true, // Use our structured naming
    }
  );

  console.log(`[Lazy Upscale] Saved to orders folder: ${printReadyUrl}`);

  return {
    originalUrl: imageUrl,
    printReadyUrl,
    dimensions,
    fileSizeBytes: printReadyBuffer.length,
  };
}

/**
 * Upscale all items in an order
 * Called after payment is confirmed, before sending to Prodigi
 * 
 * @param orderItems - Array of order items with designUrl
 * @param orderId - Order ID for storage path
 * @returns Array of upscale results
 */
export async function upscaleOrderItems(
  orderItems: Array<{
    designUrl?: string;
    productCode?: string;
  }>,
  orderId: string
): Promise<UpscaleResult[]> {
  console.log(`[Lazy Upscale] Processing ${orderItems.length} items for order ${orderId}`);

  const results: UpscaleResult[] = [];

  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    
    if (!item.designUrl) {
      console.warn(`[Lazy Upscale] Item ${i} has no designUrl, skipping`);
      continue;
    }

    try {
      const result = await upscaleForPrint(item.designUrl, {
        orderId,
        itemIndex: i,
        productCode: item.productCode,
      });
      results.push(result);
    } catch (error) {
      console.error(`[Lazy Upscale] Failed to upscale item ${i}:`, error);
      // Don't fail the whole order, but log the error
      // The original low-res URL can be used as fallback
      results.push({
        originalUrl: item.designUrl,
        printReadyUrl: item.designUrl, // Fallback to original
        dimensions: { width: 0, height: 0 },
        fileSizeBytes: 0,
      });
    }
  }

  console.log(`[Lazy Upscale] Completed ${results.length} upscales for order ${orderId}`);
  return results;
}

/**
 * Check if an image needs upscaling
 * Images in /orders folder are already upscaled
 * Images in /temp or /saved need upscaling
 */
export function needsUpscaling(imageUrl: string): boolean {
  // Already in orders folder = already upscaled
  if (imageUrl.includes('/orders/')) {
    return false;
  }
  
  // Check if URL indicates print-ready (300dpi)
  if (imageUrl.includes('-300dpi') || imageUrl.includes('print-ready')) {
    return false;
  }
  
  return true;
}

