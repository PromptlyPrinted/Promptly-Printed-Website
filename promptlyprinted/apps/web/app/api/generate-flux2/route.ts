import { NextResponse } from 'next/server';
import Together from 'together-ai';
import { getAuthContext, generateSessionId } from '@/lib/auth-helper';
import {
  hasEnoughCredits,
  deductCredits,
  checkGuestLimit,
  recordGuestGeneration,
  recordImageGeneration,
  MODEL_CREDIT_COSTS,
} from '@/lib/credits';

if (!process.env.TOGETHER_API_KEY) {
  console.warn('TOGETHER_API_KEY is not set - Flux 2 Pro features will not work');
}

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || null;

/**
 * Main API endpoint for Flux 2 Pro image-to-image generation
 * Supports up to 8 reference images for advanced character/product/style consistency
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    if (!TOGETHER_API_KEY) {
      return NextResponse.json(
        { error: 'Flux 2 Pro API key not configured. Please set TOGETHER_API_KEY in your environment.' },
        { status: 500 }
      );
    }

    const {
      prompt,
      imageUrl,
      referenceImages = [], // Array of up to 8 reference images
      width = 1024,
      height = 1024,
      steps = 28, // Optimal for quality
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required for image-to-image transformation' },
        { status: 400 }
      );
    }

    // Validate reference images count (max 8)
    if (referenceImages.length > 8) {
      return NextResponse.json(
        { error: 'Maximum of 8 reference images allowed for Flux 2 Pro' },
        { status: 400 }
      );
    }

    // Get auth context (user or guest)
    const authContext = await getAuthContext();
    const sessionId = authContext.sessionId || generateSessionId(request);

    // Flux 2 Pro uses 1 credit
    const modelName = 'flux-2-pro';
    const creditsRequired = MODEL_CREDIT_COSTS[modelName] || 1;

    // CREDIT CHECK: Authenticated users
    if (authContext.isAuthenticated && authContext.userId) {
      const creditCheck = await hasEnoughCredits(authContext.userId, modelName);

      if (!creditCheck.hasCredits) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            details: `You need ${creditCheck.required} credits but only have ${creditCheck.currentBalance}`,
            creditsNeeded: creditCheck.required,
            currentBalance: creditCheck.currentBalance,
          },
          { status: 402 }
        );
      }
    } else {
      // GUEST LIMIT CHECK: Unauthenticated users
      const guestCheck = await checkGuestLimit(sessionId, authContext.ipAddress || 'unknown');

      if (!guestCheck.allowed) {
        const hoursUntilReset = Math.ceil(
          (guestCheck.resetsAt!.getTime() - Date.now()) / (1000 * 60 * 60)
        );

        return NextResponse.json(
          {
            error: 'Daily limit reached',
            details: `You've used all 3 free generations today. Sign up to get 50 free credits!`,
            remaining: 0,
            resetsIn: hoursUntilReset,
            resetsAt: guestCheck.resetsAt,
            signupOffer: {
              credits: 50,
              message: 'Create a free account to get 50 credits instantly',
            },
          },
          { status: 429 }
        );
      }
    }

    console.log('Making request to Together AI Flux 2 Pro with:', {
      prompt,
      imageUrl: 'provided',
      referenceImageCount: referenceImages.length,
      width,
      height,
      steps,
    });

    try {
      const together = new Together({ apiKey: TOGETHER_API_KEY });

      // Build the request parameters
      // For Flux 2 Pro, image_url can be a single URL or an array for multi-reference
      let imageUrlParam: string | string[];

      if (referenceImages.length > 0) {
        // Multi-reference mode: combine main image + reference images
        console.log(`Using ${referenceImages.length + 1} total images (1 main + ${referenceImages.length} references)`);
        imageUrlParam = [imageUrl, ...referenceImages];
      } else {
        // Single image mode
        imageUrlParam = imageUrl;
      }

      const requestParams: any = {
        model: 'black-forest-labs/FLUX.2-pro',
        width,
        height,
        steps,
        prompt,
        image_url: imageUrlParam,
      };

      const response = await together.images.create(requestParams);

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from Flux 2 Pro API');
      }

      const generatedImageUrl = response.data[0].url;
      const generationTimeMs = Date.now() - startTime;

      console.log('Flux 2 Pro generation successful, URL:', generatedImageUrl);

      // DEDUCT CREDITS or RECORD GUEST GENERATION
      if (authContext.isAuthenticated && authContext.userId) {
        // Deduct credits from authenticated user
        const deduction = await deductCredits(
          authContext.userId,
          modelName,
          `Generated image using Flux 2 Pro`,
          {
            prompt,
            referenceImageCount: referenceImages.length,
            width,
            height,
            steps,
          }
        );

        if (!deduction.success) {
          console.error('Failed to deduct credits after generation');
        }

        // Record generation in database
        await recordImageGeneration({
          userId: authContext.userId,
          prompt,
          aiModel: modelName,
          creditsUsed: creditsRequired,
          status: 'COMPLETED',
          imageUrl: generatedImageUrl,
          generationTimeMs,
          metadata: {
            referenceImageCount: referenceImages.length,
            width,
            height,
            steps,
          },
        });

        return NextResponse.json({
          data: [{
            url: generatedImageUrl,
            b64_json: null,
          }],
          debug: {
            referenceImageCount: referenceImages.length,
            generationTimeMs,
            model: 'flux-2-pro',
          },
          credits: {
            used: deduction.deducted,
            remaining: deduction.newBalance,
          },
        });
      } else {
        // Record guest generation
        await recordGuestGeneration(sessionId, authContext.ipAddress || 'unknown');

        // Record in database (no user ID)
        await recordImageGeneration({
          sessionId,
          prompt,
          aiModel: modelName,
          creditsUsed: 0, // Free for guests
          status: 'COMPLETED',
          imageUrl: generatedImageUrl,
          generationTimeMs,
          metadata: {
            referenceImageCount: referenceImages.length,
            width,
            height,
            steps,
          },
        });

        // Check remaining generations
        const updatedLimit = await checkGuestLimit(sessionId, authContext.ipAddress || 'unknown');

        return NextResponse.json({
          data: [{
            url: generatedImageUrl,
            b64_json: null,
          }],
          debug: {
            referenceImageCount: referenceImages.length,
            generationTimeMs,
            model: 'flux-2-pro',
          },
          guestInfo: {
            remaining: updatedLimit.remaining,
            resetsAt: updatedLimit.resetsAt,
            signupOffer: updatedLimit.remaining <= 1 ? {
              credits: 50,
              message: 'Sign up to get 50 free credits!',
            } : undefined,
          },
        });
      }

    } catch (apiError) {
      console.error('Together AI Flux 2 Pro API error:', apiError);

      let errorMessage = 'API error';
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
      }

      // Record failed generation
      if (authContext.isAuthenticated && authContext.userId) {
        await recordImageGeneration({
          userId: authContext.userId,
          prompt,
          aiModel: modelName,
          creditsUsed: 0, // Don't charge for failed generations
          status: 'FAILED',
          errorMessage,
          generationTimeMs: Date.now() - startTime,
        });
      } else {
        await recordImageGeneration({
          sessionId,
          prompt,
          aiModel: modelName,
          creditsUsed: 0,
          status: 'FAILED',
          errorMessage,
          generationTimeMs: Date.now() - startTime,
        });
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error generating image with Flux 2 Pro:', error);
    return NextResponse.json(
      {
        error: 'Failed to process image with Flux 2 Pro',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
