import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { storage } from '@/lib/storage';
import sharp from 'sharp';

// Print-ready dimensions for 300 DPI at 15.6" x 19.3" (standard t-shirt print area)
const PRINT_WIDTH = 4680;  // 15.6 inches * 300 DPI
const PRINT_HEIGHT = 5790; // 19.3 inches * 300 DPI

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
    })
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

    if (imageData) {
      // Handle base64 data URLs - extract buffer first
      const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const [, , base64String] = matches;
        imageBuffer = Buffer.from(base64String, 'base64');
      } else {
        imageBuffer = Buffer.from(imageData, 'base64');
      }
      publicUrl = await storage.uploadFromBase64(imageData, name);
    } else if (imageUrl) {
      // Fetch image from URL and upload
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);

      // Determine file extension from Content-Type
      const contentType = response.headers.get('content-type') || 'image/png';
      let fileExtension = 'png';
      if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        fileExtension = 'jpg';
      } else if (contentType.includes('webp')) {
        fileExtension = 'webp';
      }

      const filename = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${fileExtension}`;
      publicUrl = await storage.uploadFromBuffer(imageBuffer, filename, contentType);
    } else {
      return new Response(JSON.stringify({ error: 'No valid image source provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate and upload 300 DPI print-ready version
    try {
      console.log('[Upload Image] Generating 300 DPI print-ready version...');
      const printReadyBuffer = await generatePrintReadyVersion(imageBuffer);
      const printReadyFilename = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-300dpi.png`;
      printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, printReadyFilename, 'image/png');
      console.log('[Upload Image] 300 DPI version saved:', printReadyUrl);
    } catch (printError) {
      console.error('[Upload Image] Failed to generate 300 DPI version:', printError);
      // Continue without 300 DPI version - original will be used as fallback
    }

    // Save to database with both URLs
    const savedImage = await database.savedImage.create({
      data: {
        name,
        url: publicUrl,
        printReadyUrl: printReadyUrl, // 300 DPI version for Prodigi
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