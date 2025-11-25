'use client';

import { useEffect, useState } from 'react';
import { X, Coins, Sparkles, TrendingUp, Zap, Check } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';

type CreditPack = {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  bonusCredits: number;
  totalCredits: number;
  pricePerCredit: number;
  savings: number;
  isPopular: boolean;
  metadata: any;
};

type CreditPacksModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (packId: string) => void;
};

export function CreditPacksModal({ isOpen, onClose, onPurchase }: CreditPacksModalProps) {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPacks();
    }
  }, [isOpen]);

  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/credit-packs');
      const data = await response.json();
      setPacks(data.packs || []);
    } catch (error) {
      console.error('Failed to fetch credit packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packId: string) => {
    setSelectedPack(packId);

    try {
      // Create Square checkout session
      const response = await fetch('/api/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create checkout');
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Square checkout
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Checkout error:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to start checkout. Please try again.'
      );
      setSelectedPack(null);
    }

    // Call optional callback
    if (onPurchase) {
      onPurchase(packId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Buy Credits</h2>
            <p className="text-sm text-gray-600 mt-1">Choose the perfect pack for your needs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Coins className="w-8 h-8 text-[#16C1A8] animate-pulse" />
              <span className="ml-2 text-gray-600">Loading packs...</span>
            </div>
          ) : (
            <>
              {/* Model Costs Reference */}
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Credit Costs by AI Model
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-700">Nano Banana: <strong>0.5</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700">Flux Dev: <strong>1</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-gray-700">LORA Models: <strong>1</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-gray-700">Gemini Flash: <strong>1</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-gray-700">Nano Banana Pro: <strong>2</strong></span>
                  </div>
                </div>
              </div>

              {/* Credit Packs Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className={`relative rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                      pack.isPopular
                        ? 'border-[#16C1A8] bg-gradient-to-br from-[#16C1A8]/5 to-[#0D2C45]/5'
                        : 'border-gray-200 bg-white hover:border-[#16C1A8]'
                    }`}
                  >
                    {/* Popular Badge */}
                    {pack.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white px-4 py-1 rounded-full text-xs font-bold">
                          ⭐ BEST VALUE
                        </div>
                      </div>
                    )}

                    {/* Custom Badge from metadata */}
                    {pack.metadata?.badge && !pack.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-1 rounded-full text-xs font-bold">
                          {pack.metadata.badge}
                        </div>
                      </div>
                    )}

                    {/* Pack Name */}
                    <h3 className="font-bold text-xl text-gray-900 mb-2 mt-2">
                      {pack.name}
                    </h3>

                    {/* Description */}
                    {pack.metadata?.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {pack.metadata.description}
                      </p>
                    )}

                    {/* Credits */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {pack.totalCredits}
                        </span>
                        <span className="text-sm text-gray-500">credits</span>
                      </div>
                      {pack.bonusCredits > 0 && (
                        <div className="text-sm text-green-600 font-semibold flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          +{pack.bonusCredits} bonus credits!
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          ${pack.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">USD</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${pack.pricePerCredit.toFixed(3)} per credit
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-4 text-sm">
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>Instant delivery</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>Never expires</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>All AI models</span>
                      </li>
                      {pack.savings > 0 && (
                        <li className="flex items-center gap-2 text-green-600 font-semibold">
                          <TrendingUp className="w-4 h-4 flex-shrink-0" />
                          <span>Save {pack.savings}%</span>
                        </li>
                      )}
                    </ul>

                    {/* Buy Button */}
                    <Button
                      onClick={() => handlePurchase(pack.id)}
                      disabled={selectedPack === pack.id}
                      className={`w-full ${
                        pack.isPopular
                          ? 'bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white hover:opacity-90'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {selectedPack === pack.id ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">💡 Good to know</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Credits never expire - use them whenever you want</li>
                  <li>• Works with all AI models (costs vary by model)</li>
                  <li>• Instant delivery - credits added immediately</li>
                  <li>• Secure payment via Stripe</li>
                  <li>• Need help? Contact support@promptlyprinted.com</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
