import { auth } from '@repo/auth/server';
import { database } from '@repo/database';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch app user
    const dbUser = await database.user.findUnique({
      where: { id: session.user.id },
    });
    if (!dbUser) {
      return new Response('User not found', { status: 404 });
    }

    // Fetch all saved images for user (both standalone images and designs)
    // Limit to 10 most recent to avoid exceeding 5MB response limit
    // (URLs may contain large base64 data)
    const images = await database.savedImage.findMany({
      where: {
        userId: dbUser.id,
      },
      select: {
        id: true,
        url: true,
        name: true,
        userId: true,
        productId: true,
        createdAt: true,
        product: {
          select: {
            name: true,
            sku: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return new Response(JSON.stringify(images), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching saved images:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}