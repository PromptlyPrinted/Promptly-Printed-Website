import { NextRequest, NextResponse } from 'next/server';
import { type UserStats } from '@/lib/gamification';

// Mock database - replace with your actual database
const userStatsDB = new Map<string, UserStats>();

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session/auth
    const userId = request.headers.get('user-id') || 'demo-user';

    const stats = userStatsDB.get(userId);

    if (!stats) {
      return NextResponse.json(
        { error: 'User stats not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const stats: UserStats = await request.json();

    // TODO: Get user from session/auth
    const userId = stats.userId || 'demo-user';

    // Validate required fields
    if (!stats.email || !stats.userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to mock database - replace with your actual database
    userStatsDB.set(userId, {
      ...stats,
      userId,
    });

    // Track achievement unlocks in PostHog
    if (stats.badges.length > 0) {
      await trackAchievements(stats);
    }

    return NextResponse.json({
      success: true,
      stats: userStatsDB.get(userId),
    });
  } catch (error) {
    console.error('Error saving user stats:', error);
    return NextResponse.json(
      { error: 'Failed to save user stats' },
      { status: 500 }
    );
  }
}

async function trackAchievements(stats: UserStats) {
  try {
    // Track badge unlocks in PostHog
    if (process.env.POSTHOG_API_KEY) {
      const recentBadges = stats.badges.filter(badge => {
        const unlockTime = new Date(badge.unlockedAt).getTime();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return unlockTime > fiveMinutesAgo;
      });

      for (const badge of recentBadges) {
        await fetch('https://app.posthog.com/capture/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.POSTHOG_API_KEY,
            event: 'achievement_unlocked',
            properties: {
              user_id: stats.userId,
              badge_id: badge.id,
              badge_name: badge.name,
              badge_category: badge.category,
              user_tier: stats.tier,
              total_points: stats.points,
              designs_created: stats.designsCreated,
              orders_completed: stats.ordersCompleted,
            },
            timestamp: badge.unlockedAt,
          }),
        });
      }
    }

    // Send achievement notifications via email
    await sendAchievementEmails(stats);
  } catch (error) {
    console.error('Failed to track achievements:', error);
  }
}

async function sendAchievementEmails(stats: UserStats) {
  try {
    if (!process.env.RESEND_API_KEY) return;

    const recentBadges = stats.badges.filter(badge => {
      const unlockTime = new Date(badge.unlockedAt).getTime();
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      return unlockTime > oneHourAgo;
    });

    if (recentBadges.length === 0) return;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'achievements@promptlyprinted.com',
        to: stats.email,
        subject: `🎉 You unlocked ${recentBadges.length} new achievement${recentBadges.length > 1 ? 's' : ''}!`,
        html: getAchievementEmailTemplate(stats, recentBadges),
      }),
    });

    if (!response.ok) {
      console.error('Failed to send achievement email:', await response.text());
    }
  } catch (error) {
    console.error('Error sending achievement email:', error);
  }
}

function getAchievementEmailTemplate(stats: UserStats, badges: UserStats['badges']): string {
  const badgesList = badges.map(badge =>
    `<li style="margin: 10px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
      <div style="font-size: 24px; margin-bottom: 5px;">${badge.icon}</div>
      <strong>${badge.name}</strong><br>
      <span style="color: #666;">${badge.description}</span>
    </li>`
  ).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF7900;">🎉 Achievement Unlocked!</h1>
          <p style="font-size: 18px; color: #666;">Congratulations on your progress!</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2>Your New Badges:</h2>
          <ul style="list-style: none; padding: 0;">
            ${badgesList}
          </ul>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3>Your Progress:</h3>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>🎨 Designs Created:</span>
              <strong>${stats.designsCreated}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>🛍️ Orders Completed:</span>
              <strong>${stats.ordersCompleted}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>⭐ Current Tier:</span>
              <strong style="text-transform: capitalize; color: #FF7900;">${stats.tier}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>🏆 Total Points:</span>
              <strong>${stats.points}</strong>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://promptlyprinted.com/design?utm_source=email&utm_campaign=achievement"
               style="background: #FF7900; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Create Your Next Design →
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          <p>Keep creating amazing designs!</p>
          <p>The Promptly Printed Team</p>
        </div>
      </body>
    </html>
  `;
}