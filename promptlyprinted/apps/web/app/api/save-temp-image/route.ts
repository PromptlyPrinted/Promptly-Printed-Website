/**
 * Save Temp Image API Route
 * 
 * Handles saving temporary images to permanent storage.
 * Uses centralized image-utils for consistent data URL handling.
 */

import { database } from '@repo/database';
import { getSession } from '../../../lib/session-utils';
import { storage } from '@/lib/storage';
import { generatePrintReadyVersion } from '@/lib/image-processing';
import {
  isDataUrl,
  dataUrlToBuffer,
  parseDataUrl,
  ImageUtilsError,
} from '@/lib/image-utils';

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

    if (isDataUrl(url)) {
      console.log('[Save Temp Image] Converting data URL to file storage...');

      try {
        // Use centralized utility to parse and convert
        const imageBuffer = dataUrlToBuffer(url);
        console.log('[Save Temp Image] Buffer created, size:', imageBuffer.length);

        // Upload original
        finalUrl = await storage.uploadFromBase64(url, 'checkout-image');
        console.log('[Save Temp Image] Original uploaded:', finalUrl);

        // Generate and upload 300 DPI print-ready version
        try {
          console.log('[Save Temp Image] Generating 300 DPI print-ready version...');
          const printReadyBuffer = await generatePrintReadyVersion(imageBuffer);
          const printReadyFilename = `checkout-image-${Date.now()}-300dpi.png`;
          printReadyUrl = await storage.uploadFromBuffer(printReadyBuffer, printReadyFilename, 'image/png');
          console.log('[Save Temp Image] 300 DPI version saved:', printReadyUrl);
        } catch (printError) {
          console.error('[Save Temp Image] Failed to generate 300 DPI version:', printError);
          // Continue without print-ready version
        }
      } catch (parseError) {
        console.error('[Save Temp Image] Failed to parse data URL:', parseError);
        // Fallback: try direct upload
        finalUrl = await storage.uploadFromBase64(url, 'checkout-image');
      }
    }

    // Check if the image is already saved (only if we have a DB user)
    if (dbUser) {
      const existingImage = await database.savedImage.findFirst({
        where: { url: finalUrl },
      });

      if (existingImage) {
        return new Response(
          JSON.stringify({ 
            id: existingImage.id, 
            url: existingImage.url,
            printReadyUrl: existingImage.printReadyUrl 
          }), 
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
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

    return new Response(
      JSON.stringify({ id: savedImageId, url: finalUrl, printReadyUrl }), 
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Save Temp Image] Error:', error);
    
    const errorMessage = error instanceof ImageUtilsError
      ? `${error.message} (${error.code})`
      : error instanceof Error 
        ? error.message 
        : 'Failed to process image';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
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
        console.error('[Save Temp Image] Error proxying image:', error);
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
        
        if (isDataUrl(decodedUrl)) {
          // Use centralized utility to parse data URL
          const { mimeType } = parseDataUrl(decodedUrl);
          const buffer = dataUrlToBuffer(decodedUrl);
          
          return new Response(buffer, {
            headers: {
              'Content-Type': mimeType,
              'Content-Length': buffer.length.toString(),
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }

        // Fetch from remote URL
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
        console.error('[Save Temp Image] Error proxying raw URL:', error);
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
    console.error('[Save Temp Image] Error retrieving image:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to retrieve image',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
