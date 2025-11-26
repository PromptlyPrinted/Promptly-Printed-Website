'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { useState, useMemo } from 'react';
import { Sparkles, Tag, Gift, Clock, Trophy, Cpu } from 'lucide-react';
import Image from 'next/image';
import { tshirtDetails } from '@repo/database/scripts/tshirt-details';
import { getProductDisplayName, GIVEAWAY_ITEMS, AI_MODEL_INFO } from '@/lib/quiz-product-selector';

// Legacy fallback map for backwards compatibility
const LEGACY_CLOTHING_TYPE_TO_SKU: Record<string, string> = {
  'tee': 'TEE-SS-STTU755',
  'hoodie': 'A-MH-JH001',
  'long-sleeve': 'A-ML-GD2400',
  'crewneck': 'TEE-SS-STTU755',
};

export function OfferPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const prompt = searchParams.get('prompt') || '';
  const style = searchParams.get('style') || 'minimalist';
  const campaign = searchParams.get('campaign') || 'general';
  const source = searchParams.get('source') || 'direct';

  // NEW: Get product SKU from quiz (primary method)
  const quizProductSKU = searchParams.get('productSKU');

  // NEW: Get all quiz parameters
  const audience = searchParams.get('audience') || 'mens';
  const styleType = searchParams.get('styleType') || 'classic-tee';
  const theme = searchParams.get('theme') || 'everyday';
  const aiModel = searchParams.get('aiModel') || 'flux-dev';
  const giveawayTier = searchParams.get('giveawayTier') as keyof typeof GIVEAWAY_ITEMS || 'standard';

  // Legacy parameter (for backwards compatibility)
  const clothingType = searchParams.get('clothingType') || 'tee';

  // Determine product SKU: Use quiz-provided SKU, or fall back to legacy mapping
  const productSku = quizProductSKU || LEGACY_CLOTHING_TYPE_TO_SKU[clothingType] || 'TEE-SS-STTU755';
  const productData = tshirtDetails[productSku as keyof typeof tshirtDetails];

  // If product not found, fallback to first available product
  const product = productData || Object.values(tshirtDetails)[0];

  // Get USD pricing
  const usdPrice = product.pricing.find((p) => p.currency === 'USD')?.amount || 0;

  // Get discount from URL or use giveaway tier default
  const discountParam = searchParams.get('discount');
  const discount = discountParam
    ? parseFloat(discountParam)
    : GIVEAWAY_ITEMS[giveawayTier]?.discount || 0.30;

  const discountedPrice = usdPrice * (1 - discount);
  const savings = usdPrice - discountedPrice;

  // Get giveaway info
  const giveawayInfo = GIVEAWAY_ITEMS[giveawayTier];

  // Get product display name from quiz data
  const productDisplayName = quizProductSKU
    ? getProductDisplayName(audience as any, styleType as any)
    : product.name;

  // Get AI model info
  const aiModelInfo = aiModel && AI_MODEL_INFO[aiModel as keyof typeof AI_MODEL_INFO]
    ? AI_MODEL_INFO[aiModel as keyof typeof AI_MODEL_INFO]
    : null;

  // Get first available color image
  const firstColor = product.colorOptions?.[0];
  const productImageUrl = firstColor
    ? `${product.imageUrls.base}/${firstColor.filename}`
    : '/placeholder-product.png';

  const urlColor = searchParams.get('color');
  const [selectedSize, setSelectedSize] = useState(product.size[Math.floor(product.size.length / 2)] || 'M');
  const [selectedColor, setSelectedColor] = useState(urlColor || firstColor?.name || 'White');

  // Available colors from product data
  const colors = product.colorOptions?.map(c => c.name) || ['White'];

  const handleStartDesigning = () => {
    // Build URL to design page with all params
    const params = new URLSearchParams({
      prompt,
      campaign,
      source,
      color: selectedColor,
      size: selectedSize,
      discount: discount.toString(),
      audience,
      styleType,
      theme,
      aiModel,
      giveawayTier,
    });

    // Preserve UTM parameters from current URL
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmContent = searchParams.get('utm_content');
    const utmTerm = searchParams.get('utm_term');

    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmContent) params.set('utm_content', utmContent);
    if (utmTerm) params.set('utm_term', utmTerm);

    // Navigate to design page using SKU
    // Format: /design/[productSku]
    router.push(`/design/${product.sku}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="text-2xl font-bold text-gray-900">Promptly Printed</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Limited Time Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg animate-pulse">
            <Clock className="w-5 h-5" />
            <span className="font-bold">Limited Time Offer - First Drop Discount</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* LEFT: Product Image */}
          <div>
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-xl">
              <Image
                src={productImageUrl}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
            </div>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl mb-1">✨</div>
                <div className="text-gray-600">AI-Powered</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-gray-600">Fast Shipping</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl mb-1">♻️</div>
                <div className="text-gray-600">Eco-Friendly</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Offer Details */}
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
                <Gift className="w-4 h-4" />
                New Creator Offer
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Your Personalized {productDisplayName}
              </h1>

              <p className="text-lg text-gray-600 mb-4">
                We've prepared your AI design prompt based on your style quiz. Start designing and get your first drop at an exclusive discount.
              </p>

              {/* AI Model Badge */}
              {aiModelInfo && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm mb-6">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900">
                    <strong>{aiModelInfo.name}</strong> - {aiModelInfo.description}
                  </span>
                </div>
              )}
            </div>

            {/* Giveaway Banner */}
            {giveawayInfo && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <Trophy className="w-8 h-8 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold mb-2">🎉 {giveawayInfo.name}!</h3>
                    <p className="text-white/90 mb-3">
                      You've unlocked <strong>{Math.round(discount * 100)}% OFF</strong> + FREE bonus items!
                    </p>
                    <div className="text-sm text-white/80">
                      ✓ Plus free giveaway items with your order
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-gradient-to-br from-[#16C1A8]/10 to-[#0D2C45]/10 rounded-2xl p-6 mb-6 border border-[#16C1A8]/20">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-2xl text-gray-400 line-through">
                  ${usdPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <Tag className="w-5 h-5" />
                Save ${savings.toFixed(2)} ({Math.round(discount * 100)}% off)
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-3">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      selectedSize === size
                        ? 'border-[#16C1A8] bg-[#16C1A8]/5 text-[#16C1A8] font-semibold'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mb-8">
              <label className="block font-semibold text-gray-900 mb-3">Select Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-[#16C1A8] bg-[#16C1A8]/5 text-[#16C1A8] font-semibold'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4">What's Included:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700"><strong>Your AI-designed print</strong> - personalized based on your style</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700"><strong>{product.materials[0]}</strong> - premium quality fabric</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700"><strong>Free design toolkit</strong> - unlimited AI generations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700"><strong>48-hour dispatch</strong> - priority production</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Button
              onClick={handleStartDesigning}
              size="lg"
              className="w-full bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white py-8 text-xl rounded-2xl hover:shadow-2xl transition-all mb-4"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start Designing Now
            </Button>

            <p className="text-center text-sm text-gray-500">
              Your {Math.round(discount * 100)}% discount will be automatically applied at checkout
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Trusted by creators worldwide</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-sm text-gray-500">⭐⭐⭐⭐⭐ 4.9/5 from 2,431 reviews</div>
            <div className="text-sm text-gray-500">🎨 15,847+ designs created</div>
            <div className="text-sm text-gray-500">🚀 Shipped to 47 countries</div>
          </div>
        </div>
      </main>
    </div>
  );
}
