'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { useState } from 'react';
import { CreditPacksModal } from '@/components/credits/CreditPacksModal';

export default function CheckoutCancelledPage() {
  const router = useRouter();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Cancelled Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Checkout Cancelled
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            No payment was processed. You can try again whenever you're ready.
          </p>

          {/* Current Balance */}
          <div className="mb-8">
            <CreditBalance showDetails={false} />
          </div>

          {/* Why Buy Credits */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">
              Why Buy Credits?
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span><strong>Unlimited generations</strong> - No daily limits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span><strong>Premium AI models</strong> - Access to all models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span><strong>Never expire</strong> - Use credits anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span><strong>Bonus credits</strong> - Get up to 30% extra free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span><strong>Instant delivery</strong> - Credits added immediately</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setShowPurchaseModal(true)}
              className="bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white px-8 py-6 text-lg"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              View Credit Packs
            </Button>

            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back Home
            </Button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Had an issue during checkout?{' '}
              <a
                href="mailto:support@promptlyprinted.com"
                className="text-[#16C1A8] hover:underline font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>🔒 Secure payment via Square • 💳 All major cards accepted • 🔄 30-day refund policy</p>
        </div>
      </div>

      {/* Purchase Modal */}
      <CreditPacksModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </div>
  );
}
