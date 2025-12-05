/**
 * Save to Favorites API Route
 * 
 * LAZY UPSCALING WORKFLOW - Step 2:
 * When user clicks "Save to Favorites", this route:
 * 1. COPIES the file from /temp to /saved (not moves, to preserve the draft view)
 * 2. Creates a database record for the saved image
 * 
 * The image remains LOW-RES. High-res 300 DPI is only generated at checkout.
 * 
 * Cost Impact: Minimal - we're only storing small low-res files
 */

import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { storage } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const session = await getSession(request);

    // Require authentication for saving to favorites
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required',
          message: 'Please sign in to save images to your favorites',
        }), 
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const dbUser = await database.user.findUnique({
      where: { id: session.user.id },
    });

    if (!dbUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }), 
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await request.json();
    const { tempUrl, name, productCode, prompt, aiModel } = data;

    if (!tempUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing tempUrl - the URL of the image in /temp folder' }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Save to Favorites] Processing...');
    console.log('[Save to Favorites] User ID:', dbUser.id);
    console.log('[Save to Favorites] Temp URL:', tempUrl);

    // Check if already saved (to prevent duplicates)
    const existingImage = await database.savedImage.findFirst({
      where: { 
        userId: dbUser.id,
        // Check if original temp URL matches or if URL matches
        OR: [
          { url: tempUrl },
          { metadata: { path: ['tempUrl'], equals: tempUrl } },
        ]
      },
    });

    if (existingImage) {
      console.log('[Save to Favorites] Image already saved, returning existing');
      return new Response(
        JSON.stringify({ 
          id: existingImage.id, 
          url: existingImage.url,
          alreadySaved: true,
          message: 'This image is already in your favorites',
        }), 
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // COPY the file from /temp to /saved (not move!)
    // This preserves the draft in the current session while also saving to favorites
    console.log('[Save to Favorites] Copying from /temp to /saved...');
    
    let savedUrl: string;
    try {
      savedUrl = await storage.copy(tempUrl, 'saved', { userId: dbUser.id });
      console.log('[Save to Favorites] Copied to:', savedUrl);
    } catch (copyError) {
      console.error('[Save to Favorites] Copy failed:', copyError);
      
      // If copy fails (e.g., temp file expired), return helpful error
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save image',
          message: 'The temporary image may have expired. Please regenerate the design.',
        }), 
        {
          status: 410, // Gone
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create database record
    const savedImage = await database.savedImage.create({
      data: {
        name: name || 'Saved Design',
        url: savedUrl,
        // printReadyUrl is NULL - will be generated at checkout via lazy upscaling
        printReadyUrl: null,
        userId: dbUser.id,
        metadata: {
          tempUrl, // Keep reference to original temp URL
          productCode,
          prompt,
          aiModel,
          savedAt: new Date().toISOString(),
          folder: 'saved',
          isLowRes: true, // Flag that this is low-res, needs upscaling at checkout
        },
      },
    });

    console.log('[Save to Favorites] Database record created:', savedImage.id);

    return new Response(
      JSON.stringify({ 
        id: savedImage.id, 
        url: savedUrl,
        folder: 'saved',
        message: 'Image saved to favorites! High-resolution version will be generated at checkout.',
      }), 
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Save to Favorites] Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to save to favorites';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * GET: List user's saved favorites
 */
export async function GET(request: Request) {
  try {
    const session = await getSession(request);

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const savedImages = await database.savedImage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    });

    return new Response(
      JSON.stringify({ 
        images: savedImages,
        count: savedImages.length,
      }), 
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Save to Favorites] GET Error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch favorites' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * DELETE: Remove from favorites
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession(request);

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(request.url);
    const imageId = url.searchParams.get('id');

    if (!imageId) {
      return new Response(
        JSON.stringify({ error: 'Missing image ID' }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify ownership before deleting
    const image = await database.savedImage.findFirst({
      where: { 
        id: imageId,
        userId: session.user.id,
      },
    });

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image not found or not owned by user' }), 
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete from storage
    try {
      await storage.delete(image.url);
    } catch (storageError) {
      console.error('[Save to Favorites] Storage delete failed:', storageError);
      // Continue anyway - database record should still be deleted
    }

    // Delete database record
    await database.savedImage.delete({
      where: { id: imageId },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Image removed from favorites' }), 
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Save to Favorites] DELETE Error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to delete from favorites' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

