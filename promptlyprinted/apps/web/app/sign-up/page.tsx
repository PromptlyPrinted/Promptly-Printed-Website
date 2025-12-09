'use client';

import { Suspense } from 'react';
import { SignUp } from '@repo/auth/components/sign-up';
import { Sparkles, Gift, Zap, Heart } from 'lucide-react';
import Link from 'next/link';

function SignUpContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2C45] via-[#0D2C45] to-[#16C1A8]/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Benefits */}
        <div className="hidden lg:block text-white space-y-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <Sparkles className="w-10 h-10 text-[#16C1A8]" />
              <span className="text-3xl font-bold">Promptly Printed</span>
            </Link>
            <h2 className="text-4xl font-bold mb-4">
              Create stunning AI designs
              <br />
              in seconds
            </h2>
            <p className="text-xl text-white/80">
              Join thousands of creators making unique apparel with AI
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-[#16C1A8] flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">50 Free Credits</p>
                <p className="text-sm text-white/70">Generate up to 50 unique designs</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-[#16C1A8] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">AI-Powered Design</p>
                <p className="text-sm text-white/70">Type your idea, watch it come to life</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-[#16C1A8] flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Save Your Creations</p>
                <p className="text-sm text-white/70">Build your personal design library</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-[#16C1A8]" />
              <span className="text-2xl font-bold text-white">Promptly Printed</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
              <p className="text-gray-600">Get 50 free credits to start designing</p>
            </div>

            <SignUp />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-white/60 mt-6">
            By signing up, you agree to our{' '}
            <Link href="/legal/terms" className="underline hover:text-white">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0D2C45]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
