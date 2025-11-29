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
import { processAIGeneratedImage } from '@/lib/image-processing';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  console.warn('GOOGLE_GEMINI_API_KEY is not set - Nano Banana features will not work');
}

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || null;
// Dynamic API URL based on model selection

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
 * Following Google's recommendation: "Describe the scene, don't just list keywords"
 */
function enhancePromptWithBestPractices(userPrompt: string): string {
  let enhancedPrompt = userPrompt;

  // Check if user is providing a scene description vs. keyword list
  const hasSceneDescription = /\b(scene|with|in|at|under|over|beside|during)\b/.test(userPrompt.toLowerCase());
  const wordCount = userPrompt.split(/\s+/).length;

  // If prompt is very short (< 5 words) and lacks scene context, encourage more detail
  if (wordCount < 5 && !hasSceneDescription) {
    enhancedPrompt = `Create a scene featuring ${userPrompt.toLowerCase()}`;
  }

  // Add camera/composition guidance if user mentions camera-related keywords
  const cameraKeywords = ['shot', 'angle', 'perspective', 'view', 'camera'];
  const hasCameraTerms = cameraKeywords.some(keyword =>
    userPrompt.toLowerCase().includes(keyword)
  );

  if (!hasCameraTerms && userPrompt.length > 50) {
    // Suggest considering composition for detailed prompts
    enhancedPrompt += '. Use professional photographic composition and framing.';
  }

  // Quality boosters - always ensure high fidelity
  enhancedPrompt += '. High resolution, detailed, sharp focus, professional quality, 8k, highly detailed.';

  return enhancedPrompt;
}

/**
 * Detect image format from base64 string by examining magic bytes
 */
function detectImageFormat(base64String: string): string {
  try {
    // Decode first 12 bytes to check magic numbers
    const prefix = base64String.substring(0, 20);
    const buffer = Buffer.from(prefix, 'base64');
    const hex = buffer.toString('hex');
    
    // Check magic bytes
    if (hex.startsWith('ffd8ff')) return 'jpeg';
    if (hex.startsWith('89504e47')) return 'png';
    if (hex.startsWith('52494646') && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
    if (hex.startsWith('474946383')) return 'gif';
    
    console.warn('[detectImageFormat] Could not detect format, defaulting to jpeg. Hex:', hex);
    return 'jpeg'; // Default to jpeg since that's what Gemini typically returns
  } catch (error) {
    console.error('[detectImageFormat] Error:', error);
    return 'jpeg';
  }
}

/**
 * Safely extract inline image data from a Gemini response.
 */
function extractInlineImageData(result: any): string | null {
  const parts = result?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    console.warn('[extractInlineImageData] No parts array found in response');
    return null;
  }

  for (const part of parts) {
    const inlineData = part?.inline_data || part?.inlineData;
    if (inlineData?.data) {
      let base64Data = inlineData.data;

      // Validate it's actually base64
      console.log('[extractInlineImageData] Found inline data, length:', base64Data.length);
      console.log('[extractInlineImageData] Data starts with:', base64Data.substring(0, 50));

      // Clean up any potential data URL prefix if present
      if (base64Data.startsWith('data:')) {
        console.warn('[extractInlineImageData] Data has data URL prefix, stripping it...');
        const match = base64Data.match(/^data:image\/\w+;base64,(.+)$/);
        if (match) {
          base64Data = match[1];
        }
      }

      // Validate base64 format
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data.substring(0, 100))) {
        console.error('[extractInlineImageData] Data does not look like valid base64');
        return null;
      }

      // CRITICAL: Validate that the decoded data has valid image magic bytes
      try {
        const buffer = Buffer.from(base64Data.substring(0, 20), 'base64');
        const hex = buffer.toString('hex');

        // Check if magic bytes match known image formats
        const isValidImage =
          hex.startsWith('ffd8ff') ||      // JPEG
          hex.startsWith('89504e47') ||    // PNG
          hex.startsWith('52494646') ||    // RIFF (WebP)
          hex.startsWith('474946383');     // GIF

        if (!isValidImage) {
          console.error('[extractInlineImageData] Invalid image magic bytes detected:', hex);
          console.error('[extractInlineImageData] This data cannot be decoded as a valid image');
          return null;
        }

        console.log('[extractInlineImageData] Valid image format detected, magic bytes:', hex);
      } catch (validationError) {
        console.error('[extractInlineImageData] Failed to validate image data:', validationError);
        return null;
      }

      console.log('[extractInlineImageData] Returning clean base64, length:', base64Data.length);
      return base64Data;
    }
  }

  console.warn('[extractInlineImageData] No inline_data found in any part');
  return null;
}

/**
 * Construct hierarchical master prompt based on number of reference images
 * This is the critical logic that determines how the AI interprets multiple images
 * Supports 0-6 reference images (0-3 for nano-banana, 0-6 for nano-banana-pro)
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
      // Three references: Subject + Style + Composition + Texture
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

    case 4:
      // Four references: Subject + Style + Composition + Texture + Lighting (Pro only)
      return `${historyContext}Perform an advanced, multi-layered image transformation on the primary input image. Follow this strict hierarchy:

LAYER 1 - PRIMARY SUBJECT (Input Image):
- Foundation and main subject - preserve identity and key features

LAYER 2 - ARTISTIC STYLE (Reference #1):
- Artistic style, technique, color palette, and visual aesthetic

LAYER 3 - COMPOSITIONAL STRUCTURE (Reference #2):
- Layout, framing, spatial arrangement, and perspective

LAYER 4 - SURFACE TEXTURE (Reference #3):
- Texture, pattern, and material quality

LAYER 5 - LIGHTING & ATMOSPHERE (Reference #4):
- Lighting setup, shadows, highlights, and atmospheric effects
- Time of day, weather conditions, and mood lighting

User instruction: "${enhancedUserPrompt}"

Guidelines: Blend all layers seamlessly while keeping the primary subject recognizable and central.`;

    case 5:
      // Five references: All above + Color Grading (Pro only)
      return `${historyContext}Perform a professional-grade image transformation with maximum creative control:

LAYER 1 - PRIMARY SUBJECT (Input): Foundation - preserve identity
LAYER 2 - ARTISTIC STYLE (Reference #1): Style, technique, aesthetic
LAYER 3 - COMPOSITION (Reference #2): Layout, framing, perspective
LAYER 4 - TEXTURE (Reference #3): Surface texture and patterns
LAYER 5 - LIGHTING (Reference #4): Lighting setup and atmosphere
LAYER 6 - COLOR GRADING (Reference #5): Color treatment, tones, and grading style

User instruction: "${enhancedUserPrompt}"

Create a cohesive final image that harmoniously blends all influences while maintaining the primary subject's identity.`;

    case 6:
      // Six references: Maximum creative control with character/object consistency (Pro only)
      return `${historyContext}Perform a master-level image transformation with full creative control:

LAYER 1 - PRIMARY SUBJECT (Input): Foundation and main subject
LAYER 2 - ARTISTIC STYLE (Reference #1): Overall artistic style
LAYER 3 - COMPOSITION (Reference #2): Layout and framing
LAYER 4 - TEXTURE (Reference #3): Surface textures
LAYER 5 - LIGHTING (Reference #4): Lighting and atmosphere
LAYER 6 - COLOR GRADING (Reference #5): Color treatment
LAYER 7 - CHARACTER/OBJECT CONSISTENCY (Reference #6): Specific character features, object details, or brand elements to maintain consistency

User instruction: "${enhancedUserPrompt}"

Create a unified masterpiece that seamlessly integrates all influences while preserving the primary subject's identity and the character/object consistency from reference #6.`;

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
      referenceImages = [], // New: Array of 0-3 (or 6 for Pro) reference images
      aiModel = 'nano-banana', // 'nano-banana' or 'nano-banana-pro'
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
    const maxRefImages = aiModel === 'nano-banana-pro' ? 6 : 3;
    if (referenceImages.length > maxRefImages) {
      return NextResponse.json(
        { error: `Maximum of ${maxRefImages} reference images allowed for ${aiModel}` },
        { status: 400 }
      );
    }

    // Get auth context (user or guest)
    const authContext = await getAuthContext();
    const sessionId = authContext.sessionId || generateSessionId(request);

    // Nano Banana uses 0.5 credits, Pro uses 2
    const modelName = aiModel === 'nano-banana-pro' ? 'nano-banana-pro' : 'nano-banana';
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

    // Determine Gemini Model URL
    // nano-banana uses gemini-2.5-flash-image (fast, up to 3 reference images)
    // nano-banana-pro uses gemini-3-pro-image-preview (advanced, up to 6 reference images)
    const geminiModelId = aiModel === 'nano-banana-pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelId}:generateContent`;

    console.log('Making request to Google Gemini Nano Banana with:', {
      prompt,
      imageUrl: imageUrl ? 'provided' : 'none',
      editHistoryLength: editHistory.length,
      mode,
      referenceImageCount: referenceImages.length,
      model: geminiModelId,
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

        // Make API call to Gemini with optimized configuration
        console.log('Sending to Gemini API with', contentParts.length - 1, 'images');
        const response = await fetch(geminiApiUrl, {
          method: 'POST',
          headers: {
            'x-goog-api-key': GEMINI_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: contentParts,
            }],
            generationConfig: {
              response_modalities: ['IMAGE', 'TEXT'],
            },
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
          // Log the full response to help debug what went wrong
          console.error('[Gemini API] Response structure:', JSON.stringify(result, null, 2));
          throw new Error('No valid image data returned from Gemini API. The API may have returned corrupted data or an error.');
        }

        generatedImageBase64 = generatedData;
        console.log('Initial generation successful');
      } else {
        // Text-to-image generation mode (with optional reference images)
        const contentParts: any[] = [];

        // Add reference images first if provided (0-3 or 0-6)
        for (let i = 0; i < referenceImages.length; i++) {
          const refImage = await fetchImageAsBase64(referenceImages[i]);
          contentParts.push({
            inline_data: {
              data: refImage.data,
              mime_type: refImage.mimeType,
            },
          });
          console.log(`[Generate Mode] Added reference image ${i + 1}/${referenceImages.length}`);
        }

        // Enhance prompt with reference image guidance if references are provided
        let finalPrompt = prompt;
        if (referenceImages.length > 0) {
          finalPrompt = `Generate an image based on this prompt: "${prompt}". `;

          if (referenceImages.length === 1) {
            finalPrompt += `Use the style, mood, color palette, and artistic aesthetic from the reference image provided to influence the generation.`;
          } else if (referenceImages.length === 2) {
            finalPrompt += `Use reference image 1 for overall style and mood. Use reference image 2 for compositional elements or additional details.`;
          } else if (referenceImages.length >= 3) {
            finalPrompt += `Use reference image 1 for overall artistic style, image 2 for composition and layout, and image 3 for texture and surface details.`;
          }
        }

        // Add the prompt
        contentParts.push({ text: finalPrompt });

        console.log('[Generate Mode] Sending to Gemini with', referenceImages.length, 'reference images');

        const response = await fetch(geminiApiUrl, {
          method: 'POST',
          headers: {
            'x-goog-api-key': GEMINI_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: contentParts,
            }],
            generationConfig: {
              response_modalities: ['IMAGE', 'TEXT'],
            },
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
          // Log the full response to help debug what went wrong
          console.error('[Gemini API] Text-to-image response structure:', JSON.stringify(result, null, 2));
          throw new Error('No valid image data returned from Gemini API. The API may have returned corrupted data or an error.');
        }

        generatedImageBase64 = generatedData;
        console.log('Text-to-image generation successful');
      }

      // ========== STEP 2: AUTOMATIC EMBELLISHMENT ==========
      // This step is NON-OPTIONAL and runs after every successful generation
      console.log('Starting automatic embellishment step...');

      // Detect the actual format of the generated image to pass correct mime_type
      const generatedFormat = detectImageFormat(generatedImageBase64);
      const generatedMimeType = `image/${generatedFormat}`;
      console.log(`[Embellishment] Detected generated image format: ${generatedMimeType}`);

      // Hard-coded embellishment prompt (static, non-negotiable)
      const embellishmentPrompt = `Subtly enhance this image. Improve the lighting, increase the dynamic range, and sharpen the details to make it look more vibrant and professional. Do not change any of the content, characters, or objects. Only enhance the visual quality, clarity, and impact of the existing image.`;

      // Make the embellishment API call
      // Always use the standard model for embellishment to save costs/time unless Pro is specifically needed
      // For now, we'll use the same model as the generation for consistency
      const embellishmentResponse = await fetch(geminiApiUrl, {
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
                  mime_type: generatedMimeType,
                },
              },
              { text: embellishmentPrompt },
            ],
          }],
          generationConfig: {
            response_modalities: ['IMAGE', 'TEXT'],
          },
        }),
      });

      let finalImageBase64: string;
      if (!embellishmentResponse.ok) {
        // If embellishment fails, use the original generated image
        const errorText = await embellishmentResponse.text();
        console.warn('Embellishment API request failed:', embellishmentResponse.status, errorText);
        console.warn('Using original image without embellishment');
        finalImageBase64 = generatedImageBase64;
      } else {
        const embellishmentResult = await embellishmentResponse.json();
        const embellishedData = extractInlineImageData(embellishmentResult);
        if (!embellishedData) {
          console.warn('Embellishment returned invalid or no data');
          console.warn('[Gemini API] Embellishment response structure:', JSON.stringify(embellishmentResult, null, 2));
          console.warn('Using original image without embellishment');
          finalImageBase64 = generatedImageBase64;
        } else {
          finalImageBase64 = embellishedData;
          console.log('Embellishment successful');
        }
      }

      console.log('Embellishment step completed');

      // Clean and normalize the base64 string
      // Remove any whitespace, newlines, or other non-base64 characters
      const cleanBase64 = finalImageBase64.replace(/\s+/g, '');
      console.log('[Nano Banana] Base64 length before cleaning:', finalImageBase64.length);
      console.log('[Nano Banana] Base64 length after cleaning:', cleanBase64.length);

      // Detect actual image format from base64 data
      const detectedFormat = detectImageFormat(cleanBase64);
      console.log(`Nano Banana image format detected: ${detectedFormat}`);

      // Convert to data URL with correct format
      const finalImageUrl = `data:image/${detectedFormat};base64,${cleanBase64}`;
      const generationTimeMs = Date.now() - startTime;

      // Generate print-ready version for T-shirt printing
      let printReadyUrl: string | undefined;
      try {
        const processedImages = await processAIGeneratedImage(finalImageUrl);
        printReadyUrl = processedImages.printReadyUrl;
        console.log('[Nano Banana] Print-ready version created:', printReadyUrl);
      } catch (printError) {
        console.error('[Nano Banana] Failed to create print-ready version:', printError);
        // Continue without print-ready version - the original will be used
      }

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
          printReadyUrl,
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
            printReadyUrl,
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
        await recordGuestGeneration(sessionId, authContext.ipAddress || 'unknown');

        // Record in database (no user ID)
        await recordImageGeneration({
          sessionId,
          prompt,
          aiModel: modelName,
          creditsUsed: 0, // Free for guests
          status: 'COMPLETED',
          imageUrl: finalImageUrl,
          printReadyUrl,
          generationTimeMs,
          metadata: {
            mode,
            referenceImageCount: referenceImages.length,
            embellished: true,
          },
        });

        // Check remaining generations
        const updatedLimit = await checkGuestLimit(sessionId, authContext.ipAddress || 'unknown');

        return NextResponse.json({
          data: [{
            url: finalImageUrl,
            printReadyUrl,
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
