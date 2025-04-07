"use client"

/**
 * Updated Product Detail Component with revised layout:
 * 
 * Left Panel:
 * - T-shirt preview with generated design overlay and thumbnails.
 * - AI Prompt Input section with tabs for Text to Image / Image to Image and a Generate Design button.
 * 
 * Right Panel:
 * - Product Info: Title, Price, Description.
 * - Size and Color selectors.
 * - AI Settings: Model selection, LoRA scale slider.
 * - Save options: Download, Save to My Images, Save to My Designs.
 * - Checkout buttons and shipping/review tabs.
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
import { LORAS, Lora } from '../../../../data/textModel'
import { SUPPORTED_COUNTRIES, formatPrice, convertPrice, getDefaultCurrency } from '@/utils/currency'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { GlobeAltIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { CheckoutButton } from "@/components/CheckoutButton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/design-system/components/ui/tooltip'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  // State
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [selectedColor, setSelectedColor] = useState(product.specifications?.color?.[0]?.toLowerCase() || 'white')
  const [promptText, setPromptText] = useState('')
  const [selectedModels, setSelectedModels] = useState<number[]>([LORAS[0].id])
  const [modelWeights, setModelWeights] = useState<Record<number, number>>({})
  const [generationMode, setGenerationMode] = useState('text')
  const [loraScale, setLoraScale] = useState(0.7)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [isSaving, setIsSaving] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  
  // Refs for T-shirt and design images
  const tshirtImageRef = useRef<HTMLImageElement>(null)
  const designImageRef = useRef<HTMLImageElement>(null)

  const { rates, loading: ratesLoading, error: ratesError, convertPrice: convertWithRates } = useExchangeRates()

  // Preload generated image for faster download
  useEffect(() => {
    if (generatedImage) {
      const img = document.createElement('img')
      img.src = generatedImage
    }
  }, [generatedImage])

  // Update currency when country changes
  useEffect(() => {
    const newCurrency = getDefaultCurrency(selectedCountry)
    setSelectedCurrency(newCurrency)
  }, [selectedCountry])

  // Get converted price with real-time exchange rates
  const getConvertedPrice = (price: number) => {
    if (ratesLoading) return price
    return convertWithRates(price, 'USD', selectedCurrency)
  }

  // Get shipping information based on country
  const getShippingInfo = () => {
    const country = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry)
    if (!country) return null

    const isEU = country.currency === 'EUR'
    const baseShipping = product.shippingCost || 0

    return {
      standard: {
        cost: isEU ? baseShipping : baseShipping * 1.2,
        days: isEU ? '3-5' : '5-7'
      },
      express: {
        cost: isEU ? baseShipping * 1.5 : baseShipping * 2,
        days: isEU ? '1-2' : '2-3'
      }
    }
  }

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
        const model = LORAS.find((m: Lora) => m.id === id)!
        return {
          model: model.path,
          type: 'lora',
          weight: modelWeights[id] || model.scale || 1.0,
          steps: model.steps || 28
        }
      })

      // Add the base FLUX model to the configuration
      const allModelConfigs = [
        {
          model: "black-forest-labs/FLUX.1-dev-lora",
          type: 'base',
          weight: 1.0
        },
        ...selectedModelConfigs
      ]

      // Enhanced prompt for high-quality T-shirt printing
      const enhancedPrompt = `${promptText}, high resolution, 300 dpi, detailed, clear image, suitable for t-shirt printing, centered composition, professional quality, sharp details`

      // Call your /api/generate-image route
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          models: allModelConfigs,
          loraScale
        })
      })

      const data = await response.json()
      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Failed to generate image'
        console.error('API error details:', data)
        throw new Error(errorMessage)
      }

      if (data.data?.[0]?.url) {
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
      toast({
        title: "Preparing high-resolution image",
        description: "Creating 4680x5790px (300 DPI) print-ready image...",
        variant: "default"
      })

      const canvas = document.createElement('canvas')
      canvas.width = 4680
      canvas.height = 5790

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not create canvas context')
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const designImage = document.createElement('img')
      designImage.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        designImage.onload = () => resolve()
        designImage.onerror = () => reject(new Error('Failed to load design image'))

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

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(designImage, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-design-only.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "High-resolution image (4680x5790px, 300 DPI) downloaded successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error downloading image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to download image',
        variant: "destructive"
      })

      try {
        toast({
          title: "Trying simple fallback",
          description: "Downloading the design image as-is...",
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

  // ---- Save Generated Image ----
  const handleSaveImage = async () => {
    if (!generatedImage) {
      toast({
        title: "Error",
        description: "Please generate a design first",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: generatedImage,
          designName: `${product.name} Design`,
          productId: product.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save image')
      }

      toast({
        title: "Success",
        description: "Design saved to My Images!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error saving image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save image',
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ---- Add to Wishlist ----
  const handleAddToWishlist = async () => {
    if (!generatedImage) {
      toast({
        title: "Error",
        description: "Please generate a design first",
        variant: "destructive"
      })
      return
    }

    setIsAddingToWishlist(true)
    try {
      const saveResponse = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: generatedImage,
          designName: `${product.name} Design`,
          productId: product.id
        })
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save design')
      }

      const wishlistResponse = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id
        })
      })

      if (!wishlistResponse.ok) {
        throw new Error('Failed to add to wishlist')
      }

      toast({
        title: "Success",
        description: "Design saved to My Designs!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add to wishlist',
        variant: "destructive"
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  // ---- Submit Review ----
  const handleSubmitReview = async () => {
    console.log('Submitting review:', { rating, reviewText })
  }

  const handleDirectCheckout = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: "Error",
        description: "Please select size and color",
        variant: "destructive"
      })
      return
    }

    const checkoutItem = {
      productId: Number(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      images: product.images?.map(url => ({ url })) || []
    }

    return <CheckoutButton items={[checkoutItem]} />
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
        {/* LEFT PANEL: T-shirt Preview and AI Prompt Input */}
        <div className="space-y-6">
          {/* T-shirt Preview with teal border accent */}
          <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg border-2 border-teal-500 bg-gray-100 aspect-square">
            <Image
              src={`../${product.imageUrl}/${(selectedColor || product.specifications?.color?.[0] || 'white').replace(/ /g, '-')}.png`}
              alt={product.name}
              fill
              className="object-contain"
              ref={tshirtImageRef as any}
              onError={(e) => {
                console.log('Base path:', product.imageUrl)
              }}
            />

            {generatedImage && (
              <div
                className="absolute"
                style={{
                  width: '35%',
                  height: '40%',
                  top: '30%',
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

          {/* Thumbnails */}
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

          {/* AI Prompt Input Section */}
          <div className="border rounded-lg p-6 space-y-4 border-teal-200">
            <h2 className="text-xl font-semibold mb-2 text-teal-700">Customize with AI</h2>
            <Tabs defaultValue="text" onValueChange={(v) => setGenerationMode(v)}>
              <TabsList className="mb-4">
                <TabsTrigger value="text" className="data-[state=active]:text-teal-600">Text to Image</TabsTrigger>
                <TabsTrigger value="image" className="data-[state=active]:text-teal-600">Image to Image</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <div className="space-y-4">
                  <Label htmlFor="prompt" className="text-teal-600">Describe your design</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your design description..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="image">
                <div className="space-y-4">
                  <Label className="text-teal-600">Reference Image</Label>
                  <div className="mt-2 flex items-center justify-center border-2 border-dashed border-teal-200 rounded-lg p-6">
                    <Button variant="outline">Upload Image</Button>
                  </div>
                  <Label htmlFor="imagePrompt" className="text-teal-600">Style Description</Label>
                  <Textarea
                    id="imagePrompt"
                    placeholder="Describe how you want to modify the reference image..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleImageGeneration}
              disabled={isGenerating || !promptText}
            >
              {isGenerating ? 'Generating...' : 'Generate Design'}
            </Button>
          </div>
        </div>

        {/* RIGHT PANEL: Product Info, Options, AI Settings & Checkout */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Product Info */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-teal-900">{product.name}</h1>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-teal-800">
                {formatPrice(getConvertedPrice(product.price), selectedCurrency)}
              </p>
              {selectedCurrency !== 'USD' && (
                <p className="text-sm text-gray-500">
                  (${product.price.toFixed(2)} USD)
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-teal-700">Description</h3>
            <div className="mt-2 text-base text-gray-500 space-y-4">
              {product.description}
            </div>
          </div>

          {/* Size and Color Selection */}
          {(product.specifications?.size?.length || product.specifications?.color?.length) && (
            <div className="space-y-4">
              {product.specifications.size?.length > 0 && (
                <div>
                  <Label htmlFor="size" className="text-teal-600">Size</Label>
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
                  <Label htmlFor="color" className="text-teal-600">Color</Label>
                  <div className="flex gap-2 mt-2">
                    <TooltipProvider>
                      {product.specifications.color.map((color, idx) => {
                        const colorValue = color.toLowerCase().replace(/\s+/g, '')
                        const colorMap: Record<string, string> = {
                          white: '#FFFFFF',
                          black: '#000000',
                          red: '#FF0000',
                          blue: '#0000FF',
                          green: '#00FF00',
                          yellow: '#FFFF00',
                          purple: '#800080',
                          pink: '#FFC0CB',
                          orange: '#FFA500',
                          gray: '#808080',
                          grey: '#808080'
                        }
                        const hexColor = colorMap[colorValue] || colorValue

                        return (
                          <Tooltip key={`color-${idx}-${color}`}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setSelectedColor(colorValue)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  selectedColor === colorValue
                                    ? 'border-teal-600 scale-110'
                                    : 'border-transparent hover:border-teal-200'
                                }`}
                                style={{ backgroundColor: hexColor }}
                                aria-label={`Select ${color} color`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{color}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Settings Section */}
          <div className="border rounded-lg p-6 space-y-4 border-teal-200">
            <h2 className="text-xl font-semibold text-teal-700">AI Settings</h2>
            <div>
              <Label className="text-teal-600 mb-4 block">AI Models &amp; LoRAs</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {LORAS.map((model: Lora) => (
                  <div 
                    key={model.id} 
                    className={`
                      relative aspect-square rounded-lg overflow-hidden cursor-pointer
                      transition-all duration-200 group
                      ${selectedModels.includes(model.id) ? 'ring-2 ring-teal-500' : 'hover:ring-2 hover:ring-teal-200'}
                    `}
                    onClick={() => {
                      if (selectedModels.includes(model.id)) {
                        setSelectedModels(selectedModels.filter(mid => mid !== model.id))
                      } else {
                        setSelectedModels([...selectedModels, model.id])
                      }
                    }}
                  >
                    {/* Background Image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={`/lora-images/${model.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                        alt={model.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Label Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm">
                      <p className="text-white text-sm font-medium text-center">
                        {model.name.split(/(?=[A-Z])/).join(' ')}
                      </p>
                    </div>

                    {/* Checkbox Overlay */}
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        id={`model-${model.id}`}
                        checked={selectedModels.includes(model.id)}
                        className="bg-white/90 border-teal-500 data-[state=checked]:bg-teal-500"
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedModels([...selectedModels, model.id])
                          } else {
                            setSelectedModels(selectedModels.filter(mid => mid !== model.id))
                          }
                        }}
                      />
                    </div>

                    {/* Slider for selected models */}
                    {selectedModels.includes(model.id) && (
                      <div className="absolute left-0 right-0 bottom-12 px-4 py-2">
                        <Slider
                          value={[modelWeights[model.id] || model.scale || 1.0]}
                          onValueChange={([value]) => {
                            setModelWeights({
                              ...modelWeights,
                              [model.id]: value
                            })
                          }}
                          min={0}
                          max={1}
                          step={0.1}
                          className="accent-teal-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-teal-600">LoRA Scale</Label>
              <Slider
                value={[loraScale]}
                onValueChange={([value]) => setLoraScale(value)}
                min={0}
                max={1}
                step={0.1}
                className="mt-2 accent-teal-600"
              />
            </div>
            {generatedImage && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  variant="outline"
                  onClick={handleDownloadImage}
                  disabled={isDownloading || !generatedImage}
                >
                  {isDownloading ? 'Downloading...' : 'Download as PNG (300 DPI)'}
                </Button>

                <Button
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  variant="outline"
                  onClick={handleSaveImage}
                  disabled={isSaving || !generatedImage}
                >
                  {isSaving ? 'Saving...' : 'Save to My Images'}
                </Button>

                <Button
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  variant="outline"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist || !generatedImage}
                >
                  {isAddingToWishlist ? 'Adding to Designs...' : 'Save to My Designs'}
                </Button>
              </div>
            )}
          </div>

          {/* Checkout Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white" size="lg" onClick={() => {/* Add to cart logic */}}>
              Add to Cart
            </Button>
            <CheckoutButton
              items={[{
                productId: Number(product.id),
                name: product.name,
                price: product.price,
                quantity: 1,
                images: product.images?.map(url => ({ url })) || []
              }]}
              variant="outline"
              className="w-full sm:flex-1 border-teal-600 text-teal-600 hover:bg-teal-50"
            />
          </div>

          {/* Shipping Information */}
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-5 w-5 text-teal-600" />
              <h3 className="font-medium text-teal-700">
                Shipping to {SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry)?.name}
              </h3>
            </div>
            {getShippingInfo() && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-teal-700">Standard Delivery</p>
                    <p className="text-sm text-gray-500">
                      {getShippingInfo()?.standard.days} business days
                    </p>
                  </div>
                  <p className="font-medium text-teal-700">
                    {formatPrice(getConvertedPrice(getShippingInfo()?.standard.cost || 0), selectedCurrency)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-teal-700">Express Delivery</p>
                    <p className="text-sm text-gray-500">
                      {getShippingInfo()?.express.days} business days
                    </p>
                  </div>
                  <p className="font-medium text-teal-700">
                    {formatPrice(getConvertedPrice(getShippingInfo()?.express.cost || 0), selectedCurrency)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Product Details Tabs (Shipping & Reviews) */}
          <Tabs defaultValue="shipping" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shipping" className="data-[state=active]:text-teal-600">Shipping</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:text-teal-600">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="shipping" className="mt-4">
              <Card className="p-6 border border-teal-200">
                <div className="space-y-4">
                  <h3 className="font-semibold text-teal-700">Shipping Information</h3>
                  {product.shipping?.methods && product.shipping.methods.length > 0 ? (
                    <div className="space-y-4">
                      {product.shipping.methods.map((method, index) => (
                        <div
                          key={`shipping-${index}-${method.method}`}
                          className="p-4 rounded-lg bg-teal-50"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-teal-700">{method.method}</h4>
                              <p className="text-sm text-gray-500">
                                Estimated delivery: {method.estimatedDays} days
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-teal-700">
                                {formatPrice(getConvertedPrice(method.cost), selectedCurrency)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {selectedCountry === 'US'
                        ? "Shipping information not available"
                        : `International shipping to ${SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry)?.name} available`
                      }
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <Card className="p-6 border border-teal-200">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4 text-teal-700">Write a Review</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-teal-600">Rating</Label>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={`rating-star-${star}`}
                              className={`h-6 w-6 cursor-pointer ${
                                star <= rating ? 'text-orange-500' : 'text-gray-200'
                              }`}
                              onClick={() => setRating(star)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review" className="text-teal-600">Your Review</Label>
                        <Textarea
                          id="review"
                          placeholder="Write your review here..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSubmitReview}>
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
    </div>
  )
}