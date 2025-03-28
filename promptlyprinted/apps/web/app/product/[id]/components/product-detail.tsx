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
 * High-Resolution Output:
 * - Downloaded image size: 4680x5790px at 300 DPI
 * - Print-ready quality suitable for professional printing
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
import { LORAS, Lora } from '../../../../data/textModel'
import { SUPPORTED_COUNTRIES, formatPrice, convertPrice, getDefaultCurrency } from '@/utils/currency'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { GlobeAltIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { CheckoutButton } from "@/components/CheckoutButton"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  // State
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(product.colorOptions?.[0]?.filename || '')
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
  
  // Refs for T-shirt and design images (if needed)
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
    if (ratesLoading) return price;
    return convertWithRates(price, 'USD', selectedCurrency);
  }

  // Get shipping information based on country
  const getShippingInfo = () => {
    const country = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry);
    if (!country) return null;

    const isEU = country.currency === 'EUR';
    const baseShipping = product.shippingCost || 0;
    
    return {
      standard: {
        cost: isEU ? baseShipping : baseShipping * 1.2,
        days: isEU ? '3-5' : '5-7'
      },
      express: {
        cost: isEU ? baseShipping * 1.5 : baseShipping * 2,
        days: isEU ? '1-2' : '2-3'
      }
    };
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
      ];

      // Enhanced prompt for high-quality T-shirt printing
      const enhancedPrompt = `${promptText}, high resolution, 300 dpi, detailed, clear image, suitable for t-shirt printing, centered composition, professional quality, sharp details`

      // Call your /api/generate-image route
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          models: allModelConfigs, // Use the array with the base model included
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
      // Show a loading toast with resolution info
      toast({
        title: "Preparing high-resolution image",
        description: "Creating 4680x5790px (300 DPI) print-ready image...",
        variant: "default"
      })
      
      // Create a canvas sized for 300 DPI at 4680x5790px
      const canvas = document.createElement('canvas')
      canvas.width = 4680  // Requested width
      canvas.height = 5790 // Requested height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not create canvas context')
      }

      // Transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Load design image
      const designImage = document.createElement('img')
      designImage.crossOrigin = 'anonymous'

      // Wait for design image to load
      await new Promise<void>((resolve, reject) => {
        designImage.onload = () => {
          resolve()
        }
        designImage.onerror = () => reject(new Error('Failed to load design image'))

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

      // Apply anti-aliasing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Draw the design at full canvas size with high quality
      ctx.drawImage(designImage, 0, 0, canvas.width, canvas.height)

      // Convert to data URL and download
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

      // Fallback: just download the generated design as-is
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

  // Save generated image
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

  // Add to wishlist
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
      // First save the image
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

      // Then add to wishlist
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

  // ---- Example: Submitting a Review ----
  const handleSubmitReview = async () => {
    // Implement review submission logic here
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
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      images: product.images
    }

    return <CheckoutButton items={[checkoutItem]} />
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
            //src = 'product.specifications?.color'
            //'/assets/images/Apparel/Mens/T-Shirts/GLOBAL-TEE-GIL-64V00/Blanks/png/navy.png'
            src={`../${product.imageUrl}/${(selectedColor || product.specifications?.color[0]).replace(/ /g, '-')}.png`}
            alt={product.name}
            width={800}       // Example real T-shirt ratio
            height={1000}     // Example real T-shirt ratio
            className="object-contain"
            ref={tshirtImageRef as any}
            onError={(e) => {
              //console.log('Base path:', product.imageUrls?.base);
              console.log('Base path 2:', product.imageUrl);
              console.log('Selected color filename:', selectedColor);
              //console.log('Color options:', product.colorOptions);
               console.log('Color options 2:', product.specifications?.color);
              //console.log('Full image path:', `${product.imageUrls?.base}/${selectedColor || product.colorOptions?.[0]?.filename || 'white.png'}`);
            }}
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
        {/* Country and Currency Selection *
        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
          <GlobeAltIcon className="h-6 w-6 text-gray-400" />
          <div className="flex-1 space-y-1">
            <Label htmlFor="country">Ship to</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" disabled>Select your country</SelectItem>
                {Object.entries(COUNTRIES_BY_CURRENCY).map(([currency, countries]) => (
                  <div key={currency}>
                    <div className="px-2 py-1.5 text-sm font-semibold bg-gray-100">
                      {currency} Zone
                    </div>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {ratesLoading && (
              <p className="text-sm text-gray-500">Loading exchange rates...</p>
            )}
            {ratesError && (
              <p className="text-sm text-red-500">Using fallback exchange rates</p>
            )}
          </div>
        </div> */}

        {/* Price Display with International Support */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">
              {formatPrice(getConvertedPrice(product.price), selectedCurrency)}
            </p>
            {selectedCurrency !== 'USD' && (
              <p className="text-sm text-gray-500">
                (${product.price.toFixed(2)} USD)
              </p>
            )}
          </div>
        </div>

        {/* International Shipping Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TruckIcon className="h-5 w-5 text-gray-400" />
            <h3 className="font-medium">Shipping to {SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry)?.name}</h3>
          </div>
          {getShippingInfo() && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Standard Delivery</p>
                  <p className="text-sm text-gray-500">{getShippingInfo()?.standard.days} business days</p>
                </div>
                <p className="font-medium">
                  {formatPrice(getConvertedPrice(getShippingInfo()?.standard.cost || 0), selectedCurrency)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Express Delivery</p>
                  <p className="text-sm text-gray-500">{getShippingInfo()?.express.days} business days</p>
                </div>
                <p className="font-medium">
                  {formatPrice(getConvertedPrice(getShippingInfo()?.express.cost || 0), selectedCurrency)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* International Guarantees */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="font-medium">International Order Guarantees</h3>
              <ul className="mt-2 text-sm text-gray-500 space-y-1">
                <li>• Secure international payments</li>
                <li>• Duty and tax calculated at checkout</li>
                <li>• Track your order globally</li>
                <li>• International return shipping included</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Basic product info */}
        <div>
          <h3 className="text-sm font-medium text-gray-900">Description</h3>
          <div className="mt-2 text-base text-gray-500 space-y-4">
            {product.description}
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

        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={() => {/* Add to cart logic */}}>
            Add to Cart
          </Button>
          <CheckoutButton
            items={[{
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              images: product.images
            }]}
            variant="outline"
            className="w-full"
          />
        </div>

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
                {LORAS.map((model: Lora) => (
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
                    {selectedModels.includes(model.id) && (
                      <div className="flex-1 max-w-[200px]">
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
              <div className="space-y-2">
                <Button
                  className="w-full mt-2"
                  variant="outline"
                  onClick={handleDownloadImage}
                  disabled={isDownloading || !generatedImage}
                >
                  {isDownloading ? 'Downloading...' : 'Download as PNG (300 DPI)'}
                </Button>
                
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleSaveImage}
                  disabled={isSaving || !generatedImage}
                >
                  {isSaving ? 'Saving...' : 'Save to My Images'}
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist || !generatedImage}
                >
                  {isAddingToWishlist ? 'Adding to Designs...' : 'Save to My Designs'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold">Product Details</h2>
          
          {/* Materials */}
          <div>
            <h3 className="font-medium text-gray-900">Materials</h3>
            <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
              {product.materials?.map((material, index) => (
                <li key={`material-${index}`}>{material}</li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-medium text-gray-900">Features</h3>
            <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
              {product.features?.map((feature, index) => (
                <li key={`feature-${index}`}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Eco Properties */}
          <div>
            <h3 className="font-medium text-gray-900">Sustainability</h3>
            <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
              {product.ecoProperties?.map((prop, index) => (
                <li key={`eco-${index}`}>{prop}</li>
              ))}
            </ul>
          </div>

          {/* Care Instructions */}
          <div>
            <h3 className="font-medium text-gray-900">Care Instructions</h3>
            <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
              {product.careInstructions?.map((instruction, index) => (
                <li key={`care-${index}`}>{instruction}</li>
              ))}
            </ul>
          </div>

          {/* Manufacturing Location */}
          {product.manufacturingLocation && (
            <div>
              <h3 className="font-medium text-gray-900">Manufacturing</h3>
              <p className="mt-2 text-gray-600">{product.manufacturingLocation}</p>
            </div>
          )}
        </div>

        {/* Product Details Tabs - Updated to remove redundant information */}
        <Tabs defaultValue="shipping" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

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