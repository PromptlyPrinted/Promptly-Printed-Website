'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@repo/auth/client';
import {
  type UserStats,
  type Achievement,
  checkAchievements,
  calculateTier,
  calculatePoints
} from '@/lib/gamification';

export function useGamification() {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadUserStats();
    } else {
      setLoading(false);
    }
  }, [session]);

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats');
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      } else {
        // Initialize new user stats
        const initialStats: UserStats = {
          userId: session?.user?.id || '',
          email: session?.user?.email || '',
          designsCreated: 0,
          ordersCompleted: 0,
          streakDays: 0,
          lastActiveDate: new Date().toISOString(),
          totalSpent: 0,
          referralsComplete: 0,
          badges: [],
          tier: 'bronze',
          points: 0,
        };
        setUserStats(initialStats);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates: Partial<UserStats>, campaignId?: string) => {
    if (!userStats) return;

    const newStats = { ...userStats, ...updates };
    newStats.tier = calculateTier(newStats);
    newStats.points = calculatePoints(newStats);

    // Check for new achievements
    const achievements = checkAchievements(newStats, campaignId);
    if (achievements.length > 0) {
      setNewAchievements(achievements);

      // Add new badges to user stats
      const newBadges = achievements.map(achievement => ({
        ...achievement.badge,
        unlockedAt: new Date().toISOString(),
      }));
      newStats.badges = [...newStats.badges, ...newBadges];
    }

    setUserStats(newStats);

    // Save to backend
    try {
      await fetch('/api/gamification/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStats),
      });
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  };

  const trackDesignCreated = (campaignId?: string) => {
    if (!userStats) return;

    updateStats({
      designsCreated: userStats.designsCreated + 1,
      lastActiveDate: new Date().toISOString(),
    }, campaignId);

    // Track in PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('design_created', {
        total_designs: userStats.designsCreated + 1,
        campaign_id: campaignId,
      });
    }
  };

  const trackOrderCompleted = (orderValue: number, campaignId?: string) => {
    if (!userStats) return;

    updateStats({
      ordersCompleted: userStats.ordersCompleted + 1,
      totalSpent: userStats.totalSpent + orderValue,
      lastActiveDate: new Date().toISOString(),
    }, campaignId);

    // Track in PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('order_completed', {
        order_value: orderValue,
        total_orders: userStats.ordersCompleted + 1,
        total_spent: userStats.totalSpent + orderValue,
        campaign_id: campaignId,
      });
    }
  };

  const trackStreak = () => {
    if (!userStats) return;

    const today = new Date().toDateString();
    const lastActive = new Date(userStats.lastActiveDate).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    let newStreakDays = userStats.streakDays;

    if (lastActive === yesterday) {
      // Continue streak
      newStreakDays += 1;
    } else if (lastActive !== today) {
      // Reset streak
      newStreakDays = 1;
    }

    updateStats({
      streakDays: newStreakDays,
      lastActiveDate: new Date().toISOString(),
    });
  };

  const trackReferral = () => {
    if (!userStats) return;

    updateStats({
      referralsComplete: userStats.referralsComplete + 1,
    });
  };

  const dismissAchievement = (achievementId: string) => {
    setNewAchievements(prev =>
      prev.filter(achievement => achievement.id !== achievementId)
    );
  };

  return {
    userStats,
    newAchievements,
    loading,
    trackDesignCreated,
    trackOrderCompleted,
    trackStreak,
    trackReferral,
    dismissAchievement,
  };
}