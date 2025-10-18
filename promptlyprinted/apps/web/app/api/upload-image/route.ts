import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
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
    const { imageUrl, imageData, name = 'Generated Image' } = data;

    if (!imageUrl && !imageData) {
      return new Response(JSON.stringify({ error: 'Missing image URL or data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the database user
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

    let publicUrl: string;

    if (imageData) {
      // Handle base64 data URLs - use storage abstraction
      publicUrl = await storage.uploadFromBase64(imageData, name);
    } else if (imageUrl) {
      // Fetch image from URL and upload
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine file extension from Content-Type
      const contentType = response.headers.get('content-type') || 'image/png';
      let fileExtension = 'png';
      if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        fileExtension = 'jpg';
      } else if (contentType.includes('webp')) {
        fileExtension = 'webp';
      }

      const filename = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${fileExtension}`;
      publicUrl = await storage.uploadFromBuffer(buffer, filename, contentType);
    } else {
      return new Response(JSON.stringify({ error: 'No valid image source provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save to database
    const savedImage = await database.savedImage.create({
      data: {
        name,
        url: publicUrl,
        userId: dbUser.id,
      },
    });

    console.log('Image uploaded successfully:', {
      publicUrl,
      savedImageId: savedImage.id
    });

    return new Response(JSON.stringify({ 
      id: savedImage.id,
      url: publicUrl,
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to upload image',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}