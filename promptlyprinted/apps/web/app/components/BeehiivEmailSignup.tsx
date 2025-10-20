'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface BeehiivEmailSignupProps {
  campaignId?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'halloween';
}

export function BeehiivEmailSignup({
  campaignId = 'home-page-signup',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Thanks for subscribing! Check your inbox.',
  className = '',
  variant = 'default',
}: BeehiivEmailSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          campaignId,
          source: 'website',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setDiscountCode(data.discountCode);
      setAlreadySubscribed(data.alreadySubscribed || false);
      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`flex flex-col gap-3 p-6 rounded-xl ${alreadySubscribed ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'} ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircle className={`w-5 h-5 flex-shrink-0 ${alreadySubscribed ? 'text-blue-600' : 'text-green-600'}`} />
          <p className={`font-medium ${alreadySubscribed ? 'text-blue-800' : 'text-green-800'}`}>
            {alreadySubscribed ? 'You\'re already subscribed!' : successMessage}
          </p>
        </div>
        {discountCode && (
          <div className={`bg-white rounded-lg p-4 border-2 border-dashed ${alreadySubscribed ? 'border-blue-400' : 'border-green-400'}`}>
            <p className="text-sm text-gray-600 mb-1">
              {alreadySubscribed ? 'Your existing discount code:' : 'Your discount code:'}
            </p>
            <p className={`text-2xl font-bold font-mono ${alreadySubscribed ? 'text-blue-700' : 'text-green-700'}`}>
              {discountCode}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {alreadySubscribed ? 'You can still use this at checkout!' : 'Use at checkout for 10% off!'}
            </p>
          </div>
        )}
      </div>
    );
  }

  const getStyles = () => {
    switch (variant) {
      case 'halloween':
        return {
          container: 'bg-gradient-to-br from-gray-900/80 to-black/80 border-orange-500/30',
          input: 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500',
          button: 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white shadow-lg shadow-orange-500/30',
        };
      case 'minimal':
        return {
          container: 'bg-transparent border-0',
          input: 'bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-[#16C1A8]',
          button: 'bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white',
        };
      default:
        return {
          container: 'bg-white border-gray-200',
          input: 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#16C1A8]',
          button: 'bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white',
        };
    }
  };

  const styles = getStyles();

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className={`flex flex-col sm:flex-row gap-3 p-2 rounded-xl border ${styles.container}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#16C1A8]/20 disabled:opacity-50 ${styles.input}`}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !email}
          className={`px-8 py-3 font-semibold transition-all disabled:opacity-50 ${styles.button}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <p className="text-xs text-gray-400 mt-2 text-center">
        No spam, ever. Unsubscribe anytime.
      </p>
    </form>
  );
}
