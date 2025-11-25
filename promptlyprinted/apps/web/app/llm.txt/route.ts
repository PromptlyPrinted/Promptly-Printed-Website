import { NextResponse } from 'next/server';

export async function GET() {
  const content = `
# Promptly Printed

Promptly Printed is a platform for creating and printing custom designs using AI.

## Key Pages

- /: Home page
- /products: Browse our catalog of customizable products
- /pricing: View pricing and credit packages
- /faq: Frequently Asked Questions
- /contact: Contact support
- /legal/terms: Terms of Service
- /legal/privacy: Privacy Policy

## Features

- AI Image Generation: Create unique designs using our AI tools.
- Custom Printing: Print your designs on high-quality products.
- Global Shipping: We ship worldwide.

## API

- /api/generate-image: Generate images using AI.
- /api/generate-nano-banana: Generate images using Nano Banana (Gemini Flash).
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
