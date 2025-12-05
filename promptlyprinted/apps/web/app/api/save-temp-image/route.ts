/**
 * Save Temp Image API Route
 * 
 * LAZY UPSCALING WORKFLOW:
 * This route ONLY saves images to /temp folder at original resolution.
 * NO 300 DPI generation happens here - that's deferred until checkout (after payment).
 * 
 * Three-Folder System:
 * - /temp/{sessionId}/ - Session drafts, auto-delete 24h
 * - /saved/{userId}/ - User favorites (via /api/saved-designs POST)
 * - /orders/{orderId}/ - Print files 300 DPI (via checkout after payment)
 */

import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

// Simple helper to check if URL is a data URL
function isDataUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}

// Get or create session ID for temp folder organization
async function getSessionId(request: Request): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('temp-session-id')?.value;
  
  if (!sessionId) {
    // Generate a new session ID
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
  
  return sessionId;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url } = data;

    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionId = await getSessionId(request);
    
    console.log('[Save Temp Image] Processing URL to /temp folder');
    console.log('[Save Temp Image] Session ID:', sessionId);
    console.log('[Save Temp Image] URL length:', url?.length, 'isDataUrl:', isDataUrl(url));

    let finalUrl = url;

    // If URL is base64, upload it to /temp storage (LOW-RES ONLY, NO UPSCALING)
    if (isDataUrl(url)) {
      console.log('[Save Temp Image] Uploading to /temp folder (low-res, no 300 DPI)...');

      try {
        // Upload to /temp folder with session ID for organization
        finalUrl = await storage.uploadFromBase64(url, 'draft-image', {
          folder: 'temp',
          sessionId,
        });
        console.log('[Save Temp Image] Uploaded to temp:', finalUrl);
      } catch (uploadError) {
        console.error('[Save Temp Image] Upload failed:', uploadError);
        throw new Error('Failed to save image to temp storage');
      }
    }

    // Set session cookie for subsequent requests
    const response = new Response(
      JSON.stringify({ 
        url: finalUrl,
        folder: 'temp',
        sessionId,
        // NOTE: printReadyUrl is NOT generated here anymore
        // It will be generated at checkout after payment via lazy upscaling
        printReadyUrl: null,
        _info: 'Print-ready 300 DPI version will be generated at checkout after payment'
      }), 
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response;
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
  // Keep the existing GET handler for proxying images
  try {
    const url = new URL(request.url);
    const rawUrl = url.searchParams.get('url');

    if (rawUrl) {
      try {
        const decodedUrl = decodeURIComponent(rawUrl);
        
        if (isDataUrl(decodedUrl)) {
          // Extract MIME type from data URL
          const mimeMatch = decodedUrl.match(/^data:([^;,]+)/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
          
          // Find the base64 marker
          const base64Marker = ';base64,';
          const markerIndex = decodedUrl.indexOf(base64Marker);
          if (markerIndex === -1) {
            throw new Error('Invalid data URL');
          }
          
          const base64Data = decodedUrl.substring(markerIndex + base64Marker.length);
          const cleanBase64 = base64Data.replace(/[\s\n\r]/g, '');
          const buffer = Buffer.from(cleanBase64, 'base64');
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
      JSON.stringify({ error: 'Missing url parameter' }),
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
