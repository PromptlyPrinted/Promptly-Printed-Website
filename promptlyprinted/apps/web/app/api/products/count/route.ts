import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/app/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  
  try {
    // Build where clause conditionally
    const whereClause: any = {};
    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId);
    }

    // Use retry logic for better reliability with count queries
    const count = await withRetry(
      () => prisma.product.count({ where: whereClause }),
      3, // number of retries
      1000 // delay between retries
    );

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting products:', error);
    
    // Fallback: Get an approximate count by querying with a limit
    try {
      const products = await prisma.product.findMany({
        where: categoryId ? { categoryId: parseInt(categoryId) } : {},
        select: { id: true },
        take: 100, // Get up to 100 products as a fallback
      });
      
      return NextResponse.json({ 
        count: products.length,
        approximate: true,
        message: 'Count operation failed, showing approximate result'
      });
    } catch (fallbackError) {
      // If even the fallback fails, return an error response
      console.error('Fallback count failed:', fallbackError);
      return NextResponse.json(
        { error: 'Unable to process count query', message: (error as Error).message },
        { status: 500 }
      );
    }
  }
} 