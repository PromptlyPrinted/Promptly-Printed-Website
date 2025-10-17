import { Suspense } from 'react';
import { OfferPageContent } from './components/OfferPageContent';

export const metadata = {
  title: 'Your Personalized Offer | Promptly Printed',
  description: 'Exclusive first-drop discount on your AI-designed custom apparel',
};

export default function OfferPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#16C1A8] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your offer...</p>
      </div>
    </div>}>
      <OfferPageContent />
    </Suspense>
  );
}
