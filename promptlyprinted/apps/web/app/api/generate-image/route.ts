import { NextResponse } from 'next/server';
import Together from 'together-ai';

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
  try {
    const { prompt, models, loraScale, width, height, dpi } =
      await request.json();

    if (!prompt || !models || !models.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

      return NextResponse.json({ data: response.data });
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
