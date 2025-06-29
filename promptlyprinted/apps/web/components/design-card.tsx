import type { DesignResponse } from '@/types/design';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { format } from 'date-fns';
import Image from 'next/image';

interface DesignCardProps {
  design: DesignResponse;
  onSelect?: (design: DesignResponse) => void;
  selectable?: boolean;
}

export function DesignCard({
  design,
  onSelect,
  selectable = false,
}: DesignCardProps) {
  const formattedDate = format(new Date(design.createdAt), 'MMM d, yyyy');

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="line-clamp-1">{design.name}</CardTitle>
        <CardDescription>
          Created {formattedDate}
          {design.product && (
            <>
              {' '}
              • {design.product.name} ({design.product.color.join(', ')})
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative aspect-square">
        <Image
          src={design.url}
          alt={design.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </CardContent>
      {selectable && onSelect && (
        <CardFooter>
          <Button
            onClick={() => onSelect(design)}
            className="w-full"
            variant="secondary"
          >
            Use This Design
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
