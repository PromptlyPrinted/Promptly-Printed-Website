'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Card } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { X, Mail, Gift, Sparkles } from 'lucide-react';
import { type Campaign } from '@/lib/campaigns';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  utmSource?: string;
  trigger?: 'exit-intent' | 'time-based' | 'design-completed' | 'manual';
}

export function LeadCaptureModal({
  isOpen,
  onClose,
  campaign,
  utmSource,
  trigger = 'time-based'
}: LeadCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track lead capture event
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('lead_captured', {
          email,
          campaign_id: campaign.id,
          utm_source: utmSource,
          trigger,
          timestamp: new Date().toISOString(),
        });
      }

      // Send to email automation system
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          campaignId: campaign.id,
          utmSource,
          trigger,
          metadata: {
            themes: campaign.themes,
            location: 'detected', // Will be enhanced
          },
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to capture lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalContent = () => {
    switch (trigger) {
      case 'exit-intent':
        return {
          title: "Don't lose your masterpiece! 🎨",
          subtitle: "Get your design ideas via email and unlock exclusive content",
          incentive: "Early access to new themes + 15% off your first order",
        };
      case 'design-completed':
        return {
          title: "Love your design? Save it forever! 💾",
          subtitle: "Get high-res downloads and design inspiration weekly",
          incentive: "Free design downloads + weekly inspiration",
        };
      default:
        return {
          title: `Get exclusive ${campaign.name} inspiration! ✨`,
          subtitle: "Join thousands creating amazing designs",
          incentive: `${campaign.discounts?.percentage || 20}% off + design tips`,
        };
    }
  };

  const { title, subtitle, incentive } = getModalContent();

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full p-6 text-center relative">
          <div className="mb-4">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ backgroundColor: campaign.colors.primary }}
            >
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">
              You're all set! 🎉
            </h3>
            <p className="text-gray-600">
              Check your email for your welcome gift and design inspiration!
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: campaign.colors.primary }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{subtitle}</p>

          <Badge
            className="mb-4"
            style={{
              backgroundColor: campaign.colors.secondary,
              color: 'white'
            }}
          >
            <Gift className="w-4 h-4 mr-1" />
            {incentive}
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-center"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            style={{
              backgroundColor: campaign.colors.primary,
              borderColor: campaign.colors.primary,
            }}
          >
            {isSubmitting ? 'Joining...' : 'Get My Design Inspiration'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </form>

        {/* Social proof */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Join 12,847 designers already creating amazing designs
          </p>
        </div>
      </Card>
    </div>
  );
}