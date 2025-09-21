import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const PRODIGI_API = process.env.PRODIGI_API || 'https://api.prodigi.com/v4.0';
const PRODIGI_API_KEY = process.env.PRODIGI_API_KEY;

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await database.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!PRODIGI_API_KEY) {
      throw new Error(
        'Prodigi API key not configured in environment variables'
      );
    }

    const { searchParams } = new URL(req.url);
    const sku = searchParams.get('sku');

    // Construct the Prodigi API URL based on whether we're fetching a specific product or all products
    const url = sku
      ? `${PRODIGI_API}/products/${sku}`
      : `${PRODIGI_API}/products/catalogue`;

    console.log('Fetching from Prodigi:', url);

    const response = await fetch(url, {
      headers: {
        'X-API-Key': PRODIGI_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Prodigi API Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorText,
      });
      return new NextResponse(
        JSON.stringify({
          error: `Prodigi API error: ${response.status} ${response.statusText}`,
          details: errorText,
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Forward the Prodigi response directly to the client
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PRODIGI_PRODUCTS_GET]', error);

    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal error',
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
