'use client';

import { analytics } from '@repo/analytics/posthog/client';
import { useSession } from '@repo/auth/client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Halloween-specific tracking events
interface HalloweenTrackingEvents {
  // Page events
  'halloween_landing_page_view': {
    source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };

  // Gamification events
  'phantom_points_earned': {
    points: number;
    action: string;
    total_points: number;
  };

  'spook_sparks_earned': {
    sparks: number;
    action: string;
    total_sparks: number;
  };

  'pumpkin_tokens_earned': {
    tokens: number;
    action: string;
    total_tokens: number;
  };

  // Showdown events
  'showdown_vote_cast': {
    entry_id: string;
    designer: string;
    design_title: string;
    vote_count: number;
  };

  'showdown_submission_started': {
    challenge_date: string;
  };

  'showdown_submission_completed': {
    design_title: string;
    category: string;
    challenge_date: string;
  };

  // Design Cauldron events
  'cauldron_prompt_generated': {
    difficulty: string;
    prompt_title: string;
    phantom_points_awarded: number;
  };

  'cauldron_design_started': {
    prompt_title: string;
    difficulty: string;
    phantom_points_used: number;
  };

  // Engagement events
  'hero_cta_clicked': {
    cta_text: string;
    location: string;
  };

  'product_design_started': {
    product_id: string;
    product_title: string;
    phantom_points_earned: number;
  };

  'express_delivery_selected': {
    product_id?: string;
    phantom_points_used: number;
  };

  'halloween_newsletter_signup': {
    source: string;
  };

  // Conversion events
  'halloween_design_completed': {
    design_id: string;
    product_type: string;
    design_method: string; // 'ai_prompt', 'template', 'cauldron'
    phantom_points_earned: number;
  };

  'halloween_order_started': {
    design_id?: string;
    product_type: string;
    order_value: number;
    express_delivery: boolean;
  };

  'halloween_order_completed': {
    order_id: string;
    order_value: number;
    product_count: number;
    express_delivery: boolean;
    phantom_points_used: number;
    total_phantom_points: number;
  };

  // Social events
  'design_shared': {
    platform: string;
    design_id?: string;
    spook_sparks_earned: number;
  };

  'showdown_shared': {
    platform: string;
    entry_id: string;
  };
}

// Global tracking function
declare global {
  interface Window {
    trackHalloweenEvent: <K extends keyof HalloweenTrackingEvents>(
      eventName: K,
      properties: HalloweenTrackingEvents[K]
    ) => void;
  }
}

export const HalloweenTracker = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageViewTracked = useRef(false);

  // Track Halloween landing page view
  useEffect(() => {
    if (pathname?.includes('halloween-2025') && !pageViewTracked.current) {
      const trackingProperties = {
        source: searchParams.get('source') || 'direct',
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
      };

      analytics?.capture('halloween_landing_page_view', trackingProperties);
      pageViewTracked.current = true;
    }
  }, [pathname, searchParams]);

  // Set up global tracking function
  useEffect(() => {
    const trackHalloweenEvent = <K extends keyof HalloweenTrackingEvents>(
      eventName: K,
      properties: HalloweenTrackingEvents[K]
    ) => {
      if (!analytics) return;

      // Add Halloween campaign context to all events
      const enhancedProperties = {
        ...properties,
        campaign: 'Halloween_2025_Spook_Style',
        page_path: pathname,
        user_id: user?.id,
        session_id: session?.session?.id,
        timestamp: new Date().toISOString(),
      };

      analytics?.capture(eventName, enhancedProperties);

      // Also track as a general campaign event for easier analysis
      analytics?.capture('halloween_campaign_event', {
        event_type: eventName,
        ...enhancedProperties,
      });
    };

    // Make tracking function globally available
    window.trackHalloweenEvent = trackHalloweenEvent;

    // Cleanup on unmount
    return () => {
      if (window.trackHalloweenEvent) {
        delete (window as any).trackHalloweenEvent;
      }
    };
  }, [pathname, user, session]);

  // Track user properties for Halloween campaign
  useEffect(() => {
    if (user && pathname?.includes('halloween-2025')) {
      analytics?.setPersonProperties({
        halloween_campaign_participant: true,
        halloween_first_visit: new Date().toISOString(),
        halloween_page_views: 1, // This will be incremented on subsequent visits
      });
    }
  }, [user, pathname]);

  return null;
};

// Helper functions to track common Halloween events
export const halloweenTracking = {
  // Phantom Points tracking
  awardPhantomPoints: (points: number, action: string) => {
    const currentPoints = parseInt(localStorage.getItem('halloween-phantom-points') || '100');
    const newTotal = currentPoints + points;

    if (window.trackHalloweenEvent) {
      window.trackHalloweenEvent('phantom_points_earned', {
        points,
        action,
        total_points: newTotal,
      });
    }
  },

  // Spook Sparks tracking
  awardSpookSparks: (sparks: number, action: string) => {
    const saved = JSON.parse(localStorage.getItem('halloween-phantom-points') || '{"spookSparks": 0}');
    const newTotal = (saved.spookSparks || 0) + sparks;

    if (window.trackHalloweenEvent) {
      window.trackHalloweenEvent('spook_sparks_earned', {
        sparks,
        action,
        total_sparks: newTotal,
      });
    }
  },

  // CTA tracking
  trackCTAClick: (ctaText: string, location: string) => {
    if (window.trackHalloweenEvent) {
      window.trackHalloweenEvent('hero_cta_clicked', {
        cta_text: ctaText,
        location,
      });
    }
  },

  // Design tracking
  trackDesignStarted: (productId: string, productTitle: string, phantomPoints: number) => {
    if (window.trackHalloweenEvent) {
      window.trackHalloweenEvent('product_design_started', {
        product_id: productId,
        product_title: productTitle,
        phantom_points_earned: phantomPoints,
      });
    }
  },

  // Showdown tracking
  trackShowdownVote: (entryId: string, designer: string, designTitle: string, voteCount: number) => {
    if (window.trackHalloweenEvent) {
      window.trackHalloweenEvent('showdown_vote_cast', {
        entry_id: entryId,
        designer,
        design_title: designTitle,
        vote_count: voteCount,
      });
    }
  },

  // Cauldron tracking
  trackCauldronPrompt: (difficulty: string, promptTitle: string, phantomPoints: number) => {
    if (window.trackHalloweenEvent) {
      window.trackHalloweenEvent('cauldron_prompt_generated', {
        difficulty,
        prompt_title: promptTitle,
        phantom_points_awarded: phantomPoints,
      });
    }
  },
};