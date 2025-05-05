import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@repo/design-system/components/ui/card'

interface ProductCardProps {
  id: number
  name: string
  price: number
  imageUrl: string
  description: string
}

export function ProductCard({ id, name, price, imageUrl, description }: ProductCardProps) {
  return (
    <Link href={`/product/${id.toString()}`} className="block">
      <Card className="overflow-hidden h-full transition-transform hover:scale-[1.02]">
        <div className="aspect-square relative">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
          <p className="mt-2 font-bold">${price}</p>
        </div>
      </Card>
    </Link>
  )
} 