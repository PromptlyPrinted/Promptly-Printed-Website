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
  throw new Error('TOGETHER_API_KEY is not set');
}

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

interface ModelConfig {
  model: string;
  type: 'base' | 'lora';
  weight: number;
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { prompt, models, loraScale, width, height, dpi, aiModel = 'flux-dev' } =
      await request.json();

    if (!prompt || !models || !models.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get auth context (user or guest)
    const authContext = await getAuthContext();
    const sessionId = authContext.sessionId || generateSessionId(request);

    // Determine model name for credit calculation
    const modelName = aiModel || 'flux-dev';
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
          { status: 402 } // Payment Required
        );
      }
    } else {
      // GUEST LIMIT CHECK: Unauthenticated users (3 per 24 hours)
      const guestCheck = await checkGuestLimit(sessionId, authContext.ipAddress);

      if (!guestCheck.allowed) {
        const hoursUntilReset = Math.ceil(
          (guestCheck.resetsAt!.getTime() - Date.now()) / (1000 * 60 * 60)
        );

        return NextResponse.json(
          {
            error: 'Daily limit reached',
            details: `You've used all ${3} free generations today. Sign up to get ${50} free credits!`,
            remaining: 0,
            resetsIn: hoursUntilReset,
            resetsAt: guestCheck.resetsAt,
            signupOffer: {
              credits: 50,
              message: 'Create a free account to get 50 credits instantly',
            },
          },
          { status: 429 } // Too Many Requests
        );
      }
    }

    console.log('Making request to Together AI with:', {
      prompt,
      models,
      loraScale,
      width,
      height,
      dpi,
    });

    try {
      // Get the base model (should be FLUX)
      const baseModel = (models as ModelConfig[]).find(
        (m) => m.type === 'base'
      );
      if (!baseModel) {
        throw new Error('No base model selected');
      }

      // Extract LoRA models
      const loraModels = (models as ModelConfig[]).filter(
        (m) => m.type === 'lora'
      );

      // Format LoRAs for the image_loras parameter according to Together AI docs
      const imageLoras = loraModels.map((lora) => ({
        path: lora.model,
        scale: lora.weight * (loraScale ?? 1),
      }));

      console.log('Using base model:', baseModel.model);
      console.log('Using LoRAs:', imageLoras);

      // Validate parameters to ensure they're within allowed ranges
      const steps = 12; // Maximum allowed by the API

      // Scale down dimensions to fit within Together AI's limits while maintaining aspect ratio
      const MAX_SIZE = 1024;
      const aspectRatio = width / height;
      let targetWidth = width;
      let targetHeight = height;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (aspectRatio > 1) {
          targetWidth = MAX_SIZE;
          targetHeight = Math.round(MAX_SIZE / aspectRatio);
        } else {
          targetHeight = MAX_SIZE;
          targetWidth = Math.round(MAX_SIZE * aspectRatio);
        }
      }

      // Ensure dimensions are multiples of 8 (required by most AI models)
      targetWidth = Math.floor(targetWidth / 8) * 8;
      targetHeight = Math.floor(targetHeight / 8) * 8;

      console.log('Using dimensions:', { targetWidth, targetHeight });

      const response = await together.images.create({
        model: baseModel.model,
        prompt: prompt,
        n: 1,
        steps: 4,
        width: targetWidth,
        height: targetHeight,
        image_loras: imageLoras,
      });

      console.log('Together AI response:', response);

      if (!response.data?.[0]) {
        throw new Error('No image generated');
      }

      const generationTimeMs = Date.now() - startTime;
      const imageUrl = response.data[0]?.url || response.data[0]?.b64_json;

      // DEDUCT CREDITS or RECORD GUEST GENERATION
      if (authContext.isAuthenticated && authContext.userId) {
        // Deduct credits from authenticated user
        const deduction = await deductCredits(
          authContext.userId,
          modelName,
          `Generated image using ${modelName}`,
          {
            prompt,
            models,
            dimensions: { width: targetWidth, height: targetHeight },
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
          imageUrl,
          generationTimeMs,
          metadata: {
            models,
            dimensions: { width: targetWidth, height: targetHeight },
            loraScale,
          },
        });

        return NextResponse.json({
          data: response.data,
          credits: {
            used: deduction.deducted,
            remaining: deduction.newBalance,
          },
        });
      } else {
        // Record guest generation
        await recordGuestGeneration(sessionId, authContext.ipAddress);

        // Record in database (no user ID)
        await recordImageGeneration({
          sessionId,
          prompt,
          aiModel: modelName,
          creditsUsed: 0, // Free for guests
          status: 'COMPLETED',
          imageUrl,
          generationTimeMs,
          metadata: {
            models,
            dimensions: { width: targetWidth, height: targetHeight },
            loraScale,
          },
        });

        // Check remaining generations
        const updatedLimit = await checkGuestLimit(sessionId, authContext.ipAddress);

        return NextResponse.json({
          data: response.data,
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
      console.error('Together AI API error:', apiError);

      // Extract the specific error message from the API response if available
      let errorMessage = 'API error';
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
      }

      // Check if it's a response error with more details
      if (typeof apiError === 'object' && apiError !== null) {
        // @ts-ignore - Handle potential response error format
        if (apiError.response?.data?.error?.message) {
          // @ts-ignore
          errorMessage = apiError.response.data.error.message;
        }
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
    console.error('Error generating image:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
