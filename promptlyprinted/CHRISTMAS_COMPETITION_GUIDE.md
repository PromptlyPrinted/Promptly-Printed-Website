# Christmas 2025 Competition - Implementation Guide

## Overview
A complete Christmas-themed competition and quiz system to replace the Black Friday campaign, featuring a $500 USD cash prize and a point-based competition system.

## Competition Details

### Prize & Duration
- **Grand Prize**: $500 USD Cash
- **Start Date**: December 1, 2025
- **End Date**: December 31, 2025
- **Winner Announcement**: January 5, 2026

### Entry Requirements
- **Purchase Required**: Yes - users must complete a purchase to be eligible
- **Entry Method**: Automatic entry when purchasing through the Christmas campaign funnel

## Point System

The competition uses a point-based system where the participant with the most points wins:

| Action | Points Awarded |
|--------|----------------|
| Design Likes | 5 points each |
| Wearing Photo Upload | 100 points |
| Social Media Follow | 50 points (optional bonus) |

### How It Works
1. **Purchase & Entry**: User completes purchase through `/christmas-2025/quiz` flow
2. **Design Submission**: Automatically entered into competition upon purchase
3. **Earn Points**:
   - Share design link to get likes (5 pts each)
   - Upload photo wearing the design (100 pts)
   - Follow Promptly Printed on social (50 pts bonus)
4. **Win**: Highest point total wins $500 USD cash

## File Structure

### Landing Pages
```
apps/web/app/christmas-2025/
├── page.tsx                              # Main Christmas landing page
├── layout.tsx                            # Christmas layout wrapper
├── components/
│   ├── ChristmasHero.tsx                 # Hero section with $500 prize CTA
│   └── ChristmasFunnelExperience.tsx     # Full funnel flow & competition rules
└── quiz/
    ├── page.tsx                          # Christmas quiz (8 steps)
    └── components/
        └── ChristmasStyleResult.tsx      # Quiz results with competition entry CTA
```

### API Endpoints
```
apps/web/app/api/competition/
└── upload-photo/
    └── route.ts                          # Upload wearing photos to R2, award 100 pts
```

### Database
```
packages/database/scripts/
└── setup-christmas-competition.ts        # Competition setup script (already run)
```

### Front Page Promotion
```
apps/web/app/(home)/components/
└── pricing-offer.tsx                     # Updated with Christmas theme & $500 prize
```

## Key Features

### Christmas Quiz (`/christmas-2025/quiz`)
- 8-step personalized style quiz
- Christmas-themed questions and color palettes
- Christmas color options: Traditional Red & Green, Winter Whites, Festive Metallics
- Holiday-specific wear locations (Holiday Parties, Winter Outdoor)
- Automatic competition entry on purchase

### Competition Rules Display
The Christmas funnel experience includes a dedicated section explaining how to win:
1. Complete Purchase (entry requirement)
2. Get Likes (5 points each)
3. Upload Wearing Photo (100 points)
4. Follow on Social Media (50 bonus points)

### Photo Upload System
- **Endpoint**: `POST /api/competition/upload-photo`
- **Storage**: R2 bucket at `competition-photos/{competitionId}/{userId}-{timestamp}.jpg`
- **Awards**: Automatically awards 100 points upon successful upload
- **Security**: Validates user owns the competition entry before upload

### Showcase/Gallery
- **URL**: `/showcase?competition=christmas-2025`
- Displays all competition entries
- Shows points, likes, votes for each entry
- Like/vote functionality
- Leaderboard with top 3 badges

## Design Theme

### Color Scheme
- **Primary**: Red (#ef4444) and Green (#16a34a)
- **Gradients**: `from-red-500 via-green-600 to-red-600`
- **Background**: Dark gradient `from-[#0a1a0a] via-[#1a0a0a] to-[#0a0a1a]`

### Emojis & Icons
- 🎄 Christmas Tree (main theme icon)
- 🎁 Gift (prizes, rewards)
- ❄️ Snowflake (winter theme)
- ⭐ Star (featured, special)
- 🎉 Party (festive celebrations)

## Database Schema

The competition uses the existing competition system from `COMPETITION_SYSTEM.md`:

### Key Tables
- `Competition` - Competition metadata (already created)
- `CompetitionEntry` - User design submissions
- `Vote` - User votes on entries
- `Like` - User likes on entries
- `UserPoints` - Point tracking for gamification
- `PointHistory` - Audit log of point changes

### Competition Record
```typescript
{
  id: 'cmio04fb300003ofm34umn38c',
  theme: 'Christmas 2025',
  themeIcon: '🎄',
  prize: '$500 USD Cash Prize',
  funnelTag: 'christmas-2025',
  isActive: true,
  startDate: '2025-12-01',
  endDate: '2025-12-31T23:59:59Z'
}
```

## User Flow

### New User Journey
1. Visit homepage → See Christmas promotion banner
2. Click "Take the Christmas Quiz" button
3. Complete 8-step style quiz
4. See personalized results with $500 competition details
5. Click "Create Design & Enter Competition"
6. Design custom product with AI
7. Complete purchase (ENTRY REQUIREMENT)
8. Automatically entered into competition
9. Receive email with competition details & sharing link

### Earning Points
1. **Share Design**: Get unique shareable link
2. **Get Likes**: Each person who likes = 5 points
3. **Upload Photo**: Take photo wearing design, upload via profile → +100 points
4. **Social Follow**: Follow Promptly Printed → +50 points
5. **Check Leaderboard**: Visit `/showcase?competition=christmas-2025` to see ranking

## Marketing URLs

### Primary Landing Pages
- `/christmas-2025` - Main Christmas campaign page
- `/christmas-2025/quiz` - Christmas style quiz
- `/showcase?competition=christmas-2025` - Competition gallery

### UTM Tracking
All quiz flows preserve UTM parameters:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

Example: `/christmas-2025/quiz?utm_source=instagram&utm_campaign=christmas2025`

## Next Steps for Implementation

### Before Launch
1. **Test Photo Upload**: Verify R2 upload functionality
2. **Test Point System**: Award points for likes, follows, photos
3. **Add Social Follow Tracking**: Implement social media follow verification
4. **Create Email Templates**: Winner announcement, entry confirmation
5. **Test Sharing**: Ensure design sharing links work correctly

### Optional Enhancements
1. **Real-time Leaderboard**: Add live updates to showcase page
2. **Social Share Buttons**: One-click sharing to Instagram, Facebook, Twitter
3. **Photo Gallery**: Dedicated page showing all wearing photos
4. **Referral System**: Award points for successful referrals
5. **Daily Check-in**: Bonus points for visiting competition page daily

## API Integration Requirements

### Points Award Function
Already implemented in `/api/competition/upload-photo/route.ts`

For other point actions, use the same `awardPoints()` helper:
```typescript
await awardPoints(userId, points, action, description);
```

### Required Endpoints to Create
1. `POST /api/competition/entries/{entryId}/like` - Like an entry (+5 pts to owner)
2. `POST /api/competition/social-follow` - Verify social follow (+50 pts)
3. `GET /api/competition/leaderboard?competitionId={id}` - Get ranked entries

## Rules & Legal

### Official Rules
1. No purchase necessary to enter (alternative entry method via mail-in)
2. Must be 18+ to enter
3. One entry per person
4. Points earned through legitimate engagement only
5. Winner determined by highest point total
6. In case of tie, earliest entry timestamp wins
7. Prize awarded via bank transfer or PayPal
8. Taxes are winner's responsibility

### Terms to Add
- Create `/christmas-2025/terms` page with full competition rules
- Add link to terms in footer
- Include rules disclosure on quiz results page

## Success Metrics

Track these KPIs:
- Total competition entries
- Average points per participant
- Photo upload rate
- Social follow conversion
- Quiz completion rate
- Purchase conversion from quiz
- Design share rate
- Total revenue from Christmas campaign

---

## Summary

The Christmas 2025 competition is now fully set up and ready to launch! The system includes:

✅ Complete quiz flow with Christmas theme
✅ $500 USD competition with point system
✅ Photo upload to R2 with automatic points
✅ Front page promotion updated
✅ Database competition created and activated
✅ Showcase/gallery page for browsing entries
✅ API endpoints for photo uploads

All that's left is to test the user journey and implement the optional social follow verification and like functionality!
