# Nano Banana Integration - Setup Guide

## Overview

Google Nano Banana (Gemini 2.5 Flash Image) has been successfully integrated into your Promptly Printed website as an alternative image editing option in the **Image to Image** mode. This integration provides advanced conversational AI editing capabilities that complement your existing Flux Kontext LORAs.

## Key Features

### 1. **Conversational Multi-Turn Editing**
- The AI remembers previous edits in a conversation flow
- Enables iterative refinement with natural language
- Example workflow:
  1. "Make the background brighter"
  2. "Now change the car to red"
  3. "Add a sunset in the background"

### 2. **Surgical Precision Editing**
- Makes targeted changes without altering other parts of the image
- Preserves facial features, backgrounds, and elements you didn't ask to change
- More precise than traditional AI models that may inadvertently modify unrelated details

### 3. **Massive Context Window Integration**
- Can process up to 1M tokens of context
- Understands the full story and generates fitting imagery
- Maintains consistency across multiple editing rounds

### 4. **Superior Character Consistency**
- Maintains facial features, proportions, and expressions across edits
- Perfect for character sheets, branded content, or sequential storytelling
- Ensures coherent results in a single pass

### 5. **Optional Reference Images (1-3 Images)** 🆕
- Add up to 3 optional reference images to influence the generation
- **1 reference:** Style & mood reference (influences artistic style, color palette, lighting)
- **2 references:** Style + compositional element (adds objects or elements from 2nd image)
- **3 references:** Style + composition + texture (maximum creative control with layered influences)
- Hierarchical prompt system ensures the primary image remains the subject

### 6. **Ultra-Fast Processing**
- Returns images in seconds
- 95% speed rating (fastest among major models)
- Enables rapid prototyping and experimentation

### 7. **Contextual Knowledge Integration**
- Understands realistic lighting physics
- Accurate typography and cultural context
- Makes intelligent decisions about "what should this look like"

### 8. **Automatic Output Embellishment** 🆕
- Every generated image is automatically enhanced in a post-processing step
- Improves lighting, dynamic range, and sharpness
- Makes images more vibrant and professional-looking
- Completely transparent to the user - happens automatically
- Does not alter content, only enhances visual quality

## Setup Instructions

### 1. Obtain a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key

### 2. Add the API Key to Your Environment

Add the following line to your `.env.local` file in `apps/web/`:

```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

**Important:** Replace `your_api_key_here` with your actual API key from step 1.

### 3. Restart Your Development Server

```bash
cd apps/web
pnpm dev
```

Or if you're running the entire monorepo:

```bash
pnpm dev
```

## Usage Guide

### Accessing Nano Banana

1. Navigate to any product page (e.g., a T-shirt product)
2. Switch to **Image to Image** mode
3. In the "Select Image Editing Model" dropdown, choose:
   - **Google Nano Banana (Conversational AI Editing)**

### First Edit

1. Upload a reference image or use an existing T-shirt design
2. Enter your editing prompt (e.g., "Change the background to a sunset")
3. Click **"Generate Design"**
4. Wait for the AI to process (typically 2-5 seconds)

### Subsequent Edits (Conversational Flow)

Once you have an initial edited image:

1. Enter your next edit instruction (e.g., "Make it more vibrant")
2. Click **"Apply Edit"**
3. The AI will remember your previous edit and apply the new change
4. Continue this process for iterative refinement

### Edit History

- View all your previous edits by clicking **"Show"** in the Edit History section
- Restore any previous version by clicking **"Restore"** next to that edit
- The history helps you track your creative journey and revert if needed

### Using Reference Images (Optional) 🆕

Nano Banana now supports adding 1-3 optional reference images to influence your generation:

#### Adding Reference Images

1. After selecting Nano Banana as your model, scroll to the **"Add Image References"** section
2. You'll see 3 slots for reference images labeled:
   - **Slot 1:** Style
   - **Slot 2:** Layout/Composition
   - **Slot 3:** Texture
3. Click or drag images to upload them
4. Remove any image by clicking the X button on its thumbnail
5. Clear all references with the "Clear All References" button

#### How Reference Images Work

The number of reference images you add determines how the AI processes them:

**0 Reference Images (Default)**
- Standard conversational editing
- Your prompt directly modifies the main image
- Edit history provides context for multi-turn refinement

**1 Reference Image**
- **Purpose:** Style & mood influence
- The reference image's artistic style, color palette, lighting, and mood are applied to your main image
- Your main image remains the subject, but adopts the aesthetic of the reference
- **Example:** Upload a watercolor painting as reference, prompt: "Apply this painting style to my photo"

**2 Reference Images**
- **Purpose:** Style + compositional element
- **Reference #1:** Provides the artistic style and mood (same as above)
- **Reference #2:** Contains an object or element to incorporate into the scene
- The AI will blend the style from #1 and integrate an element from #2
- **Example:**
  - Reference #1: Van Gogh painting style
  - Reference #2: Image of sunflowers
  - Prompt: "Transform my photo with this style and add these flowers"

**3 Reference Images (Maximum Control)**
- **Purpose:** Style + composition + texture
- **Reference #1:** Artistic style and mood
- **Reference #2:** Compositional layout and framing guidance
- **Reference #3:** Surface texture or pattern
- Provides layered, hierarchical control for complex transformations
- **Example:**
  - Reference #1: Cyberpunk art style
  - Reference #2: Dynamic action pose composition
  - Reference #3: Neon texture pattern
  - Prompt: "Create a cyberpunk version with this composition and neon textures"

#### Best Practices

- **Start simple:** Try with 0-1 reference images first to understand the system
- **Clear references:** Use high-quality reference images with clear visual characteristics
- **Specific prompts:** Be explicit in your prompt about what you want from each reference
- **Iterate:** You can add/remove references between generations to refine results
- **Experiment:** Different combinations of references can produce dramatically different results

## Technical Implementation

### Files Modified/Created

1. **API Route:** `apps/web/app/api/generate-nano-banana/route.ts`
   - Handles Nano Banana API requests with reference images (0-3)
   - Implements hierarchical prompt logic based on reference count
   - Automatic embellishment post-processing step
   - Manages edit history and conversational context
   - Supports both edit and generate modes
   - Helper function for base64 image conversion

2. **Product Detail Component:** `apps/web/app/products/[category]/[productName]/components/ProductDetail.tsx`
   - Added Nano Banana state management including reference images
   - Created `handleNanoBananaGeneration` function with reference image support
   - Integrated Nano Banana UI components
   - Added conversational editing interface with edit history
   - Reference image upload handlers (drag & drop, file selection)
   - Reference image management (add, remove, clear)

3. **Environment Configuration:** `apps/web/.env.example`
   - Added `GOOGLE_GEMINI_API_KEY` variable

4. **Package Dependencies:** `apps/web/package.json`
   - Added `@google/generative-ai` package

### State Management

The following state variables manage Nano Banana functionality:

```typescript
const [useNanoBanana, setUseNanoBanana] = useState(false);
const [nanoBananaEditHistory, setNanoBananaEditHistory] = useState<Array<{
  prompt: string;
  imageUrl: string;
  timestamp: number;
}>>([]);
const [nanoBananaPrompt, setNanoBananaPrompt] = useState('');
const [showEditHistory, setShowEditHistory] = useState(false);
// New: Reference images state (up to 3 optional images)
const [referenceImages, setReferenceImages] = useState<string[]>([]);
const [isUploadingReference, setIsUploadingReference] = useState(false);
```

### Hierarchical Prompt Logic

The backend implements intelligent prompt construction based on the number of reference images:

**0 References:**
```
Previous edits: [history]. [user prompt]
```

**1 Reference:**
```
Using the primary input image as the subject, apply the core artistic style,
mood, color palette, and visual aesthetic from the single reference image.
User instruction: "[user prompt]"
```

**2 References:**
```
1. PRIMARY SUBJECT: First image is the main subject
2. STYLE REFERENCE: Second image provides artistic style
3. COMPOSITIONAL ELEMENT: Third image contains element to incorporate
User instruction: "[user prompt]"
```

**3 References:**
```
LAYER 1 - PRIMARY SUBJECT (Input Image)
LAYER 2 - ARTISTIC STYLE (Reference #1)
LAYER 3 - COMPOSITIONAL STRUCTURE (Reference #2)
LAYER 4 - SURFACE TEXTURE (Reference #3)
User instruction: "[user prompt]"
```

### Automatic Embellishment

After every successful generation, the system automatically:

1. Takes the generated image
2. Makes a second API call to Gemini with the prompt:
   ```
   Subtly enhance this image. Improve the lighting, increase the dynamic range,
   and sharpen the details to make it look more vibrant and professional.
   Do not change any of the content, characters, or objects.
   ```
3. Returns the embellished image to the user
4. Stores the embellished image in edit history

This process is completely transparent and non-optional, ensuring all outputs are polished.

## Isolation from Other Models

**Important:** The Nano Banana integration is completely isolated and does not affect:
- Flux Kontext Pro
- Flux Kontext Max
- Kontext LORAs
- Text-to-Image models
- Any existing functionality

When Nano Banana is **not** selected, all other models function exactly as before. The integration only activates when you explicitly select "Google Nano Banana" from the dropdown.

## Comparison with Other Models

### Nano Banana vs. Flux Kontext

| Feature | Nano Banana | Flux Kontext |
|---------|-------------|--------------|
| **Multi-turn Editing** | ✅ Remembers context | ❌ Each edit is independent |
| **Character Consistency** | ✅ Excellent in one pass | ⚠️ May require multiple attempts |
| **Speed** | ✅ 2-5 seconds | ⚠️ 10-30 seconds |
| **Precision** | ✅ Surgical edits | ⚠️ May alter unrelated details |
| **Stylized Art** | ⚠️ Good | ✅ Excellent with LORAs |
| **Context Window** | ✅ 1M tokens | ❌ Limited |

### When to Use Nano Banana

- **Iterative refinement:** When you need to make multiple sequential edits
- **Character work:** When maintaining character consistency is critical
- **Quick edits:** When speed is important
- **Conversational workflow:** When you want to describe changes naturally

### When to Use Flux Kontext

- **Artistic styles:** When using specific LORA styles (3D Chibi, Ghibli, etc.)
- **Single transformations:** When you know exactly what you want in one shot
- **Style consistency:** When you need a specific artistic look

## Troubleshooting

### "Nano Banana API key not configured" Error

**Solution:** Ensure you've added `GOOGLE_GEMINI_API_KEY` to your `.env.local` file and restarted your server.

### API Key Not Working

1. Verify your API key is correct (copy it again from Google AI Studio)
2. Check that there are no extra spaces in the `.env.local` file
3. Ensure you've restarted the development server after adding the key

### Slow Response Times

- Nano Banana is typically very fast (2-5 seconds)
- If experiencing slowness:
  - Check your internet connection
  - Verify you're not hitting API rate limits
  - Try again in a few moments

### Edit History Not Showing

- Edit history only appears after you've made at least one edit
- Click "Show" to expand the history panel
- Use "Restore" to revert to any previous edit

## API Costs

Google Gemini API pricing varies by usage. Check the [Google AI Pricing Page](https://ai.google.dev/pricing) for current rates.

**Recommendations:**
- Monitor your usage in the Google Cloud Console
- Set up billing alerts to avoid unexpected charges
- Consider implementing rate limiting for production use

## Future Enhancements

Potential future improvements to the Nano Banana integration:

1. **Multi-Image Fusion:** Enable blending multiple source images
2. **Advanced Context:** Feed entire product catalogs for brand-consistent edits
3. **Batch Processing:** Edit multiple images with the same instructions
4. **Custom Presets:** Save common edit workflows
5. **A/B Testing:** Generate multiple variations simultaneously

## Support

For issues specific to:
- **Nano Banana API:** Check [Google AI Documentation](https://ai.google.dev/gemini-api/docs)
- **Integration bugs:** File an issue in your project repository
- **Feature requests:** Discuss with your development team

---

**Last Updated:** December 2024
**Integration Version:** 2.0.0 🆕
**Nano Banana Model:** Gemini 2.5 Flash Image (gemini-2.5-flash-image)

## Version 2.0.0 Release Notes

### New Features

1. **Optional Reference Images (1-3)**
   - Upload up to 3 reference images to influence generation
   - Hierarchical prompt system based on reference count
   - Intelligent style, composition, and texture blending

2. **Automatic Output Embellishment**
   - Every generation is automatically enhanced post-processing
   - Improves lighting, dynamic range, and sharpness
   - Transparent to users - always active

3. **Enhanced UI**
   - Beautiful reference image upload interface
   - Drag & drop support
   - Visual indicators for image slots (Style, Composition, Texture)
   - Clear all references button

### Technical Improvements

- Base64 image conversion helper function
- Better error handling for reference images
- Debug output in API responses
- Comprehensive documentation updates
