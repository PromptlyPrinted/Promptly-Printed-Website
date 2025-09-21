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
    const images = await database.savedImage.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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