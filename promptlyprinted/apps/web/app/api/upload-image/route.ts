import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { storage } from '@/lib/storage';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

// Next.js Route Segment Config for handling large file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

// Increase body size limit for large base64 images (default is 4MB)
// A 1920x1080 PNG can be ~5-10MB as base64
export const bodyParser = {
  sizeLimit: '50mb',
};


// Print-ready dimensions for 300 DPI at 15.6" x 19.3" (standard t-shirt print area)
const PRINT_WIDTH = 4680;  // 15.6 inches * 300 DPI
const PRINT_HEIGHT = 5790; // 19.3 inches * 300 DPI

// Configuration constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'avif'];
const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_DIMENSION = 8000; // Maximum width or height for input images

/**
 * Validate image buffer and metadata
 */
async function validateImage(imageBuffer: Buffer): Promise<void> {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Empty image buffer');
  }

  if (imageBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
      throw new Error(`Unsupported image format: ${metadata.format || 'unknown'}`);
    }

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to determine image dimensions');
    }

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      throw new Error(`Image dimensions exceed maximum allowed size (${MAX_DIMENSION}x${MAX_DIMENSION})`);
    }

    console.log(`[Upload Image] Image validation passed: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Input file contains unsupported image format')) {
      throw new Error('Invalid or corrupted image file');
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
 * Generate a 300 DPI print-ready version of an image
 */
async function generatePrintReadyVersion(imageBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(PRINT_WIDTH, PRINT_HEIGHT, {
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
    const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (matches) {
      const [, format, base64String] = matches;
      if (!ALLOWED_FORMATS.includes(format.toLowerCase())) {
        throw new Error(`Unsupported image format in data URL: ${format}`);
      }
      return Buffer.from(base64String, 'base64');
    } else {
      // Try fallback parsing
      const parts = dataUrl.split(',');
      if (parts.length > 1) {
        return Buffer.from(parts[1], 'base64');
      } else {
        throw new Error('Invalid data URL format');
      }
    }
  } catch (error) {
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

    // 1. Parse request and obtain image buffer
    const contentType = request.headers.get('content-type') || '';
    let isPdf = false;

    if (contentType.includes('multipart/form-data')) {
      console.log('[Upload Image] Processing multipart/form-data request');
      
      try {
        const formData = await request.formData();
        console.log('[Upload Image] FormData parsed successfully');
        
        const file = formData.get('file');
        const imageUrlField = formData.get('imageUrl');
        const nameField = formData.get('name');
        
        console.log('[Upload Image] FormData fields:', {
          hasFile: !!file,
          hasImageUrl: !!imageUrlField,
          hasName: !!nameField,
          fileType: file instanceof Blob ? file.type : 'not a blob'
        });
        
        if (nameField && typeof nameField === 'string') {
          name = nameField.trim();
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
        const data = await request.json();
        const { imageUrl, imageData, name: jsonName } = data;
        
        if (jsonName && typeof jsonName === 'string') {
          name = jsonName.trim();
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
            const printReadyBuffer = await generatePrintReadyVersion(imageBuffer);
            const printReadyFilename = `${fileId}-${sanitizedName}-300dpi.png`;
            
            printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, printReadyFilename, 'image/png', { skipUuid: true });
            console.log('[Upload Image] 300 DPI version uploaded successfully:', printReadyUrl);
        } catch (printError) {
            console.error('[Upload Image] Failed to generate 300 DPI version:', printError);
            // Fallback: use the standard PNG as print-ready
            printReadyUrl = publicUrl;
            console.log('[Upload Image] Using standard PNG as fallback for print-ready version');
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