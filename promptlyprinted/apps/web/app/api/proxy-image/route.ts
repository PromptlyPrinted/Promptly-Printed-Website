import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    console.log('Proxying image from URL:', imageUrl);

    if (!imageUrl) {
      console.error('No image URL provided');
      return new NextResponse('Missing image URL', { status: 400 })
    }

    console.log('Fetching image...');
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      console.error('Failed to fetch image:', {
        status: response.status,
        statusText: response.statusText,
        url: imageUrl
      });
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    const contentType = response.headers.get('content-type')
    console.log('Image content type:', contentType);

    const imageData = await response.arrayBuffer()
    console.log('Image data size:', imageData.byteLength, 'bytes');

    // Add CORS headers to allow the image to be displayed
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}