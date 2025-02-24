import { Metadata } from 'next'
import { ProductDetail } from './components/product-detail'
import { getProductById } from '@/app/lib/db'

type Props = {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await Promise.resolve(params)
  const product = await getProductById(id)
  
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | Promptly Printed`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await Promise.resolve(params)
  const product = await getProductById(id)

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </div>
  )
} 