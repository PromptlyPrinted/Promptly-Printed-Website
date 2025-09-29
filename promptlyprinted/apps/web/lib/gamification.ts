export interface UserStats {
  userId: string;
  email: string;
  designsCreated: number;
  ordersCompleted: number;
  streakDays: number;
  lastActiveDate: string;
  totalSpent: number;
  referralsComplete: number;
  badges: Badge[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'design' | 'purchase' | 'social' | 'seasonal' | 'achievement';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: {
    type: 'designs_created' | 'orders_completed' | 'streak_days' | 'total_spent' | 'referrals' | 'seasonal';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  };
  reward: {
    type: 'discount' | 'early_access' | 'exclusive_theme' | 'free_design';
    value: string;
  };
  badge: Omit<Badge, 'unlockedAt'>;
}

export const achievements: Achievement[] = [
  // Design Achievements
  {
    id: 'first_design',
    name: 'First Creation',
    description: 'Created your first design',
    requirement: { type: 'designs_created', value: 1 },
    reward: { type: 'discount', value: '10% off next order' },
    badge: {
      id: 'first_design_badge',
      name: '🎨 First Creation',
      description: 'Welcome to the design world!',
      icon: '🎨',
      category: 'design',
    },
  },
  {
    id: 'design_streak_3',
    name: 'Design Streak',
    description: 'Designed for 3 days in a row',
    requirement: { type: 'streak_days', value: 3 },
    reward: { type: 'discount', value: '15% off next order' },
    badge: {
      id: 'streak_3_badge',
      name: '🔥 3-Day Streak',
      description: 'Consistency is key!',
      icon: '🔥',
      category: 'achievement',
    },
  },
  {
    id: 'design_master',
    name: 'Design Master',
    description: 'Created 10 designs',
    requirement: { type: 'designs_created', value: 10 },
    reward: { type: 'exclusive_theme', value: 'Master Collection' },
    badge: {
      id: 'master_badge',
      name: '👑 Design Master',
      description: 'A true creative force!',
      icon: '👑',
      category: 'design',
    },
  },

  // Purchase Achievements
  {
    id: 'first_purchase',
    name: 'First Order',
    description: 'Completed your first order',
    requirement: { type: 'orders_completed', value: 1 },
    reward: { type: 'early_access', value: 'Next seasonal campaign' },
    badge: {
      id: 'first_purchase_badge',
      name: '🛍️ First Purchase',
      description: 'Welcome to the family!',
      icon: '🛍️',
      category: 'purchase',
    },
  },
  {
    id: 'loyal_customer',
    name: 'Loyal Customer',
    description: 'Completed 5 orders',
    requirement: { type: 'orders_completed', value: 5 },
    reward: { type: 'discount', value: '20% off all future orders' },
    badge: {
      id: 'loyal_badge',
      name: '💎 Loyal Customer',
      description: 'A valued member of our community!',
      icon: '💎',
      category: 'purchase',
    },
  },

  // Seasonal Achievements
  {
    id: 'halloween_creator',
    name: 'Halloween Creator',
    description: 'Created a Halloween design',
    requirement: { type: 'seasonal', value: 1, timeframe: 'seasonal' },
    reward: { type: 'exclusive_theme', value: 'Spooky Special Collection' },
    badge: {
      id: 'halloween_badge',
      name: '🎃 Halloween Creator',
      description: 'Spooky season specialist!',
      icon: '🎃',
      category: 'seasonal',
    },
  },
  {
    id: 'christmas_designer',
    name: 'Christmas Designer',
    description: 'Created a Christmas design',
    requirement: { type: 'seasonal', value: 1, timeframe: 'seasonal' },
    reward: { type: 'free_design', value: 'Free holiday design template' },
    badge: {
      id: 'christmas_badge',
      name: '🎄 Christmas Designer',
      description: 'Spreading holiday cheer!',
      icon: '🎄',
      category: 'seasonal',
    },
  },

  // Social Achievements
  {
    id: 'social_sharer',
    name: 'Social Sharer',
    description: 'Shared your design on social media',
    requirement: { type: 'referrals', value: 1 },
    reward: { type: 'discount', value: '10% off + friend gets 10% off' },
    badge: {
      id: 'sharer_badge',
      name: '📱 Social Sharer',
      description: 'Spreading the creativity!',
      icon: '📱',
      category: 'social',
    },
  },
];

export function calculateTier(stats: UserStats): UserStats['tier'] {
  if (stats.ordersCompleted >= 10 || stats.totalSpent >= 500) return 'platinum';
  if (stats.ordersCompleted >= 5 || stats.totalSpent >= 200) return 'gold';
  if (stats.ordersCompleted >= 3 || stats.totalSpent >= 100) return 'silver';
  return 'bronze';
}

export function calculatePoints(stats: UserStats): number {
  let points = 0;
  points += stats.designsCreated * 10; // 10 points per design
  points += stats.ordersCompleted * 50; // 50 points per order
  points += stats.streakDays * 5; // 5 points per streak day
  points += stats.referralsComplete * 25; // 25 points per referral
  points += stats.badges.length * 20; // 20 points per badge
  return points;
}

export function checkAchievements(stats: UserStats, campaignId?: string): Achievement[] {
  const unlockedAchievements: Achievement[] = [];

  for (const achievement of achievements) {
    // Skip if user already has this badge
    if (stats.badges.some(badge => badge.id === achievement.badge.id)) {
      continue;
    }

    let isUnlocked = false;
    const req = achievement.requirement;

    switch (req.type) {
      case 'designs_created':
        isUnlocked = stats.designsCreated >= req.value;
        break;
      case 'orders_completed':
        isUnlocked = stats.ordersCompleted >= req.value;
        break;
      case 'streak_days':
        isUnlocked = stats.streakDays >= req.value;
        break;
      case 'total_spent':
        isUnlocked = stats.totalSpent >= req.value;
        break;
      case 'referrals':
        isUnlocked = stats.referralsComplete >= req.value;
        break;
      case 'seasonal':
        // Check if current campaign matches seasonal achievement
        if (campaignId?.includes('halloween') && achievement.id === 'halloween_creator') {
          isUnlocked = true;
        } else if (campaignId?.includes('christmas') && achievement.id === 'christmas_designer') {
          isUnlocked = true;
        }
        break;
    }

    if (isUnlocked) {
      unlockedAchievements.push(achievement);
    }
  }

  return unlockedAchievements;
}

export function getTierBenefits(tier: UserStats['tier']) {
  const benefits = {
    bronze: {
      discount: 5,
      earlyAccess: false,
      exclusiveDesigns: false,
      prioritySupport: false,
    },
    silver: {
      discount: 10,
      earlyAccess: true,
      exclusiveDesigns: false,
      prioritySupport: false,
    },
    gold: {
      discount: 15,
      earlyAccess: true,
      exclusiveDesigns: true,
      prioritySupport: false,
    },
    platinum: {
      discount: 20,
      earlyAccess: true,
      exclusiveDesigns: true,
      prioritySupport: true,
    },
  };

  return benefits[tier];
}