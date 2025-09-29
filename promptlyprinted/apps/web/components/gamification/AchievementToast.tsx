'use client';

import { useState, useEffect } from 'react';
import { Card } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { X, Gift, Sparkles } from 'lucide-react';
import { type Achievement } from '@/lib/gamification';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
  onClaim?: () => void;
}

export function AchievementToast({ achievement, onClose, onClaim }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClaim = () => {
    if (onClaim) {
      onClaim();
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'
      }`}
    >
      <Card className="p-4 max-w-sm bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-800" />
            </div>
            <div>
              <h4 className="font-bold text-yellow-800">Achievement Unlocked!</h4>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Achievement Details */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{achievement.badge.icon}</div>
            <div>
              <h5 className="font-semibold text-gray-800">{achievement.name}</h5>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
          </div>

          {/* Reward */}
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-4 h-4 text-orange-500" />
              <span className="font-medium text-gray-800">Your Reward:</span>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {achievement.reward.value}
            </Badge>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleClaim}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
          >
            Claim Reward
          </Button>
        </div>
      </Card>
    </div>
  );
}