import { NextResponse } from 'next/server';
import { getAuthContext, generateSessionId } from '@/lib/auth-helper';
import {
  hasEnoughCredits,
  deductCredits,
  checkGuestLimit,
  recordGuestGeneration,
  recordImageGeneration,
  MODEL_CREDIT_COSTS,
} from '@/lib/credits';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  console.warn('GOOGLE_GEMINI_API_KEY is not set - Nano Banana features will not work');
}

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || null;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

interface EditHistoryItem {
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

/**
 * Helper function to fetch and convert image to base64
 */
async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  // Check if it's already a base64 data URL
  if (imageUrl.startsWith('data:image/')) {
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      return {
        data: matches[2],
        mimeType: matches[1],
      };
    }
  }

  // Fetch from URL
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  const mimeType = imageResponse.headers.get('content-type') || 'image/png';

  return {
    data: base64Image,
    mimeType: mimeType,
  };
}

/**
 * Enhance user prompt with best practices guidance
 */
function enhancePromptWithBestPractices(userPrompt: string): string {
  let enhancedPrompt = userPrompt;

  // Add camera/composition guidance if user mentions camera-related keywords
  const cameraKeywords = ['shot', 'angle', 'perspective', 'view', 'camera'];
  const hasCameraTerms = cameraKeywords.some(keyword =>
    userPrompt.toLowerCase().includes(keyword)
  );

  if (!hasCameraTerms && userPrompt.length > 50) {
    // Suggest considering composition for detailed prompts
    enhancedPrompt += '. Use professional photographic composition and framing.';
  }

  return enhancedPrompt;
}

/**
 * Safely extract inline image data from a Gemini response.
 */
function extractInlineImageData(result: any): string | null {
  const parts = result?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return null;
  }

  for (const part of parts) {
    const inlineData = part?.inline_data || part?.inlineData;
    if (inlineData?.data) {
      return inlineData.data;
    }
  }

  return null;
}

/**
 * Construct hierarchical master prompt based on number of reference images
 * This is the critical logic that determines how the AI interprets multiple images
 */
function constructMasterPrompt(userPrompt: string, referenceImageCount: number, editHistory: EditHistoryItem[]): string {
  // Enhance prompt with best practices
  const enhancedUserPrompt = enhancePromptWithBestPractices(userPrompt);

  // Add context from edit history if available
  let historyContext = '';
  if (editHistory.length > 0) {
    const previousEdits = editHistory
      .slice(-3) // Last 3 edits for context
      .map((edit: EditHistoryItem) => edit.prompt)
      .join(', then ');
    historyContext = `Previous edits in this session: ${previousEdits}. `;
  }

  // Build master prompt based on reference image count
  switch (referenceImageCount) {
    case 0:
      // Default: conversational editing on the main image
      return `${historyContext}${enhancedUserPrompt}`;

    case 1:
      // Single reference: Subject + Style/Influence
      return `${historyContext}Using the primary input image as the subject, apply the core artistic style, mood, color palette, and visual aesthetic from the single reference image provided. The user's specific instruction to guide this transformation is: "${enhancedUserPrompt}"

Important guidelines:
- Preserve the identity and key features of the subject in the primary input image
- Adopt the artistic style, lighting, and mood from the reference image
- Maintain the original composition unless the user specifically requests changes
- Blend the styles naturally without creating jarring transitions`;

    case 2:
      // Two references: Subject + Style + Element
      return `${historyContext}Your task is to modify the primary input image following this hierarchy:

1. PRIMARY SUBJECT: The first image (input image) is the main subject - preserve its identity and key features
2. STYLE REFERENCE: The second image is the primary style and aesthetic reference - adopt its:
   - Artistic style and technique
   - Color palette and lighting
   - Overall mood and atmosphere
3. COMPOSITIONAL ELEMENT: The third image contains a key object or compositional element to seamlessly incorporate into the scene

The user's guiding instruction is: "${enhancedUserPrompt}"

Important guidelines:
- The primary input image is the foundation - don't replace it, enhance it
- Apply the style from reference image #1 comprehensively but naturally
- Integrate the element from reference image #2 in a way that makes sense compositionally
- Ensure all elements blend cohesively into a unified final image`;

    case 3:
      // Three references: Subject + Style + Composition + Texture (Maximum creative control)
      return `${historyContext}Perform a complex, multi-layered image modification on the primary input image. Follow this strict hierarchy:

LAYER 1 - PRIMARY SUBJECT (Input Image):
- This is the main subject and foundation
- Preserve the identity, key features, and recognizability of the subject
- This should remain the "star" of the final image

LAYER 2 - ARTISTIC STYLE (Reference Image #1):
- Adopt the artistic style, technique, and mood from this reference
- Apply its color palette, lighting approach, and visual aesthetic
- Transform the rendering style while keeping the subject recognizable

LAYER 3 - COMPOSITIONAL STRUCTURE (Reference Image #2):
- Use this reference for compositional layout and framing guidance
- Adopt its spatial arrangement, perspective, and scene structure
- Reframe or recompose the scene to match this reference's composition

LAYER 4 - SURFACE TEXTURE (Reference Image #3):
- Apply the specific surface texture, pattern, or material quality from this reference
- Add this textural element to relevant surfaces in the final image
- Integrate the texture naturally so it enhances rather than overwhelms

The user's final instruction to guide this entire process is: "${enhancedUserPrompt}"

Critical guidelines:
- Each layer should be applied in order of importance (subject > style > composition > texture)
- All layers must blend seamlessly into a cohesive, unified final image
- The primary input image's subject must remain recognizable and central
- Balance all influences to create a harmonious result, not a collage`;

    default:
      return `${historyContext}${enhancedUserPrompt}`;
  }
}

/**
 * Main API endpoint for Nano Banana image generation/editing
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Nano Banana API key not configured. Please set GOOGLE_GEMINI_API_KEY in your environment.' },
        { status: 500 }
      );
    }

    const {
      prompt,
      imageUrl,
      editHistory = [],
      mode = 'edit', // 'edit' or 'generate'
      referenceImages = [], // New: Array of 0-3 reference images
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (mode === 'edit' && !imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required for edit mode' },
        { status: 400 }
      );
    }

    // Validate reference images count
    if (referenceImages.length > 3) {
      return NextResponse.json(
        { error: 'Maximum of 3 reference images allowed' },
        { status: 400 }
      );
    }

    // Get auth context (user or guest)
    const authContext = await getAuthContext();
    const sessionId = authContext.sessionId || generateSessionId(request);

    // Nano Banana uses 0.5 credits
    const modelName = 'nano-banana';
    const creditsRequired = MODEL_CREDIT_COSTS[modelName];

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
      const guestCheck = await checkGuestLimit(sessionId, authContext.ipAddress);

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

    console.log('Making request to Google Gemini Nano Banana with:', {
      prompt,
      imageUrl: imageUrl ? 'provided' : 'none',
      editHistoryLength: editHistory.length,
      mode,
      referenceImageCount: referenceImages.length,
    });

    try {
      let generatedImageBase64: string;

      // ========== STEP 1: INITIAL GENERATION WITH REFERENCE IMAGES ==========
      if (mode === 'edit' && imageUrl) {
        // Construct the master prompt based on reference image count
        const masterPrompt = constructMasterPrompt(prompt, referenceImages.length, editHistory);

        console.log('Master prompt constructed:', {
          referenceImageCount: referenceImages.length,
          promptLength: masterPrompt.length,
        });

        // Prepare content parts array for API call
        const contentParts: any[] = [];

        // Add the primary input image first
        const primaryImage = await fetchImageAsBase64(imageUrl);
        contentParts.push({
          inline_data: {
            data: primaryImage.data,
            mime_type: primaryImage.mimeType,
          },
        });

        // Add reference images if provided (0-3 images)
        for (let i = 0; i < referenceImages.length; i++) {
          const refImage = await fetchImageAsBase64(referenceImages[i]);
          contentParts.push({
            inline_data: {
              data: refImage.data,
              mime_type: refImage.mimeType,
            },
          });
          console.log(`Added reference image ${i + 1}/${referenceImages.length}`);
        }

        // Add the master prompt at the end
        contentParts.push({ text: masterPrompt });

        // Make API call to Gemini
        console.log('Sending to Gemini API with', contentParts.length - 1, 'images');
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'x-goog-api-key': GEMINI_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: contentParts,
            }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        // Extract the generated image base64 data
        const generatedData = extractInlineImageData(result);
        if (!generatedData) {
          throw new Error('No image data returned from Gemini API');
        }

        generatedImageBase64 = generatedData;
        console.log('Initial generation successful');
      } else {
        // Text-to-image generation mode
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'x-goog-api-key': GEMINI_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }],
            }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        // Extract the generated image base64 data
        const generatedData = extractInlineImageData(result);
        if (!generatedData) {
          throw new Error('No image data returned from Gemini API');
        }

        generatedImageBase64 = generatedData;
        console.log('Text-to-image generation successful');
      }

      // ========== STEP 2: AUTOMATIC EMBELLISHMENT ==========
      // This step is NON-OPTIONAL and runs after every successful generation
      console.log('Starting automatic embellishment step...');

      // Hard-coded embellishment prompt (static, non-negotiable)
      const embellishmentPrompt = `Subtly enhance this image. Improve the lighting, increase the dynamic range, and sharpen the details to make it look more vibrant and professional. Do not change any of the content, characters, or objects. Only enhance the visual quality, clarity, and impact of the existing image.`;

      // Make the embellishment API call
      const embellishmentResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'x-goog-api-key': GEMINI_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  data: generatedImageBase64,
                  mime_type: 'image/png',
                },
              },
              { text: embellishmentPrompt },
            ],
          }],
        }),
      });

      let finalImageBase64: string;
      if (!embellishmentResponse.ok) {
        // If embellishment fails, use the original generated image
        console.warn('Embellishment failed, using original image');
        finalImageBase64 = generatedImageBase64;
      } else {
        const embellishmentResult = await embellishmentResponse.json();
        const embellishedData = extractInlineImageData(embellishmentResult);
        if (!embellishedData) {
          console.warn('Embellishment returned no data, using original image');
          finalImageBase64 = generatedImageBase64;
        } else {
          finalImageBase64 = embellishedData;
        }
      }

      console.log('Embellishment step completed successfully');

      // Convert to data URL for return
      const finalImageUrl = `data:image/png;base64,${finalImageBase64}`;
      const generationTimeMs = Date.now() - startTime;

      // DEDUCT CREDITS or RECORD GUEST GENERATION
      if (authContext.isAuthenticated && authContext.userId) {
        // Deduct credits from authenticated user
        const deduction = await deductCredits(
          authContext.userId,
          modelName,
          `Generated image using Nano Banana (Gemini 2.5 Flash)`,
          {
            prompt,
            mode,
            referenceImageCount: referenceImages.length,
            embellished: true,
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
          imageUrl: finalImageUrl,
          generationTimeMs,
          metadata: {
            mode,
            referenceImageCount: referenceImages.length,
            embellished: true,
          },
        });

        return NextResponse.json({
          data: [{
            url: finalImageUrl,
            b64_json: null,
          }],
          editHistory: [
            ...editHistory,
            {
              prompt,
              imageUrl: finalImageUrl,
              timestamp: Date.now(),
            }
          ],
          debug: {
            referenceImageCount: referenceImages.length,
            embellished: true,
          },
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
          imageUrl: finalImageUrl,
          generationTimeMs,
          metadata: {
            mode,
            referenceImageCount: referenceImages.length,
            embellished: true,
          },
        });

        // Check remaining generations
        const updatedLimit = await checkGuestLimit(sessionId, authContext.ipAddress);

        return NextResponse.json({
          data: [{
            url: finalImageUrl,
            b64_json: null,
          }],
          editHistory: [
            ...editHistory,
            {
              prompt,
              imageUrl: finalImageUrl,
              timestamp: Date.now(),
            }
          ],
          debug: {
            referenceImageCount: referenceImages.length,
            embellished: true,
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
      console.error('Google Gemini API error:', apiError);

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
    console.error('Error generating/editing image with Nano Banana:', error);
    return NextResponse.json(
      {
        error: 'Failed to process image with Nano Banana',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
