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
      // GUEST CREDIT CHECK: Unauthenticated users
      const guestCheck = await checkGuestCredits(sessionId, authContext.ipAddress || 'unknown');

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

      // Helper function to re-host data URLs to R2
      async function ensurePublicUrl(url: string, index: number): Promise<string> {
        if (url.startsWith('data:')) {
          console.log(`[Flux 2 Pro] Re-hosting data URL ${index} to R2...`);
          const matches = url.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const extension = mimeType.includes('png') ? 'png' : 'jpg';
            const filename = `flux2-input-${Date.now()}-${index}.${extension}`;
            
            const publicUrl = await storage.uploadFromBuffer(buffer, filename, mimeType, {
              folder: 'temp',
              sessionId: sessionId || undefined,
            });
            console.log(`[Flux 2 Pro] Re-hosted to:`, publicUrl);
            return publicUrl;
          }
        }
        if (url.startsWith('blob:')) {
          throw new Error('Blob URLs are not supported. Please upload the image first.');
        }
        return url;
      }

      // Build the request parameters
      // FLUX.2-pro uses 'reference_images' array for image-to-image (not 'image_url')
      // According to Together AI docs: https://docs.together.ai/docs/quickstart-flux-2
      const allReferenceImages: string[] = [];
      
      // Add main image first (re-host if needed)
      if (imageUrl) {
        const publicMainUrl = await ensurePublicUrl(imageUrl, 0);
        allReferenceImages.push(publicMainUrl);
      }
      
      // Add additional reference images (re-host if needed)
      if (referenceImages.length > 0) {
        for (let i = 0; i < referenceImages.length; i++) {
          const publicRefUrl = await ensurePublicUrl(referenceImages[i], i + 1);
          allReferenceImages.push(publicRefUrl);
        }
        console.log(`Using ${allReferenceImages.length} total reference images`);
      }

      const requestParams: any = {
        model: 'black-forest-labs/FLUX.2-pro',
        width,
        height,
        prompt,
        // FLUX.2-pro uses reference_images array, not image_url
        reference_images: allReferenceImages,
      };

      const response = await together.images.create(requestParams);

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from Flux 2 Pro API');
      }

      const togetherImageUrl = response.data[0].url;
      const generationTimeMs = Date.now() - startTime;

      if (!togetherImageUrl) {
        throw new Error('No image URL returned from Flux 2 Pro API');
      }

      console.log('Flux 2 Pro generation successful, original URL:', togetherImageUrl);

      // RE-HOST TO R2: Fetch Together AI image and upload to our storage
      // This prevents CORS issues since Together AI URLs have restrictive policies
      let generatedImageUrl: string = togetherImageUrl;
      try {
        console.log('[Flux 2 Pro] Re-hosting Together AI image to R2...');
        const imageResponse = await fetch(togetherImageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch: ${imageResponse.status}`);
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        const contentType = imageResponse.headers.get('content-type') || 'image/png';
        const extension = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
        const filename = `flux2-generated-${Date.now()}.${extension}`;
        
        generatedImageUrl = await storage.uploadFromBuffer(imageBuffer, filename, contentType, {
          folder: 'temp',
          sessionId: sessionId || undefined,
        });
        console.log('[Flux 2 Pro] Re-hosted to R2:', generatedImageUrl);
      } catch (reHostError) {
        console.error('[Flux 2 Pro] Failed to re-host to R2, using original URL:', reHostError);
        // Fall back to original URL (may have CORS issues, but at least image is generated)
      }

      // Generate print-ready version for T-shirt printing
      let printReadyUrl: string | undefined;
      try {
        const processedImages = await processAIGeneratedImage(generatedImageUrl);
        printReadyUrl = processedImages.printReadyUrl;
        console.log('[Flux 2 Pro] Print-ready version created:', printReadyUrl);
      } catch (printError) {
        console.error('[Flux 2 Pro] Failed to create print-ready version:', printError);
        // Continue without print-ready version - the original will be used
      }

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
          printReadyUrl,
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
            printReadyUrl,
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
        // Deduct guest credit
        await deductGuestCredit(sessionId, authContext.ipAddress || 'unknown');

        // Record in database (no user ID)
        await recordImageGeneration({
          sessionId,
          prompt,
          aiModel: modelName,
          creditsUsed: 0, // Free for guests
          status: 'COMPLETED',
          imageUrl: generatedImageUrl,
          printReadyUrl,
          generationTimeMs,
          metadata: {
            referenceImageCount: referenceImages.length,
            width,
            height,
            steps,
          },
        });

        // Check remaining credits
        const updatedCredits = await checkGuestCredits(sessionId, authContext.ipAddress || 'unknown');

        return NextResponse.json({
          data: [{
            url: generatedImageUrl,
            printReadyUrl,
            b64_json: null,
          }],
          debug: {
            referenceImageCount: referenceImages.length,
            generationTimeMs,
            model: 'flux-2-pro',
          },
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
