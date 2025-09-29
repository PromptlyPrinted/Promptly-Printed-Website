import { database } from '@repo/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const countryCode = searchParams.get('country') || 'GB';
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build where clause for Halloween-suitable products
    const where: any = {
      listed: true,
      countryCode: countryCode,
      stock: { gt: 0 }, // Only show products in stock
    };

    // Filter by category if specified
    if (category !== 'all') {
      const categoryMap: Record<string, string[]> = {
        'spooky': ['t-shirts', 'hoodies', 'long-sleeves'],
        'cute': ['t-shirts', 'kids', 'baby'],
        'pop-culture': ['t-shirts', 'hoodies', 'accessories'],
        'group': ['t-shirts', 'hoodies', 'family'],
      };

      if (categoryMap[category]) {
        where.OR = categoryMap[category].map(type => ({
          productType: { contains: type, mode: 'insensitive' as const }
        }));
      }
    }

    // Prioritize apparel products for Halloween
    const halloweenProductTypes = [
      'T-Shirt', 'Hoodie', 'Long Sleeve', 'Sweatshirt',
      'Tank Top', 'Kids T-Shirt', 'Baby Bodysuit'
    ];

    where.productType = {
      in: halloweenProductTypes
    };

    // Fetch products with all necessary data for Halloween showcase
    const products = await database.product.findMany({
      where,
      take: limit,
      select: {
        id: true,
        name: true,
        sku: true,
        customerPrice: true,
        currency: true,
        productType: true,
        brand: true,
        color: true,
        size: true,
        stock: true,
        images: {
          take: 3, // Get multiple images for showcase
          select: {
            url: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { listed: 'desc' }, // Listed products first
        { stock: 'desc' },  // Higher stock first
        { customerPrice: 'asc' }, // Lower prices first
      ],
    });

    // If no products found in database, return sample Halloween products for demo
    if (products.length === 0) {
      const sampleHalloweenProducts = [
        {
          id: 1,
          title: "Halloween Midnight Witch Hoodie",
          category: 'spooky',
          price: 34.99,
          originalPrice: 44.99,
          currency: 'GBP',
          image: '/api/placeholder/300/300',
          images: ['/api/placeholder/300/300'],
          phantomPoints: 200,
          isExpress: true,
          tags: ['Premium Quality', 'Limited Edition'],
          productType: 'Hoodie',
          brand: 'Promptly Printed',
          colors: ['Black', 'Purple', 'Navy'],
          sizes: ['S', 'M', 'L', 'XL'],
          stock: 25,
          sku: 'DEMO-WITCH-HOODIE-001',
        },
        {
          id: 2,
          title: "Halloween Friendly Ghost Family Tee",
          category: 'cute',
          price: 24.99,
          originalPrice: 29.99,
          currency: 'GBP',
          image: '/api/placeholder/300/300',
          images: ['/api/placeholder/300/300'],
          phantomPoints: 150,
          isExpress: true,
          tags: ['Eco-Friendly', 'Family Pack'],
          productType: 'T-Shirt',
          brand: 'Promptly Printed',
          colors: ['White', 'Light Gray', 'Cream'],
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          stock: 50,
          sku: 'DEMO-GHOST-TEE-002',
        },
        {
          id: 3,
          title: "Halloween Retro Horror Movie Inspired",
          category: 'pop-culture',
          price: 28.99,
          originalPrice: 34.99,
          currency: 'GBP',
          image: '/api/placeholder/300/300',
          images: ['/api/placeholder/300/300'],
          phantomPoints: 175,
          isExpress: true,
          tags: ['Trending', 'Vintage Style'],
          productType: 'T-Shirt',
          brand: 'Promptly Printed',
          colors: ['Black', 'Dark Red', 'Gray'],
          sizes: ['S', 'M', 'L', 'XL'],
          stock: 30,
          sku: 'DEMO-HORROR-TEE-003',
        },
        {
          id: 4,
          title: "Halloween Squad Goals Group Pack",
          category: 'group',
          price: 89.99,
          originalPrice: 119.99,
          currency: 'GBP',
          image: '/api/placeholder/300/300',
          images: ['/api/placeholder/300/300'],
          phantomPoints: 400,
          isExpress: false,
          tags: ['Group Discount', '4-Pack', 'Mix & Match'],
          productType: 'T-Shirt Pack',
          brand: 'Promptly Printed',
          colors: ['Assorted'],
          sizes: ['S', 'M', 'L', 'XL'],
          stock: 15,
          sku: 'DEMO-GROUP-PACK-004',
        },
        {
          id: 5,
          title: "Halloween Zombie Apocalypse Survivor",
          category: 'spooky',
          price: 32.99,
          originalPrice: 39.99,
          currency: 'GBP',
          image: '/api/placeholder/300/300',
          images: ['/api/placeholder/300/300'],
          phantomPoints: 185,
          isExpress: true,
          tags: ['Distressed Look', 'Premium Cotton'],
          productType: 'Long Sleeve',
          brand: 'Promptly Printed',
          colors: ['Charcoal', 'Olive', 'Brown'],
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          stock: 20,
          sku: 'DEMO-ZOMBIE-LS-005',
        },
        {
          id: 6,
          title: "Halloween Pumpkin Spice Witch",
          category: 'cute',
          price: 26.99,
          originalPrice: 31.99,
          currency: 'GBP',
          image: '/api/placeholder/300/300',
          images: ['/api/placeholder/300/300'],
          phantomPoints: 160,
          isExpress: true,
          tags: ['Seasonal Favorite', 'Soft Blend'],
          productType: 'T-Shirt',
          brand: 'Promptly Printed',
          colors: ['Orange', 'Autumn Brown', 'Cream'],
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          stock: 35,
          sku: 'DEMO-PSW-TEE-006',
        },
      ];

      // Filter by category if requested
      const filtered = category === 'all'
        ? sampleHalloweenProducts
        : sampleHalloweenProducts.filter(p => p.category === category);

      return NextResponse.json({
        success: true,
        products: filtered.slice(0, limit),
        total: filtered.length,
        category,
        country: countryCode,
        note: "Demo products shown - database is empty. Add real products to see your inventory.",
      });
    }

    // Transform products for Halloween showcase
    const halloweenProducts = products.map((product) => {
      // Determine Halloween category based on product characteristics
      let halloweenCategory = 'spooky';

      if (product.productType.toLowerCase().includes('kid') ||
          product.productType.toLowerCase().includes('baby')) {
        halloweenCategory = 'cute';
      } else if (product.name.toLowerCase().includes('vintage') ||
                 product.name.toLowerCase().includes('retro')) {
        halloweenCategory = 'pop-culture';
      } else if (product.productType.toLowerCase().includes('hoodie') ||
                 product.productType.toLowerCase().includes('sweatshirt')) {
        halloweenCategory = 'group';
      }

      // Calculate Phantom Points based on price and product type
      const basePoints = Math.floor(product.customerPrice * 5);
      const typeMultiplier = product.productType.includes('Hoodie') ? 1.5 : 1;
      const phantomPoints = Math.floor(basePoints * typeMultiplier);

      // Determine if express delivery is available (assume yes for now)
      const isExpress = product.stock > 5;

      // Generate Halloween-themed tags
      const tags = [];
      if (product.customerPrice < 20) tags.push('Budget Friendly');
      if (product.stock > 10) tags.push('In Stock');
      if (isExpress) tags.push('Express Available');
      if (product.productType.includes('Hoodie')) tags.push('Premium Quality');
      if (product.color.length > 5) tags.push('Multiple Colors');

      return {
        id: product.id,
        title: `Halloween ${product.name}`,
        category: halloweenCategory,
        price: product.customerPrice,
        originalPrice: product.customerPrice * 1.25, // Show 25% discount
        currency: product.currency,
        image: product.images[0]?.url || '/placeholder-product.jpg',
        images: product.images.map(img => img.url),
        phantomPoints,
        isExpress,
        tags,
        productType: product.productType,
        brand: product.brand,
        colors: product.color,
        sizes: product.size,
        stock: product.stock,
        sku: product.sku,
      };
    });

    return NextResponse.json({
      success: true,
      products: halloweenProducts,
      total: halloweenProducts.length,
      category,
      country: countryCode,
    });

  } catch (error) {
    console.error('Halloween products API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Halloween products',
        products: [],
      },
      { status: 500 }
    );
  }
}