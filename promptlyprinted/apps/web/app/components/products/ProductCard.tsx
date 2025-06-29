import { Card } from '@repo/design-system/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

export function ProductCard({
  id,
  name,
  price,
  imageUrl,
  description,
}: ProductCardProps) {
  return (
    <Link href={`/product/${id.toString()}`} className="block">
      <Card className="h-full overflow-hidden transition-transform hover:scale-[1.02]">
        <div className="relative aspect-square">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="mt-1 line-clamp-2 text-gray-500 text-sm">
            {description}
          </p>
          <p className="mt-2 font-bold">${price}</p>
        </div>
      </Card>
    </Link>
  );
}
