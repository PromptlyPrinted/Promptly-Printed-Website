import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    // Expect these in the request body:
    // e.g. { tshirtImageUrl: "/assets/images/tshirt-red.png", designImageUrl: "/some/design.png" }
    const { tshirtImageUrl, designImageUrl } = await req.json();

    if (!tshirtImageUrl || !designImageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1) Load T-shirt image from local public folder or remote
    let tshirtBuffer: Buffer;
    try {
      const tshirtPath = path.join(process.cwd(), 'public', tshirtImageUrl);
      tshirtBuffer = await fs.readFile(tshirtPath);
    } catch {
      // fallback: fetch from remote URL
      const resp = await fetch(tshirtImageUrl);
      if (!resp.ok) throw new Error('Failed to fetch T-shirt');
      tshirtBuffer = Buffer.from(await resp.arrayBuffer());
    }

    // 2) Load design image
    let designBuffer: Buffer;
    try {
      const resp = await fetch(designImageUrl);
      if (!resp.ok) throw new Error('Failed to fetch design');
      designBuffer = Buffer.from(await resp.arrayBuffer());
    } catch {
      // fallback: placeholder
      designBuffer = await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();
    }

    // 3) Get T-shirt dimensions
    const tshirtMeta = await sharp(tshirtBuffer).metadata();
    const tshirtW = tshirtMeta.width ?? 800;
    const tshirtH = tshirtMeta.height ?? 1000;

    // 4) Same 35% / 40% / 10% offset math
    const overlayW = Math.round(tshirtW * 0.35);
    const overlayH = Math.round(tshirtH * 0.4);
    const overlayX = Math.round((tshirtW - overlayW) / 2);
    const overlayY = Math.round(tshirtH * 0.3); // ~10% below center

    // 5) Resize design to fit inside that overlay
    const resizedDesign = await sharp(designBuffer)
      .resize(overlayW, overlayH, { fit: 'inside' })
      .toBuffer();

    // 6) Composite onto T-shirt
    const composited = await sharp(tshirtBuffer)
      .composite([{ input: resizedDesign, left: overlayX, top: overlayY }])
      .png()
      .toBuffer();

    // 7) Optionally scale to final 8×10 at 300 DPI => 2400×3000
    const final = await sharp(composited)
      .resize(2400, 3000, {
        fit: 'fill',
        withoutEnlargement: false,
      })
      .png({ quality: 100 })
      .withMetadata({ density: 300 }) // sets 300 DPI
      .toBuffer();

    // Return as base64
    const base64 = `data:image/png;base64,${final.toString('base64')}`;
    return NextResponse.json({
      mockupUrl: base64,
      width: 2400,
      height: 3000,
      dpi: 300,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Server error', details: String(err) },
      { status: 500 }
    );
  }
}
