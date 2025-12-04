/**
 * Save Temp Image API Route
 * 
 * Handles saving temporary images to permanent storage.
 * Uses a robust approach to handle data URLs.
 */

import { database } from '@repo/database';
import { getSession } from '../../../lib/session-utils';
import { storage } from '@/lib/storage';
import { generatePrintReadyVersion } from '@/lib/image-processing';

// Simple helper to check if URL is a data URL
function isDataUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}

// Simple, robust data URL to Buffer converter
function simpleDataUrlToBuffer(dataUrl: string): Buffer {
  // Find the base64 marker
  const base64Marker = ';base64,';
  const markerIndex = dataUrl.indexOf(base64Marker);
  
  if (markerIndex === -1) {
    throw new Error('Invalid data URL: missing base64 marker');
  }
  
  // Extract base64 data
  const base64Data = dataUrl.substring(markerIndex + base64Marker.length);
  
  if (!base64Data || base64Data.length === 0) {
    throw new Error('Invalid data URL: empty base64 data');
  }
  
  // Clean whitespace and newlines
  const cleanBase64 = base64Data.replace(/[\s\n\r]/g, '');
  
  // Decode to buffer
  return Buffer.from(cleanBase64, 'base64');
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

    console.log('[Save Temp Image] Processing URL, length:', url?.length, 'isDataUrl:', isDataUrl(url));

    // If URL is base64, upload it to storage first and generate 300 DPI version
    let finalUrl = url;
    let printReadyUrl: string | null = null;

    if (isDataUrl(url)) {
      console.log('[Save Temp Image] Converting data URL to file storage...');

      try {
        // Use simple buffer conversion
        const imageBuffer = simpleDataUrlToBuffer(url);
        console.log('[Save Temp Image] Buffer created, size:', imageBuffer.length);

        // Upload original using storage (which handles its own base64 parsing)
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
          // Continue without print-ready version - it's optional
        }
      } catch (parseError) {
        console.error('[Save Temp Image] Failed to parse data URL:', parseError);
        // Last resort fallback: try direct upload which may handle errors better
        try {
          finalUrl = await storage.uploadFromBase64(url, 'checkout-image');
          console.log('[Save Temp Image] Fallback upload succeeded:', finalUrl);
        } catch (fallbackError) {
          console.error('[Save Temp Image] Fallback upload also failed:', fallbackError);
          throw new Error('Failed to process image data');
        }
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
    
    const errorMessage = error instanceof Error 
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
          // Extract MIME type from data URL
          const mimeMatch = decodedUrl.match(/^data:([^;,]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
          const buffer = simpleDataUrlToBuffer(decodedUrl);
          
          // Convert Buffer to Uint8Array for Response compatibility
          const uint8Array = new Uint8Array(buffer);
          
          return new Response(uint8Array, {
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
