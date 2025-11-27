import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { storage } from '@/lib/storage';
import sharp from 'sharp';

// Print-ready dimensions for 300 DPI at 15.6" x 19.3" (standard t-shirt print area)
const PRINT_WIDTH = 4680;  // 15.6 inches * 300 DPI
const PRINT_HEIGHT = 5790; // 19.3 inches * 300 DPI

/**
 * Ensure image buffer is in PNG format
 */
async function ensurePngFormat(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .png({
      quality: 100,
      compressionLevel: 6,
      force: true, // Force PNG output
    })
    .toBuffer();
}

/**
 * Generate a 300 DPI print-ready version of an image
 */
async function generatePrintReadyVersion(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
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
    .toBuffer();
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await request.json();
    const { imageUrl, imageData, name = 'Generated Image' } = data;

    if (!imageUrl && !imageData) {
      return new Response(JSON.stringify({ error: 'Missing image URL or data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the database user
    const dbUser = await database.user.findUnique({
      where: { id: session.user.id },
    });

    if (!dbUser) {
      return new Response(
        JSON.stringify({ error: 'User not found in database' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let publicUrl: string;
    let printReadyUrl: string | null = null;
    let imageBuffer: Buffer;

    // 1. Obtain Image Buffer
    if (imageData) {
      console.log('[Upload Image] Processing imageData field, length:', imageData.length);
      // Handle base64 data URLs from 'imageData' field
      const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const [, , base64String] = matches;
        imageBuffer = Buffer.from(base64String, 'base64');
      } else {
        imageBuffer = Buffer.from(imageData, 'base64');
      }
    } else if (imageUrl) {
      console.log('[Upload Image] Processing imageUrl field, length:', imageUrl.length);
      // Handle 'imageUrl' field - could be a URL or a Data URL
      if (imageUrl.startsWith('data:')) {
         console.log('[Upload Image] imageUrl is a data URL');
         const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
         if (matches) {
           const [, , base64String] = matches;
           console.log('[Upload Image] Extracted base64 string length:', base64String.length);
           imageBuffer = Buffer.from(base64String, 'base64');
         } else {
           console.log('[Upload Image] Regex match failed, trying split');
           // Fallback for malformed data URIs
           const parts = imageUrl.split(',');
           if (parts.length > 1) {
             const base64String = parts[1];
             console.log('[Upload Image] Split base64 string length:', base64String.length);
             imageBuffer = Buffer.from(base64String, 'base64');
           } else {
             console.error('[Upload Image] Failed to extract base64 from data URL');
             imageBuffer = Buffer.alloc(0);
           }
         }
      } else {
        console.log('[Upload Image] Fetching from remote URL:', imageUrl);
        // Fetch image from remote URL
        const response = await fetch(imageUrl);
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      console.error('[Upload Image] No valid image source provided');
      return new Response(JSON.stringify({ error: 'No valid image source provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[Upload Image] Final imageBuffer size:', imageBuffer.length);

    if (imageBuffer.length === 0) {
        return new Response(JSON.stringify({ error: 'Processed image buffer is empty' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 2. Enforce PNG Format for the "Original" (Public) URL
    // Even the "display" URL should be a PNG to avoid confusion
    try {
      imageBuffer = await ensurePngFormat(imageBuffer);
    } catch (conversionError) {
      console.error('[Upload Image] Failed to convert to PNG:', conversionError);
      return new Response(JSON.stringify({ error: 'Failed to process image format' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Upload the Standard PNG
    const filename = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    publicUrl = await storage.uploadFromBuffer(imageBuffer, filename, 'image/png');


    // 4. Generate and Upload 300 DPI Print-Ready Version
    try {
      console.log('[Upload Image] Generating 300 DPI print-ready version...');
      const printReadyBuffer = await generatePrintReadyVersion(imageBuffer);
      const printReadyFilename = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-300dpi.png`;
      printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, printReadyFilename, 'image/png');
      console.log('[Upload Image] 300 DPI version saved:', printReadyUrl);
    } catch (printError) {
      console.error('[Upload Image] Failed to generate 300 DPI version:', printError);
      // Fallback: use the standard PNG as print-ready (better than nothing, and it IS a PNG now)
      printReadyUrl = publicUrl;
    }

    // 5. Save to Database
    const savedImage = await database.savedImage.create({
      data: {
        name,
        url: publicUrl,
        printReadyUrl: printReadyUrl, // This is now guaranteed to be a PNG
        userId: dbUser.id,
      },
    });

    console.log('Image uploaded successfully:', {
      publicUrl,
      printReadyUrl,
      savedImageId: savedImage.id
    });

    return new Response(JSON.stringify({
      id: savedImage.id,
      url: publicUrl,
      printReadyUrl: printReadyUrl,
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to upload image',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}