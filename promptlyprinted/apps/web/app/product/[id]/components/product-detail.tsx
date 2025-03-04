"use client"

/**
 * Product Detail Component
 * 
 * T-shirt Design Positioning:
 * - Design width: 35% of T-shirt width
 * - Design height: 40% of T-shirt height
 * - Vertical position: 30% from the top of the T-shirt
 * - Horizontal position: Centered (50% with translateX(-50%))
 * 
 * This positioning is consistent between the UI preview and the downloaded high-resolution image.
 * When making changes to the positioning, ensure both the UI display and the download function
 * are updated to maintain consistency.
 */

import { useState, useRef, useEffect } from 'react'
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
import { Checkbox } from '@repo/design-system/components/ui/checkbox'

/**
 * Example AI models. Adjust as needed.
 */
const AI_MODELS = [
  { 
    id: 'black-forest-labs/FLUX.1-schnell-standard', 
    name: 'Standard FLUX', 
    model: 'black-forest-labs/FLUX.1-schnell',
    type: 'base'
  },
  {
    id: 'black-forest-labs/FLUX.1-dev',
    name: 'FLUX Developer',
    model: 'black-forest-labs/FLUX.1-dev',
    type: 'base'
  },
  {
    id: 'black-forest-labs/realvisxl-v3.0',
    name: 'RealVisXL Style',
    model: 'black-forest-labs/realvisxl-v3.0',
    type: 'lora',
    weight: 0.7
  },
  {
    id: 'black-forest-labs/illustration-style',
    name: 'Illustration Style',
    model: 'black-forest-labs/illustration-style',
    type: 'lora',
    weight: 0.6
  },
  {
    id: 'black-forest-labs/product-photography',
    name: 'Product Photography',
    model: 'black-forest-labs/product-photography',
    type: 'lora',
    weight: 0.8
  }
]

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  // State
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [promptText, setPromptText] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([AI_MODELS[0].id])
  const [modelWeights, setModelWeights] = useState<Record<string, number>>({})
  const [generationMode, setGenerationMode] = useState('text')
  const [loraScale, setLoraScale] = useState(0.7)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)
  const [isDownloading, setIsDownloading] = useState(false)
  
  // Refs for T-shirt and design images (if needed)
  const tshirtImageRef = useRef<HTMLImageElement>(null)
  const designImageRef = useRef<HTMLImageElement>(null)

  // Preload generated image for faster download
  useEffect(() => {
    if (generatedImage) {
      const img = document.createElement('img')
      img.src = generatedImage
    }
  }, [generatedImage])

  // ---- Generate Image (AI) ----
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
      // Prepare model configs
      const selectedModelConfigs = selectedModels.map(id => {
        const model = AI_MODELS.find(m => m.id === id)!
        return {
          model: model.model,
          type: model.type,
          weight: modelWeights[id] || model.weight || 1.0
        }
      })

      // Enhanced prompt for high-quality T-shirt printing
      const enhancedPrompt = `${promptText}, high resolution, 300 dpi, detailed, clear image, suitable for t-shirt printing, centered composition, professional quality, sharp details`

      // Call your /api/generate-image route
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          models: selectedModelConfigs,
          loraScale
        })
      })

      const data = await response.json()
      if (!response.ok) {
        // Extract the specific error message if available
        const errorMessage = data.details || data.error || 'Failed to generate image';
        console.error('API error details:', data);
        throw new Error(errorMessage);
      }

      if (data.data?.[0]?.url) {
        console.log('Generated image URL:', data.data[0].url)
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(data.data[0].url)}`
        setGeneratedImage(proxyUrl)
        toast({
          title: "Success",
          description: "Image generated successfully!",
          variant: "default"
        })
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

  // ---- Download High-Res PNG (300 DPI) ----
  const handleDownloadImage = async () => {
    if (!generatedImage) {
      toast({
        title: "Error",
        description: "Please generate a design first",
        variant: "destructive"
      })
      return
    }

    setIsDownloading(true)
    try {
      // Create a canvas sized for 300 DPI
      // For example, 8" × 10" => 2400 × 3000
      const canvas = document.createElement('canvas')
      canvas.width = 2400
      canvas.height = 3000

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not create canvas context')
      }

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Load T-shirt and design images
      const tshirtImage = document.createElement('img')
      tshirtImage.crossOrigin = 'anonymous'

      const designImage = document.createElement('img')
      designImage.crossOrigin = 'anonymous'

      // Show a loading toast
      toast({
        title: "Preparing download",
        description: "Loading images...",
        variant: "default"
      })

      // Wait for both images to load
      await new Promise<void>((resolve, reject) => {
        let tshirtLoaded = false
        let designLoaded = false

        const checkBothLoaded = () => {
          if (tshirtLoaded && designLoaded) resolve()
        }

        tshirtImage.onload = () => {
          tshirtLoaded = true
          checkBothLoaded()
        }
        tshirtImage.onerror = () => reject(new Error('Failed to load T-shirt image'))

        designImage.onload = () => {
          designLoaded = true
          checkBothLoaded()
        }
        designImage.onerror = () => reject(new Error('Failed to load design image'))

        tshirtImage.src = '/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-64V00/blanks/png/red.png'
        
        // If the generated image is a data URL, use it directly
        // otherwise fetch it, convert to blob -> objectURL
        if (generatedImage.startsWith('data:')) {
          designImage.src = generatedImage
        } else {
          fetch(generatedImage)
            .then(res => res.blob())
            .then(blob => {
              designImage.src = URL.createObjectURL(blob)
            })
            .catch(reject)
        }
      })

      // Draw T-shirt image with the same aspect ratio
      const tshirtAspectRatio = tshirtImage.width / tshirtImage.height
      const canvasAspectRatio = canvas.width / canvas.height

      let tshirtDrawWidth: number
      let tshirtDrawHeight: number
      let tshirtX: number
      let tshirtY: number

      if (tshirtAspectRatio > canvasAspectRatio) {
        // T-shirt is relatively wider, so match canvas height
        tshirtDrawHeight = canvas.height
        tshirtDrawWidth = tshirtDrawHeight * tshirtAspectRatio
        tshirtX = (canvas.width - tshirtDrawWidth) / 2
        tshirtY = 0
      } else {
        // T-shirt is relatively taller, so match canvas width
        tshirtDrawWidth = canvas.width
        tshirtDrawHeight = tshirtDrawWidth / tshirtAspectRatio
        tshirtX = 0
        tshirtY = (canvas.height - tshirtDrawHeight) / 2
      }

      ctx.drawImage(tshirtImage, tshirtX, tshirtY, tshirtDrawWidth, tshirtDrawHeight)

      // IMPORTANT: These values must match exactly with the UI preview positioning
      // The UI uses: width: 35%, height: 40%, top: 30%, left: 50%, transform: translateX(-50%)
      // Calculate the design overlay position to match the UI preview
      const designWidth = tshirtDrawWidth * 0.35  // 35% of t-shirt width
      const designHeight = tshirtDrawHeight * 0.40  // 40% of t-shirt height
      
      // Center horizontally (matching the translateX(-50%) in CSS)
      const designX = tshirtX + (tshirtDrawWidth / 2) - (designWidth / 2)
      
      // Position at 30% from the top of the t-shirt (matching the UI)
      const designY = tshirtY + (tshirtDrawHeight * 0.30)

      // Apply anti-aliasing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Draw the design with high quality
      ctx.drawImage(designImage, designX, designY, designWidth, designHeight)

      // Convert to data URL and download
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-custom-design.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "Image downloaded successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error downloading image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to download image',
        variant: "destructive"
      })

      // Fallback: just download the generated design
      try {
        toast({
          title: "Trying simple fallback",
          description: "Downloading just the design image...",
          variant: "default"
        })

        const link = document.createElement('a')
        link.href = generatedImage
        link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-design-only.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  // ---- Example: Submitting a Review ----
  const handleSubmitReview = async () => {
    // Implement review submission logic here
    console.log('Submitting review:', { rating, reviewText })
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
      {/* Left Column - T-shirt Preview */}
      <div className="space-y-6">
        <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg bg-gray-100">
          {/* 
            No aspect-square: we let the T-shirt define its aspect ratio
            (e.g. 800×1000). 
          */}
          <Image
            src="/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-64V00/blanks/png/red.png"
            alt={product.name}
            width={800}       // Example real T-shirt ratio
            height={1000}     // Example real T-shirt ratio
            className="object-contain"
            ref={tshirtImageRef as any}
          />

          {generatedImage && (
            // Absolutely position the design overlay to match the download function
            <div
              className="absolute"
              style={{
                width: '35%',
                height: '40%',
                top: '30%', // Positioned at 30% from the top
                left: '50%',
                transform: 'translateX(-50%)',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Image
                src={generatedImage}
                alt="Generated design"
                fill
                className="object-contain"
                ref={designImageRef as any}
                style={{ 
                  imageRendering: 'crisp-edges',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
        </div>

        {/* Thumbnails, if multiple images */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, idx) => (
              <div
                key={`product-image-${idx}`}
                className="aspect-square relative overflow-hidden rounded-md"
              >
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

      {/* Right Column - Product Info / AI Generation */}
      <div className="space-y-8">
        {/* Basic product info */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
            {product.shippingCost > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                + ${product.shippingCost.toFixed(2)} shipping
              </p>
            )}
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <div className="mt-2 text-base text-gray-500 space-y-4">
              {product.description}
            </div>
          </div>
        </div>

        {/* Product Options (size, color) */}
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

        <Button className="w-full" size="lg">
          Add to Cart
        </Button>

        {/* AI Generation UI */}
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
              <Label>AI Models &amp; LoRAs</Label>
              <div className="space-y-2">
                {AI_MODELS.map((model) => (
                  <div key={model.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`model-${model.id}`}
                      checked={selectedModels.includes(model.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedModels([...selectedModels, model.id])
                        } else {
                          setSelectedModels(selectedModels.filter(mid => mid !== model.id))
                        }
                      }}
                    />
                    <Label htmlFor={`model-${model.id}`}>{model.name}</Label>
                    {model.type === 'lora' && selectedModels.includes(model.id) && (
                      <div className="flex-1 max-w-[200px]">
                        <Slider
                          value={[modelWeights[model.id] || model.weight || 1.0]}
                          onValueChange={([value]) => {
                            setModelWeights({
                              ...modelWeights,
                              [model.id]: value
                            })
                          }}
                          min={0}
                          max={1}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>LoRA Scale</Label>
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
            
            {generatedImage && (
              <Button
                className="w-full mt-2"
                variant="outline"
                onClick={handleDownloadImage}
                disabled={isDownloading || !generatedImage}
              >
                {isDownloading ? 'Downloading...' : 'Download as PNG (300 DPI)'}
              </Button>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="specifications" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Specifications */}
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

          {/* Shipping */}
          <TabsContent value="shipping" className="mt-4">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Shipping Information</h3>
                {product.shipping?.methods && product.shipping.methods.length > 0 ? (
                  <div className="space-y-4">
                    {product.shipping.methods.map((method, index) => (
                      <div
                        key={`shipping-${index}-${method.method}`}
                        className="p-4 rounded-lg bg-gray-50"
                      >
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

          {/* Reviews */}
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
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}