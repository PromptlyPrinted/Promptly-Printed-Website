import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(h => h.headers()),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imageId, imageUrl, imageName, productId } = body;

    if (!imageId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Please select an apparel type before submitting to the gallery' },
        { status: 400 }
      );
    }

    // Check if the image belongs to the user
    const savedImage = await database.savedImage.findFirst({
      where: {
        id: imageId,
        userId: session.user.id,
      },
    });

    if (!savedImage) {
      return NextResponse.json(
        { error: 'Image not found or unauthorized' },
        { status: 404 }
      );
    }

    // For now, we'll add a simple marker to track gallery submissions
    // You can extend this to create a separate GallerySubmission model if needed
    // Or integrate with the existing Competition system

    // Check if there's an active competition to submit to
    const activeCompetition = await database.competition.findFirst({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if this image is already associated with a design
    let design = await database.design.findFirst({
      where: {
        savedImageId: imageId,
        userId: session.user.id,
      },
    });

    // If no design exists, create one
    if (!design) {
      design = await database.design.create({
        data: {
          name: imageName || savedImage.name,
          userId: session.user.id,
          productId: productId,
          savedImageId: imageId,
        },
      });
    }

    if (activeCompetition) {
      // Check if already submitted to this competition
      const existingEntry = await database.competitionEntry.findFirst({
        where: {
          competitionId: activeCompetition.id,
          designId: design.id,
        },
      });

      if (existingEntry) {
        return NextResponse.json(
          { message: 'Already submitted to the current competition' },
          { status: 200 }
        );
      }

      // Create competition entry
      await database.competitionEntry.create({
        data: {
          competitionId: activeCompetition.id,
          userId: session.user.id,
          designId: design.id,
        },
      });

      return NextResponse.json(
        {
          message: 'Successfully submitted to gallery and competition!',
          competition: activeCompetition.theme,
        },
        { status: 200 }
      );
    }

    // If no active competition, just acknowledge the submission
    return NextResponse.json(
      {
        message: 'Design saved! Stay tuned for upcoming competitions where you can submit it to the gallery!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting to gallery:', error);
    return NextResponse.json(
      { error: 'Failed to submit to gallery' },
      { status: 500 }
    );
  }
}
