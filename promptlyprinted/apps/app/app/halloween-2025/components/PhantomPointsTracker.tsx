'use client';

import { useState, useEffect } from 'react';
import { Ghost, Sparkles, Zap } from 'lucide-react';

interface PhantomPoints {
  phantomPoints: number;
  spookSparks: number;
  pumpkinTokens: number;
}

export const PhantomPointsTracker = () => {
  const [points, setPoints] = useState<PhantomPoints>({
    phantomPoints: 100, // Welcome bonus
    spookSparks: 0,
    pumpkinTokens: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load points from localStorage on mount
    const savedPoints = localStorage.getItem('halloween-phantom-points');
    if (savedPoints) {
      setPoints(JSON.parse(savedPoints));
    }
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Save points to localStorage whenever they change
    localStorage.setItem('halloween-phantom-points', JSON.stringify(points));
  }, [points]);

  const addPoints = (type: keyof PhantomPoints, amount: number) => {
    setPoints(prev => ({
      ...prev,
      [type]: prev[type] + amount
    }));
  };

  // Expose addPoints function globally for other components to use
  useEffect(() => {
    (window as any).addPhantomPoints = addPoints;
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3 shadow-lg transition-all duration-300 hover:scale-105">
      <div className="flex items-center gap-4 text-white text-sm">
        {/* Phantom Points */}
        <div className="flex items-center gap-1">
          <Ghost className="w-4 h-4 text-purple-300" />
          <span className="font-semibold">{points.phantomPoints}</span>
        </div>

        {/* Spook Sparks */}
        <div className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="font-semibold">{points.spookSparks}</span>
        </div>

        {/* Pumpkin Tokens */}
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-orange-300" />
          <span className="font-semibold">{points.pumpkinTokens}</span>
        </div>
      </div>

      {/* Welcome message for new users */}
      {points.phantomPoints === 100 && points.spookSparks === 0 && points.pumpkinTokens === 0 && (
        <div className="text-xs text-purple-200 mt-1 animate-pulse">
          Welcome bonus: 100 👻 Phantom Points!
        </div>
      )}
    </div>
  );
};