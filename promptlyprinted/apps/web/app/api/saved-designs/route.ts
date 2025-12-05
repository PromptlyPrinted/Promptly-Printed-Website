import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { storage } from '@/lib/storage';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Check if a URL is already in permanent storage (/saved folder)
 */
function isInSavedFolder(url: string): boolean {
  return url.includes('/saved/');
}

/**
 * GET /api/saved-designs
 * Retrieve all saved designs for the current user
 * This is what "Choose an Existing Image" uses
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const savedDesigns = await database.savedImage.findMany({
      where: {
        userId: session.user.id,
        // Exclude base64 URLs (old data)
        url: {
          not: {
            startsWith: 'data:',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(savedDesigns), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Saved Designs] GET error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch saved designs',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /api/saved-designs
 * Save a new design for the current user
 * 
 * This is the SINGLE save endpoint for both "Save to My Designs" and "Save to My Images"
 * It copies images to /saved folder for PERMANENT storage (no 24h expiry)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name, url, printReadyUrl, productId } = body;

    // Validate required fields
    if (!name || !url) {
      return new Response(
        JSON.stringify({ error: 'Name and URL are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Saved Designs] Processing save request...');
    console.log('[Saved Designs] Original URL:', url);
    console.log('[Saved Designs] Original printReadyUrl:', printReadyUrl);

    // Check if already saved (prevent duplicates)
    const existingDesign = await database.savedImage.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          { url: url },
          { printReadyUrl: url },
          ...(printReadyUrl ? [{ url: printReadyUrl }, { printReadyUrl: printReadyUrl }] : []),
        ],
      },
    });

    if (existingDesign) {
      console.log('[Saved Designs] Design already saved, returning existing');
      return new Response(JSON.stringify({
        ...existingDesign,
        alreadySaved: true,
        message: 'This design is already saved',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Copy images to /saved folder for PERMANENT storage
    let savedUrl = url;
    let savedPrintReadyUrl = printReadyUrl || null;

    // Copy preview/display URL to /saved if not already there
    if (!isInSavedFolder(url)) {
      try {
        console.log('[Saved Designs] Copying preview URL to /saved folder...');
        savedUrl = await storage.copy(url, 'saved', { userId: session.user.id });
        console.log('[Saved Designs] Preview copied to:', savedUrl);
      } catch (copyError) {
        console.error('[Saved Designs] Failed to copy preview URL:', copyError);
        // If copy fails, use original URL as fallback
        console.log('[Saved Designs] Using original URL as fallback');
      }
    }

    // Copy print-ready URL to /saved if exists and not already there
    if (printReadyUrl && !isInSavedFolder(printReadyUrl)) {
      try {
        console.log('[Saved Designs] Copying print-ready URL to /saved folder...');
        savedPrintReadyUrl = await storage.copy(printReadyUrl, 'saved', { userId: session.user.id });
        console.log('[Saved Designs] Print-ready copied to:', savedPrintReadyUrl);
      } catch (copyError) {
        console.error('[Saved Designs] Failed to copy print-ready URL:', copyError);
        // Use original URL as fallback
        savedPrintReadyUrl = printReadyUrl;
      }
    }

    // Create the saved design with permanent URLs
    const savedDesign = await database.savedImage.create({
      data: {
        name,
        url: savedUrl,
        printReadyUrl: savedPrintReadyUrl,
        userId: session.user.id,
        productId: productId ? parseInt(productId, 10) : null,
        metadata: {
          originalUrl: url,
          originalPrintReadyUrl: printReadyUrl,
          savedAt: new Date().toISOString(),
          folder: 'saved',
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    console.log('[Saved Designs] Design saved successfully:', savedDesign.id);
    console.log('[Saved Designs] Saved URL:', savedUrl);
    console.log('[Saved Designs] Saved printReadyUrl:', savedPrintReadyUrl);

    return new Response(JSON.stringify(savedDesign), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Saved Designs] POST error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to save design',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * DELETE /api/saved-designs?id=xxx
 * Delete a saved design
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Design ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify the design belongs to the user before deleting
    const design = await database.savedImage.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!design) {
      return new Response(JSON.stringify({ error: 'Design not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (design.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await database.savedImage.delete({
      where: { id },
    });

    console.log('[Saved Designs] Design deleted successfully:', id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Saved Designs] DELETE error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to delete design',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
