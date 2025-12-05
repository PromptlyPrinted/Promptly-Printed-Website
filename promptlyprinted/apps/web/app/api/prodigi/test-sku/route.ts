import { NextRequest, NextResponse } from 'next/server';
import { env } from '@repo/env';

/**
 * Test endpoint to validate SKUs against Prodigi's API
 * 
 * Usage: 
 *   GET /api/prodigi/test-sku?sku=GLOBAL-TEE-BC-3413&country=GB
 *   
 * This helps debug SKU format issues by:
 * 1. Getting product details from Prodigi
 * 2. Testing a quote with the SKU
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sku = searchParams.get('sku');
  const country = searchParams.get('country') || 'GB';
  
  if (!sku) {
    return NextResponse.json({ error: 'SKU parameter required' }, { status: 400 });
  }

  const apiKey = env.PRODIGI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'PRODIGI_API_KEY not configured' }, { status: 500 });
  }

  const results: Record<string, any> = {
    testedSku: sku,
    destinationCountry: country,
  };

  // 1. Try to get product details
  console.log(`[Test SKU] Fetching product details for: ${sku}`);
  try {
    const productResponse = await fetch(`https://api.prodigi.com/v4.0/products/${sku}`, {
      headers: { 'X-API-Key': apiKey },
    });
    
    const productData = await productResponse.json();
    results.productDetails = {
      status: productResponse.status,
      outcome: productData.outcome,
      product: productData.product ? {
        sku: productData.product.sku,
        description: productData.product.description,
        attributes: productData.product.attributes,
        printAreas: productData.product.printAreas,
        variantCount: productData.product.variants?.length,
        // Show first variant's details
        sampleVariant: productData.product.variants?.[0],
      } : null,
      error: productData.outcome !== 'Ok' ? productData : null,
    };
  } catch (error) {
    results.productDetails = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 2. Try to get a quote
  console.log(`[Test SKU] Getting quote for: ${sku} to ${country}`);
  try {
    const quoteResponse = await fetch('https://api.prodigi.com/v4.0/quotes', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shippingMethod: 'Standard',
        destinationCountryCode: country,
        currencyCode: 'GBP',
        items: [
          {
            sku: sku,
            copies: 1,
            attributes: {}, // Empty to see what's required
            assets: [{ printArea: 'default' }],
          },
        ],
      }),
    });
    
    const quoteData = await quoteResponse.json();
    results.quoteWithDefaultPrintArea = {
      status: quoteResponse.status,
      outcome: quoteData.outcome,
      quotes: quoteData.quotes,
      issues: quoteData.issues,
    };
  } catch (error) {
    results.quoteWithDefaultPrintArea = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 3. Try quote with 'front' printArea (for apparel)
  console.log(`[Test SKU] Getting quote with 'front' printArea for: ${sku}`);
  try {
    const quoteResponse = await fetch('https://api.prodigi.com/v4.0/quotes', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shippingMethod: 'Standard',
        destinationCountryCode: country,
        currencyCode: 'GBP',
        items: [
          {
            sku: sku,
            copies: 1,
            attributes: {
              color: 'black',
              size: 'm',
            },
            assets: [{ printArea: 'front' }],
          },
        ],
      }),
    });
    
    const quoteData = await quoteResponse.json();
    results.quoteWithFrontPrintArea = {
      status: quoteResponse.status,
      outcome: quoteData.outcome,
      quotes: quoteData.quotes,
      issues: quoteData.issues,
    };
  } catch (error) {
    results.quoteWithFrontPrintArea = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 4. Also try some SKU variations
  const skuVariations = [
    sku,
    `GLOBAL-${sku}`,
    sku.replace(/^GLOBAL-/, ''),
    sku.replace(/^[A-Z]{2}-/, ''),
  ];
  
  results.skuVariationsTested = [...new Set(skuVariations)];

  return NextResponse.json(results, { status: 200 });
}

