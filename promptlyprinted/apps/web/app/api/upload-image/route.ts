import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { storage } from '@/lib/storage';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { PRODUCT_IMAGE_SIZES } from '@/constants/product-sizes';

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
 */
function detectImageFormatFromBase64(base64String: string): string {
  try {
    // Decode first 12 bytes to check magic numbers
    const prefix = base64String.substring(0, 20);
    const buffer = Buffer.from(prefix, 'base64');
    const hex = buffer.toString('hex');

    // Check magic bytes (first few bytes of the file)
    // JPEG: FF D8 FF
    if (hex.startsWith('ffd8ff')) {
      return 'jpeg';
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (hex.startsWith('89504e47')) {
      return 'png';
    }
    // WebP: RIFF....WEBP (52 49 46 46 ... 57 45 42 50)
    if (hex.startsWith('52494646') && hex.includes('57454250')) {
      return 'webp';
    }
    // GIF: GIF87a or GIF89a (47 49 46 38 37 61 or 47 49 46 38 39 61)
    if (hex.startsWith('474946383')) {
      return 'gif';
    }

    console.warn('[detectImageFormatFromBase64] Could not detect format from magic bytes, base64 is likely corrupted. Hex:', hex);
    console.warn('[detectImageFormatFromBase64] Base64 prefix:', base64String.substring(0, 50));
    // Don't default to anything - return empty to signal invalid data
    return ''; // Return empty string to signal corrupted data
  } catch (error) {
    console.error('[detectImageFormatFromBase64] Error detecting format:', error);
    return ''; // Return empty to signal error
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
 * Parse base64 data URL
 */
function parseDataUrl(dataUrl: string): Buffer {
  try {
    console.log('[parseDataUrl] Parsing data URL...');
    console.log('[parseDataUrl] Data URL length:', dataUrl.length);
    console.log('[parseDataUrl] Data URL prefix:', dataUrl.substring(0, 100));
    
    const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (matches) {
      const [, format, base64String] = matches;
      console.log('[parseDataUrl] Matched format:', format);
      console.log('[parseDataUrl] Base64 string length:', base64String.length);
      console.log('[parseDataUrl] Base64 string prefix:', base64String.substring(0, 50));
      
      if (!ALLOWED_FORMATS.includes(format.toLowerCase())) {
        throw new Error(`Unsupported image format in data URL: ${format}`);
      }
      
      const buffer = Buffer.from(base64String, 'base64');
      console.log('[parseDataUrl] Buffer created successfully, size:', buffer.length);
      
      // Check if buffer is actually valid image data by examining magic bytes
      const magicBytes = buffer.toString('hex', 0, Math.min(8, buffer.length));
      console.log('[parseDataUrl] Buffer magic bytes (hex):', magicBytes);
      
      return buffer;
    } else {
      console.warn('[parseDataUrl] Regex match failed, trying fallback parsing...');
      // Try fallback parsing
      const parts = dataUrl.split(',');
      console.log('[parseDataUrl] Split parts count:', parts.length);
      if (parts.length > 1) {
        console.log('[parseDataUrl] Using fallback with part[0]:', parts[0]);
        const buffer = Buffer.from(parts[1], 'base64');
        console.log('[parseDataUrl] Fallback buffer created, size:', buffer.length);
        return buffer;
      } else {
        throw new Error('Invalid data URL format');
      }
    }
  } catch (error) {
    console.error('[parseDataUrl] Parse error:', error);
    throw new Error(`Failed to parse data URL: ${error instanceof Error ? error.message : 'Invalid format'}`);
  }
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
        } catch (jsonError) {
          // DEFENSIVE HANDLING: Check if body is raw base64 instead of JSON
          // This can happen when:
          // - Middleware or proxies strip the JSON wrapper
          // - Edge functions modify the request body
          // - Client code accidentally sends raw data
          // Instead of failing, we attempt to recover by wrapping the raw data
          console.warn('[Upload Image] JSON parsing failed, attempting base64 recovery...');
          console.log('[Upload Image] Body length:', bodyText.length);
          console.log('[Upload Image] Body starts with:', bodyText.substring(0, 100));

          // Check if this looks like raw base64 data
          const looksLikeBase64 = /^[A-Za-z0-9+/]/.test(bodyText) && bodyText.length > 100;
          const looksLikeDataUrl = bodyText.startsWith('data:image/');

          if (looksLikeBase64 || looksLikeDataUrl) {
            console.log('[Upload Image] Detected raw base64/data URL, wrapping in JSON structure...');

            // Reconstruct as if it was sent properly
            let imageDataValue: string;
            if (looksLikeDataUrl) {
              // It's already a data URL
              imageDataValue = bodyText;
            } else {
              // It's raw base64, need to add data URL prefix
              // Detect format from base64 magic bytes instead of assuming PNG
              let detectedFormat = detectImageFormatFromBase64(bodyText);
              console.log('[Upload Image] Detected format from base64:', detectedFormat);

              // If format detection failed (empty string), the base64 might be corrupted during transmission
              // This is a known issue where JSON body gets stripped and base64 gets corrupted
              // As a fallback, try PNG since Gemini embellishment typically returns PNG
              if (!detectedFormat) {
                console.warn('[Upload Image] Could not detect format from magic bytes');
                console.warn('[Upload Image] Base64 may have been corrupted during transmission');
                console.warn('[Upload Image] Attempting PNG fallback (Gemini embellishment default)');

                // Try to use the base64 anyway with PNG format
                // Sharp will validate and reject if truly corrupted
                detectedFormat = 'png';
              }

              imageDataValue = `data:image/${detectedFormat};base64,${bodyText}`;
            }

            data = {
              imageData: imageDataValue,
              name: 'Generated Image',
              productCode: undefined
            };

            console.log('[Upload Image] Successfully recovered from raw base64 data');
          } else {
            // Not base64, this is a genuine error
            console.error('[Upload Image] Body type check:', {
              startsWithCurly: bodyText.startsWith('{'),
              startsWithBase64: looksLikeBase64,
              startsWithDataUrl: looksLikeDataUrl,
              firstChar: bodyText.charAt(0),
              firstCharCode: bodyText.charCodeAt(0)
            });
            console.error('[Upload Image] JSON error:', jsonError);
            throw new Error(`Invalid JSON body: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
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
          
          if (typeof imageUrl !== 'string') {
            throw new Error('imageUrl must be a string');
          }

          if (imageUrl.startsWith('data:')) {
            imageBuffer = parseDataUrl(imageUrl);
          } else {
            imageBuffer = await fetchImageFromUrl(imageUrl);
          }
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

        // 3. Upload the standard PNG
        try {
        console.log('[Upload Image] Uploading standard PNG to storage...');
        const fileId = randomUUID();
        const sanitizedName = sanitizeFilename(name);
        const filename = `${fileId}-${sanitizedName}.png`;
        
        
        publicUrl = await storage.uploadFromBuffer(imageBuffer, filename, 'image/png', { skipUuid: true });
        console.log('[Upload Image] Standard PNG uploaded successfully:', publicUrl);

        // 4. Generate and upload 300 DPI print-ready version
        try {
            console.log('[Upload Image] Generating 300 DPI print-ready version...');
            const printReadyBuffer = await generatePrintReadyVersion(imageBuffer, productCode);
            const printReadyFilename = `${fileId}-${sanitizedName}-300dpi.png`;
            
            printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, printReadyFilename, 'image/png', { skipUuid: true });
            console.log('[Upload Image] 300 DPI version uploaded successfully:', printReadyUrl);
        } catch (printError) {
            console.error('[Upload Image] Failed to generate 300 DPI version:', printError);
            // Fallback: use the standard PNG as print-ready
            printReadyUrl = publicUrl;
            console.log('[Upload Image] Using standard PNG as fallback for print-ready version');
        }

        // 5. Generate and upload preview JPEG version for cart/checkout
        try {
            console.log('[Upload Image] Generating preview JPEG version...');
            const previewBuffer = await generatePreviewVersion(imageBuffer);
            const previewFilename = `${fileId}-${sanitizedName}-preview.jpg`;
            
            previewUrl = await storage.uploadFromBuffer(previewBuffer, previewFilename, 'image/jpeg', { skipUuid: true });
            console.log('[Upload Image] Preview JPEG uploaded successfully:', previewUrl);
        } catch (previewError) {
            console.error('[Upload Image] Failed to generate preview version:', previewError);
            // Fallback: use the standard PNG as preview
            previewUrl = publicUrl;
            console.log('[Upload Image] Using standard PNG as fallback for preview version');
        }
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