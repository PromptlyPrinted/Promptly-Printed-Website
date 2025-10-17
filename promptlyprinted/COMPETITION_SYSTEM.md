# Competition & Gamification System - Implementation Guide

This document outlines the database schema, API endpoints, and gamification logic for the design competition system.

## Database Schema

### 1. Competitions Table
```prisma
model Competition {
  id           String   @id @default(cuid())
  theme        String
  themeIcon    String   // Emoji for the theme
  prize        String   // e.g., "$200"
  startDate    DateTime
  endDate      DateTime
  description  String
  funnelTag    String   @unique // e.g., "halloween-2025", "black-friday-2024"
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  entries      CompetitionEntry[]
  votes        Vote[]

  @@index([funnelTag])
  @@index([isActive, endDate])
}
```

### 2. Competition Entries Table
```prisma
model CompetitionEntry {
  id             String      @id @default(cuid())
  competitionId  String
  userId         String
  designId       String
  submittedAt    DateTime    @default(now())

  // Relations
  competition    Competition @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  design         Design      @relation(fields: [designId], references: [id], onDelete: Cascade)
  votes          Vote[]
  likes          Like[]

  @@unique([competitionId, designId])
  @@index([competitionId, userId])
}
```

### 3. Votes Table
```prisma
model Vote {
  id        String   @id @default(cuid())
  userId    String
  entryId   String
  competitionId String
  createdAt DateTime @default(now())

  // Relations
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  entry     CompetitionEntry  @relation(fields: [entryId], references: [id], onDelete: Cascade)
  competition Competition     @relation(fields: [competitionId], references: [id], onDelete: Cascade)

  @@unique([userId, entryId]) // One vote per user per entry
  @@index([entryId])
  @@index([competitionId])
}
```

### 4. Likes Table
```prisma
model Like {
  id        String   @id @default(cuid())
  userId    String
  entryId   String
  createdAt DateTime @default(now())

  // Relations
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  entry     CompetitionEntry  @relation(fields: [entryId], references: [id], onDelete: Cascade)

  @@unique([userId, entryId]) // One like per user per entry
  @@index([entryId])
}
```

### 5. User Points Table (Gamification)
```prisma
model UserPoints {
  id        String   @id @default(cuid())
  userId    String   @unique
  points    Int      @default(0)
  level     Int      @default(1)
  streak    Int      @default(0) // Consecutive days active
  updatedAt DateTime @updatedAt

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  history   PointHistory[]

  @@index([points]) // For leaderboard queries
}
```

### 6. Point History Table
```prisma
model PointHistory {
  id          String      @id @default(cuid())
  userId      String
  points      Int         // Can be positive or negative
  action      String      // e.g., "design_submission", "vote_received", "competition_win"
  description String?
  createdAt   DateTime    @default(now())

  // Relations
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userPoints  UserPoints  @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

### 7. Update User Model
```prisma
model User {
  // ... existing fields

  // New relations
  competitionEntries CompetitionEntry[]
  votes              Vote[]
  likes              Like[]
  userPoints         UserPoints?
  pointHistory       PointHistory[]
}
```

### 8. Update Design Model
```prisma
model Design {
  // ... existing fields

  // New relations
  competitionEntries CompetitionEntry[]
}
```

---

## Gamification Points System

### Point Values
```typescript
const POINTS = {
  // Design Actions
  DESIGN_SUBMISSION: 50,
  COMPETITION_ENTRY: 100,

  // Social Actions
  VOTE_RECEIVED: 10,
  LIKE_RECEIVED: 5,
  VOTE_GIVEN: 2,
  LIKE_GIVEN: 1,

  // Achievements
  FIRST_DESIGN: 100,
  FIRST_COMPETITION: 150,
  DAILY_LOGIN: 5,
  WEEKLY_STREAK: 50,

  // Competition Rewards
  FIRST_PLACE: 1000,
  SECOND_PLACE: 500,
  THIRD_PLACE: 250,
  TOP_10: 100,
}
```

### Level Calculation
```typescript
function calculateLevel(points: number): number {
  // Level up every 500 points
  return Math.floor(points / 500) + 1;
}
```

---

## API Endpoints

### 1. Get Current Competition
```typescript
// GET /api/competitions/current
export async function GET() {
  const competition = await prisma.competition.findFirst({
    where: {
      isActive: true,
      endDate: { gte: new Date() },
    },
    orderBy: { startDate: 'desc' },
  });

  return Response.json(competition);
}
```

### 2. Get Competition Leaderboard
```typescript
// GET /api/competitions/[competitionId]/leaderboard?limit=10
export async function GET(
  req: Request,
  { params }: { params: { competitionId: string } }
) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  const entries = await prisma.competitionEntry.findMany({
    where: { competitionId: params.competitionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          userPoints: true,
        },
      },
      design: {
        select: {
          id: true,
          imageUrl: true,
        },
      },
      _count: {
        select: {
          votes: true,
          likes: true,
        },
      },
    },
    take: limit,
  });

  // Calculate points: votes * 10 + likes * 5
  const leaderboard = entries
    .map((entry, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      username: entry.user.name,
      avatar: entry.user.image,
      designId: entry.design.id,
      designImage: entry.design.imageUrl,
      votes: entry._count.votes,
      likes: entry._count.likes,
      points: entry._count.votes * 10 + entry._count.likes * 5,
      badge: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null,
    }))
    .sort((a, b) => b.points - a.points);

  return Response.json(leaderboard);
}
```

### 3. Submit Design to Competition
```typescript
// POST /api/competitions/[competitionId]/submit
export async function POST(
  req: Request,
  { params }: { params: { competitionId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { designId } = await req.json();

  // Create competition entry
  const entry = await prisma.competitionEntry.create({
    data: {
      competitionId: params.competitionId,
      userId: session.user.id,
      designId,
    },
  });

  // Award points
  await awardPoints(session.user.id, POINTS.COMPETITION_ENTRY, 'competition_entry');

  return Response.json(entry);
}
```

### 4. Vote on Entry
```typescript
// POST /api/competitions/entries/[entryId]/vote
export async function POST(
  req: Request,
  { params }: { params: { entryId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entry = await prisma.competitionEntry.findUnique({
    where: { id: params.entryId },
    include: { user: true, competition: true },
  });

  if (!entry) {
    return Response.json({ error: 'Entry not found' }, { status: 404 });
  }

  // Create or delete vote (toggle)
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_entryId: {
        userId: session.user.id,
        entryId: params.entryId,
      },
    },
  });

  if (existingVote) {
    // Remove vote
    await prisma.vote.delete({ where: { id: existingVote.id } });
    await awardPoints(entry.userId, -POINTS.VOTE_RECEIVED, 'vote_removed');
    await awardPoints(session.user.id, -POINTS.VOTE_GIVEN, 'vote_given_removed');
    return Response.json({ voted: false });
  } else {
    // Add vote
    await prisma.vote.create({
      data: {
        userId: session.user.id,
        entryId: params.entryId,
        competitionId: entry.competitionId,
      },
    });
    await awardPoints(entry.userId, POINTS.VOTE_RECEIVED, 'vote_received');
    await awardPoints(session.user.id, POINTS.VOTE_GIVEN, 'vote_given');
    return Response.json({ voted: true });
  }
}
```

### 5. Like an Entry
```typescript
// POST /api/competitions/entries/[entryId]/like
// Similar to vote endpoint but for likes
```

### 6. Get User Points
```typescript
// GET /api/users/[userId]/points
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const userPoints = await prisma.userPoints.findUnique({
    where: { userId: params.userId },
    include: {
      history: {
        take: 20,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return Response.json(userPoints);
}
```

### 7. Showcase Page - All Entries
```typescript
// GET /api/showcase?competition=[competitionId]&page=1&limit=20
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const competitionId = searchParams.get('competition');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const entries = await prisma.competitionEntry.findMany({
    where: competitionId ? { competitionId } : {},
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      design: true,
      _count: {
        select: { votes: true, likes: true },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [
      { votes: { _count: 'desc' } },
      { likes: { _count: 'desc' } },
    ],
  });

  return Response.json(entries);
}
```

---

## Helper Function: Award Points

```typescript
async function awardPoints(
  userId: string,
  points: number,
  action: string,
  description?: string
) {
  // Update or create user points
  const userPoints = await prisma.userPoints.upsert({
    where: { userId },
    update: {
      points: { increment: points },
    },
    create: {
      userId,
      points: Math.max(0, points), // Can't go negative
    },
  });

  // Calculate new level
  const newLevel = calculateLevel(userPoints.points);
  if (newLevel > userPoints.level) {
    await prisma.userPoints.update({
      where: { userId },
      data: { level: newLevel },
    });
  }

  // Log point history
  await prisma.pointHistory.create({
    data: {
      userId,
      points,
      action,
      description,
    },
  });

  return userPoints;
}
```

---

## Funnel Integration

### 1. Design Submission Flow
When user creates a design, check for active competition:
```typescript
// In your design creation API
const activeCompetition = await prisma.competition.findFirst({
  where: {
    isActive: true,
    endDate: { gte: new Date() },
    funnelTag: req.query.funnel, // e.g., "halloween-2025"
  },
});

if (activeCompetition) {
  // Auto-submit to competition
  await prisma.competitionEntry.create({
    data: {
      competitionId: activeCompetition.id,
      userId: session.user.id,
      designId: newDesign.id,
    },
  });

  // Award points
  await awardPoints(session.user.id, POINTS.COMPETITION_ENTRY, 'competition_entry');
}
```

### 2. URL Structure
- Design submission: `/designs?funnel=halloween-2025`
- Showcase page: `/showcase?competition=halloween-2025`
- User profile: `/profile/[userId]`
- Design detail: `/designs/[designId]`

---

## Frontend Components to Create

### 1. Showcase Page (`/app/showcase/page.tsx`)
- Grid of all competition entries
- Filter by competition
- Like and vote buttons
- Infinite scroll or pagination

### 2. User Profile Page (`/app/profile/[userId]/page.tsx`)
- User stats (points, level, streak)
- Badges/achievements
- Design portfolio
- Competition history

### 3. Design Detail Page (`/app/designs/[designId]/page.tsx`)
- Full design view
- Vote and like buttons
- Comments section
- Share functionality

---

## Next Steps

1. **Run Prisma Migration**
   ```bash
   npx prisma migrate dev --name add-competition-system
   ```

2. **Create API Routes**
   - `/api/competitions/current`
   - `/api/competitions/[id]/leaderboard`
   - `/api/competitions/[id]/submit`
   - `/api/competitions/entries/[id]/vote`
   - `/api/showcase`

3. **Create Frontend Pages**
   - `/showcase` - Browse all entries
   - `/profile/[userId]` - User profile with stats
   - Update `/designs` to handle funnel parameter

4. **Add Voting/Like Functionality**
   - Make Vote/Like buttons functional
   - Add optimistic UI updates
   - Show user's vote/like status

5. **Implement Points Display**
   - Show user points in header/profile
   - Add level badges
   - Create achievements system

---

## Gamification Milestones

| Points | Level | Badge |
|--------|-------|-------|
| 0-499 | 1 | Beginner |
| 500-999 | 2 | Designer |
| 1000-1999 | 3 | Creator |
| 2000-4999 | 4 | Artist |
| 5000+ | 5+ | Master |

---

This system creates a complete competition ecosystem with:
- ✅ Real database-linked users
- ✅ Funnel integration (Halloween, Black Friday, etc.)
- ✅ Gamified points system
- ✅ Leaderboard rankings
- ✅ Showcase page for browsing designs
- ✅ Social features (votes, likes)
