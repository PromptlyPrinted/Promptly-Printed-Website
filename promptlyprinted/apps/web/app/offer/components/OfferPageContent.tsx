'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { useState, useMemo } from 'react';
import { Sparkles, Tag, Gift, Clock } from 'lucide-react';
import Image from 'next/image';
import { tshirtDetails } from '@repo/database/scripts/tshirt-details';

// Map quiz clothing types to actual product SKUs
// Note: Update these SKUs to match your actual inventory
const CLOTHING_TYPE_TO_SKU: Record<string, string> = {
  'tee': 'TEE-SS-STTU755', // Men's Classic T-Shirt
  'hoodie': 'TEE-SS-STTU755', // TODO: Add hoodie SKU when available
  'long-sleeve': 'A-ML-GD2400', // Men's Long Sleeve T-Shirt
  'crewneck': 'TEE-SS-STTU755', // TODO: Add crewneck SKU when available
};

export function OfferPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const prompt = searchParams.get('prompt') || '';
  const style = searchParams.get('style') || 'minimalist';
  const campaign = searchParams.get('campaign') || 'general';
  const source = searchParams.get('source') || 'direct';
  const clothingType = searchParams.get('clothingType') || 'tee';

  // Get actual product from tshirtDetails
  const productSku = CLOTHING_TYPE_TO_SKU[clothingType] || CLOTHING_TYPE_TO_SKU.tee;
  const productData = tshirtDetails[productSku as keyof typeof tshirtDetails];

  // If product not found, fallback to first available product
  const product = productData || Object.values(tshirtDetails)[0];

  // Get USD pricing
  const usdPrice = product.pricing.find((p) => p.currency === 'USD')?.amount || 0;

  // First-drop discount
  const FIRST_DROP_DISCOUNT = 0.40; // 40% off
  const discountedPrice = usdPrice * (1 - FIRST_DROP_DISCOUNT);
  const savings = usdPrice - discountedPrice;

  // Get first available color image
  const firstColor = product.colorOptions?.[0];
  const productImageUrl = firstColor
    ? `${product.imageUrls.base}/${firstColor.filename}`
    : '/placeholder-product.png';

  const [selectedSize, setSelectedSize] = useState(product.size[Math.floor(product.size.length / 2)] || 'M');
  const [selectedColor, setSelectedColor] = useState(firstColor?.name || 'White');

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
      discount: FIRST_DROP_DISCOUNT.toString(),
    });

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
                Your Personalized {product.name}
              </h1>

              <p className="text-lg text-gray-600 mb-6">
                We've prepared your AI design prompt based on your style quiz. Start designing and get your first drop at an exclusive discount.
              </p>
            </div>

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
                Save ${savings.toFixed(2)} ({Math.round(FIRST_DROP_DISCOUNT * 100)}% off)
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
              Your {Math.round(FIRST_DROP_DISCOUNT * 100)}% discount will be automatically applied at checkout
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
