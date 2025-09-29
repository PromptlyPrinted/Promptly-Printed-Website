import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get total product count
    const totalProducts = await database.product.count();

    // Get products with minimal filters to see what's available
    const products = await database.product.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        sku: true,
        customerPrice: true,
        currency: true,
        productType: true,
        countryCode: true,
        listed: true,
        stock: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get unique product types
    const productTypes = await database.product.findMany({
      select: {
        productType: true,
      },
      distinct: ['productType'],
      take: 20,
    });

    // Get unique country codes
    const countries = await database.product.findMany({
      select: {
        countryCode: true,
      },
      distinct: ['countryCode'],
      take: 10,
    });

    return NextResponse.json({
      success: true,
      totalProducts,
      sampleProducts: products,
      availableProductTypes: productTypes.map(p => p.productType),
      availableCountries: countries.map(c => c.countryCode),
    });

  } catch (error) {
    console.error('Test products API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test products',
        totalProducts: 0,
      },
      { status: 500 }
    );
  }
}