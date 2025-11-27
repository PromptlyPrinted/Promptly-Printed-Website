import { database } from '@repo/database';
import { getSession } from '../../../lib/session-utils';
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
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .png({
      quality: 100,
      compressionLevel: 6,
    })
    .withMetadata({ density: 300 })
    .toBuffer();
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);

    // Get the database user if session exists
    let dbUser = null;
    if (session?.user?.id) {
      dbUser = await database.user.findUnique({
        where: { id: session.user.id },
      });
    }

    const data = await request.json();
    const { url } = data;

    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If URL is base64, upload it to storage first and generate 300 DPI version
    let finalUrl = url;
    let printReadyUrl: string | null = null;

    if (url.startsWith('data:image')) {
      console.log('Converting base64 image to file storage');

      // Extract buffer from base64
      const matches = url.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const [, , base64String] = matches;
        const imageBuffer = Buffer.from(base64String, 'base64');

        // Upload original
        finalUrl = await storage.uploadFromBase64(url, 'checkout-image');

        // Generate and upload 300 DPI print-ready version
        try {
          console.log('[Save Temp Image] Generating 300 DPI print-ready version...');
          const printReadyBuffer = await generatePrintReadyVersion(imageBuffer);
          const printReadyFilename = `checkout-image-${Date.now()}-300dpi.png`;
          printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, printReadyFilename, 'image/png');
          console.log('[Save Temp Image] 300 DPI version saved:', printReadyUrl);
        } catch (printError) {
          console.error('[Save Temp Image] Failed to generate 300 DPI version:', printError);
        }
      } else {
        finalUrl = await storage.uploadFromBase64(url, 'checkout-image');
      }
    }

    // Check if the image is already saved (only if we have a DB user to query against, or just skip this check for guests)
    // Actually, we can check by URL if it's unique enough, but for guests we might just want to save new.
    if (dbUser) {
        const existingImage = await database.savedImage.findFirst({
        where: { url: finalUrl },
        });

        if (existingImage) {
        return new Response(JSON.stringify({ id: existingImage.id, printReadyUrl: existingImage.printReadyUrl }), {
            headers: { 'Content-Type': 'application/json' },
        });
        }
    }

    // Save the image to the database with both URLs (only if user is logged in)
    let savedImageId: string | undefined;
    
    if (dbUser) {
      const savedImage = await database.savedImage.create({
        data: {
          name: 'Checkout Image',
          url: finalUrl,
          printReadyUrl: printReadyUrl,
          userId: dbUser.id,
        },
      });
      savedImageId = savedImage.id;
    }

    return new Response(JSON.stringify({ id: savedImageId, url: finalUrl, printReadyUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to process image',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const rawUrl = url.searchParams.get('url');

    if (id) {
      // Get the image from the database
      const savedImage = await database.savedImage.findUnique({
        where: { id },
      });

      if (!savedImage) {
        return new Response(JSON.stringify({ error: 'Image not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Proxy the image
      try {
        const fetched = await fetch(savedImage.url);
        const contentType =
          fetched.headers.get('content-type') || 'application/octet-stream';
        return new Response(fetched.body, {
          headers: { 'Content-Type': contentType },
        });
      } catch (error) {
        console.error('Error proxying image:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to proxy image' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    if (rawUrl) {
      try {
        const decodedUrl = decodeURIComponent(rawUrl);
        if (decodedUrl.startsWith('data:image')) {
          const matches = decodedUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
          if (!matches) {
            return new Response(JSON.stringify({ error: 'Invalid data URL' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const [, mimeType, base64Data] = matches;
          const buffer = Buffer.from(base64Data, 'base64');
          return new Response(buffer, {
            headers: {
              'Content-Type': mimeType,
              'Content-Length': buffer.length.toString(),
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }

        const response = await fetch(decodedUrl);
        if (!response.ok) {
          throw new Error(`Upstream response ${response.status} ${response.statusText}`);
        }
        const contentType =
          response.headers.get('content-type') || 'application/octet-stream';
        return new Response(response.body, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } catch (error) {
        console.error('Error proxying raw URL:', error);
        return new Response(JSON.stringify({ error: 'Failed to proxy URL' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(
      JSON.stringify({ error: 'Missing id or url parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error retrieving image:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Failed to retrieve image',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
