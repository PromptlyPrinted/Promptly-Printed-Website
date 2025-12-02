import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';
import { S3StorageProvider } from '@/lib/storage/s3';

const storage = new S3StorageProvider();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const photo = formData.get('photo') as File;
    const entryId = formData.get('entryId') as string;

    if (!photo || !entryId) {
      return NextResponse.json(
        { error: 'Photo and entryId are required' },
        { status: 400 }
      );
    }

    // Verify the entry belongs to the user
    const entry = await prisma.competitionEntry.findUnique({
      where: { id: entryId },
      include: { competition: true },
    });

    if (!entry || entry.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Entry not found or unauthorized' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const filename = `competition-photos/${entry.competitionId}/${session.user.id}-${Date.now()}.jpg`;
    const photoUrl = await storage.uploadFromBuffer(
      buffer,
      filename,
      photo.type || 'image/jpeg',
      { skipUuid: true }
    );

    // Store photo URL in database (you might want to add a wearingPhotoUrl field to CompetitionEntry)
    // For now, we'll create a new table or use metadata

    // Award 100 points for wearing photo
    await awardPoints(session.user.id, 100, 'wearing_photo_upload', `Uploaded wearing photo for entry ${entryId}`);

    return NextResponse.json({
      success: true,
      photoUrl,
      pointsAwarded: 100,
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

// Helper function to award points
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
      points: Math.max(0, points),
    },
  });

  // Calculate new level (every 500 points)
  const newLevel = Math.floor(userPoints.points / 500) + 1;
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
