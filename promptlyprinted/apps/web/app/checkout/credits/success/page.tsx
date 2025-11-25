'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Coins, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [creditInfo, setCreditInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Fetch updated credit balance
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/credits');
        const data = await response.json();
        setCreditInfo(data);
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Your credits have been added to your account
          </p>

          {/* Credit Info */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Coins className="w-6 h-6 text-[#16C1A8] animate-pulse" />
              <span className="text-gray-600">Loading your new balance...</span>
            </div>
          ) : creditInfo?.credits ? (
            <div className="bg-gradient-to-br from-[#16C1A8]/10 to-[#0D2C45]/10 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Coins className="w-8 h-8 text-[#16C1A8]" />
                <div className="text-left">
                  <div className="text-sm text-gray-600">New Balance</div>
                  <div className="text-4xl font-bold text-[#16C1A8]">
                    {creditInfo.credits.balance}
                  </div>
                  <div className="text-xs text-gray-500">credits</div>
                </div>
              </div>
            </div>
          ) : null}

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              What You Can Do Now
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  1
                </div>
                <span>Generate unlimited AI images with your credits</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  2
                </div>
                <span>Try premium AI models (Nano Banana Pro, LORA models)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  3
                </div>
                <span>Save and download your favorite designs</span>
              </li>
            </ul>
          </div>

          {/* Receipt Info */}
          {sessionId && (
            <div className="text-sm text-gray-500 mb-6">
              <p>Transaction ID: {sessionId}</p>
              <p className="mt-1">A receipt has been sent to your email</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/design')}
              className="bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] text-white px-8 py-6 text-lg"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg"
            >
              Go to Homepage
            </Button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{' '}
              <a
                href="mailto:support@promptlyprinted.com"
                className="text-[#16C1A8] hover:underline font-medium"
              >
                support@promptlyprinted.com
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>✅ Credits added instantly • ✅ No expiration • ✅ Refundable within 30 days</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Coins className="w-12 h-12 text-[#16C1A8] animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
