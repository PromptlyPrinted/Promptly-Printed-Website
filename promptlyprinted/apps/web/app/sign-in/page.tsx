'use client';

import { Suspense } from 'react';
import { SignIn } from '@repo/auth/components/sign-in';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

function SignInContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2C45] via-[#0D2C45] to-[#16C1A8]/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-[#16C1A8]" />
            <span className="text-2xl font-bold text-white">Promptly Printed</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to continue designing</p>
          </div>

          <SignIn />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/60 mt-6">
          By signing in, you agree to our{' '}
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
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0D2C45]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
