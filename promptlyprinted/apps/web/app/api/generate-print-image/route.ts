import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { storage } from '@/lib/storage';
import { getSession } from '@/lib/session-utils';

// Print-ready dimensions for 300 DPI at 15.6" x 19.3" (standard t-shirt print area)
const PRINT_WIDTH = 4680;  // 15.6 inches * 300 DPI
const PRINT_HEIGHT = 5790; // 19.3 inches * 300 DPI

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, name = 'print-ready-design' } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
    }

    console.log('[Generate Print Image] Starting...', { imageUrl: imageUrl.substring(0, 100) });

    // Fetch the source image
    let imageBuffer: Buffer;

    if (imageUrl.startsWith('data:')) {
      // Handle base64 data URLs
      const base64Data = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Fetch from URL
      const fullUrl = imageUrl.startsWith('/')
        ? `${process.env.NEXT_PUBLIC_WEB_URL}${imageUrl}`
        : imageUrl;

      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    console.log('[Generate Print Image] Source image fetched, size:', imageBuffer.length);

    // Resize to 300 DPI print dimensions using sharp
    const printReadyBuffer = await sharp(imageBuffer)
      .resize(PRINT_WIDTH, PRINT_HEIGHT, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        withoutEnlargement: false, // Allow upscaling for print quality
      })
      .png({
        quality: 100,
        compressionLevel: 6,
      })
      .withMetadata({ density: 300 })
      .toBuffer();

    console.log('[Generate Print Image] Resized to print dimensions:', {
      width: PRINT_WIDTH,
      height: PRINT_HEIGHT,
      outputSize: printReadyBuffer.length,
    });

    // Upload to permanent storage
    const filename = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-300dpi-${Date.now()}.png`;
    const publicUrl = await storage.uploadFromBuffer(printReadyBuffer, filename, 'image/png');

    console.log('[Generate Print Image] Uploaded to storage:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      width: PRINT_WIDTH,
      height: PRINT_HEIGHT,
      dpi: 300,
    });

  } catch (error) {
    console.error('[Generate Print Image] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate print image' },
      { status: 500 }
    );
  }
}
