import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { storage } from '@/lib/storage';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { PRODUCT_IMAGE_SIZES } from '@/constants/product-sizes';
import {
  dataUrlToBuffer,
  parseDataUrl as parseDataUrlUtil,
  detectImageFormat,
  isDataUrl,
  ImageUtilsError,
  type ImageFormat,
} from '@/lib/image-utils';

// Next.js Route Segment Config for handling large file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';
// Note: bodyParser is not supported in App Router route handlers
// Body size limits are handled by Next.js config in next.config.js


// Default print-ready dimensions for 300 DPI at 15.6\" x 19.3\" (standard t-shirt print area)
// These are used as fallback if no product code is provided
const DEFAULT_PRINT_WIDTH = 4680;  // 15.6 inches * 300 DPI
const DEFAULT_PRINT_HEIGHT = 5790; // 19.3 inches * 300 DPI

// Configuration constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'avif'];
const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_DIMENSION = 8000; // Maximum width or height for input images

/**
 * Detect image format from base64 string by examining magic bytes
 * Uses centralized image-utils but adds logging for this route
 */
function detectImageFormatFromBase64(base64String: string): string {
  try {
    // Decode first 12 bytes to check magic numbers
    const prefix = base64String.substring(0, 20);
    const buffer = Buffer.from(prefix, 'base64');
    
    // Use centralized utility for detection
    const format = detectImageFormat(buffer);
    
    if (format === 'unknown') {
      const hex = buffer.toString('hex');
      console.warn('[detectImageFormatFromBase64] Could not detect format from magic bytes. Hex:', hex);
      console.warn('[detectImageFormatFromBase64] Base64 prefix:', base64String.substring(0, 50));
      return '';
    }
    
    return format;
  } catch (error) {
    console.error('[detectImageFormatFromBase64] Error detecting format:', error);
    return '';
  }
}

/**
 * Validate image buffer and metadata
 */
async function validateImage(imageBuffer: Buffer): Promise<void> {
  console.log('[validateImage] Starting validation...');
  console.log('[validateImage] Buffer length:', imageBuffer.length);
  console.log('[validateImage] Buffer first 20 bytes (hex):', imageBuffer.toString('hex', 0, Math.min(20, imageBuffer.length)));
  
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Empty image buffer');
  }

  if (imageBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  try {
    console.log('[validateImage] Attempting to read metadata with sharp...');
    const metadata = await sharp(imageBuffer).metadata();
    console.log('[validateImage] Metadata retrieved:', JSON.stringify(metadata, null, 2));
    
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error(`Unsupported image format: ${metadata.format || 'unknown'}`);
    }

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to determine image dimensions');
    }

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      throw new Error(`Image dimensions exceed maximum allowed size (${MAX_DIMENSION}x${MAX_DIMENSION})`);
    }

    console.log(`[validateImage] Image validation passed: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
  } catch (error) {
    console.error('[validateImage] Validation error details:', {
      errorName: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      bufferLength: imageBuffer.length,
      bufferStart: imageBuffer.toString('hex', 0, Math.min(20, imageBuffer.length))
    });
    
    if (error instanceof Error && error.message.includes('Input file contains unsupported image format')) {
      throw new Error('Invalid or corrupted image file');
    }
    // Check for common error patterns
    if (error instanceof Error && error.message.includes('Input buffer contains unsupported image format')) {
      throw new Error(`Input buffer contains unsupported image format - Buffer appears to be invalid or corrupted`);
    }
    throw error;
  }
}

/**
 * Ensure image buffer is in PNG format with proper error handling
 */
async function ensurePngFormat(imageBuffer: Buffer): Promise<Buffer> {
  try {
    await validateImage(imageBuffer);
    
    return await sharp(imageBuffer)
      .png({
        quality: 100,
        compressionLevel: 6,
        force: true,
      })
      .timeout({ seconds: 30 })
      .toBuffer();
  } catch (error) {
    console.error('[Upload Image] PNG conversion error:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a 300 DPI print-ready version of an image with product-specific dimensions
 */
async function generatePrintReadyVersion(imageBuffer: Buffer, productCode?: string): Promise<Buffer> {
  try {
    // Get product-specific dimensions or use defaults
    const dimensions = productCode && PRODUCT_IMAGE_SIZES[productCode as keyof typeof PRODUCT_IMAGE_SIZES]
      ? PRODUCT_IMAGE_SIZES[productCode as keyof typeof PRODUCT_IMAGE_SIZES]
      : { width: DEFAULT_PRINT_WIDTH, height: DEFAULT_PRINT_HEIGHT };

    console.log(`[Upload Image] Generating print-ready version with dimensions: ${dimensions.width}x${dimensions.height}${productCode ? ` for product ${productCode}` : ' (default)'}`);

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
    console.error('[Upload Image] Print-ready generation error:', error);
    throw new Error(`Failed to generate print-ready version: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a small JPEG preview for cart/checkout display
 */
async function generatePreviewVersion(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const maxWidth = 800; // Max width for preview
    
    // Calculate resize dimensions
    const shouldResize = metadata.width && metadata.width > maxWidth;
    
    return await sharp(imageBuffer)
      .resize(shouldResize ? maxWidth : undefined, undefined, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        progressive: true,
        optimizeScans: true,
      })
      .timeout({ seconds: 30 })
      .toBuffer();
  } catch (error) {
    console.error('[Upload Image] Preview generation error:', error);
    throw new Error(`Failed to generate preview version: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch image from URL with timeout and validation
 */
async function fetchImageFromUrl(url: string): Promise<Buffer> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Image-Upload-Service/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Image fetch timeout - URL took too long to respond');
      }
      throw new Error(`Failed to fetch image from URL: ${error.message}`);
    }
    throw new Error('Failed to fetch image from URL');
  }
}

/**
 * Parse base64 data URL with robust error handling
 * Simple implementation to avoid complex parsing issues
 */
function parseDataUrl(dataUrl: string): Buffer {
  console.log('[parseDataUrl] Parsing data URL...');
  console.log('[parseDataUrl] Data URL length:', dataUrl?.length || 0);
  
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('Data URL must be a non-empty string');
  }
  
  if (!dataUrl.startsWith('data:')) {
    throw new Error('Invalid data URL: must start with "data:"');
  }
  
  // Log the start of the data URL for debugging
  console.log('[parseDataUrl] Data URL prefix:', dataUrl.substring(0, Math.min(100, dataUrl.length)));
  
  // Find the base64 marker - handle various formats
  const base64Marker = ';base64,';
  const markerIndex = dataUrl.indexOf(base64Marker);
  
  if (markerIndex === -1) {
    throw new Error('Invalid data URL format - missing ";base64," marker');
  }
  
  // Extract base64 data
  const base64Data = dataUrl.substring(markerIndex + base64Marker.length);
  console.log('[parseDataUrl] Base64 data length:', base64Data?.length || 0);
  
  if (!base64Data || base64Data.length === 0) {
    throw new Error('Invalid data URL: empty base64 data');
  }
  
  // Clean whitespace and newlines that might have been introduced
  const cleanBase64 = base64Data.replace(/[\s\n\r]/g, '');
  console.log('[parseDataUrl] Cleaned base64 length:', cleanBase64.length);
  
  // Convert to buffer
  let buffer: Buffer;
  try {
    buffer = Buffer.from(cleanBase64, 'base64');
  } catch (decodeError) {
    console.error('[parseDataUrl] Base64 decode failed:', decodeError);
    throw new Error('Failed to decode base64 data - data may be corrupted');
  }
  
  console.log('[parseDataUrl] Buffer created, size:', buffer.length);
  
  if (buffer.length === 0) {
    throw new Error('Decoded buffer is empty');
  }
  
  // Log magic bytes for format verification
  if (buffer.length >= 8) {
    const magicHex = buffer.toString('hex', 0, 8);
    console.log('[parseDataUrl] Buffer magic bytes:', magicHex);
    
    // Quick format check
    if (magicHex.startsWith('89504e47')) {
      console.log('[parseDataUrl] Detected PNG format');
    } else if (magicHex.startsWith('ffd8ff')) {
      console.log('[parseDataUrl] Detected JPEG format');
    } else if (magicHex.startsWith('47494638')) {
      console.log('[parseDataUrl] Detected GIF format');
    } else if (magicHex.startsWith('52494646')) {
      console.log('[parseDataUrl] Detected RIFF (possibly WebP) format');
    } else {
      console.warn('[parseDataUrl] Unknown format, magic bytes:', magicHex);
      // Don't fail here - let sharp validate it
    }
  }
  
  // Use detectImageFormat for validation if available
  try {
    const detectedFormat = detectImageFormat(buffer);
    console.log('[parseDataUrl] Detected format via utility:', detectedFormat);
    
    if (detectedFormat !== 'unknown' && !ALLOWED_FORMATS.includes(detectedFormat)) {
      throw new Error(`Unsupported image format: ${detectedFormat}. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
    }
  } catch (formatError) {
    // Format detection failed, but we'll let sharp try anyway
    console.warn('[parseDataUrl] Format detection warning:', formatError);
  }
  
  return buffer;
}

/**
 * Sanitize filename for storage
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\s-]/gi, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .toLowerCase()
    .substring(0, 50) // Limit length
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    || 'image'; // Fallback if name becomes empty
}

export async function POST(request: Request) {
  console.log('[Upload Image] Starting image upload process');
  
  try {
    // Log request details immediately
    const contentType = request.headers.get('content-type') || '';
    console.log('[Upload Image] Request Content-Type:', contentType);
    console.log('[Upload Image] Request method:', request.method);
    console.log('[Upload Image] Request URL:', request.url);
    
    // Get session and user
    const session = await getSession(request);
    let dbUser = null;
    
    if (session?.user?.id) {
      try {
        dbUser = await database.user.findUnique({
          where: { id: session.user.id },
        });
      } catch (dbError) {
        console.error('[Upload Image] Database user lookup failed:', dbError);
        // Continue without user - treat as guest upload
      }
    }

    let name = 'Generated Image';
    let imageBuffer: Buffer | undefined;
    let publicUrl: string;
    let printReadyUrl: string | null = null;
    let previewUrl: string | null = null;
    let productCode: string | undefined;

    // 1. Parse request and obtain image buffer
    let isPdf = false;

    // Check for raw binary upload (image/* or application/octet-stream)
    if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
      console.log('[Upload Image] Processing raw binary request');
      console.log('[Upload Image] Content-Type:', contentType);

      // Read metadata from headers
      const headerName = request.headers.get('x-image-name');
      const headerProductCode = request.headers.get('x-product-code');

      if (headerName) {
        name = decodeURIComponent(headerName);
        console.log('[Upload Image] Name from header:', name);
      }

      if (headerProductCode) {
        productCode = headerProductCode;
        console.log('[Upload Image] Product code from header:', productCode);
      }

      try {
        const arrayBuffer = await request.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        console.log('[Upload Image] Raw binary buffer received, size:', imageBuffer.length);

        // Log first 20 bytes to verify data integrity
        const first20Hex = imageBuffer.toString('hex', 0, Math.min(20, imageBuffer.length));
        console.log('[Upload Image] Buffer first 20 bytes (hex):', first20Hex);
        console.log('[Upload Image] Expected PNG magic:', '89504e470d0a1a0a');
      } catch (readError) {
        console.error('[Upload Image] Failed to read raw body:', readError);
        throw new Error(`Failed to read request body: ${readError instanceof Error ? readError.message : 'Unknown error'}`);
      }
    } else if (contentType.includes('multipart/form-data')) {
      console.log('[Upload Image] Processing multipart/form-data request');
      console.log('[Upload Image] Content-Type header:', contentType);
      
      try {
        let formData: FormData;
        try {
          formData = await request.formData();
          console.log('[Upload Image] FormData parsed successfully');
        } catch (parseError) {
          console.error('[Upload Image] FormData parsing failed:', parseError);
          console.error('[Upload Image] Parse error details:', {
            name: parseError instanceof Error ? parseError.name : 'unknown',
            message: parseError instanceof Error ? parseError.message : String(parseError),
            stack: parseError instanceof Error ? parseError.stack : undefined
          });
          throw new Error(`Failed to parse body as FormData: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
        }
        
        const file = formData.get('file');
        const imageUrlField = formData.get('imageUrl');
        const nameField = formData.get('name');
        const productCodeField = formData.get('productCode');
        
        console.log('[Upload Image] FormData fields:', {
          hasFile: !!file,
          hasImageUrl: !!imageUrlField,
          hasName: !!nameField,
          hasProductCode: !!productCodeField,
          fileType: file instanceof Blob ? file.type : 'not a blob'
        });
        
        if (nameField && typeof nameField === 'string') {
          name = nameField.trim();
        }
        
        if (productCodeField && typeof productCodeField === 'string') {
          productCode = productCodeField.trim();
          console.log('[Upload Image] Product code:', productCode);
        }

        if (file && file instanceof Blob) {
          console.log('[Upload Image] Processing uploaded file, size:', file.size, 'type:', file.type);
          
          if (file.type === 'application/pdf') {
            isPdf = true;
          }

          if (file.size > MAX_FILE_SIZE) {
            return new Response(JSON.stringify({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const arrayBuffer = await file.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
        } else if (typeof imageUrlField === 'string') {
          console.log('[Upload Image] Processing image URL from form data');
          
          if (imageUrlField.startsWith('data:')) {
            imageBuffer = parseDataUrl(imageUrlField);
          } else {
            imageBuffer = await fetchImageFromUrl(imageUrlField);
          }
        }
      } catch (formError) {
        console.error('[Upload Image] Form data processing error:', formError);
        console.error('[Upload Image] Error details:', {
          name: formError instanceof Error ? formError.name : 'unknown',
          message: formError instanceof Error ? formError.message : String(formError),
          stack: formError instanceof Error ? formError.stack : undefined
        });
        return new Response(JSON.stringify({ 
          error: `Failed to process form data: ${formError instanceof Error ? formError.message : 'Unknown error'}` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.log('[Upload Image] Processing JSON request');

      try {
        // Read body as text first to inspect it
        const bodyText = await request.text();
        console.log('[Upload Image] Raw body length:', bodyText.length);
        console.log('[Upload Image] Raw body starts with:', bodyText.substring(0, 100));
        console.log('[Upload Image] Body appears to be JSON:', bodyText.trim().startsWith('{'));

        let data;

        try {
          // Try to parse as JSON
          data = JSON.parse(bodyText);
          console.log('[Upload Image] JSON parsed successfully, keys:', Object.keys(data));
          console.log('[Upload Image] Has imageUrl:', !!data.imageUrl);
          console.log('[Upload Image] Has imageData:', !!data.imageData);
          if (data.imageUrl) {
            console.log('[Upload Image] imageUrl type:', typeof data.imageUrl);
            console.log('[Upload Image] imageUrl length:', data.imageUrl?.length);
            console.log('[Upload Image] imageUrl starts with:', data.imageUrl?.substring(0, 50));
          }
        } catch (jsonError) {
          // DEFENSIVE HANDLING: Check if body is raw base64 instead of JSON
          console.warn('[Upload Image] JSON parsing failed, attempting recovery...');
          console.log('[Upload Image] Body length:', bodyText.length);
          console.log('[Upload Image] Body starts with:', bodyText.substring(0, 100));

          // Check if this looks like raw base64 data or a data URL
          const looksLikeBase64 = /^[A-Za-z0-9+/]/.test(bodyText) && bodyText.length > 100;
          const looksLikeDataUrl = bodyText.startsWith('data:image/') || bodyText.startsWith('data:application/');

          if (looksLikeDataUrl) {
            // It's already a data URL - use it directly
            console.log('[Upload Image] Detected raw data URL, using directly...');
            data = {
              imageData: bodyText,
              name: 'Generated Image',
              productCode: undefined
            };
            console.log('[Upload Image] Successfully recovered from raw data URL');
          } else if (looksLikeBase64) {
            // It's raw base64, need to add data URL prefix
            console.log('[Upload Image] Detected raw base64, wrapping...');
            
            // Try to detect format from base64 magic bytes
            let detectedFormat = detectImageFormatFromBase64(bodyText);
            console.log('[Upload Image] Detected format from base64:', detectedFormat);

            // If format detection failed, default to PNG (most common)
            if (!detectedFormat) {
              console.warn('[Upload Image] Could not detect format from magic bytes, defaulting to PNG');
              detectedFormat = 'png';
            }

            data = {
              imageData: `data:image/${detectedFormat};base64,${bodyText}`,
              name: 'Generated Image',
              productCode: undefined
            };
            console.log('[Upload Image] Successfully recovered from raw base64 data');
          } else {
            // Not recoverable - this is a genuine JSON error
            console.error('[Upload Image] Body type check:', {
              startsWithCurly: bodyText.startsWith('{'),
              startsWithBase64: looksLikeBase64,
              startsWithDataUrl: looksLikeDataUrl,
              firstChar: bodyText.charAt(0),
              firstCharCode: bodyText.charCodeAt(0)
            });
            console.error('[Upload Image] JSON error:', jsonError);
            
            // Return a helpful error message
            return new Response(JSON.stringify({
              error: 'Invalid request format. Expected JSON with imageUrl or imageData field.',
              details: 'The request body could not be parsed as JSON or detected as valid image data.'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }
        
        const { imageUrl, imageData, name: jsonName, productCode: jsonProductCode } = data;
        
        if (jsonName && typeof jsonName === 'string') {
          name = jsonName.trim();
        }
        
        if (jsonProductCode && typeof jsonProductCode === 'string') {
          productCode = jsonProductCode.trim();
          console.log('[Upload Image] Product code from JSON:', productCode);
        }

        if (imageData) {
          console.log('[Upload Image] Processing base64 imageData field');
          if (typeof imageData === 'string') {
            if (imageData.startsWith('data:')) {
              imageBuffer = parseDataUrl(imageData);
            } else {
              imageBuffer = Buffer.from(imageData, 'base64');
            }
          } else {
            throw new Error('imageData must be a string');
          }
        } else if (imageUrl) {
          console.log('[Upload Image] Processing imageUrl field');
          console.log('[Upload Image] imageUrl type:', typeof imageUrl);
          console.log('[Upload Image] imageUrl length:', imageUrl?.length);
          console.log('[Upload Image] imageUrl starts with:', imageUrl?.substring(0, 100));
          
          if (typeof imageUrl !== 'string') {
            throw new Error(`imageUrl must be a string, got ${typeof imageUrl}`);
          }

          if (!imageUrl || imageUrl.trim().length === 0) {
            throw new Error('imageUrl is empty');
          }

          if (imageUrl.startsWith('data:')) {
            console.log('[Upload Image] Parsing data URL...');
            try {
              imageBuffer = parseDataUrl(imageUrl);
              console.log('[Upload Image] Data URL parsed successfully, buffer size:', imageBuffer.length);
            } catch (parseError) {
              console.error('[Upload Image] Failed to parse data URL:', parseError);
              console.error('[Upload Image] Data URL length:', imageUrl.length);
              console.error('[Upload Image] Data URL first 200 chars:', imageUrl.substring(0, 200));
              throw new Error(`Failed to parse data URL: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
            }
          } else {
            console.log('[Upload Image] Fetching image from URL...');
            imageBuffer = await fetchImageFromUrl(imageUrl);
          }
        } else {
          console.error('[Upload Image] No image source found in JSON data');
          console.error('[Upload Image] Available keys:', Object.keys(data));
          throw new Error('No image source provided. Please provide either imageUrl or imageData in the request body.');
        }
      } catch (jsonError) {
        console.error('[Upload Image] JSON processing error:', jsonError);
        return new Response(JSON.stringify({ 
          error: `Failed to process JSON data: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Validate we have an image buffer
    if (!imageBuffer || imageBuffer.length === 0) {
      console.error('[Upload Image] No valid image source provided');
      return new Response(JSON.stringify({ error: 'No valid image source provided. Please provide either a file upload, imageUrl, or imageData.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[Upload Image] Buffer obtained, size:', imageBuffer.length, 'isPdf:', isPdf);

    // Check if buffer starts with PDF signature if not explicitly identified yet
    if (!isPdf && imageBuffer.length > 4 && imageBuffer.toString('ascii', 0, 4) === '%PDF') {
        console.log('[Upload Image] Detected PDF signature in buffer');
        isPdf = true;
    }

    if (isPdf) {
        // Handle PDF Upload
        try {
            console.log('[Upload Image] Uploading PDF to storage...');
            const fileId = randomUUID();
            const sanitizedName = sanitizeFilename(name);
            const filename = `${fileId}-${sanitizedName}.pdf`;
            
            publicUrl = await storage.uploadFromBuffer(imageBuffer, filename, 'application/pdf', { skipUuid: true });
            console.log('[Upload Image] PDF uploaded successfully:', publicUrl);
            
            // For PDFs, the printReadyUrl is the same as the publicUrl
            printReadyUrl = publicUrl;
        } catch (uploadError) {
            console.error('[Upload Image] PDF storage upload failed:', uploadError);
            return new Response(JSON.stringify({ 
                error: `Failed to save PDF to storage: ${uploadError instanceof Error ? uploadError.message : 'Unknown storage error'}`
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } else {
        // Handle Image Upload (Existing Logic)
        // 2. Convert to PNG format with validation
        try {
        console.log('[Upload Image] Converting to PNG format...');
        imageBuffer = await ensurePngFormat(imageBuffer);
        console.log('[Upload Image] PNG conversion successful, final size:', imageBuffer.length);
        } catch (conversionError) {
        console.error('[Upload Image] PNG conversion failed:', conversionError);
        return new Response(JSON.stringify({ 
            error: conversionError instanceof Error ? conversionError.message : 'Failed to process image format'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
        }

        // Upload 2 files:
        // 1. 300 DPI PNG for Prodigi printing (large, high quality)
        // 2. Preview JPEG for cart/checkout display (small, fast loading)
        try {
        console.log('[Upload Image] Processing images...');
        const fileId = randomUUID();
        const sanitizedName = sanitizeFilename(name);
        
        // Generate and upload the 300 DPI version for Prodigi (required for printing)
        console.log('[Upload Image] Generating 300 DPI print-ready version...');
        const printReadyBuffer = await generatePrintReadyVersion(imageBuffer, productCode);
        const printFilename = `${fileId}-${sanitizedName}-print.png`;
        
        printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, printFilename, 'image/png', { skipUuid: true });
        console.log('[Upload Image] 300 DPI PNG uploaded:', printReadyUrl);
        
        // Generate and upload a small preview JPEG for cart/checkout display (~50-100KB)
        console.log('[Upload Image] Generating preview version...');
        const previewBuffer = await generatePreviewVersion(imageBuffer);
        const previewFilename = `${fileId}-${sanitizedName}-preview.jpg`;
        
        previewUrl = await storage.uploadFromBuffer(previewBuffer, previewFilename, 'image/jpeg', { skipUuid: true });
        console.log('[Upload Image] Preview JPEG uploaded:', previewUrl);
        
        // Use preview URL as the public/display URL (smaller, faster loading)
        publicUrl = previewUrl;
        
      } catch (uploadError) {
        console.error('[Upload Image] Storage upload failed:', uploadError);
        return new Response(JSON.stringify({ 
            error: `Failed to save image to storage: ${uploadError instanceof Error ? uploadError.message : 'Unknown storage error'}`
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 5. Save to database (only if user is logged in)
    let savedImageId: string | undefined;
    
    if (dbUser) {
      try {
        console.log('[Upload Image] Saving image record to database...');
        const savedImage = await database.savedImage.create({
          data: {
            name: name || 'Generated Image',
            url: publicUrl,
            printReadyUrl: printReadyUrl,
            userId: dbUser.id,
          },
        });
        savedImageId = savedImage.id;
        console.log('[Upload Image] Database record created successfully:', savedImageId);
      } catch (dbError) {
        console.error('[Upload Image] Database save failed (non-critical):', dbError);
        // We don't fail the request if DB save fails, just log it
        // The image is still successfully uploaded to storage
      }
    } else {
      console.log('[Upload Image] Guest upload completed successfully');
    }

    // 6. Return success response
    const response = {
      id: savedImageId,
      url: publicUrl,
      previewUrl: previewUrl,
      printReadyUrl: printReadyUrl,
      success: true,
      name: name
    };

    console.log('[Upload Image] Upload process completed successfully');
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Upload Image] Unexpected error during upload process:', error);
    
    const errorResponse = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred during image upload',
      success: false,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined,
        details: 'Check server logs for more information'
      })
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}