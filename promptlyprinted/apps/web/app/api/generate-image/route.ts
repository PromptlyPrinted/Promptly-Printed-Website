import { NextResponse } from 'next/server'
import Together from 'together-ai'

if (!process.env.TOGETHER_API_KEY) {
  throw new Error('TOGETHER_API_KEY is not set')
}

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY })

interface ModelConfig {
  model: string
  type: 'base' | 'lora'
  weight: number
}

export async function POST(request: Request) {
  try {
    const { prompt, models, loraScale } = await request.json()

    if (!prompt || !models || !models.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Making request to Together AI with:', { prompt, models, loraScale })

    try {
      // Get the base model (should be FLUX)
      const baseModel = (models as ModelConfig[]).find(m => m.type === 'base')
      if (!baseModel) {
        throw new Error('No base model selected')
      }

      // Extract LoRA models
      const loraModels = (models as ModelConfig[])
        .filter(m => m.type === 'lora')
        
      // Format LoRAs for the image_loras parameter according to Together AI docs
      const imageLoras = loraModels.map(lora => ({
        // We need to include the full path to the model on HuggingFace
        // but we only have the model ID in our request.
        // Together AI requires the full path like "https://huggingface.co/model-id"
        // We assume model name is the full path in this case
        path: lora.model,
        scale: lora.weight * (loraScale ?? 1)
      }))

      console.log('Using base model:', baseModel.model)
      console.log('Using LoRAs:', imageLoras)

      // Validate parameters to ensure they're within allowed ranges
      const steps = 12; // Maximum allowed by the API
      
      // Together AI typically supports these sizes: 512x512, 768x768, 1024x1024
      // Some models may support other sizes, but these are commonly supported
      const width = 1024;
      const height = 1024;

      const response = await together.images.create({
        model: baseModel.model,
        prompt: prompt, // Use the original prompt without LoRA tags
        n: 1,
        steps,
        width,
        height,
        image_loras: imageLoras // Add the image_loras parameter with the correct format
      })

      console.log('Together AI response:', response)

      if (!response.data?.[0]) {
        throw new Error('No image generated')
      }

      return NextResponse.json({ data: response.data })
    } catch (apiError) {
      console.error('Together AI API error:', apiError)
      
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
    console.error('Error generating image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 