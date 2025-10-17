/**
 * Post-Purchase Flow Integration
 *
 * Handles the flow after a user completes a purchase from the style quiz funnel:
 * 1. Award points for purchase
 * 2. Submit design to competition (if applicable)
 * 3. Show leaderboard position
 * 4. Suggest share actions
 */

import { prisma } from './prisma';
import {
  awardCompetitionPoints,
  COMPETITION_POINTS,
  updateStreak,
  getUserRank
} from './gamification';

export interface PurchaseFlowData {
  userId: string;
  orderId: number;
  designId: number;
  campaign?: string;
  source?: string;
  style?: string;
}

export interface PostPurchaseResult {
  pointsEarned: number;
  newLevel: number;
  newRank: number;
  competitionEntry?: {
    id: string;
    competitionId: string;
    competitionName: string;
  };
  achievements: string[];
}

/**
 * Handle all post-purchase actions after successful order
 */
export async function handlePostPurchase(
  data: PurchaseFlowData
): Promise<PostPurchaseResult> {
  const { userId, orderId, designId, campaign, source, style } = data;

  // Initialize result
  const result: PostPurchaseResult = {
    pointsEarned: 0,
    newLevel: 1,
    newRank: 0,
    achievements: [],
  };

  try {
    // 1. Update daily streak
    await updateStreak(userId);

    // 2. Award points for design creation and order
    const designPoints = await awardCompetitionPoints(
      userId,
      COMPETITION_POINTS.DESIGN_SUBMISSION,
      'design_submission',
      'Created design from style quiz'
    );

    result.pointsEarned += COMPETITION_POINTS.DESIGN_SUBMISSION;
    result.newLevel = designPoints.level;

    // 3. Check if this is their first design (achievement)
    const designCount = await prisma.design.count({
      where: { userId },
    });

    if (designCount === 1) {
      const firstDesignPoints = await awardCompetitionPoints(
        userId,
        COMPETITION_POINTS.FIRST_DESIGN,
        'first_design',
        'Created your first design!'
      );
      result.pointsEarned += COMPETITION_POINTS.FIRST_DESIGN;
      result.newLevel = firstDesignPoints.level;
      result.achievements.push('First Design Created');
    }

    // 4. Check if campaign has active competition
    if (campaign) {
      const competition = await prisma.competition.findFirst({
        where: {
          funnelTag: campaign,
          isActive: true,
          endDate: { gte: new Date() },
        },
      });

      // 5. Auto-submit to competition if one exists
      if (competition) {
        // Check if already submitted
        const existingEntry = await prisma.competitionEntry.findUnique({
          where: {
            competitionId_designId: {
              competitionId: competition.id,
              designId: designId,
            },
          },
        });

        if (!existingEntry) {
          const entry = await prisma.competitionEntry.create({
            data: {
              competitionId: competition.id,
              userId,
              designId,
            },
          });

          // Award competition entry points
          const competitionPoints = await awardCompetitionPoints(
            userId,
            COMPETITION_POINTS.COMPETITION_ENTRY,
            'competition_entry',
            `Entered ${competition.theme} competition`
          );

          result.pointsEarned += COMPETITION_POINTS.COMPETITION_ENTRY;
          result.newLevel = competitionPoints.level;
          result.competitionEntry = {
            id: entry.id,
            competitionId: competition.id,
            competitionName: competition.theme,
          };

          // Check if first competition entry
          const competitionEntryCount = await prisma.competitionEntry.count({
            where: { userId },
          });

          if (competitionEntryCount === 1) {
            const firstCompPoints = await awardCompetitionPoints(
              userId,
              COMPETITION_POINTS.FIRST_COMPETITION,
              'first_competition',
              'Entered your first competition!'
            );
            result.pointsEarned += COMPETITION_POINTS.FIRST_COMPETITION;
            result.newLevel = firstCompPoints.level;
            result.achievements.push('First Competition Entry');
          }
        }
      }
    }

    // 6. Get user's new rank
    result.newRank = await getUserRank(userId);

    // 7. Track analytics
    await prisma.analytics.create({
      data: {
        userId,
        eventName: 'post_purchase_flow_completed',
        eventData: {
          orderId,
          designId,
          campaign,
          source,
          style,
          pointsEarned: result.pointsEarned,
          newLevel: result.newLevel,
          newRank: result.newRank,
          achievements: result.achievements,
        },
      },
    });

    return result;
  } catch (error) {
    console.error('Error in post-purchase flow:', error);
    throw error;
  }
}

/**
 * Get shareable content for social media
 */
export function getShareableContent(data: {
  designUrl: string;
  competitionName?: string;
  rank?: number;
  style?: string;
}): {
  twitter: string;
  facebook: string;
  instagram: string;
} {
  const { designUrl, competitionName, rank, style } = data;

  const baseText = competitionName
    ? `Just entered the ${competitionName} with my AI-designed apparel! 🎨✨`
    : `Just created my custom AI-designed ${style || 'style'} apparel! 🎨✨`;

  const rankText = rank ? ` Currently ranked #${rank} on the leaderboard! 🏆` : '';
  const ctaText = ' Create yours at promptlyprinted.com';

  const twitterText = `${baseText}${rankText}${ctaText}`;
  const facebookText = `${baseText}${rankText}\n\n${ctaText}`;
  const instagramText = `${baseText}${rankText}\n\n📸 Link in bio to create your own!`;

  return {
    twitter: encodeURIComponent(twitterText),
    facebook: encodeURIComponent(facebookText),
    instagram: instagramText, // Instagram doesn't support URL sharing
  };
}

/**
 * Get recommended next actions for user
 */
export function getRecommendedActions(data: {
  achievements: string[];
  competitionEntry?: boolean;
  style?: string;
}): Array<{
  id: string;
  title: string;
  description: string;
  action: string;
  icon: string;
  points: number;
}> {
  const { achievements, competitionEntry, style } = data;

  const actions = [];

  // Always suggest sharing
  actions.push({
    id: 'share_design',
    title: 'Share Your Design',
    description: 'Post on social media and inspire others!',
    action: 'Share on Social Media',
    icon: '📱',
    points: COMPETITION_POINTS.LIKE_RECEIVED * 5, // Potential points from likes
  });

  // Suggest exploring competition if they entered one
  if (competitionEntry) {
    actions.push({
      id: 'view_leaderboard',
      title: 'Check Competition Leaderboard',
      description: 'See how your design ranks against others',
      action: 'View Leaderboard',
      icon: '🏆',
      points: 0,
    });

    actions.push({
      id: 'vote_others',
      title: 'Vote for Other Designs',
      description: 'Support fellow creators and earn points',
      action: 'Vote Now',
      icon: '👍',
      points: COMPETITION_POINTS.VOTE_GIVEN,
    });
  }

  // Suggest creating another design
  actions.push({
    id: 'create_another',
    title: 'Design Another Style',
    description: `Try a different ${style ? 'style beyond ' + style : 'aesthetic'}`,
    action: 'Take Quiz Again',
    icon: '🎨',
    points: COMPETITION_POINTS.DESIGN_SUBMISSION,
  });

  // If they got achievements, suggest checking profile
  if (achievements.length > 0) {
    actions.push({
      id: 'view_achievements',
      title: 'View Your Achievements',
      description: `You unlocked ${achievements.length} new achievement${achievements.length > 1 ? 's' : ''}!`,
      action: 'View Profile',
      icon: '⭐',
      points: 0,
    });
  }

  return actions;
}

/**
 * Get style tribe statistics for social proof
 */
export async function getStyleTribeStats(style: string): Promise<{
  totalMembers: number;
  designsCreated: number;
  topCreators: Array<{
    name: string;
    image: string | null;
    designCount: number;
  }>;
}> {
  // Get designs matching this style (based on campaign or source data)
  const designs = await prisma.design.findMany({
    where: {
      // You'd need to add style metadata to Design model
      // For now, we'll use competition entries as proxy
      competitionEntries: {
        some: {
          competition: {
            description: {
              contains: style,
            },
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Count unique users
  const uniqueUsers = new Set(designs.map(d => d.userId));

  // Group by user and count designs
  const userDesignCounts = designs.reduce((acc, design) => {
    const userId = design.userId;
    if (!acc[userId]) {
      acc[userId] = {
        name: design.user.name || 'Anonymous',
        image: design.user.image,
        count: 0,
      };
    }
    acc[userId].count++;
    return acc;
  }, {} as Record<string, { name: string; image: string | null; count: number }>);

  // Get top 3 creators
  const topCreators = Object.values(userDesignCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(u => ({
      name: u.name,
      image: u.image,
      designCount: u.count,
    }));

  return {
    totalMembers: uniqueUsers.size,
    designsCreated: designs.length,
    topCreators,
  };
}
