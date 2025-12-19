/**
 * Generate Design Tool
 * 
 * Allows users to generate AI apparel designs or use their own images
 * from ChatGPT's DALL-E generation.
 */

import { z } from 'zod';

const PROMPTLY_PRINTED_API = process.env.PROMPTLY_PRINTED_URL || 'https://promptlyprinted.com';

// Input schema for the tool
export const generateDesignInputSchema = {
  prompt: z.string().optional().describe('Text prompt for AI design generation'),
  userDesignUrl: z.string().url().optional().describe('URL of user-provided image (e.g., from ChatGPT DALL-E)'),
  style: z.enum(['minimalist', 'streetwear', 'graphic', 'surreal', 'futuristic', 'vintage', 'abstract'])
    .optional()
    .describe('Design style preference'),
};

export const generateDesignTool = {
  name: 'generate_design',
  description: `Generate an AI-powered apparel design or apply a user's existing image to products.
  
If the user has already generated an image in ChatGPT (via DALL-E), provide the userDesignUrl to skip AI generation and save costs.
If no image is provided, use the prompt to generate a new design.

Examples:
- User says "Put this design on a t-shirt" → Use the DALL-E image URL
- User says "Create a minimalist mountain design" → Generate with prompt
- User has an image attached → Extract URL and pass as userDesignUrl`,
  inputSchema: generateDesignInputSchema,
};

export interface GenerateDesignInput {
  prompt?: string;
  userDesignUrl?: string;
  style?: string;
}

export interface GenerateDesignResult {
  success: boolean;
  designUrl?: string;
  previewUrl?: string;
  prompt?: string;
  style?: string;
  source: 'user_provided' | 'ai_generated';
  redirectUrl?: string;
  error?: string;
}

export async function handleGenerateDesign(
  input: GenerateDesignInput
): Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent: GenerateDesignResult;
  _meta: { component: string };
}> {
  try {
    // If user provided their own image (from DALL-E), use that directly
    if (input.userDesignUrl) {
      return {
        content: [{ 
          type: 'text', 
          text: `Great! I'll use your design image to create apparel mockups. This design is ready to be applied to products.` 
        }],
        structuredContent: {
          success: true,
          designUrl: input.userDesignUrl,
          previewUrl: input.userDesignUrl,
          source: 'user_provided',
        },
        _meta: { component: 'component://widget' },
      };
    }

    // Otherwise, redirect to PromptlyPrinted to generate a design
    // This saves API credits and drives traffic to the website
    if (!input.prompt) {
      const designUrl = `${PROMPTLY_PRINTED_API}/design?source=chatgpt`;
      return {
        content: [{ 
          type: 'text', 
          text: `To create a custom design, you have two options:\n\n1. **Generate an image here** - Just ask me to create an image (e.g., "Create an image of a minimalist mountain sunset")\n\n2. **Use our AI designer** - [Create your design on PromptlyPrinted →](${designUrl})\n\nOnce you have a design, we can apply it to t-shirts and hoodies!` 
        }],
        structuredContent: {
          success: false,
          source: 'ai_generated',
          redirectUrl: designUrl,
          error: 'No prompt or image provided - redirecting to website',
        },
        _meta: { component: 'component://widget' },
      };
    }

    // If user provided a prompt, redirect to PP with the prompt pre-filled
    const designUrl = `${PROMPTLY_PRINTED_API}/design?prompt=${encodeURIComponent(input.prompt)}&style=${input.style || 'custom'}&source=chatgpt`;
    
    return {
      content: [{ 
        type: 'text', 
        text: `Great idea! You can either:\n\n1. **Generate here** - Ask me "Create an image of ${input.prompt}"\n\n2. **Use our AI** - [Generate "${input.prompt}" on PromptlyPrinted →](${designUrl})\n\nTip: Generating in ChatGPT is included with your ChatGPT Plus subscription! 🎉` 
      }],
      structuredContent: {
        success: false,
        source: 'ai_generated',
        prompt: input.prompt,
        style: input.style,
        redirectUrl: designUrl,
        error: 'Redirecting to website for design generation',
      },
      _meta: { component: 'component://widget' },
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ 
        type: 'text', 
        text: `I encountered an issue generating the design. You can also try generating an image yourself first (ask me to "create an image of...") and then we'll apply it to apparel.` 
      }],
      structuredContent: {
        success: false,
        source: 'ai_generated',
        error: errorMessage,
      },
      _meta: { component: 'component://widget' },
    };
  }
}
