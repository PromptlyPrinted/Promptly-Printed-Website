import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/saved-designs
 * Retrieve all saved designs for the current user
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

    // Create the saved design
    const savedDesign = await database.savedImage.create({
      data: {
        name,
        url,
        printReadyUrl: printReadyUrl || null,
        userId: session.user.id,
        productId: productId ? parseInt(productId, 10) : null,
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
