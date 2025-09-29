'use client';

import { useState, useEffect } from 'react';
import { LeadCaptureModal } from './LeadCaptureModal';
import { useCampaign } from '@/hooks/useCampaign';

export function ExitIntentCapture() {
  const [showModal, setShowModal] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { campaign } = useCampaign();

  useEffect(() => {
    if (!campaign || hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is leaving the top of the viewport
      if (e.clientY <= 0 && !hasShown) {
        setShowModal(true);
        setHasShown(true);
      }
    };

    // Add event listener
    document.addEventListener('mouseleave', handleMouseLeave);

    // Also trigger on scroll up from top
    const handleScroll = () => {
      if (window.scrollY === 0 && !hasShown) {
        const timer = setTimeout(() => {
          if (window.scrollY === 0) {
            setShowModal(true);
            setHasShown(true);
          }
        }, 1000);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [campaign, hasShown]);

  if (!campaign) return null;

  return (
    <LeadCaptureModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      campaign={campaign}
      trigger="exit-intent"
    />
  );
}