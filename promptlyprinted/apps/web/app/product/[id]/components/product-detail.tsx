'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs'
import { Button } from '@repo/design-system/components/ui/button'
import { Input } from '@repo/design-system/components/ui/input'
import { Textarea } from '@repo/design-system/components/ui/textarea'
import { Slider } from '@repo/design-system/components/ui/slider'
import { Label } from '@repo/design-system/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select'
import { Product } from '@/types/product'
import { Card } from '@repo/design-system/components/ui/card'
import { Separator } from '@repo/design-system/components/ui/separator'
import { StarIcon } from '@heroicons/react/24/solid'
import { toast } from '@repo/design-system/components/ui/use-toast'

const AI_MODELS = [
  { id: 'black-forest-labs/FLUX.1-schnell-standard', name: 'Standard', model: 'black-forest-labs/FLUX.1-schnell' },
  { id: 'black-forest-labs/FLUX.1-schnell-high-quality', name: 'High Quality', model: 'black-forest-labs/FLUX.1-schnell' }
]

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [promptText, setPromptText] = useState('')
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].model)
  const [generationMode, setGenerationMode] = useState('text')
  const [loraScale, setLoraScale] = useState(0.7)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)

  const handleImageGeneration = async () => {
    if (!promptText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the image generation",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptText,
          model: selectedModel
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate image')
      }

      if (data.data?.[0]?.url) {
        setGeneratedImage(data.data[0].url)
        toast({
          title: "Success",
          description: "Image generated successfully!",
          variant: "default"
        })
      } else {
        throw new Error('No image generated')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitReview = async () => {
    // TODO: Implement review submission
    console.log('Submitting review:', { rating, reviewText })
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
      {/* Left Column - Product Images */}
      <div className="space-y-6">
        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={generatedImage || product.imageUrl || '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-64V00/blanks/png/white.png'}
            alt={product.name}
            width={800}
            height={800}
            priority
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Product Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, idx) => (
              <div key={`product-image-${idx}`} className="aspect-square relative overflow-hidden rounded-md">
                <Image
                  src={image}
                  alt={`${product.name} ${idx + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-75"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column - Product Info */}
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

          {/* Price and Shipping */}
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
            {product.shippingCost > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                + ${product.shippingCost.toFixed(2)} shipping
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <div className="mt-2 text-base text-gray-500 space-y-4">
              {product.description}
            </div>
          </div>
        </div>

        {/* Product Options */}
        {(product.specifications?.size?.length || product.specifications?.color?.length) && (
          <div className="space-y-4">
            {product.specifications.size?.length > 0 && (
              <div>
                <Label htmlFor="size">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.specifications.size.map((size, idx) => (
                      <SelectItem key={`size-${idx}-${size}`} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {product.specifications.color?.length > 0 && (
              <div>
                <Label htmlFor="color">Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.specifications.color.map((color, idx) => (
                      <SelectItem key={`color-${idx}-${color}`} value={color.toLowerCase()}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Add to Cart */}
        <Button className="w-full" size="lg">
          Add to Cart
        </Button>

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
                    <SelectItem key={model.id} value={model.model}>
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

        {/* Product Details Tabs */}
        <Tabs defaultValue="specifications" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="mt-4">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Product Specifications</h3>
                {product.specifications && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm text-gray-500">Dimensions</div>
                      <div className="text-sm">
                        {product.specifications.dimensions.width} x {product.specifications.dimensions.height} {product.specifications.dimensions.units}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm text-gray-500">Brand</div>
                      <div className="text-sm">{product.specifications.brand}</div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm text-gray-500">Style</div>
                      <div className="text-sm">{product.specifications.style}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping" className="mt-4">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Shipping Information</h3>
                {product.shipping?.methods && product.shipping.methods.length > 0 ? (
                  <div className="space-y-4">
                    {product.shipping.methods.map((method, index) => (
                      <div key={`shipping-${index}-${method.method}`} className="p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{method.method}</h4>
                            <p className="text-sm text-gray-500">
                              Estimated delivery: {method.estimatedDays} days
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {method.currency} {method.cost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Shipping information not available</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-4">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Write a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={`rating-star-${star}`}
                            className={`h-6 w-6 cursor-pointer ${
                              star <= rating ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="review">Your Review</Label>
                      <Textarea
                        id="review"
                        placeholder="Write your review here..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleSubmitReview}>
                      Submit Review
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4">Customer Reviews</h3>
                  <p className="text-sm text-gray-500">Reviews will appear here once customers start leaving them.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 