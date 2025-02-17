'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StarIcon } from '@heroicons/react/24/solid'
import { Product } from '@/types/product'

const AI_MODELS = [
  { id: 'flux-midjourney-anime', name: 'Anime Style' },
  { id: 'fluxdreamscape', name: 'Dreamscape' },
  { id: 'animation2k-flux', name: 'Animation' },
  { id: 'yarn_art_Flux_loRA', name: 'Yarn Art' },
  { id: 'flux-disney', name: 'Disney Style' },
  { id: 'flux-art', name: 'Art Style' },
]

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [promptText, setPromptText] = useState('')
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id)
  const [generationMode, setGenerationMode] = useState('text')
  const [loraScale, setLoraScale] = useState(0.7)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState('')

  const handleImageGeneration = async () => {
    setIsGenerating(true)
    try {
      // TODO: Implement Together AI API call
      // This is where we'll make the API call to generate images
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated delay
      setGeneratedImage('/placeholder-generated.jpg')
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
      {/* Left Column - Product Images */}
      <div className="space-y-6">
        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={generatedImage || product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Product Thumbnails */}
        <div className="grid grid-cols-4 gap-4">
          {product.images?.map((image, idx) => (
            <div key={idx} className="aspect-square relative overflow-hidden rounded-md">
              <Image
                src={image}
                alt={`${product.name} ${idx + 1}`}
                fill
                className="object-cover cursor-pointer hover:opacity-75"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Product Info & AI Generation */}
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
          <div className="mt-4 flex items-center">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <StarIcon
                  key={rating}
                  className={`h-5 w-5 ${
                    rating < (product.rating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="ml-3 text-sm text-gray-500">
              {product.reviewCount} reviews
            </p>
          </div>
          <p className="mt-4 text-xl text-gray-900">${product.price}</p>
          <div className="mt-4 text-gray-500">{product.description}</div>
        </div>

        {/* Product Options */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="size">Size</Label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger id="size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger id="color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {['White', 'Black', 'Navy', 'Gray'].map((color) => (
                  <SelectItem key={color} value={color.toLowerCase()}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Generation Interface */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Customize with AI</h2>
          
          <Tabs defaultValue="text" onValueChange={(v) => setGenerationMode(v)}>
            <TabsList className="mb-4">
              <TabsTrigger value="text">Text to Image</TabsTrigger>
              <TabsTrigger value="image">Image to Image</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Describe your design</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your design description..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image">
              <div className="space-y-4">
                <div>
                  <Label>Reference Image</Label>
                  <div className="mt-2 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <Button variant="outline">Upload Image</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="imagePrompt">Style Description</Label>
                  <Textarea
                    id="imagePrompt"
                    placeholder="Describe how you want to modify the reference image..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="model">AI Style</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select AI style" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Style Intensity</Label>
              <Slider
                value={[loraScale]}
                onValueChange={([value]) => setLoraScale(value)}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleImageGeneration}
              disabled={isGenerating || !promptText}
            >
              {isGenerating ? 'Generating...' : 'Generate Design'}
            </Button>
          </div>
        </div>

        {/* Add to Cart */}
        <Button className="w-full" size="lg">
          Add to Cart
        </Button>
      </div>
    </div>
  )
} 