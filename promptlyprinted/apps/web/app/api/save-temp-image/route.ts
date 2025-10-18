import { database } from '@repo/database';
import { getSession } from '../../../lib/session-utils';
import { storage } from '@/lib/storage';

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
    const { url } = data;

    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the database user from Better Auth session
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

    // If URL is base64, upload it to storage first
    let finalUrl = url;
    if (url.startsWith('data:image')) {
      console.log('Converting base64 image to file storage');
      finalUrl = await storage.uploadFromBase64(url, 'checkout-image');
    }

    // Check if the image is already saved
    const existingImage = await database.savedImage.findFirst({
      where: { url: finalUrl },
    });

    if (existingImage) {
      return new Response(JSON.stringify({ id: existingImage.id }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save the image to the database (now with file URL instead of base64)
    const savedImage = await database.savedImage.create({
      data: {
        name: 'Checkout Image',
        url: finalUrl,
        userId: dbUser.id,
      },
    });

    return new Response(JSON.stringify({ id: savedImage.id }), {
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
