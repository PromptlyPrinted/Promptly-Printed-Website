
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Testing image upload...');

  // Create a simple 1x1 PNG buffer
  const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d600000000049454e44ae426082', 'hex');
  
  console.log('Created test PNG buffer, size:', pngBuffer.length);

  try {
    const response = await fetch('http://localhost:3001/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        'x-image-name': 'test-image.png',
        'x-product-code': 'test-product'
      },
      body: pngBuffer
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response body:', text);

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${text}`);
    }

    console.log('Upload successful!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
