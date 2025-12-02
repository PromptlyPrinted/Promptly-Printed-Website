
import fs from 'fs';
import path from 'path';

async function testUpload() {
  const endpoint = 'http://localhost:3000/api/upload-image';
  
  // 1. Create a simple valid PNG buffer (1x1 pixel red dot)
  const validPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const dataUrl = `data:image/png;base64,${validPngBase64}`;

  console.log('Testing valid Data URL upload using fetch...');
  try {
    // Simulate the client-side fix: fetch the Data URL to get a Blob
    const imageResponse = await fetch(dataUrl);
    const blob = await imageResponse.blob();
    
    console.log(`Blob created: ${blob.size} bytes, type: ${blob.type}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': blob.type,
        'x-image-name': 'Valid Test Image',
        'x-product-code': 'test-product'
      },
      body: blob
    });

    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error('Valid upload failed:', error);
  }
}

testUpload();
