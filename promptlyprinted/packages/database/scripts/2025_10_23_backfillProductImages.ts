import { PrismaClient } from '@prisma/client';
import { tshirtDetails as webTshirtDetails } from '../../../apps/web/data/products.ts';
import { tshirtDetails as dbTshirtDetails } from './tshirt-details.ts';

type JsonRecord = Record<string, unknown>;

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

function buildImageUrlMap(imageUrls: JsonRecord | undefined) {
  const entries = Object.entries({
    base: imageUrls?.base,
    productImage: imageUrls?.productImage,
    cover: imageUrls?.cover,
    front: imageUrls?.front,
    back: imageUrls?.back,
    closeup: imageUrls?.closeup,
    lifestyle: imageUrls?.lifestyle,
    sizeChart: imageUrls?.sizeChart,
  }).filter(([, value]) => Boolean(value));

  return Object.fromEntries(entries);
}

async function main() {
  console.log('Backfilling prodigiVariants.imageUrls from tshirtDetails...');

  const mergedDetails = new Map<string, JsonRecord>();

  for (const [sku, details] of Object.entries(dbTshirtDetails)) {
    mergedDetails.set(sku, details as JsonRecord);
  }

  for (const [sku, details] of Object.entries(webTshirtDetails)) {
    const existing = mergedDetails.get(sku) ?? {};
    mergedDetails.set(sku, { ...existing, ...((details as unknown) as JsonRecord) });
  }

  for (const [sku, rawDetails] of mergedDetails.entries()) {
    const details = rawDetails as JsonRecord;
    const detailsAny = details as Record<string, any>;
    const products = await prisma.product.findMany({
      where: {
        sku: {
          endsWith: sku,
        },
      },
    });

    if (products.length === 0) {
      console.warn(`No products found in database for SKU ${sku}, skipping.`);
      continue;
    }

    const imageUrlMap = buildImageUrlMap(
      detailsAny.imageUrls as JsonRecord | undefined
    );
    const colorOptions = Array.isArray(detailsAny.colorOptions)
      ? detailsAny.colorOptions
      : [];
    const hasImageData = Object.keys(imageUrlMap).length > 0;
    const hasColorOptions = colorOptions.length > 0;

    if (!hasImageData && !hasColorOptions) {
      continue;
    }

    for (const product of products) {
      const existingVariants =
        (product.prodigiVariants as JsonRecord | null) ?? {};
      const existingImageUrls =
        (existingVariants.imageUrls as JsonRecord | undefined) ?? {};

      const mergedVariants: JsonRecord = {
        ...existingVariants,
      };

      if (hasColorOptions) {
        mergedVariants.colorOptions = colorOptions;
      }

      if (hasImageData) {
        mergedVariants.imageUrls = {
          ...existingImageUrls,
          ...imageUrlMap,
        };
      }

      try {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            prodigiVariants: mergedVariants,
          },
        });
        console.log(
          `Updated prodigiVariants for SKU ${sku}, product ID ${product.id}`
        );
      } catch (error) {
        console.error(
          `Failed to update product ${product.id} (SKU ${sku}):`,
          error
        );
      }
    }
  }

  console.log('Backfill complete.');
}

main()
  .catch((error) => {
    console.error('Unexpected error while backfilling product images:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
