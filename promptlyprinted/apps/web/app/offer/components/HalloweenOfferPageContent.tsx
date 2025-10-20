'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { useState } from 'react';
import { Ghost, Candy, Sparkles, ArrowRight, Skull } from 'lucide-react';
import Image from 'next/image';
import { tshirtDetails } from '@repo/database/scripts/tshirt-details';
import { getProductDisplayName, GIVEAWAY_ITEMS } from '@/lib/quiz-product-selector';

// Legacy fallback map for backwards compatibility
const LEGACY_CLOTHING_TYPE_TO_SKU: Record<string, string> = {
  'tee': 'TEE-SS-STTU755',
  'hoodie': 'A-MH-JH001',
  'long-sleeve': 'A-ML-GD2400',
  'crewneck': 'TEE-SS-STTU755',
};

export function HalloweenOfferPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const campaign = searchParams.get('campaign') || 'halloween-2025';

  // Check if user came from quiz (has quiz params)
  const hasQuizParams = searchParams.get('productSKU') || searchParams.get('styleType');

  // If no quiz params, redirect to quiz
  if (!hasQuizParams) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-950 via-purple-950 to-black text-white">
        {/* Header */}
        <header className="border-b border-orange-500/20 bg-black/40 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              Promptly Printed
            </div>
          </div>
        </header>

        {/* Redirect to Quiz Content */}
        <main className="container mx-auto px-6 py-24 max-w-4xl text-center">
          <div className="flex flex-col items-center gap-8">
            <div className="text-8xl animate-bounce">🎃</div>

            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Halloween 2025 Special
            </h1>

            <p className="text-2xl text-gray-300 max-w-2xl">
              Take our spooky style quiz to unlock exclusive Halloween discounts and freebies!
            </p>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 my-12 w-full">
              <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-2xl p-6 border border-orange-500/30">
                <div className="text-4xl mb-3">👻</div>
                <h3 className="font-bold text-xl mb-2">Spooky Discounts</h3>
                <p className="text-gray-300 text-sm">Up to 50% off your first Halloween design</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                <div className="text-4xl mb-3">🎁</div>
                <h3 className="font-bold text-xl mb-2">Free Goodies</h3>
                <p className="text-gray-300 text-sm">Unlock free Halloween-themed items with your order</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-2xl p-6 border border-pink-500/30">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-bold text-xl mb-2">AI Magic</h3>
                <p className="text-gray-300 text-sm">Custom Halloween designs powered by advanced AI</p>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/halloween-2025/quiz?campaign=${campaign}`)}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-12 py-8 text-2xl rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all group"
            >
              <Ghost className="w-8 h-8 mr-3 group-hover:animate-bounce" />
              Start Halloween Quiz
              <ArrowRight className="w-8 h-8 ml-3" />
            </Button>

            <p className="text-gray-400 text-sm mt-4">
              Takes 2 minutes • Personalized recommendations • Instant discounts
            </p>
          </div>
        </main>

        {/* Floating Halloween Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">🎃</div>
          <div className="absolute top-40 right-20 text-5xl opacity-10 animate-bounce" style={{ animationDelay: '0.5s' }}>👻</div>
          <div className="absolute bottom-40 left-20 text-5xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }}>🦇</div>
          <div className="absolute bottom-20 right-40 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>💀</div>
        </div>
      </div>
    );
  }

  // User came from quiz - show personalized offer
  const prompt = searchParams.get('prompt') || '';
  const style = searchParams.get('style') || 'minimalist';
  const source = searchParams.get('source') || 'halloween-quiz';

  // Get product SKU from quiz
  const quizProductSKU = searchParams.get('productSKU');

  // Get all quiz parameters
  const audience = searchParams.get('audience') || 'mens';
  const styleType = searchParams.get('styleType') || 'classic-tee';
  const theme = searchParams.get('theme') || 'halloween';
  const aiModel = searchParams.get('aiModel') || 'flux-dev';
  const giveawayTier = searchParams.get('giveawayTier') as keyof typeof GIVEAWAY_ITEMS || 'standard';

  // Legacy parameter
  const clothingType = searchParams.get('clothingType') || 'tee';

  // Determine product SKU
  const productSku = quizProductSKU || LEGACY_CLOTHING_TYPE_TO_SKU[clothingType] || 'TEE-SS-STTU755';
  const productData = tshirtDetails[productSku as keyof typeof tshirtDetails];
  const product = productData || Object.values(tshirtDetails)[0];

  // Get USD pricing
  const usdPrice = product.pricing.find((p) => p.currency === 'USD')?.amount || 0;

  // Get discount from giveaway tier
  const discountParam = searchParams.get('discount');
  const discount = discountParam
    ? parseFloat(discountParam)
    : GIVEAWAY_ITEMS[giveawayTier]?.discount || 0.30;

  const discountedPrice = usdPrice * (1 - discount);
  const savings = usdPrice - discountedPrice;

  // Get giveaway info
  const giveawayInfo = GIVEAWAY_ITEMS[giveawayTier];

  // Get product display name
  const productDisplayName = quizProductSKU
    ? getProductDisplayName(audience as any, styleType as any)
    : product.name;

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
      discount: discount.toString(),
      audience,
      styleType,
      theme,
      aiModel,
      giveawayTier,
    });

    // Navigate to design page using SKU
    router.push(`/design/${product.sku}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-950 via-purple-950 to-black text-white">
      {/* Header */}
      <header className="border-b border-orange-500/20 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
            Promptly Printed
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Halloween Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-purple-600 rounded-full shadow-xl shadow-orange-500/50 animate-pulse">
            <Skull className="w-6 h-6" />
            <span className="font-bold text-lg">Halloween 2025 Exclusive Offer</span>
            <Skull className="w-6 h-6" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* LEFT: Product Image */}
          <div>
            <div className="relative aspect-square bg-gradient-to-br from-orange-900/30 to-purple-900/30 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-orange-500/30">
              <Image
                src={productImageUrl}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
              {/* Spooky overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Halloween Trust Badges */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-xl p-4 border border-orange-500/30">
                <div className="text-3xl mb-1">🎃</div>
                <div className="text-gray-300">Spooky AI</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                <div className="text-3xl mb-1">👻</div>
                <div className="text-gray-300">Fast Delivery</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-xl p-4 border border-pink-500/30">
                <div className="text-3xl mb-1">🦇</div>
                <div className="text-gray-300">Premium Quality</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Offer Details */}
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-full text-sm font-semibold mb-4">
                <Candy className="w-4 h-4" />
                <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                  Quiz Completed - Rewards Unlocked!
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Your Halloween {productDisplayName}
              </h1>

              <p className="text-lg text-gray-300 mb-4">
                Your personalized Halloween design is ready! Start creating your spooky masterpiece with exclusive quiz rewards.
              </p>
            </div>

            {/* Giveaway Banner */}
            {giveawayInfo && (
              <div className="bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-2xl shadow-orange-500/30 border border-orange-400/50">
                <div className="flex items-start gap-4">
                  <Ghost className="w-10 h-10 flex-shrink-0 mt-1 animate-bounce" />
                  <div>
                    <h3 className="text-2xl font-bold mb-2">🎉 {giveawayInfo.name}!</h3>
                    <p className="text-white/90 mb-3 text-lg">
                      You've unlocked <strong className="text-yellow-300">{Math.round(discount * 100)}% OFF</strong> + spooky bonus items!
                    </p>
                    <div className="text-sm text-white/80">
                      ✓ Free Halloween-themed giveaway items included
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-2xl p-6 mb-6 border border-orange-500/30">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-orange-300 to-purple-300 bg-clip-text text-transparent">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-2xl text-gray-500 line-through">
                  ${usdPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-400 font-semibold text-lg">
                <Candy className="w-5 h-5" />
                Save ${savings.toFixed(2)} ({Math.round(discount * 100)}% off)
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-200 mb-3">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      selectedSize === size
                        ? 'border-orange-500 bg-orange-500/20 text-orange-300 font-semibold shadow-lg shadow-orange-500/30'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500 bg-gray-800/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mb-8">
              <label className="block font-semibold text-gray-200 mb-3">Select Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-semibold shadow-lg shadow-purple-500/30'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500 bg-gray-800/50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl border border-gray-700 p-6 mb-8 backdrop-blur-sm">
              <h3 className="font-bold text-gray-200 mb-4 text-lg">What's Included:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300"><strong className="text-white">Custom Halloween AI design</strong> - spooky & personalized</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300"><strong className="text-white">{product.materials[0]}</strong> - premium comfort</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300"><strong className="text-white">Unlimited AI generations</strong> - perfect your design</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300"><strong className="text-white">Free Halloween goodies</strong> - bonus items with order</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Button
              onClick={handleStartDesigning}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-8 text-xl rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all group mb-4"
            >
              <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              Create My Spooky Design
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-center text-sm text-gray-400">
              Your {Math.round(discount * 100)}% Halloween discount applied automatically at checkout 🎃
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Join the Halloween hype</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-sm text-gray-500">⭐⭐⭐⭐⭐ 4.9/5 spooky ratings</div>
            <div className="text-sm text-gray-500">🎃 1,000+ Halloween designs created</div>
            <div className="text-sm text-gray-500">👻 Limited time offer</div>
          </div>
        </div>
      </main>

      {/* Floating Halloween Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-pulse">🎃</div>
        <div className="absolute top-40 right-20 text-5xl opacity-5 animate-bounce" style={{ animationDelay: '0.5s' }}>👻</div>
        <div className="absolute bottom-40 left-20 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>🦇</div>
        <div className="absolute bottom-20 right-40 text-6xl opacity-10 animate-bounce" style={{ animationDelay: '1.5s' }}>💀</div>
      </div>
    </div>
  );
}
