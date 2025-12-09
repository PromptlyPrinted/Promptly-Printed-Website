import { NextResponse } from 'next/server';
import Together from 'together-ai';
import { getAuthContext, generateSessionId } from '@/lib/auth-helper';
import {
  hasEnoughCredits,
  deductCredits,
  checkGuestCredits,
  deductGuestCredit,
  recordImageGeneration,
  MODEL_CREDIT_COSTS,
} from '@/lib/credits';
import { processAIGeneratedImage } from '@/lib/image-processing';
import { storage } from '@/lib/storage';

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
    const { prompt, models, loraScale, width, height, dpi, aiModel = 'flux-dev', image_url } =
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
      // GUEST CREDIT CHECK: Unauthenticated users
      const guestCheck = await checkGuestCredits(sessionId, authContext.ipAddress ?? undefined);

      if (!guestCheck.allowed) {
        return NextResponse.json(
          {
            error: 'No credits remaining',
            details: `You've used all ${guestCheck.total} free credits. Sign up to get 50 credits per month!`,
            remaining: 0,
            total: guestCheck.total,
            signupOffer: {
              credits: 50,
              message: 'Create a free account to get 50 credits instantly',
            },
          },
          { status: 429 }
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

      // Check if this is a Kontext model (image-to-image)
      const isKontextModel = baseModel.model.includes('Kontext');
      
      // Build request parameters
      const requestParams: any = {
        model: baseModel.model,
        prompt: prompt,
        n: 1,
        steps: isKontextModel ? 24 : 4, // Kontext models need more steps
        width: targetWidth,
        height: targetHeight,
      };
      
      // Add image_loras only if there are LoRAs (not applicable for Kontext models)
      if (imageLoras.length > 0 && !isKontextModel) {
        requestParams.image_loras = imageLoras;
      }
      
      // Add image_url for Kontext image-to-image models
      if (image_url && isKontextModel) {
        requestParams.image_url = image_url;
        console.log('Using image-to-image mode with Kontext model');
      } else if (isKontextModel && !image_url) {
        throw new Error('Kontext models require an image_url for image-to-image transformation');
      }

      const response = await together.images.create(requestParams);

      console.log('Together AI response:', response);

      if (!response.data?.[0]) {
        throw new Error('No image generated');
      }

      const generationTimeMs = Date.now() - startTime;
      const togetherImageUrl = response.data[0]?.url || response.data[0]?.b64_json;
      
      if (!togetherImageUrl) {
        throw new Error('No image URL returned from Together AI');
      }

      // RE-HOST TO R2: Fetch Together AI image and upload to our storage
      // This prevents CORS issues since Together AI URLs have restrictive policies
      let imageUrl: string = togetherImageUrl;
      try {
        console.log('[Generate Image] Re-hosting Together AI image to R2...');
        const imageResponse = await fetch(togetherImageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch: ${imageResponse.status}`);
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        const contentType = imageResponse.headers.get('content-type') || 'image/png';
        const extension = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
        const filename = `generated-${Date.now()}.${extension}`;
        
        imageUrl = await storage.uploadFromBuffer(imageBuffer, filename, contentType, {
          folder: 'temp',
          sessionId: sessionId || undefined,
        });
        console.log('[Generate Image] Re-hosted to R2:', imageUrl);
      } catch (reHostError) {
        console.error('[Generate Image] Failed to re-host to R2, using original URL:', reHostError);
        // Fall back to original URL (may have CORS issues, but at least image is generated)
      }

      // Generate print-ready version for T-shirt printing
      let printReadyUrl: string | undefined;
      try {
        const processedImages = await processAIGeneratedImage(imageUrl);
        printReadyUrl = processedImages.printReadyUrl;
        console.log('[Generate Image] Print-ready version created:', printReadyUrl);
      } catch (printError) {
        console.error('[Generate Image] Failed to create print-ready version:', printError);
        // Continue without print-ready version - the original will be used
      }

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
          printReadyUrl,
          generationTimeMs,
          metadata: {
            models,
            dimensions: { width: targetWidth, height: targetHeight },
            loraScale,
          },
        });

        return NextResponse.json({
          data: [{
            url: imageUrl,  // R2-hosted URL (not Together AI URL)
            printReadyUrl,
          }],
          credits: {
            used: deduction.deducted,
            remaining: deduction.newBalance,
          },
        });
      } else {
        // Deduct guest credit
        await deductGuestCredit(sessionId, authContext.ipAddress ?? undefined);

        // Record in database (no user ID)
        await recordImageGeneration({
          sessionId,
          prompt,
          aiModel: modelName,
          creditsUsed: 0, // Free for guests
          status: 'COMPLETED',
          imageUrl,
          printReadyUrl,
          generationTimeMs,
          metadata: {
            models,
            dimensions: { width: targetWidth, height: targetHeight },
            loraScale,
          },
        });

        // Check remaining credits
        const updatedCredits = await checkGuestCredits(sessionId, authContext.ipAddress ?? undefined);

        return NextResponse.json({
          data: [{
            url: imageUrl,  // R2-hosted URL (not Together AI URL)
            printReadyUrl,
          }],
          guestInfo: {
            remaining: updatedCredits.remaining,
            total: updatedCredits.total,
            signupOffer: updatedCredits.remaining <= 1 ? {
              credits: 50,
              message: 'Sign up to get 50 credits per month!',
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
