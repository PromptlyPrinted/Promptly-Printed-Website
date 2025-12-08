'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Sparkles, Zap, Heart, ShoppingBag } from 'lucide-react';

interface SignUpPromptProps {
  isOpen: boolean;
  onClose: () => void;
  prompt?: string; // Preserve user's prompt for after sign-up
  productUrl?: string; // Current page URL to redirect back
}

export function SignUpPrompt({ isOpen, onClose, prompt, productUrl }: SignUpPromptProps) {
  // Build redirect URL preserving all existing query params (discount, campaign, color, etc.)
  // and updating/adding the prompt parameter
  let redirectUrl: string | undefined;
  
  if (productUrl) {
    try {
      const url = new URL(productUrl);
      // Update or add the prompt parameter if we have a prompt
      if (prompt) {
        url.searchParams.set('prompt', prompt);
      }
      redirectUrl = url.toString();
    } catch {
      // Fallback if URL parsing fails
      redirectUrl = productUrl;
    }
  }
  
  const signUpUrl = redirectUrl 
    ? `/sign-up?redirect=${encodeURIComponent(redirectUrl)}`
    : '/sign-up';
    
  const signInUrl = redirectUrl
    ? `/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
    : '/sign-in';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-[#16C1A8]" />
            Unlock AI Design Powers
          </DialogTitle>
          <DialogDescription className="text-base">
            Create a free account to start generating amazing designs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits List */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#16C1A8]/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-[#16C1A8]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">50 Free Credits</p>
                <p className="text-sm text-gray-500">Generate up to 50 unique designs instantly</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#16C1A8]/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-[#16C1A8]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Save Your Designs</p>
                <p className="text-sm text-gray-500">Keep all your creations in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#16C1A8]/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4 text-[#16C1A8]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Earn Bonus Credits</p>
                <p className="text-sm text-gray-500">Get 10 credits for each T-shirt purchase</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              asChild
              className="w-full text-white"
              style={{ background: 'linear-gradient(to right, #16C1A8, #0D2C45)' }}
            >
              <Link href={signUpUrl}>
                <Sparkles className="w-4 h-4 mr-2" />
                Sign Up Free — Get 50 Credits
              </Link>
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href={signInUrl} className="font-medium text-[#16C1A8] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-400">
            No credit card required • Takes 30 seconds
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
