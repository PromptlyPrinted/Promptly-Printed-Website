'use client';

import { useState } from 'react';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { CreditPacksModal } from '@/components/credits/CreditPacksModal';
import { GenerationCostIndicator } from '@/components/credits/GenerationCostIndicator';
import { ModelRecommendation } from '@/components/credits/ModelRecommendation';
import { Button } from '@repo/design-system/components/ui/button';

/**
 * Credit System Demo Page
 *
 * This page demonstrates how to use all the credit system components.
 * Copy these patterns into your actual design studio / generation pages.
 */
export default function CreditsDemoPage() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState('flux-dev');

  // In a real app, fetch these from your credit API
  const mockUserData = {
    authenticated: true,
    balance: 45,
    isGuest: false,
    guestRemaining: 2,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Credit System Demo
            </h1>

            {/* Compact Balance in Header */}
            <div className="flex items-center gap-4">
              <CreditBalance compact onBuyCredits={() => setShowPurchaseModal(true)} />
              <Button
                onClick={() => setShowPurchaseModal(true)}
                variant="outline"
                size="sm"
              >
                Buy Credits
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Credit Info */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Credits
              </h2>
              <CreditBalance
                showDetails
                onBuyCredits={() => setShowPurchaseModal(true)}
              />
            </div>

            {/* Implementation Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                📘 Implementation Guide
              </h3>
              <div className="text-xs text-blue-800 space-y-2">
                <p><strong>1. Add to Header:</strong></p>
                <code className="block bg-white p-2 rounded text-xs overflow-x-auto">
                  {`<CreditBalance compact />`}
                </code>

                <p><strong>2. Add to Sidebar:</strong></p>
                <code className="block bg-white p-2 rounded text-xs overflow-x-auto">
                  {`<CreditBalance showDetails onBuyCredits={openModal} />`}
                </code>

                <p><strong>3. Before Generation:</strong></p>
                <code className="block bg-white p-2 rounded text-xs overflow-x-auto">
                  {`<GenerationCostIndicator modelName="flux-dev" currentBalance={50} />`}
                </code>
              </div>
            </div>
          </div>

          {/* Main Content - Generation UI */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Generate Image
              </h2>

              {/* Model Selection */}
              <div className="mb-6">
                <ModelRecommendation
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  currentBalance={mockUserData.balance}
                  isGuest={mockUserData.isGuest}
                  showCosts={true}
                />
              </div>

              {/* Prompt Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16C1A8] focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Describe the image you want to generate..."
                />
              </div>

              {/* Cost Indicator */}
              <div className="mb-4">
                <GenerationCostIndicator
                  modelName={selectedModel}
                  currentBalance={mockUserData.balance}
                  isGuest={mockUserData.isGuest}
                  guestRemaining={mockUserData.guestRemaining}
                />
              </div>

              {/* Generate Button */}
              <Button
                className="w-full bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white py-6 text-lg"
                size="lg"
              >
                Generate Image
              </Button>
            </div>

            {/* Usage Examples */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Component Examples
              </h3>

              <div className="space-y-6">
                {/* Example 1: Compact Cost */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Compact Cost Indicator
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <GenerationCostIndicator
                      modelName="nano-banana"
                      currentBalance={50}
                      compact
                    />
                    <GenerationCostIndicator
                      modelName="flux-dev"
                      currentBalance={50}
                      compact
                    />
                    <GenerationCostIndicator
                      modelName="nano-banana-pro"
                      currentBalance={50}
                      compact
                    />
                  </div>
                </div>

                {/* Example 2: Guest View */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Guest User View
                  </h4>
                  <GenerationCostIndicator
                    modelName="flux-dev"
                    isGuest={true}
                    guestRemaining={2}
                  />
                </div>

                {/* Example 3: Low Balance Warning */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Low Balance Warning
                  </h4>
                  <GenerationCostIndicator
                    modelName="flux-dev"
                    currentBalance={5}
                  />
                </div>

                {/* Example 4: Insufficient Credits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Insufficient Credits
                  </h4>
                  <GenerationCostIndicator
                    modelName="nano-banana-pro"
                    currentBalance={0.5}
                  />
                </div>
              </div>
            </div>

            {/* API Integration Guide */}
            <div className="bg-gray-900 text-white rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                🔌 API Integration
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-300 mb-2"><strong>1. Fetch Credits:</strong></p>
                  <code className="block bg-black p-3 rounded text-xs overflow-x-auto text-green-400">
                    {`const res = await fetch('/api/credits');
const data = await res.json();
// { authenticated, credits: { balance, ... } }`}
                  </code>
                </div>

                <div>
                  <p className="text-gray-300 mb-2"><strong>2. Generate Image:</strong></p>
                  <code className="block bg-black p-3 rounded text-xs overflow-x-auto text-green-400">
                    {`const res = await fetch('/api/generate-image', {
  method: 'POST',
  body: JSON.stringify({ prompt, models, aiModel })
});
// Response includes credit balance:
// { data: [...], credits: { used: 1, remaining: 49 } }`}
                  </code>
                </div>

                <div>
                  <p className="text-gray-300 mb-2"><strong>3. Handle Errors:</strong></p>
                  <code className="block bg-black p-3 rounded text-xs overflow-x-auto text-green-400">
                    {`if (res.status === 402) {
  // Insufficient credits
  openPurchaseModal();
} else if (res.status === 429) {
  // Guest limit reached
  showSignupPrompt();
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <CreditPacksModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchase={(packId) => {
          console.log('Purchase pack:', packId);
          // Implement checkout flow here
          alert(`Checkout for pack: ${packId}\n\nIntegrate with Stripe/Square to complete purchase.`);
        }}
      />
    </div>
  );
}
