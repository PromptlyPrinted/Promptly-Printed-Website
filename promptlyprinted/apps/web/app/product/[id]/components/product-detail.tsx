"use client"

/**
 * Updated Product Detail Component with default `copies = 1`.
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

import { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs'
import { Button } from '@repo/design-system/components/ui/button'
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
import { StarIcon } from '@heroicons/react/24/solid'
import { toast } from '@repo/design-system/components/ui/use-toast'
import { Checkbox } from '@repo/design-system/components/ui/checkbox'
import { LORAS, Lora } from '../../../../data/textModel'
import { SUPPORTED_COUNTRIES, formatPrice, getDefaultCurrency } from '@/utils/currency'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { TruckIcon } from '@heroicons/react/24/outline'
import { CheckoutButton } from "@/components/CheckoutButton"
import { PRODUCT_IMAGE_SIZES } from '@/constants/product-sizes'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/design-system/components/ui/tooltip'
import { X } from "lucide-react"
import { DesignPicker } from "@/components/design-picker"

interface CheckoutImage {
  url: string
  dpi?: number
  width?: number
  height?: number
}

/**
 * Renamed `quantity` to `copies` here.
 * The field is optional, defaulting to `1` in handleCheckout().
 */
interface CheckoutItem {
  productId: string
  name: string
  price: number
  copies?: number
  images: CheckoutImage[]
}

// Utility to fetch the dominant color from an image
const getDominantColor = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve('#FFFFFF')

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      const centerX = Math.floor(canvas.width / 2)
      const centerY = Math.floor(canvas.height / 2)
      const pixelIndex = (centerY * canvas.width + centerX) * 4

      const r = data[pixelIndex]
      const g = data[pixelIndex + 1]
      const b = data[pixelIndex + 2]

      resolve(`rgb(${r}, ${g}, ${b})`)
    }
    img.onerror = () => resolve('#FFFFFF')
    img.src = imageUrl
  })
}

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined)
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
  const [colorMap, setColorMap] = useState<Record<string, string>>({})
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null)
  const [savedImageId, setSavedImageId] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [quantity, setQuantity] = useState<number>(1)

  // Refs
  const tshirtImageRef = useRef<HTMLImageElement>(null)
  const designImageRef = useRef<HTMLImageElement>(null)

  const { rates, loading: ratesLoading, error: ratesError, convertPrice } = useExchangeRates()

  // Utility: consistent kebab-case for color keys
  function toKebabCase(str?: string) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Memoized color and size lists
  const colorList = useMemo(() => (
    (product.specifications?.color && product.specifications.color.length > 0)
      ? product.specifications.color
      : (product.prodigiVariants?.colorOptions?.map((opt: any) => opt.name) || [])
  ), [product]);

  const sizeList = useMemo(() => (
    (product.specifications?.size && product.specifications.size.length > 0)
      ? product.specifications.size
      : (product.prodigiVariants?.sizes || [])
  ), [product]);

  useEffect(() => {
    console.log('product.specifications.size:', product.specifications?.dimensions.width);
    console.log('product.prodigiVariants.sizes:', product.specifications?.size);
    console.log('sizeList:', sizeList);
    console.log('product.specifications.color:', product.specifications?.color);
    console.log('product.prodigiVariants.colorOptions:', product.prodigiVariants?.colorOptions);
    console.log('colorList:', colorList);
    if (!colorList.length || !product.prodigiVariants?.imageUrls?.base) return;
    const loadColors = async () => {
      const newColorMap: Record<string, string> = {};
      for (const color of colorList) {
        const colorValue = toKebabCase(color);
        const imgUrl = `../${product.prodigiVariants.imageUrls.base}/${colorValue}.png`;
        // Optionally: check if file exists, but for now just try to extract
        const domColor = await getDominantColor(imgUrl);
        newColorMap[colorValue] = domColor;
      }
      setColorMap(newColorMap);
    };
    loadColors();
  }, [product, colorList]);

  useEffect(() => {
    if (colorList.length > 0) {
      setSelectedColor(toKebabCase(colorList[0]));
    }
  }, [colorList]);

  useEffect(() => {
    if (sizeList.length > 0) {
      setSelectedSize(sizeList[0]);
    }
  }, [sizeList]);

  useEffect(() => {
    if (generatedImage) {
      const img = document.createElement('img')
      img.src = generatedImage
    }
  }, [generatedImage])

  useEffect(() => {
    const newCurrency = getDefaultCurrency(selectedCountry)
    setSelectedCurrency(newCurrency)
  }, [selectedCountry])

  const getConvertedPrice = (price: number) => {
    if (ratesLoading) return price
    return convertPrice(price, 'USD', selectedCurrency)
  }

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

  // --- Utility function to get color swatch (always use extracted color) ---
  const getColorSwatch = (colorName: string): { color: string } => {
    const colorValue = toKebabCase(colorName);
    return { color: colorMap[colorValue] || '#FFFFFF' };
  };

  // ---- Generate Image ----
  const handleImageGeneration = async () => {
    if (!promptText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the image generation",
        variant: "destructive"
      })
      return
    }

    if (!selectedSize) {
      toast({
        title: "Error",
        description: "Please select a size before generating the design",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const productCode = product.specifications?.style || product.sku || product.id.toString()
      const imageSize = PRODUCT_IMAGE_SIZES[productCode as keyof typeof PRODUCT_IMAGE_SIZES] || { width: 4677, height: 5787 }
      const model = LORAS.find((m: Lora) => m.id === selectedModels[0])!
      const modelConfig = {
        model: model.path,
        type: 'lora',
        weight: modelWeights[model.id] || model.scale || 1.0,
        steps: model.steps || 28
      }
      const allModelConfigs = [
        {
          model: "black-forest-labs/FLUX.1-dev-lora",
          type: 'base',
          weight: 1.0
        },
        modelConfig
      ]
      const enhancedPrompt = `${promptText}, high resolution, 300 dpi, detailed, clear image, suitable for t-shirt printing, centered composition, professional quality, sharp details`
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          models: allModelConfigs,
          loraScale,
          width: imageSize.width,
          height: imageSize.height,
          dpi: 300
        })
      })

      const data = await response.json()
      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Failed to generate image'
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
      } else {
        throw new Error('No image URL in response')
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

  // ---- Download Image ----
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
      if (!ctx) throw new Error('Could not create canvas context')
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
      // fallback
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

  // ---- Save Image ----
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
      // First, save the image to temporary storage to get a permanent URL
      const tempRes = await fetch('/api/save-temp-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: generatedImage,
          isPublic: true
        })
      })
      
      if (!tempRes.ok) {
        throw new Error('Failed to save image temporarily')
      }
      
      const { id: tempId } = await tempRes.json()
      const permanentUrl = `/api/save-temp-image?id=${tempId}`

      // Then, save the design to the database with the permanent URL
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${product.name} Design`,
          imageUrl: permanentUrl,
          productId: Number(product.id),
        }),
      })
      const saved = await res.json()
      if (!res.ok) throw new Error(saved.error || 'Failed to save design')
      
      setSavedImageId(saved.id)
      setGeneratedImage(permanentUrl) // Update the generated image with the permanent URL
      
      toast({
        title: "Success",
        description: "Design saved successfully!",
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
    if (!savedImageId) {
      toast({ title: "Error", description: "Please save your design first", variant: "destructive" })
      return
    }
    setIsAddingToWishlist(true)
    try {
      const wishlistResponse = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: Number(product.id),
          savedImageId
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

  // ---- Checkout ----
  const handleCheckout = () => {
    if (!selectedSize) {
      toast({
        title: "Error",
        description: "Please select a size before proceeding to checkout",
        variant: "destructive"
      })
      return
    }
    if (!generatedImage) {
      toast({
        title: "Error",
        description: "Please generate a design first",
        variant: "destructive"
      })
      return
    }

    const productCode = product.specifications?.style || product.sku || product.id
    const imageSize = PRODUCT_IMAGE_SIZES[productCode as keyof typeof PRODUCT_IMAGE_SIZES] || {
      width: 4677,
      height: 5787
    }

    // Use selected quantity
    const item: CheckoutItem = {
      productId: product.id.toString(),
      name: product.name || 'Custom T-Shirt',
      price: product.price || 0,
      copies: quantity, // use selected quantity
      images: [
        {
          url: generatedImage,
          dpi: 300,
          width: imageSize.width,
          height: imageSize.height
        }
      ]
    }

    console.log('Setting checkout item:', item)
    setCheckoutItem(item)
  }

  const handleCloseCheckout = () => {
    setCheckoutItem(null)
  }

  const handleUploadClick = () => {
    // Add logic to handle upload click
  }

  const generatePreview = async (designUrl: string) => {
    // Add logic to generate preview
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
        {/* LEFT PANEL: T-shirt Preview + AI Prompt */}
        <div className="space-y-6">
          {/* T-shirt & Generated Design */}
          <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg border-2 border-teal-500 bg-teal-600 aspect-square">
            {(() => {
              console.log('Product data:', {
                imageUrlMap: product.imageUrlMap,
                colorValue: toKebabCase(selectedColor),
                imageUrl: product.imageUrl,
                selectedColor: selectedColor,
                availableColors: product.specifications?.color
              });
              
              if (product.imageUrlMap && product.imageUrlMap[selectedColor]) {
                console.log('Using imageUrlMap:', product.prodigiVariants?.imageUrls?.base);
                return (
                  <Image
                    src={product.imageUrlMap[selectedColor]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    ref={tshirtImageRef as any}
                  />
                );
              }

              if (product.prodigiVariants?.imageUrls?.base) {
                console.log('Product details now:', {
                  imageUrl: product.imageUrl,
                  prodigiVariants: product.prodigiVariants?.imageUrls?.base,
                  imageUrls: product.prodigiVariants?.imageUrls,
                  colorOptions: product.prodigiVariants?.colorOptions
                });
                const colorValue = selectedColor || (product.specifications?.color?.[0] ? toKebabCase(product.specifications.color[0]) :'black');
                const imageUrl = `../${product.prodigiVariants?.imageUrls?.base}/${colorValue}.png`;
                console.log('Using direct path:', {
                  imageUrl: imageUrl,
                  colorValue: colorValue,
                  baseImageUrl: product.imageUrl
                });
                return (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                    ref={tshirtImageRef as any}
                  />
                );
              }

              return (
                <div className="flex flex-col items-center justify-center text-white">
                  <div>Loading...</div>
                  <div className="mt-2">Base URL: {product.prodigiVariants?.imageUrls?.base || 'Not available'}</div>
                </div>
              );
            })()}

            {generatedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: '35%', height: '40%', overflow: 'hidden' }}>
                  <Image
                    src={generatedImage}
                    alt="Generated design"
                    fill
                    className="object-contain"
                    ref={designImageRef as any}
                    priority
                  />
                </div>
              </div>
            )}
          </div>


          {/* AI Prompt */}
          <div className="border rounded-lg p-6 space-y-4 border-teal-200">
            <h2 className="text-xl font-semibold mb-2 text-teal-700">Customize with AI</h2>
            <div className="space-y-4">
              <Label htmlFor="prompt" className="text-teal-600">
                Describe your design
              </Label>
              <Textarea
                id="prompt"
                placeholder="Enter your design description..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleImageGeneration}
                disabled={isGenerating || !promptText}
              >
                {isGenerating ? 'Generating...' : 'Generate Design'}
              </Button>
            </div>
          </div>

          {/* Design Picker / Upload */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Customize Your Design</h2>
            <div className="flex gap-4">
              <Button onClick={handleUploadClick}>Upload Image</Button>
              <DesignPicker
                productId={Number(product.id)}
                onDesignSelect={(design) => {
                  setImageUrl(design.url)
                  if (design.url) {
                    generatePreview(design.url)
                  }
                }}
              />
            </div>
          </div>
        </div>

      

        {/* RIGHT PANEL: Product Info, AI Settings, Checkout */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Product Info */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-teal-900">{product.name}</h1>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-teal-800">{formatPrice(getConvertedPrice(product.price), selectedCurrency)}</p>
              {selectedCurrency !== 'USD' && (
                <p className="text-sm text-gray-500">(${product.price.toFixed(2)} USD)</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-teal-700">Description</h3>
            <div className="mt-2 text-base text-gray-500 space-y-4">{product.description}</div>
          </div>

          {(sizeList.length > 0 || colorList.length > 0) && (
            <div className="space-y-4">
              {/* Sizing Dropdown ABOVE Color Selector */}
              {sizeList.length > 0 && (
                <div className="mb-4">
                  <Label htmlFor="size" className="text-teal-600">
                    Size
                  </Label>
                  <Select
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                  >
                    <SelectTrigger id="size" className="w-32 mt-2">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeList.map((sz) => (
                        <SelectItem key={sz} value={sz}>
                          {sz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {colorList.length > 0 && (
                <div>
                  <Label htmlFor="color" className="text-teal-600">
                    Color
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <TooltipProvider>
                      {colorList.map((clr, idx) => {
                        const colorValue = toKebabCase(clr)
                        const swatch = getColorSwatch(clr)
                        return (
                          <Tooltip key={`color-${idx}-${clr}`}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setSelectedColor(colorValue)}
                                className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                                  selectedColor === colorValue
                                    ? 'border-teal-600 scale-110 ring-2 ring-teal-300'
                                    : 'hover:border-teal-200 border-transparent'
                                }`}
                                aria-label={`Select ${clr} color`}
                                style={{ backgroundColor: swatch.color }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{clr}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </TooltipProvider>
                  </div>
                </div>
              )}
              {/* Quantity Selector always visible if any selector is shown */}
              <div className="w-full flex flex-col items-start mt-2">
                <Label htmlFor="quantity" className="text-teal-600 mb-1">
                  Quantity
                </Label>
                <div className="flex items-center bg-teal-50 rounded-full px-2 py-1 shadow-inner gap-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className="w-9 h-9 rounded-full bg-white border border-teal-300 flex items-center justify-center text-teal-700 text-xl font-bold hover:bg-teal-100 active:bg-teal-200 transition disabled:opacity-50"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-center border-none bg-teal-50 text-lg font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className="w-9 h-9 rounded-full bg-white border border-teal-300 flex items-center justify-center text-teal-700 text-xl font-bold hover:bg-teal-100 active:bg-teal-200 transition"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Settings */}
          <div className="border rounded-lg p-6 space-y-4 border-teal-200">
            <h2 className="text-xl font-semibold text-teal-700">AI Settings</h2>
            {generationMode === 'text' && (
              <div>
                <Label className="text-teal-600 mb-4 block">AI Models &amp; LoRAs</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {LORAS.map((model: Lora) => (
                    <div
                      key={model.id}
                      className={`
                        relative aspect-square rounded-lg overflow-hidden cursor-pointer
                        transition-all duration-200 group
                        ${
                          selectedModels.includes(model.id)
                            ? 'ring-2 ring-teal-500'
                            : 'hover:ring-2 hover:ring-teal-200'
                        }
                      `}
                      onClick={() => {
                        if (selectedModels[0] === model.id) return
                        setSelectedModels([model.id])
                        setModelWeights({ [model.id]: model.scale || 1.0 })
                      }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={`/lora-images/${model.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                          alt={model.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm">
                        <p className="text-white text-sm font-medium text-center">
                          {model.name.split(/(?=[A-Z])/).join(' ')}
                        </p>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          id={`model-${model.id}`}
                          checked={selectedModels.includes(model.id)}
                          className="bg-white/90 border-teal-500 data-[state=checked]:bg-teal-500"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setSelectedModels([model.id])
                              setModelWeights({ [model.id]: model.scale || 1.0 })
                            } else if (selectedModels.length === 1 && selectedModels[0] === model.id) {
                              // Prevent unchecking the only selected model
                              return
                            }
                          }}
                        />
                      </div>
                      {selectedModels.includes(model.id) && (
                        <div className="absolute left-0 right-0 bottom-12 px-4 py-2">
                          <Slider
                            value={[modelWeights[model.id] || model.scale || 1.0]}
                            onValueChange={([value]) => {
                              setModelWeights({ [model.id]: value })
                            }}
                            min={0}
                            max={1}
                            step={0.1}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {generatedImage && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  variant="outline"
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Downloading...' : 'Download as PNG (300 DPI)'}
                </Button>

                <Button
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  variant="outline"
                  onClick={handleSaveImage}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save to My Images'}
                </Button>

                <Button
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  variant="outline"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                >
                  {isAddingToWishlist ? 'Adding to Designs...' : 'Save to My Designs'}
                </Button>
              </div>
            )}
          </div>

          {/* Checkout Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button
              className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              size="lg"
              onClick={() => {
                if (!selectedSize) {
                  toast({
                    title: "Error",
                    description: "Please select a size before adding to cart",
                    variant: "destructive"
                  })
                  return
                }
                /* Add to cart logic */
              }}
            >
              Add to Cart
            </Button>
            <Button
              className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              size="lg"
              onClick={handleCheckout}
            >
              Buy Now
            </Button>
          </div>

          {/* Shipping Info */}
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
                    <p className="text-sm text-gray-500">{getShippingInfo()?.standard.days} business days</p>
                  </div>
                  <p className="font-medium text-teal-700">
                    {formatPrice(getConvertedPrice(getShippingInfo()?.standard.cost || 0), selectedCurrency)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs: Shipping & Reviews */}
          <Tabs defaultValue="shipping" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shipping" className="data-[state=active]:text-teal-600">
                Shipping
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:text-teal-600">
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shipping" className="mt-4">
              <Card className="p-6 border border-teal-200">
                <div className="space-y-4">
                  <h3 className="font-semibold text-teal-700">Shipping Information</h3>
                  {product.shipping?.methods && product.shipping.methods.length > 0 ? (
                    <div className="space-y-4">
                      {product.shipping.methods.map((method, index) => (
                        <div key={`shipping-${index}-${method.method}`} className="p-4 rounded-lg bg-teal-50">
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
                        ? "All shipping is currently free for all products"
                        : `International shipping to ${
                            SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry)?.name
                          } available`}
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
                        <Label htmlFor="review" className="text-teal-600">
                          Your Review
                        </Label>
                        <Textarea
                          id="review"
                          placeholder="Write your review here..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={handleSubmitReview}
                      >
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

      {/* Modal-like Checkout overlay */}
      {checkoutItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseCheckout}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Checkout</h3>
              <Button variant="ghost" size="icon" onClick={handleCloseCheckout}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CheckoutButton items={[checkoutItem]} />
          </div>
        </div>
      )}
    </div>
  )
}