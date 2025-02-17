import { PrismaClient } from '@repo/database';
import { Product } from '@/types/product'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function getProductById(id: string): Promise<Product | null> {
  // TODO: Implement actual database query
  // This is a mock implementation
  return {
    id,
    name: 'Sample Product',
    description: 'This is a sample product description',
    price: 29.99,
    imageUrl: '/placeholder.jpg',
    images: ['/placeholder.jpg', '/placeholder-2.jpg'],
    rating: 4,
    reviewCount: 12,
    category: {
      id: '1',
      name: 'T-Shirts'
    }
  }
} 