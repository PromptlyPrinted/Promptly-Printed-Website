import { NextResponse } from 'next/server'
import Together from 'together-ai'

if (!process.env.TOGETHER_API_KEY) {
  throw new Error('TOGETHER_API_KEY is not set')
}

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY })

export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json()

    if (!prompt || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Making request to Together AI with:', { prompt, model })

    try {
      // Force using FLUX model which is known to work well
      const response = await together.images.create({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt,
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