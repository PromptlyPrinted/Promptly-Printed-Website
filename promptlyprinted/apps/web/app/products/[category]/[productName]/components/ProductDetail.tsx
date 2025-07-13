'use client';

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

import { DesignPicker } from '@/components/design-picker';
import { PRODUCT_IMAGE_SIZES } from '@/constants/product-sizes';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useCheckout } from '@/hooks/useCheckout';
import type { Product } from '@/types/product';
import {
  SUPPORTED_COUNTRIES,
  formatPrice,
  getDefaultCurrency,
} from '@/utils/currency';
import { useAuth } from '@clerk/nextjs';
import { TruckIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Slider } from '@repo/design-system/components/ui/slider';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/design-system/components/ui/tooltip';
import { useCartStore } from '@/lib/cart-store';
import { toast } from '@repo/design-system/components/ui/use-toast';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LORAS, type Lora } from '../../../../../data/textModel';

interface CheckoutImage {
  url: string;
  dpi?: number;
  width?: number;
  height?: number;
}

/**
 * Renamed `quantity` to `copies` here.
 * The field is optional, defaulting to `1` in handleCheckout().
 */
interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  copies?: number;
  color: string;
  size: string;
  images: CheckoutImage[];
}

// Utility to fetch the dominant color from an image
const getDominantColor = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('#FFFFFF');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Get multiple sample points to find dominant color
        const samples = [];
        const sampleSize = 10;
        for (let i = 0; i < sampleSize; i++) {
          const x = Math.floor((img.width / sampleSize) * i);
          const y = Math.floor(img.height / 2);
          const pixelIndex = (y * canvas.width + x) * 4;
          
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          const a = data[pixelIndex + 3];
          
          // Skip transparent pixels
          if (a > 0) {
            samples.push({ r, g, b });
          }
        }
        
        if (samples.length === 0) {
          resolve('#FFFFFF');
          return;
        }
        
        // Average the samples
        const avgR = Math.floor(samples.reduce((sum, s) => sum + s.r, 0) / samples.length);
        const avgG = Math.floor(samples.reduce((sum, s) => sum + s.g, 0) / samples.length);
        const avgB = Math.floor(samples.reduce((sum, s) => sum + s.b, 0) / samples.length);
        
        resolve(`rgb(${avgR}, ${avgG}, ${avgB})`);
      } catch (error) {
        console.error('Error extracting color:', error);
        resolve('#FFFFFF');
      }
    };
    img.onerror = (error) => {
      console.error('Image load error:', error);
      resolve('#FFFFFF');
    };
    img.src = imageUrl;
  });
};

// Fallback color mapping for common T-shirt colors
const getColorFallback = (colorName: string): string => {
  const fallbackColors: Record<string, string> = {
    'white': '#FFFFFF',
    'black': '#000000',
    'navy': '#000080',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'gray': '#808080',
    'grey': '#808080',
    'light-blue': '#ADD8E6',
    'dark-blue': '#00008B',
    'light-green': '#90EE90',
    'dark-green': '#006400',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'teal': '#008080',
    'silver': '#C0C0C0',
    'fuchsia': '#FF00FF',
  };
  
  const colorKey = toKebabCase(colorName);
  return fallbackColors[colorKey] || '#FFFFFF';
};

// Helper function to convert color name to kebab case
function toKebabCase(str?: string) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );
  const [promptText, setPromptText] = useState('');
  const [selectedModels, setSelectedModels] = useState<(number | string)[]>([
    LORAS[0].id,
  ]);
  const [modelWeights, setModelWeights] = useState<
    Record<string | number, number>
  >({});
  const [generationMode, setGenerationMode] = useState('text');
  const [loraScale, setLoraScale] = useState(0.7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [savedImageId, setSavedImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const { items: cartItems, addItem } = useCartStore();
  const { initiateCheckout, isLoading: isCheckingOut } = useCheckout();
  const { getToken } = useAuth();
  const [isBaseModel, setIsBaseModel] = useState(false);

  // Refs
  const tshirtImageRef = useRef<HTMLImageElement>(null);
  const designImageRef = useRef<HTMLImageElement>(null);

  const {
    rates,
    loading: ratesLoading,
    error: ratesError,
    convertPrice,
  } = useExchangeRates();

  // Utility: consistent kebab-case for color keys (moved above)

  // Memoized color and size lists
  const colorList = useMemo(
    () =>
      product.specifications?.color && product.specifications.color.length > 0
        ? product.specifications.color
        : product.prodigiVariants?.colorOptions?.map((opt: any) => opt.name) ||
          [],
    [product]
  );

  const sizeList = useMemo(
    () =>
      product.specifications?.size && product.specifications.size.length > 0
        ? product.specifications.size
        : product.prodigiVariants?.sizes || [],
    [product]
  );

  useEffect(() => {
    console.log(
      'product.specifications.size:',
      product.specifications?.dimensions.width
    );
    console.log('product.prodigiVariants.sizes:', product.specifications?.size);
    console.log('sizeList:', sizeList);
    console.log('product.specifications.color:', product.specifications?.color);
    console.log(
      'product.prodigiVariants.colorOptions:',
      product.prodigiVariants?.colorOptions
    );
    console.log('colorList:', colorList);
    if (!colorList.length) return;
    
    const loadColors = async () => {
      const newColorMap: Record<string, string> = {};
      for (const color of colorList) {
        const colorValue = toKebabCase(color);
        
        // Try to extract from image if base URL exists
        if (product.prodigiVariants?.imageUrls?.base) {
          const imgUrl = `${product.prodigiVariants.imageUrls.base}/${colorValue}.png`;
          console.log(`Attempting to extract color from: ${imgUrl}`);
          try {
            const domColor = await getDominantColor(imgUrl);
            // Only use extracted color if it's not white (indicating successful extraction)
            if (domColor !== 'rgb(255, 255, 255)') {
              newColorMap[colorValue] = domColor;
              console.log(`Color extracted for ${color}: ${domColor}`);
              continue;
            }
          } catch (error) {
            console.error(`Failed to extract color for ${color}:`, error);
          }
        }
        
        // Use fallback color if extraction failed or no base URL
        const fallbackColor = getColorFallback(color);
        newColorMap[colorValue] = fallbackColor;
        console.log(`Using fallback color for ${color}: ${fallbackColor}`);
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
      const img = document.createElement('img');
      img.src = generatedImage;
    }
  }, [generatedImage]);

  useEffect(() => {
    const newCurrency = getDefaultCurrency(selectedCountry);
    setSelectedCurrency(newCurrency);
  }, [selectedCountry]);

  const getConvertedPrice = (price: number) => {
    if (ratesLoading) return price;
    return convertPrice(price, 'USD', selectedCurrency);
  };

  const getShippingInfo = () => {
    const country = SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry);
    if (!country) return null;
    const isEU = country.currency === 'EUR';
    const baseShipping = product.shippingCost || 0;

    return {
      standard: {
        cost: isEU ? baseShipping : baseShipping * 1.2,
        days: isEU ? '3-5' : '5-7',
      },
      express: {
        cost: isEU ? baseShipping * 1.5 : baseShipping * 2,
        days: isEU ? '1-2' : '2-3',
      },
    };
  };

  // --- Utility function to get color swatch (always use extracted color) ---
  const getColorSwatch = (colorName: string): { color: string } => {
    const colorValue = toKebabCase(colorName);
    return { color: colorMap[colorValue] || '#FFFFFF' };
  };

  // ---- Generate Image ----
  const handleImageGeneration = async () => {
    if (!promptText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for the image generation',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedSize) {
      toast({
        title: 'Error',
        description: 'Please select a size before generating the design',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const productCode =
        product.specifications?.style || product.sku || product.id.toString();
      const imageSize = PRODUCT_IMAGE_SIZES[
        productCode as keyof typeof PRODUCT_IMAGE_SIZES
      ] || { width: 4677, height: 5787 };

      if (isBaseModel) {
        // Use pure text-to-image model without LORAs
        const payload = {
          prompt: promptText,
          models: [
            {
              model: 'black-forest-labs/FLUX.1-schnell-Free',
              type: 'base',
              weight: 1.0,
            },
          ],
          width: Math.min(imageSize.width, 1024), // Cap at 1024 as per API limits
          height: Math.min(imageSize.height, 1024),
          dpi: 300,
          steps: 4,
        };

        console.log(
          'Base model request payload:',
          JSON.stringify(payload, null, 2)
        );

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('Base model response:', JSON.stringify(data, null, 2));

        if (!response.ok) {
          console.error('Base model error response:', {
            status: response.status,
            statusText: response.statusText,
            data: data,
          });
          const errorMessage =
            data.details || data.error || 'Failed to generate image';
          throw new Error(errorMessage);
        }

        if (data.data?.[0]?.url) {
          // Changed to match API response format
          console.log('Found image URL in response:', data.data[0].url);

          // Save the image immediately after generation
          console.log('Saving generated image to database...');
          const saveRes = await fetch('/api/save-temp-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: data.data[0].url,
              isPublic: true,
            }),
          });

          if (!saveRes.ok) {
            console.error('Failed to save image:', await saveRes.text());
            throw new Error('Failed to save generated image');
          }

          const saveData = await saveRes.json();
          console.log('Image saved successfully:', saveData);

          const permanentUrl = `/api/save-temp-image?id=${saveData.id}`;
          console.log('Using permanent URL:', permanentUrl);

          setGeneratedImage(permanentUrl);
          toast({
            title: 'Success',
            description: 'Image generated and saved successfully!',
            variant: 'default',
          });
        } else {
          console.error('No image URL found in response:', data);
          throw new Error('No image URL in response');
        }
      } else {
        // Use LORA-based generation
        const modelId = selectedModels[0];
        const model = LORAS.find((m: Lora) => m.id === modelId);
        if (!model) {
          throw new Error('Selected model not found');
        }

        const modelConfig = {
          model: model.path,
          type: 'lora',
          weight: modelWeights[modelId] || model.scale || 1.0,
          steps: 4,
        };
        const allModelConfigs = [
          {
            model: 'black-forest-labs/FLUX.1-dev-lora',
            type: 'base',
            weight: 1.0,
            steps: 4,
          },
          modelConfig,
        ];
        const enhancedPrompt = `${promptText}, high resolution, 300 dpi, detailed, clear image, suitable for t-shirt printing, centered composition, professional quality, sharp details`;

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            models: allModelConfigs,
            loraScale,
            width: imageSize.width,
            height: imageSize.height,
            dpi: 300,
            steps: 4,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          const errorMessage =
            data.details || data.error || 'Failed to generate image';
          throw new Error(errorMessage);
        }
        if (data.data?.[0]?.url) {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(data.data[0].url)}`;
          setGeneratedImage(proxyUrl);
          toast({
            title: 'Success',
            description: 'Image generated successfully!',
            variant: 'default',
          });
        } else {
          throw new Error('No image URL in response');
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Download Image ----
  const handleDownloadImage = async () => {
    if (!generatedImage) {
      toast({
        title: 'Error',
        description: 'Please generate a design first',
        variant: 'destructive',
      });
      return;
    }
    setIsDownloading(true);
    try {
      toast({
        title: 'Preparing high-resolution image',
        description: 'Creating 4680x5790px (300 DPI) print-ready image...',
        variant: 'default',
      });

      const canvas = document.createElement('canvas');
      canvas.width = 4680;
      canvas.height = 5790;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const designImage = document.createElement('img');
      designImage.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        designImage.onload = () => resolve();
        designImage.onerror = () =>
          reject(new Error('Failed to load design image'));

        if (generatedImage.startsWith('data:')) {
          designImage.src = generatedImage;
        } else {
          fetch(generatedImage)
            .then((res) => res.blob())
            .then((blob) => {
              designImage.src = URL.createObjectURL(blob);
            })
            .catch(reject);
        }
      });

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(designImage, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-design-only.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description:
          'High-resolution image (4680x5790px, 300 DPI) downloaded successfully!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to download image',
        variant: 'destructive',
      });
      // fallback
      try {
        toast({
          title: 'Trying simple fallback',
          description: 'Downloading the design image as-is...',
          variant: 'default',
        });
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-design-only.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // ---- Save Image ----
  const handleSaveImage = async () => {
    if (!generatedImage) {
      toast({
        title: 'Error',
        description: 'Please generate a design first',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    try {
      // First, save the image to temporary storage to get a permanent URL
      const tempRes = await fetch('/api/save-temp-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: generatedImage,
          isPublic: true,
        }),
      });

      if (!tempRes.ok) {
        throw new Error('Failed to save image temporarily');
      }

      const { id: tempId } = await tempRes.json();
      const permanentUrl = `/api/save-temp-image?id=${tempId}`;

      // Then, save the design to the database with the permanent URL
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${product.name} Design`,
          imageUrl: permanentUrl,
          productId: Number(product.id),
        }),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || 'Failed to save design');

      setSavedImageId(saved.id);
      setGeneratedImage(permanentUrl); // Update the generated image with the permanent URL

      toast({
        title: 'Success',
        description: 'Design saved successfully!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save image',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Add to Wishlist ----
  const handleAddToWishlist = async () => {
    if (!generatedImage) {
      toast({
        title: 'Error',
        description: 'Please generate a design first',
        variant: 'destructive',
      });
      return;
    }
    if (!savedImageId) {
      toast({
        title: 'Error',
        description: 'Please save your design first',
        variant: 'destructive',
      });
      return;
    }
    setIsAddingToWishlist(true);
    try {
      const wishlistResponse = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: Number(product.id),
          savedImageId,
        }),
      });
      if (!wishlistResponse.ok) {
        throw new Error('Failed to add to wishlist');
      }
      toast({
        title: 'Success',
        description: 'Design saved to My Designs!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add to wishlist',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  // ---- Submit Review ----
  const handleSubmitReview = async () => {
    console.log('Submitting review:', { rating, reviewText });
  };

  // ---- Checkout ----
  const handleCheckout = async () => {
    if (!selectedSize) {
      toast({
        title: 'Error',
        description: 'Please select a size before proceeding to checkout',
        variant: 'destructive',
      });
      return;
    }

    if (!generatedImage) {
      toast({
        title: 'Error',
        description: 'Please generate a design first',
        variant: 'destructive',
      });
      return;
    }

    const itemToAdd = {
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      imageUrl: generatedImage || product.imageUrls.cover,
      assets: [],
    };
    addItem(itemToAdd);

    const allItems = [...cartItems, itemToAdd];
    const allItemsAsCheckoutItems = allItems.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      copies: item.quantity,
      color: item.color,
      size: item.size,
      images: [{ url: item.imageUrl }],
      customization: item.customization,
      recipientCostAmount: item.price,
      currency: 'USD',
      merchantReference: `item_${item.productId}`,
      sku: item.productId,
    }));
    initiateCheckout(allItemsAsCheckoutItems);
  };

  const handleCloseCheckout = () => {
    setCheckoutItem(null);
  };

  const handleUploadClick = () => {
    // Add logic to handle upload click
  };

  const generatePreview = async (designUrl: string) => {
    // Add logic to generate preview
  };

  return (
    <div className="mx-auto max-w-[1440px] px-3 py-8 lg:px-6 lg:py-12">
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-2">
        {/* LEFT PANEL: T-shirt Preview + AI Prompt */}
        <div className="space-y-4">
          {/* T-shirt & Generated Design */}
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-lg border-2 border-teal-500 bg-teal-600">
            {(() => {
              console.log('Product data:', {
                imageUrlMap: product.imageUrlMap,
                colorValue: toKebabCase(selectedColor),
                imageUrl: product.imageUrl,
                selectedColor: selectedColor,
                availableColors: product.specifications?.color,
              });

              if (product.imageUrlMap && product.imageUrlMap[selectedColor]) {
                console.log(
                  'Using imageUrlMap:',
                  product.prodigiVariants?.imageUrls?.base
                );
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
                  colorOptions: product.prodigiVariants?.colorOptions,
                });
                const colorValue =
                  selectedColor ||
                  (product.specifications?.color?.[0]
                    ? toKebabCase(product.specifications.color[0])
                    : 'black');
                const imageUrl = `${product.prodigiVariants?.imageUrls?.base}/${colorValue}.png`;
                console.log('Using direct path:', {
                  imageUrl: imageUrl,
                  colorValue: colorValue,
                  baseImageUrl: product.imageUrl,
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
                  <div className="mt-2">
                    Base URL:{' '}
                    {product.prodigiVariants?.imageUrls?.base ||
                      'Not available'}
                  </div>
                </div>
              );
            })()}

            {generatedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="relative"
                  style={{ width: '35%', height: '40%', overflow: 'hidden' }}
                >
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
          <div className="space-y-3 rounded-lg border border-teal-200 p-4">
            <h2 className="font-semibold text-teal-700 text-lg">
              Customize with AI
            </h2>
            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-teal-600 text-sm">
                Describe your design
              </Label>
              <Textarea
                id="prompt"
                placeholder="Enter your design description..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="min-h-[60px]"
              />
              <Button
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
                onClick={handleImageGeneration}
                disabled={isGenerating || !promptText}
                size="sm"
              >
                {isGenerating ? 'Generating...' : 'Generate Design'}
              </Button>
            </div>
          </div>

          {/* Design Picker / Upload */}
          <div className="space-y-3">
            <h2 className="font-semibold text-base">Customize Your Design</h2>
            <div className="flex gap-3">
              <Button onClick={handleUploadClick} size="sm">Upload Image</Button>
              <DesignPicker
                productId={Number(product.id)}
                onDesignSelect={(design) => {
                  setImageUrl(design.url);
                  if (design.url) {
                    generatePreview(design.url);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Product Info, AI Settings, Checkout */}
        <div className="space-y-4 lg:sticky lg:top-4">
          {/* Product Info */}
          <div className="space-y-1">
            <h1 className="font-bold text-2xl text-teal-900 tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline space-x-2">
              <p className="font-bold text-2xl text-teal-800">
                {formatPrice(
                  getConvertedPrice(product.price),
                  selectedCurrency
                )}
              </p>
              {selectedCurrency !== 'USD' && (
                <p className="text-gray-500 text-sm">
                  (${product.price.toFixed(2)} USD)
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium text-sm text-teal-700">Description</h3>
            <div className="mt-1 text-sm text-gray-500">
              {product.description}
            </div>
          </div>

          {(sizeList.length > 0 || colorList.length > 0) && (
            <div className="space-y-3">
              {/* Sizing Dropdown ABOVE Color Selector */}
              {sizeList.length > 0 && (
                <div className="mb-2">
                  <Label htmlFor="size" className="text-teal-600 text-sm">
                    Size
                  </Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger id="size" className="mt-1 w-32 h-8">
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
                  <Label htmlFor="color" className="text-teal-600 text-sm">
                    Color
                  </Label>
                  <div className="mt-1 flex gap-1">
                    <TooltipProvider>
                      {colorList.map((clr, idx) => {
                        const colorValue = toKebabCase(clr);
                        const swatch = getColorSwatch(clr);
                        return (
                          <Tooltip key={`color-${idx}-${clr}`}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setSelectedColor(colorValue)}
                                className={`h-6 w-6 rounded-full border-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                                  selectedColor === colorValue
                                    ? 'scale-110 border-teal-600 ring-2 ring-teal-300'
                                    : 'border-transparent hover:border-teal-200'
                                }`}
                                aria-label={`Select ${clr} color`}
                                style={{ backgroundColor: swatch.color }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{clr}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                </div>
              )}
              {/* Quantity Selector always visible if any selector is shown */}
              <div className="mt-2 flex w-full flex-col items-start">
                <Label htmlFor="quantity" className="mb-1 text-teal-600 text-sm">
                  Quantity
                </Label>
                <div className="flex items-center gap-2 rounded-full bg-teal-50 px-2 py-1 shadow-inner">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-teal-300 bg-white font-bold text-teal-700 text-lg transition hover:bg-teal-100 active:bg-teal-200 disabled:opacity-50"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value)))
                    }
                    className="w-12 border-none bg-teal-50 text-center font-semibold text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-teal-300 bg-white font-bold text-teal-700 text-lg transition hover:bg-teal-100 active:bg-teal-200"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Settings */}
          <div className="space-y-3 rounded-lg border border-teal-200 p-4">
            <h2 className="font-semibold text-teal-700 text-lg">AI Settings</h2>

            {/* Generation Mode Buttons */}
            <div className="mb-3 flex gap-2">
              <Button
                className={`flex-1 h-8 text-sm ${
                  generationMode === 'text'
                    ? 'bg-teal-600 text-white'
                    : 'border-teal-600 bg-white text-teal-600'
                }`}
                variant={generationMode === 'text' ? 'default' : 'outline'}
                onClick={() => setGenerationMode('text')}
              >
                Text to Image
              </Button>
              <Button
                className={`flex-1 h-8 text-sm ${
                  generationMode === 'image'
                    ? 'bg-teal-600 text-white'
                    : 'border-teal-600 bg-white text-teal-600'
                }`}
                variant={generationMode === 'image' ? 'default' : 'outline'}
                onClick={() => setGenerationMode('image')}
              >
                Image to Image
              </Button>
            </div>


            {generationMode === 'text' && (
              <div>
                <div className="mb-3">
                  <Label className="mb-1 block text-teal-600 text-sm">
                    Select Model
                  </Label>
                  <Select
                    value={isBaseModel ? 'base' : selectedModels[0]?.toString()}
                    onValueChange={(value) => {
                      if (value === 'base') {
                        setIsBaseModel(true);
                        setSelectedModels([]);
                      }
                      else {
                        setIsBaseModel(false);
                        setSelectedModels([Number(value)]);
                        setModelWeights({ [value]: 1.0 });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-8 border-teal-200 bg-white hover:border-teal-300 focus:ring-teal-500">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LORAS[0].id.toString()}>
                        Promptly LORA's (Fine-tuned)
                      </SelectItem>
                      <SelectItem value="base">
                        Promptly Base Model (Pure Text-to-Image)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isBaseModel && (
                  <>
                    <Label className="mb-2 block text-teal-600 text-sm">
                      AI Models &amp; LoRAs
                    </Label>
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
                      {LORAS.map((model: Lora) => (
                        <div
                          key={model.id}
                          className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-all duration-200 ${
                            selectedModels.includes(model.id)
                              ? 'ring-2 ring-teal-500'
                              : 'hover:ring-2 hover:ring-teal-200'
                          }`}
                          onClick={() => {
                            if (selectedModels[0] === model.id) return;
                            setSelectedModels([model.id]);
                            setModelWeights({ [model.id]: model.scale || 1.0 });
                          }}
                        >
                          <div className="relative h-full w-full">
                            <Image
                              src={`/lora-images/${model.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                              alt={model.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-1 backdrop-blur-sm">
                            <p className="text-center font-medium text-xs text-white">
                              {model.name.split(/(?=[A-Z])/).join(' ')}
                            </p>
                          </div>
                          <div className="absolute top-1 left-1">
                            <Checkbox
                              id={`model-${model.id}`}
                              checked={selectedModels.includes(model.id)}
                              className="border-teal-500 bg-white/90 data-[state=checked]:bg-teal-500 h-4 w-4"
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked: boolean) => {
                                if (checked) {
                                  setSelectedModels([model.id]);
                                  setModelWeights({
                                    [model.id]: model.scale || 1.0,
                                  });
                                } else if (
                                  selectedModels.length === 1 &&
                                  selectedModels[0] === model.id
                                ) {
                                  // Prevent unchecking the only selected model
                                  return;
                                }
                              }}
                            />
                          </div>
                          {selectedModels.includes(model.id) && (
                            <div className="absolute right-0 bottom-8 left-0 px-2 py-1">
                              <Slider
                                value={[
                                  modelWeights[model.id] || model.scale || 1.0,
                                ]}
                                onValueChange={([value]) => {
                                  setModelWeights({ [model.id]: value });
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
                  </>
                )}
              </div>
            )}
            {generatedImage && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-teal-600 text-white hover:bg-teal-700"
                  variant="outline"
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  size="sm"
                >
                  {isDownloading
                    ? 'Downloading...'
                    : 'Download as PNG (300 DPI)'}
                </Button>

                <Button
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  variant="outline"
                  onClick={handleSaveImage}
                  disabled={isSaving}
                  size="sm"
                >
                  {isSaving ? 'Saving...' : 'Save to My Images'}
                </Button>

                <Button
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  variant="outline"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  size="sm"
                >
                  {isAddingToWishlist
                    ? 'Adding to Designs...'
                    : 'Save to My Designs'}
                </Button>
              </div>
            )}
          </div>

          {/* Checkout Buttons */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:flex-1"
              size="default"
              onClick={() => {
                if (!selectedSize) {
                  toast({
                    title: 'Error',
                    description: 'Please select a size before adding to cart',
                    variant: 'destructive',
                  });
                  return;
                }
                                const itemToAdd = {
                  id: `${product.id}-${selectedSize}-${selectedColor}`,
                  productId: product.id.toString(),
                  name: product.name,
                  price: product.price,
                  quantity: quantity,
                  size: selectedSize,
                  color: selectedColor,
                  imageUrl: generatedImage || product.imageUrls.cover,
                  assets: [],
                };
                addItem(itemToAdd);
                toast({
                  title: 'Added to cart',
                  description: `${product.name} has been added to your cart.`,
                });
              }}
            >
              Add to Cart
            </Button>
            <Button
              className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:flex-1"
              size="default"
              onClick={handleCheckout}
            >
              Buy Now
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="rounded-lg bg-teal-50 p-3">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-4 w-4 text-teal-600" />
              <h3 className="font-medium text-teal-700 text-sm">
                Shipping to{' '}
                {
                  SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry)
                    ?.name
                }
              </h3>
            </div>
            {getShippingInfo() && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-teal-700 text-sm">
                      Standard Delivery
                    </p>
                    <p className="text-gray-500 text-xs">
                      {getShippingInfo()?.standard.days} business days
                    </p>
                  </div>
                  <p className="font-medium text-teal-700 text-sm">
                    {formatPrice(
                      getConvertedPrice(getShippingInfo()?.standard.cost || 0),
                      selectedCurrency
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs: Shipping & Reviews */}
          <Tabs defaultValue="shipping" className="mt-4">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger
                value="shipping"
                className="data-[state=active]:text-teal-600 text-sm"
              >
                Shipping
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:text-teal-600 text-sm"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shipping" className="mt-2">
              <Card className="border border-teal-200 p-3">
                <div className="space-y-3">
                  <h3 className="font-semibold text-teal-700 text-sm">
                    Shipping Information
                  </h3>
                  {product.shipping?.methods &&
                  product.shipping.methods.length > 0 ? (
                    <div className="space-y-2">
                      {product.shipping.methods.map((method, index) => (
                        <div
                          key={`shipping-${index}-${method.method}`}
                          className="rounded-lg bg-teal-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-teal-700 text-sm">
                                {method.method}
                              </h4>
                              <p className="text-gray-500 text-xs">
                                Estimated delivery: {method.estimatedDays} days
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-teal-700 text-sm">
                                {formatPrice(
                                  getConvertedPrice(method.cost),
                                  selectedCurrency
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-xs">
                      {selectedCountry === 'US'
                        ? 'All shipping is currently free for all products'
                        : `International shipping to ${
                            SUPPORTED_COUNTRIES.find(
                              (c) => c.code === selectedCountry
                            )?.name
                          } available`}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-2">
              <Card className="border border-teal-200 p-3">
                <div className="space-y-3">
                  <div>
                    <h3 className="mb-2 font-semibold text-teal-700 text-sm">
                      Write a Review
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-teal-600 text-xs">Rating</Label>
                        <div className="mt-1 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={`rating-star-${star}`}
                              className={`h-4 w-4 cursor-pointer ${
                                star <= rating
                                  ? 'text-orange-500'
                                  : 'text-gray-200'
                              }`}
                              onClick={() => setRating(star)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review" className="text-teal-600 text-xs">
                          Your Review
                        </Label>
                        <Textarea
                          id="review"
                          placeholder="Write your review here..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="mt-1 min-h-[60px]"
                        />
                      </div>
                      <Button
                        className="bg-teal-600 text-white hover:bg-teal-700"
                        onClick={handleSubmitReview}
                        size="sm"
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
    </div>
  );
}