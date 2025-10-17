'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizAnswers } from '../page';

type QuizResultsProps = {
  answers: QuizAnswers;
};

// Map quiz answers to actual product SKUs
const PRODUCT_SKU_MAP: Record<string, string> = {
  'hoodie': 'gildan-heavy-blend-hooded-sweatshirt-18500',
  'tee': 'mens-classic-tshirt',
  'crewneck': 'gildan-crew-neck-sweatshirt-18000',
  'bundle': 'gildan-heavy-blend-hooded-sweatshirt-18500', // Default to hoodie for bundle
};

export const QuizResults = ({ answers }: QuizResultsProps) => {
  const router = useRouter();

  // Generate personalized prompt from quiz answers
  const designPrompt = useMemo(() => {
    const styleMap: Record<string, string> = {
      'dark-spooky': 'gothic horror with dark shadows, creepy details, and moody atmosphere',
      'cute-playful': 'friendly cartoon style with pastel colors and cute characters',
      'retro-horror': '1980s VHS aesthetic with grainy textures and neon colors',
      'minimal-modern': 'clean geometric design with subtle Halloween elements and modern typography',
    };

    const motivationContext: Record<string, string> = {
      'self': 'Create a standout piece for personal style',
      'squad': 'Design that works great for matching group looks',
      'family': 'Family-friendly design suitable for all ages',
      'business': 'Commercial-ready artwork optimized for selling',
    };

    const style = answers.style ? styleMap[answers.style] : 'Halloween themed';
    const context = answers.motivation ? motivationContext[answers.motivation] : '';
    const product = answers.product || 't-shirt';

    return `${context ? context + '. ' : ''}Create a ${style} design for a ${product}. Include Halloween elements like pumpkins, ghosts, bats, or spooky typography. Optimize for print on apparel with high contrast and bold details.`;
  }, [answers]);

  // Get recommended product SKU
  const productSku = useMemo(() => {
    const product = answers.product || 'tee';
    return PRODUCT_SKU_MAP[product] || PRODUCT_SKU_MAP['tee'];
  }, [answers.product]);

  // Automatically redirect to design page with pre-filled prompt
  useEffect(() => {
    // Build URL with query params
    const params = new URLSearchParams({
      prompt: designPrompt,
      campaign: 'halloween-2025',
      ...(answers.email && { email: answers.email }),
    });

    // Redirect to actual design page
    router.push(`/design/${productSku}?${params.toString()}`);
  }, [router, productSku, designPrompt, answers.email]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <svg
            className="animate-spin h-12 w-12 text-[#16C1A8] mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Setting up your design studio...
        </h2>
        <p className="text-gray-600">
          We're preparing your personalized prompt and product
        </p>
      </div>
    </div>
  );
};
