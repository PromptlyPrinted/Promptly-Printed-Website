import { database } from '@repo/database';
import { getSession } from '@/lib/session-utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    let buffer: Buffer;
    let fileExtension = 'png';

    if (imageData) {
      // Handle base64 data URLs
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      
      // Extract file extension from data URL
      const mimeMatch = imageData.match(/^data:image\/(\w+);base64,/);
      if (mimeMatch) {
        fileExtension = mimeMatch[1];
      }
    } else if (imageUrl) {
      // Fetch image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      // Try to determine file extension from Content-Type
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
        fileExtension = 'jpg';
      } else if (contentType?.includes('webp')) {
        fileExtension = 'webp';
      }
    } else {
      return new Response(JSON.stringify({ error: 'No valid image source provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate unique filename
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images');
    await mkdir(uploadsDir, { recursive: true });
    
    // Write file to public/uploads/images
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Create public URL
    const publicUrl = `/uploads/images/${fileName}`;

    // Save to database
    const savedImage = await database.savedImage.create({
      data: {
        name,
        url: publicUrl,
        userId: dbUser.id,
      },
    });

    console.log('Image uploaded successfully:', {
      fileName,
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