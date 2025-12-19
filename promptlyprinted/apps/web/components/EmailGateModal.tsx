'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Gift, Mail } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';

interface EmailGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STORAGE_KEY = 'pp_guest_email';

export function EmailGateModal({ isOpen, onClose, onSuccess }: EmailGateModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email locally
      localStorage.setItem(STORAGE_KEY, email);

      // Subscribe to newsletter
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, campaignId: 'email-gate' }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Don't block if already subscribed
        if (!data.alreadySubscribed) {
          console.error('Newsletter subscription failed:', data.error);
        }
      }

      onSuccess();
    } catch (err) {
      console.error('Email gate error:', err);
      // Still allow through even on error
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0D2C45] to-[#1a4a6a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#16C1A8] to-[#FF8A26] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Unlock 3 Free Designs! 🎨
          </h2>
          
          <p className="text-white/70 text-center mb-6">
            Enter your email to start creating amazing AI-powered designs
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            {[
              { icon: Gift, text: '3 free AI generations' },
              { icon: Mail, text: 'Design inspiration & tips' },
              { icon: Sparkles, text: '10% off your first order' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80">
                <Icon className="w-5 h-5 text-[#16C1A8]" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#16C1A8] to-[#FF8A26] hover:opacity-90 text-white font-semibold"
            >
              {isSubmitting ? 'Unlocking...' : 'Start Creating →'}
            </Button>
          </form>

          <p className="text-white/40 text-xs text-center mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper to check if user has provided email
export function hasProvidedEmail(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEY);
}

// Helper to get stored email
export function getStoredEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}
