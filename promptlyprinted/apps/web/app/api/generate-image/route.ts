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

      // Get LoRA configurations and add them to the prompt
      const loraPrompts = (models as ModelConfig[])
        .filter(m => m.type === 'lora')
        .map(lora => `<lora:${lora.model}:${lora.weight * (loraScale ?? 1)}>`)
        .join(' ')

      // Combine the original prompt with LoRA triggers
      const fullPrompt = `${loraPrompts} ${prompt}`.trim()

      console.log('Using prompt with LoRAs:', fullPrompt)

      const response = await together.images.create({
        model: baseModel.model,
        prompt: fullPrompt,
        n: 1,
        steps: 4
      })

      console.log('Together AI response:', response)

      if (!response.data?.[0]) {
        throw new Error('No image generated')
      }

      return NextResponse.json({ data: response.data })
    } catch (apiError) {
      console.error('Together AI API error:', apiError)
      throw new Error(apiError instanceof Error ? apiError.message : 'API error')
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