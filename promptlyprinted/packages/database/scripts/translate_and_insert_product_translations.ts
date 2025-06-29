import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { tshirtDetails } from './tshirt-details';

const prisma = new PrismaClient();

// Languages to translate into
const TARGET_LANGUAGES = ['DE', 'FR', 'ES', 'IT', 'NL']; // Add or remove as needed
const SOURCE_LANG = 'EN';

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_API_KEY = process.env.DEEPL_API_KEY; // Place your DeepL Free API key in .env

async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  const params = new URLSearchParams();
  params.append('auth_key', DEEPL_API_KEY!);
  params.append('text', text);
  params.append('target_lang', targetLang);
  params.append('source_lang', SOURCE_LANG);

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`DeepL API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.translations[0].text;
}

async function main() {
  for (const [sku, details] of Object.entries(tshirtDetails)) {
    // Find the product in the DB
    const product = await prisma.product.findUnique({
      where: { sku_countryCode: { sku, countryCode: 'US' } },
    });
    if (!product) {
      console.warn(`Product not found for SKU: ${sku}`);
      continue;
    }
    for (const lang of TARGET_LANGUAGES) {
      // Translate fields
      const name = await translateText(details.name, lang);
      const description = await translateText(details.shortDescription, lang);
      const features = details.features
        ? await Promise.all(details.features.map((f) => translateText(f, lang)))
        : null;
      const ecoProperties = details.ecoProperties
        ? await Promise.all(
            details.ecoProperties.map((f) => translateText(f, lang))
          )
        : null;
      const careInstructions = details.careInstructions
        ? await Promise.all(
            details.careInstructions.map((f) => translateText(f, lang))
          )
        : null;
      // Upsert translation
      await prisma.productTranslation.upsert({
        where: {
          productId_languageCode: { productId: product.id, languageCode: lang },
        },
        update: {
          name,
          description,
          features,
          ecoProperties,
          careInstructions,
        },
        create: {
          productId: product.id,
          languageCode: lang,
          name,
          description,
          features,
          ecoProperties,
          careInstructions,
        },
      });
      console.log(`Inserted translation for ${sku} in ${lang}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
