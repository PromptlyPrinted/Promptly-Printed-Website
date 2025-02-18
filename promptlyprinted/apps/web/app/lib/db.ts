import { database } from '@repo/database';
import { Product } from '@/types/product'

export const prisma = database;

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(id)
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      images: {
        select: {
          url: true
        }
      },
      quotes: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1,
        include: {
          costSummary: {
            include: {
              shipping: true
            }
          }
        }
      }
    }
  });

  if (!product) return null;

  return {
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: product.customerPrice,
    shippingCost: product.shippingCost,
    imageUrl: product.images[0]?.url || '/placeholder.jpg',
    images: product.images.map((img: { url: string }) => img.url),
    category: product.category ? {
      id: product.category.id.toString(),
      name: product.category.name,
      description: product.category.description
    } : undefined,
    specifications: {
      dimensions: {
        width: product.width,
        height: product.height,
        units: product.units
      },
      brand: product.brand,
      style: product.style,
      color: product.color,
      size: product.size
    },
    shipping: {
      methods: product.quotes[0]?.costSummary?.shipping?.map((s: { method: string; cost: number; currency: string; estimatedDays: number }) => ({
        method: s.method,
        cost: s.cost,
        currency: s.currency,
        estimatedDays: s.estimatedDays
      })) || []
    }
  };
} 