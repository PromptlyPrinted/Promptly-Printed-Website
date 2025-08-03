import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Check if REMOVE_BG_API_KEY is configured
    if (!process.env.REMOVE_BG_API_KEY) {
      return NextResponse.json(
        { error: 'Background removal service not configured' },
        { status: 500 }
      );
    }

    console.log('Removing background from:', imageUrl);

    // Fetch the image first
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Call Remove.bg API
    const formData = new FormData();
    formData.append('image_file', new Blob([imageBuffer]));
    formData.append('size', 'auto');

    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error('Remove.bg API error:', errorText);
      throw new Error(`Background removal failed: ${removeBgResponse.status}`);
    }

    // Get the result as a buffer
    const resultBuffer = await removeBgResponse.arrayBuffer();

    // Convert to base64 for client-side usage
    const base64Image = Buffer.from(resultBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    console.log('Background removal successful');

    return NextResponse.json({ 
      success: true, 
      imageUrl: dataUrl,
      message: 'Background removed successfully'
    });

  } catch (error) {
    console.error('Error removing background:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove background',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}