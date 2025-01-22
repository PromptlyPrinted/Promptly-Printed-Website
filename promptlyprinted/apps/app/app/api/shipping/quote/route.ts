import { NextResponse } from 'next/server';
import { getProdigiQuote } from '@repo/database/utils/getProdigiQuote';
import { saveProdigiQuote } from '@repo/database/utils/saveProdigiQuote';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shippingMethod, destinationCountryCode, currencyCode, items } = body;

    // Get quote from Prodigi
    const quoteResponse = await getProdigiQuote({
      shippingMethod,
      destinationCountryCode,
      currencyCode,
      items,
    });

    // Save quote to database
    const savedQuote = await saveProdigiQuote(quoteResponse);

    return NextResponse.json(savedQuote);
  } catch (error) {
    console.error('Error getting shipping quote:', error);
    return NextResponse.json(
      { error: 'Failed to get shipping quote' },
      { status: 500 }
    );
  }
} 
