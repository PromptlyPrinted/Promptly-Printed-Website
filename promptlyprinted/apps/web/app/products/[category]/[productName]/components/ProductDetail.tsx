'use client';

import '../product-detail-background.css';

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

import dynamic from 'next/dynamic';
import { PRODUCT_IMAGE_SIZES } from '@/constants/product-sizes';

// Lazy load heavy components to reduce initial bundle size
const DesignPicker = dynamic(
  () => import('@/components/design-picker').then(mod => ({ default: mod.DesignPicker })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading design tools...</div>
      </div>
    )
  }
);
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useCheckout } from '@/hooks/useCheckout';
import type { Product } from '@/types/product';
import { SUPPORTED_COUNTRIES, formatPrice, getDefaultCurrency } from '@/utils/currency';
import { PriceDisplay } from '@/components/PriceDisplay';
import { useSession } from '@repo/auth/client';
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
import { useSearchParams } from 'next/navigation';
import { LORAS, KONTEXT_LORAS, type Lora, type KontextLora } from '../../../../../data/textModel';
import { jsPDF } from 'jspdf';

// Comprehensive color hex mapping for all T-shirt colors found in product data
const colorHexMap: Record<string, string> = {
  // Whites
  'white': '#FFFFFF',
  'vintage-white': '#F5F5DC',
  'off-white': '#FAF0E6',
  'arctic-white': '#F0F8FF',
  
  // Blacks
  'black': '#000000',
  'jet-black': '#0A0A0A',
  
  // Greys
  'anthracite': '#36454F',
  'charcoal': '#36454F',
  'dark-heather-grey': '#616161',
  'india-ink-grey': '#414A4C',
  'heather-grey': '#999999',
  'dark-grey': '#696969',
  'sport-grey': '#9E9E9E',
  'sports-grey': '#9E9E9E',
  'heather': '#999999',
  'dark-heather': '#6B6B6B',
  'athletic-heather': '#D3D3D3',
  
  // Blues
  'navy': '#000080',
  'french-navy': '#002654',
  'oxford-navy': '#14213D',
  'bright-blue': '#0047AB',
  'light-blue': '#87CEEB',
  'royal-blue': '#4169E1',
  'sky-blue': '#87CEEB',
  'royal': '#4169E1',
  'true-royal': '#002FA7',
  'blue': '#0066CC',
  
  // Purples
  'stargazer': '#4B0082',
  'purple': '#800080',
  'heather-purple': '#9370DB',
  
  // Reds
  'red': '#DC143C',
  'burgundy': '#800020',
  
  // Pinks
  'cotton-pink': '#FFB3BA',
  'pink': '#FF69B4',
  'candy-pink': '#FFB3D9',
  'hot-pink': '#FF69B4',

  // Greens
  'glazed-green': '#8FBC8F',
  'irish-green': '#009A49',
  'bottle-green': '#006A4E',
  'kelly-green': '#4CBB17',
  'military-green-triblend': '#4B5320',
  'apple': '#8DB600',
  'jade': '#00A86B',
  'lime-green': '#32CD32',

  // Yellows
  'khaki': '#F0E68C',
  'desert-dust': '#EDC9AF',
  'ochre': '#CC7722',
  'spectra-yellow': '#FFFF00',
  'sun-yellow': '#FFD700',
  'butter': '#FFDB58',
  'daisy': '#FFFF31',

  // Hoodie-specific colors
  'airforce-blue': '#5D8AA8',
  'fire-red': '#DC143C',
  'hawaiian-blue': '#1E90FF',
  'new-french-navy': '#000080',
  'orange-crush': '#FF8C00',
  'plum': '#8E4585',
  'red-hot-chilli': '#E23D28',
  'sapphire-blue': '#0F52BA',
  
  // Special colors
  'azalea': '#F56FA1',
  'cornsilk': '#FFF8DC',
  'vintage-royal-triblend': '#002FA7',
  
  // Legacy/additional colors
  'army-green': '#4B5320',
  'ash': '#B2BEB5',
  'asphalt': '#36454F',
  'baby-blue': '#89CFF0',
  'brown': '#8B4513',
  'burnt-orange': '#CC5500',
  'cardinal': '#C41E3A',
  'chocolate': '#7B3F00',
  'cranberry': '#DC143C',
  'forest': '#228B22',
  'gold': '#DAA520',
  'heather-blue': '#4682B4',
  'heather-prism-lilac': '#C8A2C8',
  'heather-prism-mint': '#98FB98',
  'heather-prism-peach': '#FFCBA4',
  'kiwi': '#8EE53F',
  'light-pink': '#FFB6C1',
  'maroon': '#800000',
  'natural': '#F5F5DC',
  'orange': '#FF8C00',
  'slate': '#708090',
  'tan': '#D2B48C',
  'yellow': '#FFD700',
  'coral': '#FF7F50',
  'mint': '#98FB98',
  'sage': '#87AE73',
  'steel': '#71797E',
  'cream': '#F5F5DC',
  'indigo': '#4B0082',
  'lavender': '#E6E6FA',
  'peach': '#FFCBA4',
  'turquoise': '#40E0D0',
  'violet': '#8A2BE2'
};

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

// Function to crop transparent areas and return a tightly fitted image
const cropTransparentAreas = async (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image to canvas to get pixel data
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          reject(new Error('Failed to get temp canvas context'));
          return;
        }

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        // Find the bounding box of significantly non-transparent pixels
        let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
        let hasContent = false;

        // Use a higher threshold to ignore semi-transparent background artifacts
        const alphaThreshold = 50; // Only consider pixels with alpha > 50 as "content"

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const pixelIndex = (y * img.width + x) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const alpha = data[pixelIndex + 3];
            
            // More aggressive filtering: ignore low-alpha pixels and near-white/gray pixels
            if (alpha > alphaThreshold) {
              // Also check if it's not a background-like color (grays, near-whites)
              const isGrayish = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;
              const isLight = (r + g + b) / 3 > 200;
              
              // Only count as content if it's either not grayish or not light
              if (!isGrayish || !isLight || alpha > 200) {
                hasContent = true;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
              }
            }
          }
        }

        if (!hasContent) {
          // If no content found, return original
          resolve(imageDataUrl);
          return;
        }

        // Add minimal padding to avoid cutting too close
        const padding = 0;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(img.width - 1, maxX + padding);
        maxY = Math.min(img.height - 1, maxY + padding);

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        // Create cropped canvas
        canvas.width = width;
        canvas.height = height;
        
        // Draw only the cropped area
        ctx.drawImage(
          img,
          minX, minY, width, height, // Source coordinates and dimensions
          0, 0, width, height        // Destination coordinates and dimensions
        );

        // Convert to data URL
        const croppedDataUrl = canvas.toDataURL('image/png');
        resolve(croppedDataUrl);
      } catch (error) {
        console.error('Error cropping transparent areas:', error);
        reject(error);
      }
    };
    img.onerror = (error: any) => {
      console.error('Error loading image for cropping:', error);
      reject(new Error('Failed to load image for cropping'));
    };
    img.src = imageDataUrl;
  });
};

// Background removal using @imgly/background-removal
    const removeImageBackground = async (imageUrl: string): Promise<string> => {
      console.log('removeImageBackground called with URL:', imageUrl);
      
      try {
        // Dynamic import to avoid SSR issues
        const { removeBackground } = await import('@imgly/background-removal');
        
        console.log('Starting background removal with @imgly/background-removal...');
        
        // First, convert the image URL to a proper image element or blob
        let imageInput: string | Blob | HTMLImageElement;
        
        if (imageUrl.startsWith('data:')) {
          // If it's a data URL, use it directly
          console.log('Using data URL directly');
          imageInput = imageUrl;
        } else {
          // If it's a regular URL, fetch it as a blob first to avoid CORS issues
          console.log('Fetching image as blob to avoid CORS issues...');
          try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            console.log('Image content type:', contentType);
            
            if (!contentType || !contentType.startsWith('image/')) {
              throw new Error(`Invalid content type: ${contentType}. Expected image/*`);
            }
            
            imageInput = await response.blob();
            console.log('Image fetched as blob successfully');
          } catch (fetchError) {
            console.error('Failed to fetch image, trying direct URL:', fetchError);
            // Fallback to direct URL if fetch fails
            imageInput = imageUrl;
          }
        }
        
        // Remove background using the library
        console.log('Processing with @imgly/background-removal...');
        const resultBlob = await removeBackground(imageInput);
        
        console.log('Background removal completed, converting to data URL...');
        
        // Convert blob to data URL and crop transparent areas
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const result = reader.result as string;
              console.log('Background removal completed, now cropping transparent areas...');
              
              // Crop the transparent areas to get a tightly fitted image
              const croppedResult = await cropTransparentAreas(result);
              console.log('Auto-crop successful');
              resolve(croppedResult);
            } catch (cropError) {
              console.error('Auto-crop failed, using original result:', cropError);
              resolve(reader.result as string);
            }
          };
          reader.onerror = () => {
            console.error('Failed to convert blob to data URL');
            reject(new Error('Failed to convert result'));
          };
          reader.readAsDataURL(resultBlob);
        });
        
      } catch (error) {
        console.error('Background removal failed:', error);
        throw new Error(`Background removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

interface ProductDetailProps {
  product: Product;
  isDesignMode?: boolean;
}

export function ProductDetail({ product, isDesignMode = false }: ProductDetailProps) {
  const searchParams = useSearchParams();
  const colorFromUrl = searchParams.get('color');
  const promptFromUrl = searchParams.get('prompt'); // Get pre-filled prompt from quiz
  const campaignFromUrl = searchParams.get('campaign'); // Get campaign context
  const discountFromUrl = searchParams.get('discount'); // Get discount from quiz/offer
  const giveawayTierFromUrl = searchParams.get('giveawayTier'); // Get giveaway tier

  // Parse discount (0.3 = 30% off)
  const discountPercent = discountFromUrl ? parseFloat(discountFromUrl) : 0;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    colorFromUrl ? toKebabCase(colorFromUrl) : undefined
  );
  const [promptText, setPromptText] = useState(promptFromUrl || '');
  const [selectedModels, setSelectedModels] = useState<(number | string)[]>([
    LORAS[0].id,
  ]);

  // Initialize selectedColor to white if not set from URL
  useEffect(() => {
    if (!selectedColor && product.specifications?.color) {
      // Try to find white color first
      const whiteColor = product.specifications.color.find((c: string) =>
        c.toLowerCase().includes('white')
      );
      if (whiteColor) {
        setSelectedColor(toKebabCase(whiteColor));
      } else if (product.specifications.color.length > 0) {
        // Fallback to first available color
        setSelectedColor(toKebabCase(product.specifications.color[0]));
      }
    }
  }, [product.specifications?.color, selectedColor]);
  const [selectedKontextModels, setSelectedKontextModels] = useState<(number | string)[]>([
    KONTEXT_LORAS[0].id,
  ]);
  const [modelWeights, setModelWeights] = useState<
    Record<string | number, number>
  >({});
  const [generationMode, setGenerationMode] = useState('text');
  const [loraScale, setLoraScale] = useState(0.7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [printReadyImageUrl, setPrintReadyImageUrl] = useState('');
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
  // Note: getToken removed - Better Auth handles tokens differently
  const [isBaseModel, setIsBaseModel] = useState(false);
  const [selectedBaseModel, setSelectedBaseModel] = useState<string>('kontext-pro');
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const [processedImage, setProcessedImage] = useState<string>('');
  
  // Image-to-Image state
  const [referenceImage, setReferenceImage] = useState<string>('');
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false); // Local loading state for checkout preparation
  const [useTshirtDesign, setUseTshirtDesign] = useState(false);
  const [useReferenceImage, setUseReferenceImage] = useState(false);
  const [subjectDescription, setSubjectDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Nano Banana state
  const [useNanoBanana, setUseNanoBanana] = useState(false);
  const [nanoBananaEditHistory, setNanoBananaEditHistory] = useState<any[]>([]);
  const [nanoBananaPrompt, setNanoBananaPrompt] = useState('');
  const [nanoBananaModel, setNanoBananaModel] = useState<'nano-banana' | 'nano-banana-pro'>('nano-banana');
  const [showEditHistory, setShowEditHistory] = useState(false);
  // Reference images state (up to 3 optional reference images)
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isUploadingReference, setIsUploadingReference] = useState(false);

  // Flux 2 Pro state
  const [useFlux2Pro, setUseFlux2Pro] = useState(false);
  const [flux2ProReferenceImages, setFlux2ProReferenceImages] = useState<string[]>([]);

  // Design selection state - determines which image will be used for checkout
  const [selectedDesignSource, setSelectedDesignSource] = useState<'generated' | 'uploaded' | 'processed'>('generated');

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
    if (colorList.length > 0 && !selectedColor) {
      setSelectedColor(toKebabCase(colorList[0]));
    }
  }, [colorList, selectedColor]);

  useEffect(() => {
    if (sizeList.length > 0) {
      setSelectedSize(sizeList[0]);
    }
  }, [sizeList]);

  useEffect(() => {
    if (generatedImage) {
      const img = document.createElement('img');
      img.src = generatedImage;
      // Reset processed image when new image is generated
      setProcessedImage('');
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

  // --- Utility function to get color swatch using colorHexMap ---
  const getColorSwatch = (colorName: string): { color: string } => {
    const colorValue = toKebabCase(colorName);
    return { color: colorHexMap[colorValue] || '#CCCCCC' };
  };

  // Handle background removal toggle
  const handleBackgroundRemoval = async () => {
  console.log('[handleBackgroundRemoval] Starting...');

  if (!generatedImage) {
    console.log('[handleBackgroundRemoval] No image to process');
    toast({
      title: 'Error',
      description: 'Please generate a design first',
      variant: 'destructive',
    });
    return;
  }

  if (removeBackground && !processedImage) {
    setIsProcessingBackground(true);
    
    try {
      const result = await removeImageBackground(generatedImage);
      
      // Validate the result before using it
      if (!result || !result.startsWith('data:image/')) {
        throw new Error('Invalid result from background removal');
      }
      
      setProcessedImage(result);
      toast({
        title: 'Success',
        description: 'Background removed successfully!',
      });
    } catch (error) {
      console.error('[handleBackgroundRemoval] Failed:', error);
      
      // Reset the checkbox since removal failed
      setRemoveBackground(false);
      setProcessedImage('');
      
      toast({
        title: 'Background Removal Failed',
        description: error instanceof Error 
          ? error.message 
          : 'Could not remove background. The original image will be used.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingBackground(false);
    }
  }
};

  // Effect to handle background removal when checkbox is toggled
  useEffect(() => {
    console.log('Background removal useEffect triggered:', {
      removeBackground,
      hasGeneratedImage: !!generatedImage,
      hasProcessedImage: !!processedImage
    });
    
    if (removeBackground && generatedImage && !processedImage) {
      console.log('Starting background removal...');
  handleBackgroundRemoval();
    }
  }, [removeBackground, generatedImage, processedImage]);

  // Auto-select the most recent design for printing
  useEffect(() => {
    if (processedImage) {
      setSelectedDesignSource('processed');
    } else if (generatedImage) {
      setSelectedDesignSource('generated');
    } else if (referenceImage) {
      setSelectedDesignSource('uploaded');
    }
  }, [processedImage, generatedImage, referenceImage]);

  /**
   * Convert a data URL to an ArrayBuffer directly (without using fetch)
   * This is more reliable than fetch(dataUrl) which can fail in some environments
   */
  const dataUrlToArrayBuffer = (dataUrl: string): { buffer: ArrayBuffer; mimeType: string } => {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid data URL format');
    }
    
    const mimeType = match[1];
    const base64 = match[2];
    
    // Decode base64 to binary string
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return { buffer: bytes.buffer, mimeType };
  };

  const uploadImageToPermanentStorage = async (imageUrl: string): Promise<{ url: string; previewUrl: string; printReadyUrl: string }> => {
    try {
      // Early validation
      if (!imageUrl) {
        throw new Error('No image URL provided');
      }

      // If it's already a permanent URL, derive the print-ready and preview URLs
      if (imageUrl.startsWith('/api/images/')) {
        const printReadyUrl = imageUrl.replace(/\.png$/, '-300dpi.png');
        const previewUrl = imageUrl.replace(/\.png$/, '-preview.jpg');
        return { url: imageUrl, previewUrl, printReadyUrl };
      }

      // If it's a Cloudflare R2 URL, it's already permanent
      if (imageUrl.includes('.r2.dev') || imageUrl.includes('cloudflare') || imageUrl.includes('images.promptlyprinted.com')) {
        return { url: imageUrl, previewUrl: imageUrl, printReadyUrl: imageUrl };
      }

      // If it's a legacy upload URL, just return it for all three
      if (imageUrl.startsWith('/uploads/')) {
        return { url: imageUrl, previewUrl: imageUrl, printReadyUrl: imageUrl };
      }

      // Get product code for correct dimensions
      const productCode = product.specifications?.style || product.sku || product.id.toString();

      console.log('[uploadImageToPermanentStorage] Starting upload...');
      console.log('[uploadImageToPermanentStorage] Image URL type:', imageUrl.startsWith('data:') ? 'data URL' : 'regular URL');

      // Upload with retry
      const attemptUpload = async (attempt: number): Promise<Response> => {
        console.log(`[uploadImageToPermanentStorage] Upload attempt ${attempt}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
        
        try {
          let response: Response;
          
          if (imageUrl.startsWith('data:')) {
            // For data URLs, convert directly to ArrayBuffer (more reliable than fetch)
            console.log('[uploadImageToPermanentStorage] Converting data URL to binary...');
            
            try {
              const { buffer, mimeType } = dataUrlToArrayBuffer(imageUrl);
              
              if (buffer.byteLength === 0) {
                throw new Error('Image data is empty');
              }
              
              console.log('[uploadImageToPermanentStorage] Binary data ready, size:', buffer.byteLength, 'type:', mimeType);
              
              // Send as raw binary with metadata in headers
              response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: {
                  'Content-Type': mimeType || 'image/png',
                  'X-Image-Name': encodeURIComponent('Generated Design'),
                  'X-Product-Code': productCode,
                },
                body: buffer,
                signal: controller.signal,
              });
            } catch (conversionError) {
              console.error('[uploadImageToPermanentStorage] Binary conversion failed:', conversionError);
              // Fallback: try sending as JSON
              console.log('[uploadImageToPermanentStorage] Falling back to JSON upload...');
              response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  imageUrl: imageUrl,
                  name: 'Generated Design',
                  productCode: productCode,
                }),
                signal: controller.signal,
              });
            }
          } else {
            // For regular URLs, send URL reference for server-side fetch
            console.log('[uploadImageToPermanentStorage] Sending URL for server-side processing...');
            response = await fetch('/api/upload-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageUrl: imageUrl,
                name: 'Generated Design',
                productCode: productCode,
              }),
              signal: controller.signal,
            });
          }
          
          clearTimeout(timeoutId);
          return response;
        } catch (err) {
          clearTimeout(timeoutId);
          
          if (err instanceof Error) {
            if (err.name === 'AbortError') {
              throw new Error('Upload timed out');
            }
            // Retry on network errors
            if (err.message.includes('Load failed') || err.message.includes('Failed to fetch') || err.message.includes('network')) {
              if (attempt < 3) {
                console.warn(`[uploadImageToPermanentStorage] Retry ${attempt}...`);
                await new Promise(r => setTimeout(r, 1000 * attempt));
                return attemptUpload(attempt + 1);
              }
            }
          }
          throw err;
        }
      };

      const response = await attemptUpload(1);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[uploadImageToPermanentStorage] Server error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Upload failed: ${response.status}`);
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error(`Upload failed (${response.status}): ${errorText.substring(0, 100)}`);
          }
          throw e;
        }
      }

      const result = await response.json();
      console.log('[uploadImageToPermanentStorage] Success:', result.url?.substring(0, 50));

      if (!result.url) {
        throw new Error('Server did not return image URL');
      }

      return {
        url: result.url,
        previewUrl: result.previewUrl || result.url,
        printReadyUrl: result.printReadyUrl || result.url
      };

    } catch (error) {
      console.error('[uploadImageToPermanentStorage] Error:', error);
      throw error;
    }
  };

  // ---- Nano Banana Generation ----
  const handleNanoBananaGeneration = async () => {
    const currentPrompt = nanoBananaPrompt || promptText;

    if (!currentPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for Nano Banana',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Determine input image for conversational editing
      let inputImage = null;
      if (generationMode === 'image') {
        if (useTshirtDesign && generatedImage) {
          inputImage = generatedImage;
        } else if (useReferenceImage && referenceImage) {
          inputImage = referenceImage;
        } else if (nanoBananaEditHistory.length > 0) {
          // Use the last edited image from history
          inputImage = nanoBananaEditHistory[nanoBananaEditHistory.length - 1].imageUrl;
        }
      }

      // Determine mode: if we have an input image, use 'edit' mode, otherwise use 'generate' mode
      const nanoBananaMode = inputImage ? 'edit' : 'generate';

      console.log('Nano Banana request:', {
        prompt: currentPrompt,
        hasInputImage: !!inputImage,
        editHistoryLength: nanoBananaEditHistory.length,
        mode: nanoBananaMode,
      });

      const response = await fetch('/api/generate-nano-banana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          imageUrl: inputImage,
          editHistory: nanoBananaEditHistory,
          mode: nanoBananaMode,
          referenceImages: referenceImages, // Include reference images
          aiModel: nanoBananaModel, // Pass selected model
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate/edit image with Nano Banana';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch {
          // Keep default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.data?.[0]?.url) {
        throw new Error('No image URL returned from Nano Banana');
      }

      const generatedUrl = data.data[0].url;
      const printReadyUrl = data.data[0].printReadyUrl;

      // Nano Banana API already creates and uploads the print-ready version
      // Use those URLs directly instead of re-uploading (which causes corruption)
      if (printReadyUrl) {
        console.log('[Nano Banana] Using print-ready URL from API:', printReadyUrl);
        setGeneratedImage(generatedUrl); // Display the data URL for preview
        setPrintReadyImageUrl(printReadyUrl); // Use the permanent URL for printing
      } else {
        // Fallback: Upload to permanent storage if printReadyUrl is not provided
        console.log('[Nano Banana] No print-ready URL, uploading to permanent storage...');
        const uploadedResult = await uploadImageToPermanentStorage(generatedUrl);
        setGeneratedImage(uploadedResult.url);
        setPrintReadyImageUrl(uploadedResult.printReadyUrl);
      }

      // Update edit history
      if (data.editHistory) {
        setNanoBananaEditHistory(data.editHistory);
      }

      // Clear the prompt for next edit
      setNanoBananaPrompt('');

      toast({
        title: 'Success',
        description: nanoBananaEditHistory.length > 0
          ? 'Image edited successfully with Nano Banana!'
          : 'Image generated successfully with Nano Banana!',
      });
    } catch (error) {
      console.error('Nano Banana generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process image with Nano Banana',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Reference Image Handlers (for Nano Banana) ----
  /**
   * Handle file drop for reference images (up to 3)
   */
  const handleReferenceImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    // Process up to 3 or 6 images based on model
    const maxImages = nanoBananaModel === 'nano-banana-pro' ? 6 : 3;
    const filesToProcess = imageFiles.slice(0, maxImages - referenceImages.length);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setReferenceImages(prev => {
          if (prev.length < maxImages) {
            return [...prev, result];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handle file selection for reference images (up to 3)
   */
  const handleReferenceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const maxImages = nanoBananaModel === 'nano-banana-pro' ? 6 : 3;
    const filesToProcess = imageFiles.slice(0, maxImages - referenceImages.length);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setReferenceImages(prev => {
          if (prev.length < maxImages) {
            return [...prev, result];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  /**
   * Remove a specific reference image by index
   */
  const handleRemoveReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Clear all reference images
   */
  const handleClearReferenceImages = () => {
    setReferenceImages([]);
  };

  // ---- Flux 2 Pro Generation ----
  const handleFlux2ProGeneration = async () => {
    const currentPrompt = promptText;

    if (!currentPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for Flux 2 Pro',
        variant: 'destructive',
      });
      return;
    }

    // Determine input image
    let inputImage = null;
    if (generationMode === 'image') {
      if (useTshirtDesign && generatedImage) {
        inputImage = generatedImage;
      } else if (useReferenceImage && referenceImage) {
        inputImage = referenceImage;
      }
    }

    if (!inputImage) {
      toast({
        title: 'Error',
        description: 'Please provide a reference image for Flux 2 Pro',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Flux 2 Pro request:', {
        prompt: currentPrompt,
        hasInputImage: !!inputImage,
        referenceImageCount: flux2ProReferenceImages.length,
      });

      const response = await fetch('/api/generate-flux2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          imageUrl: inputImage,
          referenceImages: flux2ProReferenceImages,
          width: 1024,
          height: 1024,
          steps: 28,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate image with Flux 2 Pro';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch {
          // Keep default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.data?.[0]?.url) {
        throw new Error('No image URL returned from Flux 2 Pro');
      }

      const generatedUrl = data.data[0].url;
      const printReadyUrl = data.data[0].printReadyUrl;

      // Flux 2 Pro API already creates and uploads the print-ready version
      // Use those URLs directly instead of re-uploading
      if (printReadyUrl) {
        console.log('[Flux 2 Pro] Using print-ready URL from API:', printReadyUrl);
        setGeneratedImage(generatedUrl);
        setPrintReadyImageUrl(printReadyUrl);
      } else {
        // Fallback: Upload to permanent storage if printReadyUrl is not provided
        console.log('[Flux 2 Pro] No print-ready URL, uploading to permanent storage...');
        const uploadedResult = await uploadImageToPermanentStorage(generatedUrl);
        setGeneratedImage(uploadedResult.url);
        setPrintReadyImageUrl(uploadedResult.printReadyUrl);
      }

      toast({
        title: 'Success',
        description: 'Image generated successfully with Flux 2 Pro!',
      });
    } catch (error) {
      console.error('Flux 2 Pro generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process image with Flux 2 Pro',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Flux 2 Pro Reference Image Handlers ----
  const handleFlux2ProImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const filesToProcess = imageFiles.slice(0, 8 - flux2ProReferenceImages.length);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFlux2ProReferenceImages(prev => {
          if (prev.length < 8) {
            return [...prev, result];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFlux2ProImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const filesToProcess = imageFiles.slice(0, 8 - flux2ProReferenceImages.length);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFlux2ProReferenceImages(prev => {
          if (prev.length < 8) {
            return [...prev, result];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveFlux2ProImage = (index: number) => {
    setFlux2ProReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearFlux2ProImages = () => {
    setFlux2ProReferenceImages([]);
  };

  // ---- Generate Image ----
  const handleImageGeneration = async () => {
    // Validation for Text-to-Image mode
    if (generationMode === 'text' && !promptText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for the image generation',
        variant: 'destructive',
      });
      return;
    }
    
    // Validation for Image-to-Image mode
    if (generationMode === 'image') {
      if (!useTshirtDesign && !useReferenceImage) {
        toast({
          title: 'Error',
          description: 'Please select a reference image or use the current T-shirt design',
          variant: 'destructive',
        });
        return;
      }
      
      if (useReferenceImage && !referenceImage) {
        toast({
          title: 'Error',
          description: 'Please upload a reference image',
          variant: 'destructive',
        });
        return;
      }
      
      if (useTshirtDesign && !generatedImage) {
        toast({
          title: 'Error',
          description: 'No current T-shirt design found to use as reference',
          variant: 'destructive',
        });
        return;
      }
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

      // Determine the reference image for Image-to-Image mode
      let inputImage = null;
      if (generationMode === 'image') {
        if (useTshirtDesign && generatedImage) {
          inputImage = generatedImage;
          console.log('Using T-shirt design as input:', inputImage);
        } else if (useReferenceImage && referenceImage) {
          inputImage = referenceImage;
          console.log('Using reference image as input:', inputImage);
        }
        
        console.log('Image-to-Image Debug:', {
          generationMode,
          useTshirtDesign,
          useReferenceImage,
          hasGeneratedImage: !!generatedImage,
          hasReferenceImage: !!referenceImage,
          inputImage: !!inputImage
        });
      }

      if (isBaseModel) {
        // Use pure text-to-image model without LORAs
        let baseModelName = 'black-forest-labs/FLUX.1-schnell-Free';
        if (generationMode === 'image') {
          // Use the selected Kontext model
          if (selectedBaseModel === 'kontext-pro') {
            baseModelName = 'black-forest-labs/FLUX.1-Kontext-pro';
          } else if (selectedBaseModel === 'kontext-max') {
            baseModelName = 'black-forest-labs/FLUX.1-Kontext-max';
          } else {
            baseModelName = 'black-forest-labs/FLUX.1-Kontext-dev';
          }
        }

        const payload: any = {
          prompt: generationMode === 'image' 
            ? (promptText || subjectDescription || 'Transform this image')
            : promptText,
          models: [
            {
              model: baseModelName,
              type: 'base',
              weight: 1.0,
            },
          ],
          width: Math.min(imageSize.width, 1024), // Cap at 1024 as per API limits
          height: Math.min(imageSize.height, 1024),
          dpi: 300,
          steps: generationMode === 'image' ? 24 : 4, // More steps for Kontext models
        };

        // Add image input for Image-to-Image mode - required for all Kontext models
        if (generationMode === 'image') {
          if (!inputImage) {
            throw new Error('Reference image is required for Image-to-Image mode');
          }
          payload.image_url = inputImage;
          
          // Add subject description if provided
          if (subjectDescription.trim()) {
            payload.subject_description = subjectDescription;
          }
        }

        console.log(
          'Base model request payload:',
          JSON.stringify(payload, null, 2)
        );

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to generate image';
          try {
            const errorData = await response.json();
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch {
            errorMessage = `${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Base model response:', JSON.stringify(data, null, 2));

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

          // Generate Image API already creates and uploads the print-ready version
          // Use those URLs directly instead of re-uploading
          const printReadyUrl = data.data[0].printReadyUrl;
          if (printReadyUrl) {
            console.log('[Generate Image] Using print-ready URL from API:', printReadyUrl);
            setGeneratedImage(data.data[0].url);
            setPrintReadyImageUrl(printReadyUrl);
          } else {
            // Fallback: Upload to permanent storage if printReadyUrl is not provided
            console.log('[Generate Image] No print-ready URL, uploading to permanent storage...');
            const uploadedResult = await uploadImageToPermanentStorage(data.data[0].url);
            setGeneratedImage(uploadedResult.url);
            setPrintReadyImageUrl(uploadedResult.printReadyUrl);
          }
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
        let modelId: number | string;
        let model: Lora | KontextLora | undefined;
        
        if (generationMode === 'image') {
          // Image-to-Image mode with Kontext LoRAs
          modelId = selectedKontextModels[0];
          model = KONTEXT_LORAS.find((m: KontextLora) => m.id === modelId);
        } else {
          // Text-to-Image mode with regular LoRAs
          modelId = selectedModels[0];
          model = LORAS.find((m: Lora) => m.id === modelId);
        }
        
        if (!model) {
          throw new Error('Selected model not found');
        }

        const modelConfig = generationMode === 'image' && 'safetensorFileName' in model ? {
          // Kontext LoRA configuration
          repo_id: 'Owen777/Kontext-Style-Loras',
          filename: (model as KontextLora).safetensorFileName,
          type: 'kontext-lora',
          weight: modelWeights[modelId] || model.scale || 1.0,
          steps: model.steps || 24,
        } : {
          // Regular LoRA configuration
          model: (model as Lora).path,
          type: 'lora',
          weight: modelWeights[modelId] || model.scale || 1.0,
          steps: 4,
        };
        const allModelConfigs = [
          {
            model: generationMode === 'image' 
              ? 'black-forest-labs/FLUX.1-Kontext-dev'  // Use Kontext for Image-to-Image with LoRA
              : 'black-forest-labs/FLUX.1-dev-lora',    // Use standard for Text-to-Image with LoRA
            type: 'base',
            weight: 1.0,
            steps: generationMode === 'image' ? 24 : 4,
          },
          modelConfig,
        ];
        
        let basePrompt = generationMode === 'image' 
          ? (promptText || subjectDescription || 'Transform this image')
          : promptText;
          
        // Apply LoRA trigger if applicable
        if (generationMode === 'image' && 'applyTrigger' in model) {
          basePrompt = (model as KontextLora).applyTrigger(basePrompt);
        } else if (generationMode === 'text' && 'applyTrigger' in model) {
          basePrompt = (model as Lora).applyTrigger(basePrompt);
        }
        
        const enhancedPrompt = `${basePrompt}, high resolution, 300 dpi, detailed, clear image, suitable for t-shirt printing, centered composition, professional quality, sharp details`;

        const apiPayload: any = {
          prompt: enhancedPrompt,
          models: allModelConfigs,
          loraScale,
          width: imageSize.width,
          height: imageSize.height,
          dpi: 300,
          steps: generationMode === 'image' ? 24 : 4,
        };

        // Add image input for Image-to-Image mode with LoRA - required for all Kontext models
        if (generationMode === 'image') {
          if (!inputImage) {
            throw new Error('Reference image is required for Image-to-Image mode');
          }
          apiPayload.image_url = inputImage;
          
          // Add subject description if provided
          if (subjectDescription.trim()) {
            apiPayload.subject_description = subjectDescription;
          }
        }

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to generate image';
          try {
            const errorData = await response.json();
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use response status text
            errorMessage = `${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.data?.[0]?.url) {
          // Generate Image API already creates and uploads the print-ready version
          // Use those URLs directly instead of re-uploading
          const printReadyUrl = data.data[0].printReadyUrl;
          if (printReadyUrl) {
            console.log('[Generate Image] Using print-ready URL from API:', printReadyUrl);
            setGeneratedImage(data.data[0].url);
            setPrintReadyImageUrl(printReadyUrl);
          } else {
            // Fallback: Upload to permanent storage if printReadyUrl is not provided
            console.log('[Generate Image] No print-ready URL, uploading to permanent storage...');
            const uploadedResult = await uploadImageToPermanentStorage(data.data[0].url);
            setGeneratedImage(uploadedResult.url);
            setPrintReadyImageUrl(uploadedResult.printReadyUrl);
          }
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
      setIsGenerating(false);
    }
  };



// ... (existing imports)

  // ---- Helper: Generate High-Res Image (300 DPI) ----
  const generateHighResImage = async (sourceUrl: string): Promise<string> => {
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

      if (sourceUrl.startsWith('data:')) {
        designImage.src = sourceUrl;
      } else {
        fetch(sourceUrl)
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

    return canvas.toDataURL('image/png');
  };

  // ---- Helper: Generate Print-Ready PDF ----
  const generatePrintReadyPDF = async (sourceUrl: string): Promise<Blob> => {
    // 1. Generate the high-res image data (using JPEG inside PDF to save size/memory)
    // We use a high quality JPEG inside the PDF because a raw PNG at this resolution
    // can be massive and crash the browser/upload.
    const canvas = document.createElement('canvas');
    canvas.width = 4680;
    canvas.height = 5790;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');
    
    // Fill white background for PDF (optional, but safer for JPEG transparency handling)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const designImage = document.createElement('img');
    designImage.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      designImage.onload = () => resolve();
      designImage.onerror = () => reject(new Error('Failed to load design image'));
      
      if (sourceUrl.startsWith('data:')) {
        designImage.src = sourceUrl;
      } else {
        fetch(sourceUrl)
            .then(res => res.blob())
            .then(blob => { designImage.src = URL.createObjectURL(blob); })
            .catch(reject);
      }
    });

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(designImage, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // 2. Create PDF
    // 4680x5790 px at 300 DPI is approx 15.6" x 19.3"
    // We create a PDF of this size.
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: [15.6, 19.3]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 15.6, 19.3);
    
    return pdf.output('blob');
  };

  // ---- Download Image ----
  const handleDownloadImage = async () => {
    const imageToDownload = removeBackground && processedImage ? processedImage : generatedImage;
    
    if (!imageToDownload) {
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

      const dataUrl = await generateHighResImage(imageToDownload);
      const link = document.createElement('a');
      const filename = removeBackground ? 
        `${product.name.replace(/\s+/g, '-').toLowerCase()}-design-no-bg.png` :
        `${product.name.replace(/\s+/g, '-').toLowerCase()}-design-only.png`;
      link.href = dataUrl;
      link.download = filename;
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
        link.href = imageToDownload;
        const filename = removeBackground ? 
          `${product.name.replace(/\s+/g, '-').toLowerCase()}-design-no-bg.png` :
          `${product.name.replace(/\s+/g, '-').toLowerCase()}-design-only.png`;
        link.download = filename;
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
    const imageToSave = removeBackground && processedImage ? processedImage : generatedImage;
    
    if (!imageToSave) {
        console.warn('[handleSaveImage] No image to save');
        toast({
          title: 'Error',
          description: 'Please generate a design first',
          variant: 'destructive',
        });
        return;
    }

    try {
        setIsSaving(true);
        console.log('[handleSaveImage] Saving design...');
        
        // ALWAYS upload to get permanent URLs - never save base64 to database
        let displayUrl: string;
        let printUrl: string;
        
        if (imageToSave.startsWith('data:')) {
            // Have a data URL that needs uploading first
            console.log('[handleSaveImage] Uploading data URL to storage...');
            const result = await preparePrintReadyAsset(imageToSave);
            displayUrl = result.displayUrl;
            printUrl = result.printUrl;
            
            // Validate upload succeeded
            if (displayUrl.startsWith('data:') || printUrl.startsWith('data:')) {
                throw new Error('Failed to upload design. Please try again.');
            }
            
            // Update state with permanent URLs
            setGeneratedImage(displayUrl);
            setPrintReadyImageUrl(printUrl);
        } else if (printReadyImageUrl) {
            // Already have permanent URLs
            console.log('[handleSaveImage] Using existing permanent URLs');
            displayUrl = imageToSave;
            printUrl = printReadyImageUrl;
        } else {
            // Have a URL but no print-ready version, upload it
            console.log('[handleSaveImage] Uploading to get print-ready version...');
            const result = await preparePrintReadyAsset(imageToSave);
            displayUrl = result.displayUrl;
            printUrl = result.printUrl;
            
            setGeneratedImage(displayUrl);
            setPrintReadyImageUrl(printUrl);
        }

        // Save to database with correct field names
        const response = await fetch('/api/saved-designs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `${product.name} Design`,  // Required field
                url: displayUrl,                  // Required field (display URL)
                printReadyUrl: printUrl,          // 300 DPI URL
                productId: product.id,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to save design';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                console.error('[handleSaveImage] Non-JSON error response:', errorText);
            }
            throw new Error(errorMessage);
        }

        const savedDesign = await response.json();
        console.log('[handleSaveImage] Design saved successfully:', savedDesign.id);

        toast({
            title: 'Success',
            description: 'Design saved to My Designs',
            variant: 'default',
        });
    } catch (error) {
        console.error('[handleSaveImage] Failed to save design:', error);
        toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to save design',
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

  // ---- Helper: Prepare Print-Ready Asset ----
  const preparePrintReadyAsset = async (imageToUse: string): Promise<{ displayUrl: string, printUrl: string }> => {
    console.log('[preparePrintReadyAsset] Starting for image:', imageToUse ? 'present' : 'missing');
    if (!imageToUse) {
      throw new Error('No image provided');
    }

    // Validate data URL format before attempting upload
    if (imageToUse.startsWith('data:')) {
      const dataUrlMatch = imageToUse.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!dataUrlMatch) {
        throw new Error('Invalid image data format. Please regenerate the image.');
      }
      
      const [, format, base64Data] = dataUrlMatch;
      if (!base64Data || base64Data.length < 100) {
        throw new Error('Image data appears to be corrupted or too small. Please regenerate the image.');
      }
      
      // Try to validate base64 can be decoded
      try {
        atob(base64Data.substring(0, Math.min(100, base64Data.length)));
      } catch (e) {
        throw new Error('Image data encoding is invalid. Please regenerate the image.');
      }
    }

    try {
      toast({
        title: 'Preparing Design',
        description: 'Uploading your design...',
      });
      
      // Upload the image - server will create preview JPEG and 300 DPI PNG versions
      console.log('[preparePrintReadyAsset] Uploading image to server...');
      const uploadResult = await uploadImageToPermanentStorage(imageToUse);
      console.log('[preparePrintReadyAsset] Upload result:', uploadResult);
      
      // Validate upload succeeded
      if (!uploadResult.url || !uploadResult.previewUrl || !uploadResult.printReadyUrl) {
        throw new Error('Server did not return complete image URLs');
      }
      
      // Ensure URLs are not data URLs (should be permanent URLs)
      if (uploadResult.url.startsWith('data:') || uploadResult.previewUrl.startsWith('data:') || uploadResult.printReadyUrl.startsWith('data:')) {
        throw new Error('Upload failed - received data URLs instead of permanent URLs');
      }
      
      return {
          displayUrl: uploadResult.previewUrl, // Use preview JPEG for cart/checkout display
          printUrl: uploadResult.printReadyUrl  // Use 300 DPI PNG for Prodigi orders
      };
    } catch (error) {
      console.error('[preparePrintReadyAsset] Failed to prepare print-ready asset:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Don't return fallback data URLs - throw error instead
      throw new Error(`Failed to upload design: ${errorMessage}. Please try regenerating the image.`);
    }
  };

  // ---- Add to Cart ----
  const handleAddToCart = async () => {
    console.log('[handleAddToCart] Clicked');
    if (!selectedSize) {
      toast({
        title: 'Error',
        description: 'Please select a size before adding to cart',
        variant: 'destructive',
      });
      return;
    }

    // Use the selected design source
    let imageToUse: string;
    
    switch (selectedDesignSource) {
      case 'uploaded':
        imageToUse = referenceImage;
        break;
      case 'processed':
        imageToUse = processedImage;
        break;
      case 'generated':
      default:
        imageToUse = generatedImage;
        break;
    }

    const basePrice = product.pricing?.[0]?.amount || product.price || 0;
    const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent) : basePrice;

    // Get numeric product ID
    let numericProductId: number;
    try {
        // Optimistic fallback if product.id is already numeric
        if (typeof product.id === 'number') {
            numericProductId = product.id;
        } else {
            const response = await fetch(`/api/products/by-sku/${product.id}`);
            if (!response.ok) throw new Error('Failed to fetch product ID');
            const data = await response.json();
            numericProductId = data.id;
        }
    } catch (error) {
        console.error('[handleAddToCart] Failed to get product ID:', error);
        toast({ title: 'Error', description: 'Failed to load product info.', variant: 'destructive' });
        return;
    }

    // Prepare assets
    let finalImageUrl = imageToUse || product.imageUrls.cover;
    let printReadyUrl = '';

    if (imageToUse) {
        // ALWAYS upload to get permanent URLs - never store base64 in cart
        try {
            if (imageToUse.startsWith('data:')) {
                // Have a data URL that needs uploading
                console.log('[handleAddToCart] Data URL detected, uploading to storage...');
                const result = await preparePrintReadyAsset(imageToUse);
                finalImageUrl = result.displayUrl;
                printReadyUrl = result.printUrl;
                
                setGeneratedImage(finalImageUrl);
                setPrintReadyImageUrl(printReadyUrl);
            } else if (printReadyImageUrl) {
                // Already have permanent URLs
                console.log('[handleAddToCart] Using existing permanent URLs');
                finalImageUrl = imageToUse;
                printReadyUrl = printReadyImageUrl;
            } else {
                // Have a regular URL but no print-ready version, upload it
                console.log('[handleAddToCart] Uploading to get print-ready version...');
                const result = await preparePrintReadyAsset(imageToUse);
                finalImageUrl = result.displayUrl;
                printReadyUrl = result.printUrl;
                
                setGeneratedImage(finalImageUrl);
                setPrintReadyImageUrl(printReadyUrl);
            }
        } catch (uploadError) {
            console.error('[handleAddToCart] Failed to upload image:', uploadError);
            toast({
                title: 'Upload Failed',
                description: uploadError instanceof Error ? uploadError.message : 'Failed to upload design. Please try regenerating the image.',
                variant: 'destructive'
            });
            return; // Don't add to cart if upload failed
        }
    }

    const itemToAdd = {
      id: `${numericProductId}-${selectedSize}-${selectedColor}`,
      productId: String(numericProductId),
      name: product.name,
      price: finalPrice,
      originalPrice: basePrice,
      discount: discountPercent > 0 ? Math.round(discountPercent * 100) : undefined,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor || 'Default',
      imageUrl: finalImageUrl, // Preview URL for display
      previewUrl: finalImageUrl, // Explicitly set preview URL
      printReadyUrl: printReadyUrl, // 300 DPI URL for Prodigi
      images: [{ url: finalImageUrl }], // For checkout page display
      assets: [
        {
          url: printReadyUrl || finalImageUrl, // Use print-ready URL in assets for Prodigi
          printArea: 'default'
        }
      ],
    };

    console.log('[handleAddToCart] Adding item:', {
      ...itemToAdd,
      imageUrl: itemToAdd.imageUrl?.substring(0, 50) + '...',
      printReadyUrl: itemToAdd.printReadyUrl?.substring(0, 50) + '...',
    });
    
    try {
        addItem(itemToAdd as any);
        toast({
          title: 'Added to cart',
          description: `${product.name} has been added to your cart.`,
        });
    } catch (error) {
        console.error('[handleAddToCart] Failed to add to cart:', error);
        toast({
            title: 'Error',
            description: 'Failed to add to cart. Your browser storage may be full. Try clearing your cart.',
            variant: 'destructive'
        });
    }
  };

  // ---- Checkout ----
  const handleCheckout = async () => {
    console.log('[handleCheckout] Clicked');

    // Prevent double-clicking by checking if already processing
    if (isPreparingCheckout || isCheckingOut) {
      console.log('[handleCheckout] Already processing, ignoring duplicate click');
      return;
    }

    if (!selectedSize) {
      toast({
        title: 'Error',
        description: 'Please select a size before proceeding to checkout',
        variant: 'destructive',
      });
      return;
    }

    // Set loading state to prevent double-clicks
    setIsPreparingCheckout(true);

    // Determine which image to use based on user's selection
    let imageToUse: string;
    
    switch (selectedDesignSource) {
      case 'uploaded':
        imageToUse = referenceImage;
        break;
      case 'processed':
        imageToUse = processedImage;
        break;
      case 'generated':
      default:
        imageToUse = generatedImage;
        break;
    }

    if (!imageToUse && !product.imageUrls.cover) {
      setIsPreparingCheckout(false);
      toast({
        title: 'No Design Selected',
        description: 'Please select a design to print on your T-shirt',
        variant: 'destructive',
      });
      return;
    }

    // Calculate final price with discount
    const basePrice = product.pricing?.[0]?.amount || product.price || 0;
    const finalPrice = discountPercent > 0 ? basePrice * (1 - discountPercent) : basePrice;

    // Fetch the numeric product ID from the database using SKU
    // product.id is actually the SKU (e.g., "TEE-SS-STTU755"), not a numeric ID
    let numericProductId: number;
    try {
      const response = await fetch(`/api/products/by-sku/${product.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product ID');
      }
      const data = await response.json();
      numericProductId = data.id;
      
      if (!numericProductId || numericProductId === 0) {
        throw new Error('Invalid product ID returned');
      }
    } catch (error) {
      console.error('[Buy Now] Failed to fetch product ID:', error);
      setIsPreparingCheckout(false);
      toast({
        title: 'Error',
        description: 'Failed to load product information. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    console.log('handleCheckout start', { 
        imageToUse: imageToUse ? (imageToUse.substring(0, 50) + '...') : 'null',
        productCover: product.imageUrls?.cover,
        removeBackground,
        processedImage: processedImage ? 'present' : 'missing'
    });

    // Ensure the image is uploaded to permanent storage and we get the 300 DPI version
    let finalImageUrl = imageToUse || product.imageUrls.cover;
    let printReadyUrl = '';

    // ALWAYS upload to get permanent URLs - never store base64 in cart/checkout
    if (imageToUse) {
        try {
            if (imageToUse.startsWith('data:')) {
                // Have a data URL that needs uploading
                console.log('[handleCheckout] Data URL detected, uploading to storage...');
                const result = await preparePrintReadyAsset(imageToUse);
                finalImageUrl = result.displayUrl;
                printReadyUrl = result.printUrl;
                
                setGeneratedImage(finalImageUrl);
                setPrintReadyImageUrl(printReadyUrl);
            } else if (printReadyImageUrl) {
                // Already have permanent URLs
                console.log('[handleCheckout] Using existing permanent URLs');
                finalImageUrl = imageToUse;
                printReadyUrl = printReadyImageUrl;
            } else {
                // Have a regular URL but no print-ready version, upload it
                console.log('[handleCheckout] Uploading to get print-ready version...');
                const result = await preparePrintReadyAsset(imageToUse);
                finalImageUrl = result.displayUrl;
                printReadyUrl = result.printUrl;
                
                setGeneratedImage(finalImageUrl);
                setPrintReadyImageUrl(printReadyUrl);
            }
        } catch (uploadError) {
            console.error('[handleCheckout] Failed to upload image:', uploadError);
            setIsPreparingCheckout(false);
            toast({
                title: 'Upload Failed',
                description: uploadError instanceof Error ? uploadError.message : 'Failed to upload design. Please try regenerating the image.',
                variant: 'destructive',
            });
            return; // Don't proceed to checkout if upload failed
        }
    }

    console.log('Checkout URLs:', { 
      finalImageUrl: finalImageUrl?.substring(0, 50) + '...', 
      printReadyUrl: printReadyUrl?.substring(0, 50) + '...' 
    });

    const itemToAdd = {
      id: `${numericProductId}-${selectedSize}-${selectedColor}`,
      productId: String(numericProductId), // Use numeric database ID as string
      name: product.name,
      price: finalPrice, // Apply discount to cart price
      originalPrice: basePrice, // Store original price for reference
      discount: discountPercent > 0 ? Math.round(discountPercent * 100) : undefined, // Store discount %
      quantity: quantity,
      size: selectedSize,
      color: selectedColor || 'Default',
      imageUrl: finalImageUrl, // Preview URL for display
      previewUrl: finalImageUrl, // Explicitly set preview URL
      printReadyUrl: printReadyUrl, // 300 DPI URL for Prodigi
      images: [{ url: finalImageUrl }], // For checkout page display
      assets: [
        {
          url: printReadyUrl || finalImageUrl, // Use print-ready URL in assets for Prodigi
          printArea: 'default'
        }
      ],
    };
    addItem(itemToAdd as any);

    const allItems = [...cartItems, itemToAdd];
    const allItemsAsCheckoutItems = allItems.map(item => {
        // If this is the item we just added, use the printReadyUrl we just got
        const isCurrentItem = item.id === itemToAdd.id;
        const itemPrintUrl = isCurrentItem ? (printReadyUrl || item.printReadyUrl || item.imageUrl) : (item.printReadyUrl || item.imageUrl);
        const itemPreviewUrl = isCurrentItem ? (finalImageUrl || item.imageUrl) : ((item as any).previewUrl || item.imageUrl);

        return {
            productId: String(item.productId), // Ensure it's a string
            name: item.name,
            price: item.price,
            copies: item.quantity,
            color: item.color,
            size: item.size,
            images: [{ 
                url: itemPreviewUrl || itemPrintUrl || '', // Use preview URL for display
                dpi: 300 
            }],
            customization: (item as any).customization,
            recipientCostAmount: item.price,
            currency: 'USD',
            merchantReference: `item_${item.productId}`,
            sku: String(item.productId),
            designUrl: itemPrintUrl, // Use the print-ready URL for the design
            printReadyUrl: itemPrintUrl, // Explicitly include for Prodigi (300 DPI PNG)
            previewUrl: itemPreviewUrl, // Preview URL for cart/checkout display
        };
    }).filter(item => {
        // Filter out items with missing images to prevent checkout errors
        const hasImage = (item.images && item.images.length > 0 && item.images[0].url && item.images[0].url.trim() !== '') 
                      || (item.printReadyUrl && item.printReadyUrl.trim() !== '');
        if (!hasImage) {
            console.warn('Excluding item from checkout due to missing image:', item);
        }
        return hasImage;
    });

    if (allItemsAsCheckoutItems.length === 0) {
        setIsPreparingCheckout(false);
        toast({
            title: 'Error',
            description: 'No valid items to checkout. Please try generating the design again.',
            variant: 'destructive',
        });
        return;
    }

    try {
      initiateCheckout(allItemsAsCheckoutItems);
      // Reset loading state after checkout is initiated
      // Note: The user will be redirected to Square payment page
      setIsPreparingCheckout(false);
    } catch (error) {
      console.error('[handleCheckout] Checkout failed:', error);
      setIsPreparingCheckout(false);
       toast({
        title: 'Error',
        description: 'Failed to initiate checkout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCloseCheckout = () => {
    setCheckoutItem(null);
  };

  const handleUploadClick = () => {
    // Add logic to handle upload click
  };

  // ---- Image-to-Image Handlers ----
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setReferenceImage(result);
        setUseReferenceImage(true);
        setUseTshirtDesign(false);
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setReferenceImage(result);
        setUseReferenceImage(true);
        setUseTshirtDesign(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWebcamCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        setTimeout(() => {
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/png');
            setReferenceImage(imageData);
            setUseReferenceImage(true);
            setUseTshirtDesign(false);
          }
          
          // Stop the camera
          stream.getTracks().forEach(track => track.stop());
        }, 3000); // Take photo after 3 seconds
      });
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please try uploading an image instead.',
        variant: 'destructive',
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              setReferenceImage(result);
              setUseReferenceImage(true);
              setUseTshirtDesign(false);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      toast({
        title: 'No Image Found',
        description: 'No image found in clipboard. Please copy an image first.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error accessing clipboard:', error);
      toast({
        title: 'Clipboard Error',
        description: 'Unable to access clipboard. Please try uploading an image instead.',
        variant: 'destructive',
      });
    }
  };

  const generatePreview = async (designUrl: string) => {
    // Add logic to generate preview
  };

  return (
    <div className={`product-detail-background ${isDesignMode ? '' : 'min-h-screen'}`}>
      <div className={`mx-auto product-detail-container ${isDesignMode ? 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6' : 'max-w-[1440px] px-3 py-8 lg:px-6 lg:py-12'}`}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-2">
        {/* LEFT PANEL: T-shirt Preview + AI Prompt */}
        <div className="space-y-4">
          {/* T-shirt & Generated Design */}
          <div className="product-mockup-area relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-lg border-2 border-teal-500 bg-teal-600">
            {(() => {
              console.log('Product data:', {
                imageUrlMap: product.imageUrlMap,
                colorValue: toKebabCase(selectedColor),
                imageUrl: (product as any).imageUrl || product.imageUrls?.base,
                selectedColor: selectedColor,
                availableColors: product.specifications?.color,
              });

              if (product.imageUrlMap && selectedColor && product.imageUrlMap[selectedColor]) {
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
                  imageUrl: (product as any).imageUrl || product.imageUrls?.base,
                  prodigiVariants: product.prodigiVariants?.imageUrls?.base,
                  imageUrls: product.prodigiVariants?.imageUrls,
                  colorOptions: product.prodigiVariants?.colorOptions,
                });
                // Default to white for t-shirts and apparel, or the first available color
                const colorValue =
                  selectedColor ||
                  (product.specifications?.color?.find((c: string) =>
                    c.toLowerCase().includes('white')
                  )
                    ? toKebabCase(product.specifications.color.find((c: string) =>
                        c.toLowerCase().includes('white')
                      )!)
                    : product.specifications?.color?.[0]
                      ? toKebabCase(product.specifications.color[0])
                      : 'white');
                const imageUrl = `${product.prodigiVariants?.imageUrls?.base}/${colorValue}.png`;
                console.log('Using direct path:', {
                  imageUrl: imageUrl,
                  colorValue: colorValue,
                  baseImageUrl: (product as any).imageUrl || product.imageUrls?.base,
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
              <div className="generated-image-container absolute inset-0 flex items-center justify-center">
                <div
                  className="relative"
                  style={(() => {
                    const productCode = product.specifications?.style || product.sku || product.id.toString();
                    const productType = (product as any).productType;
                    const productName = product.name;
                    
                    // Check by product type and name for more reliable matching
                    if (productType === 'BABY_BODYSUIT' || productName.includes("Baby's Bodysuit")) {
                      return { width: '25%', height: '20%', overflow: 'hidden', marginTop: '33%' };
                    }
                    
                    if (productType === 'BABY_T_SHIRT' || productName.includes("Baby's T-Shirt")) {
                      return { width: '30%', height: '25%', overflow: 'hidden', marginTop: '35%' };
                    }
                    
                    if (productName.includes("Triblend") || productCode === 'GLOBAL-TEE-BC-3413') {
                      return { width: '25%', height: '30%', overflow: 'hidden', marginTop: '35%' };
                    }
                    
                    if (productType === 'TANK_TOP' || productName.includes("Tank Top")) {
                      return { width: '30%', height: '33%', overflow: 'hidden', marginTop: '35%' };
                    }
                    
                    if (productType === 'KIDS_T_SHIRT' || productName.includes("Kids' T-Shirt")) {
                      return { width: '33%', height: '15%', overflow: 'hidden', marginTop: '33%' };
                    }
                    
                    // Men's T-shirts with default values
                    if (productName.includes("Men's Classic T-Shirt") || productCode === 'TEE-SS-STTU755') {
                      return { width: '40%', height: '100%', overflow: 'hidden', marginTop: '30%' };
                    }
                    
                    if (productName.includes("Men's V-Neck T-Shirt") || productCode === 'GLOBAL-TEE-GIL-64V00') {
                      return { width: '30%', height: '45%', overflow: 'hidden', marginTop: '35%' };
                    }
                    
                    if (productType === 'LONG_SLEEVE_T_SHIRT' || productName.includes("Men's Long Sleeve T-Shirt") || productCode === 'A-ML-GD2400') {
                      return { width: '38%', height: '100%', overflow: 'hidden', marginTop: '25%' };
                    }
                    
                    // Women's T-shirts with color-specific sizing
                    if (productName.includes("Women's Classic T-Shirt") || productCode === 'A-WT-GD64000L') {
                      if (selectedColor === 'cornsilk') {
                        return { width: '25%', height: '35%', overflow: 'hidden', marginTop: '30%' };
                      }
                      if (selectedColor === 'daisy') {
                        return { width: '30%', height: '100%', overflow: 'hidden', marginTop: '25%', marginRight: '3%' };
                      }
                      return { width: '30%', height: '45%', overflow: 'hidden', marginTop: '35%' };
                    }
                    
                    if (productName.includes("Women's V-Neck T-Shirt") || productCode === 'GLOBAL-TEE-BC-6035') {
                      console.log('Applying Womens V-Neck T-Shirt sizing');
                      return { width: '30%', height: '45%', overflow: 'hidden', marginTop: '35%' };
                    }
                    
                    // Kids' Sweatshirt with default values
                    if (productType === 'KIDS_SWEATSHIRT' || productName.includes("Kids' Sweatshirt") || productCode === 'SWEAT-AWD-JH030B') {
                      console.log('Applying Kids Sweatshirt sizing');
                      return { width: '37%', height: '100%', overflow: 'hidden', marginTop: '25%' };
                    }
                    
                    // Default sizing for all other products
                    console.log('Applying Default sizing for product:', productName, 'Type:', productType, 'Code:', productCode);
                    return { width: '30%', height: '45%', overflow: 'hidden', marginTop: '35%'};
                  })()}
                >
                  <Image
                    src={removeBackground && processedImage ? processedImage : generatedImage}
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

          {/* Background Removal Option */}
          {generatedImage && (
            <div className="flex items-center justify-center space-x-2">
              <Checkbox
                id="remove-background"
                checked={removeBackground}
                onCheckedChange={(checked) => {
                  setRemoveBackground(checked as boolean);
                  if (!checked) {
                    setProcessedImage('');
                  }
                }}
                disabled={isProcessingBackground}
                className="border-teal-500 data-[state=checked]:bg-teal-500"
              />
              <Label 
                htmlFor="remove-background" 
                className="text-sm text-teal-700 cursor-pointer"
              >
                {isProcessingBackground ? 'Removing background...' : 'Remove background'}
              </Label>
            </div>
          )}

          {/* AI Prompt */}
          <div className="ai-controls-panel space-y-3 rounded-lg border border-teal-200 p-4">
            <h2 className="font-semibold text-teal-700 text-lg">
              Customize with AI
            </h2>
            
            {/* Text-to-Image Mode */}
            {generationMode === 'text' && (
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
                  onClick={useNanoBanana ? handleNanoBananaGeneration : handleImageGeneration}
                  disabled={isGenerating || !promptText}
                  size="sm"
                >
                  {isGenerating ? 'Generating...' : 'Generate Design'}
                </Button>
              </div>
            )}
            
            {/* Image-to-Image Mode */}
            {generationMode === 'image' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="img2img-prompt" className="text-teal-600 text-sm">
                    Describe your design (optional)
                  </Label>
                  <Textarea
                    id="img2img-prompt"
                    placeholder="Optional: Describe the changes you want to make..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="min-h-[50px]"
                  />
                </div>

                {/* Image Upload Area - Enhanced for Nano Banana */}
                <div className="space-y-3">
                  <Label className={`text-sm ${useNanoBanana ? 'text-purple-600' : useFlux2Pro ? 'text-blue-600' : 'text-teal-600'}`}>
                    Reference Image{useNanoBanana ? `s (up to ${nanoBananaModel === 'nano-banana-pro' ? '6' : '3'} optional)` : useFlux2Pro ? 's (up to 8 optional)' : ''}
                  </Label>

                  {useNanoBanana ? (
                    /* Nano Banana: Multi-image upload (1-6 images) */
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-indigo-50">
                      {/* Info Banner */}
                      <div className="mb-4 bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-purple-900">
                              {nanoBananaModel === 'nano-banana-pro' ? 'Nano Banana Pro' : 'Nano Banana'}
                            </p>
                            <p className="text-xs text-purple-600 mt-0.5">
                              {nanoBananaModel === 'nano-banana-pro'
                                ? 'Advanced model - Up to 6 reference images for maximum creative control'
                                : 'Standard model - Up to 3 reference images for quick edits'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reference Images Grid */}
                      <div className={`grid gap-2 mb-3 ${nanoBananaModel === 'nano-banana-pro' ? 'grid-cols-3' : 'grid-cols-3'}`}>
                        {Array.from({ length: nanoBananaModel === 'nano-banana-pro' ? 6 : 3 }).map((_, index) => (
                          <div
                            key={index}
                            className={`aspect-square rounded-lg border-2 border-dashed relative overflow-hidden ${
                              referenceImages[index]
                                ? 'border-purple-400 bg-white'
                                : 'border-purple-300 bg-purple-50/50'
                            }`}
                          >
                            {referenceImages[index] ? (
                              <>
                                <Image
                                  src={referenceImages[index]}
                                  alt={`Reference ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  onClick={() => handleRemoveReferenceImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                                  aria-label="Remove image"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                  <span className="text-white text-[10px] font-medium leading-tight block text-center">
                                    {index === 0 && 'Style'}
                                    {index === 1 && 'Layout'}
                                    {index === 2 && 'Texture'}
                                    {index === 3 && 'Lighting'}
                                    {index === 4 && 'Color Grade'}
                                    {index === 5 && 'Character'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                <svg className="w-5 h-5 text-purple-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-[10px] text-purple-500 text-center font-medium leading-tight">
                                  {index === 0 && 'Style'}
                                  {index === 1 && 'Layout'}
                                  {index === 2 && 'Texture'}
                                  {index === 3 && 'Lighting'}
                                  {index === 4 && 'Color Grade'}
                                  {index === 5 && 'Character'}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Upload Controls */}
                      {referenceImages.length < (nanoBananaModel === 'nano-banana-pro' ? 6 : 3) && (
                        <div
                          className="border-2 border-dashed border-purple-300 rounded-lg p-3 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-100 transition-colors"
                          onDrop={handleReferenceImageDrop}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleReferenceImageSelect}
                            className="hidden"
                            id="nano-banana-upload"
                          />
                          <label htmlFor="nano-banana-upload" className="cursor-pointer flex flex-col items-center">
                            <svg className="w-8 h-8 text-purple-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-purple-700 font-medium">Click or drag to upload</span>
                            <span className="text-xs text-purple-500 mt-1">
                              ({(nanoBananaModel === 'nano-banana-pro' ? 6 : 3) - referenceImages.length} slot{(nanoBananaModel === 'nano-banana-pro' ? 6 : 3) - referenceImages.length !== 1 ? 's' : ''} remaining)
                            </span>
                          </label>
                        </div>
                      )}

                      {referenceImages.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearReferenceImages}
                          className="w-full mt-2 text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
                        >
                          Clear All ({referenceImages.length})
                        </Button>
                      )}

                      {/* Helper Info */}
                      {referenceImages.length === 0 && (
                        <div className="mt-2 text-xs text-purple-600 space-y-1">
                          <div className="text-purple-700 font-semibold mb-1">💡 Works with any mode:</div>
                          <div><strong>1 image:</strong> Style & mood</div>
                          <div><strong>2 images:</strong> Style + element</div>
                          <div><strong>3 images:</strong> Style + composition + texture</div>
                          {nanoBananaModel === 'nano-banana-pro' && (
                            <>
                              <div><strong>4 images:</strong> + Lighting & atmosphere</div>
                              <div><strong>5 images:</strong> + Color grading</div>
                              <div><strong>6 images:</strong> + Character consistency</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : useFlux2Pro ? (
                    /* Flux 2 Pro: Multi-image upload (up to 8 images) */
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-sky-50">
                      {/* Info Banner */}
                      <div className="mb-4 bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-blue-900">Flux 2 Pro</p>
                            <p className="text-xs text-blue-600 mt-0.5">
                              Professional image-to-image - Up to 8 reference images for advanced consistency
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reference Images Grid */}
                      <div className="grid gap-2 mb-3 grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                          <div
                            key={index}
                            className={`aspect-square rounded-lg border-2 border-dashed relative overflow-hidden ${
                              flux2ProReferenceImages[index]
                                ? 'border-blue-400 bg-white'
                                : 'border-blue-300 bg-blue-50/50'
                            }`}
                          >
                            {flux2ProReferenceImages[index] ? (
                              <>
                                <Image
                                  src={flux2ProReferenceImages[index]}
                                  alt={`Flux 2 Reference ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  onClick={() => handleRemoveFlux2ProImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                  <span className="text-white text-[10px] font-medium leading-tight block text-center">
                                    Ref {index + 1}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                <svg className="w-5 h-5 text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-[10px] text-blue-500 text-center font-medium leading-tight">
                                  Ref {index + 1}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Upload Controls */}
                      {flux2ProReferenceImages.length < 8 && (
                        <div
                          className="border-2 border-dashed border-blue-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-colors"
                          onDrop={handleFlux2ProImageDrop}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFlux2ProImageSelect}
                            className="hidden"
                            id="flux2-upload"
                          />
                          <label htmlFor="flux2-upload" className="cursor-pointer flex flex-col items-center">
                            <svg className="w-8 h-8 text-blue-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-blue-700 font-medium">Click or drag to upload</span>
                            <span className="text-xs text-blue-500 mt-1">
                              ({8 - flux2ProReferenceImages.length} slot{8 - flux2ProReferenceImages.length !== 1 ? 's' : ''} remaining)
                            </span>
                          </label>
                        </div>
                      )}

                      {flux2ProReferenceImages.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFlux2ProImages}
                          className="w-full mt-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          Clear All ({flux2ProReferenceImages.length})
                        </Button>
                      )}

                      {/* Helper Info */}
                      {flux2ProReferenceImages.length === 0 && (
                        <div className="mt-2 text-xs text-blue-600 space-y-1">
                          <div><strong>Photorealistic output</strong> up to 4MP resolution</div>
                          <div><strong>Character & product consistency</strong> across reference images</div>
                          <div><strong>Advanced style transfer</strong> with multi-image guidance</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Standard: Single image upload */
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-300 hover:border-teal-400'
                      } ${
                        (useTshirtDesign && generatedImage) ? 'opacity-50 pointer-events-none' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {referenceImage && useReferenceImage ? (
                        <div className="space-y-2">
                          <img
                            src={referenceImage}
                            alt="Reference"
                            className="mx-auto max-h-32 rounded"
                          />
                          <p className="text-sm text-gray-600">Reference image uploaded</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReferenceImage('');
                              setUseReferenceImage(false);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-gray-600">
                            <p className="font-medium">Drop Image Here or Click to Upload</p>
                            <p className="text-sm">PNG, JPG, WebP up to 10MB</p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                const input = document.getElementById('image-upload') as HTMLInputElement;
                                if (input) {
                                  input.click();
                                }
                              }}
                            >
                              📁 Choose File
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleWebcamCapture}
                            >
                              📷 Use Webcam
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePasteFromClipboard}
                            >
                              📋 Paste Image
                            </Button>
                          </div>

                          <div className="pt-2">
                            <DesignPicker
                              productId={Number(product.id)}
                              onDesignSelect={(image) => {
                                setReferenceImage(image.url);
                                setUseReferenceImage(true);
                                setUseTshirtDesign(false);
                              }}
                              trigger={
                                <Button variant="outline" size="sm">
                                  🖼 Choose Existing Image
                                </Button>
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Toggle Options */}
                {generatedImage && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-tshirt-design"
                      checked={useTshirtDesign}
                      onCheckedChange={(checked) => {
                        setUseTshirtDesign(checked as boolean);
                        if (checked) {
                          setUseReferenceImage(false);
                          setReferenceImage('');
                        }
                      }}
                    />
                    <Label htmlFor="use-tshirt-design" className="text-sm">
                      Use current T-shirt design as reference
                    </Label>
                  </div>
                )}

                {referenceImage && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-reference-image"
                      checked={useReferenceImage}
                      onCheckedChange={(checked) => setUseReferenceImage(checked as boolean)}
                    />
                    <Label htmlFor="use-reference-image" className="text-sm">
                      Use reference image
                    </Label>
                  </div>
                )}

                {/* Subject Description */}
                <div className="space-y-2">
                  <Label htmlFor="subject-description" className="text-teal-600 text-sm">
                    Optional: Describe the person/subject for better accuracy
                  </Label>
                  <Textarea
                    id="subject-description"
                    placeholder="Example: Tall man with curly brown hair wearing sunglasses"
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    className="min-h-[40px]"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  className="w-full bg-teal-600 text-white hover:bg-teal-700"
                  onClick={() => {
                    if (generationMode === 'image' && useNanoBanana) {
                      handleNanoBananaGeneration();
                    } else if (generationMode === 'image' && useFlux2Pro) {
                      handleFlux2ProGeneration();
                    } else {
                      handleImageGeneration();
                    }
                  }}
                  disabled={isGenerating || (generationMode === 'image' && !useNanoBanana && !useFlux2Pro && !useTshirtDesign && !useReferenceImage) || !promptText}
                  size="sm"
                >
                  {isGenerating ? 'Generating...' : (useNanoBanana && nanoBananaEditHistory.length > 0 ? 'Apply Edit' : 'Generate Design')}
                </Button>
              </div>
            )}
          </div>

          {/* Design Picker / Upload */}
          <div className="space-y-3">
            <h2 className="font-semibold text-base">Customize Your Design</h2>
            <div className="flex gap-3">
              <Button onClick={handleUploadClick} size="sm">Upload Image</Button>
              <DesignPicker
                productId={Number(product.id)}
                onDesignSelect={(image) => {
                  // Set the selected image as the generated image
                  setGeneratedImage(image.url);
                  setImageUrl(image.url);
                  // Clear any background removal processing since this is an existing image
                  setRemoveBackground(false);
                  setProcessedImage('');
                  console.log('Selected existing image:', image.url);
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Product Info, AI Settings, Checkout */}
        <div className="product-config-sidebar space-y-4 lg:sticky lg:top-4">
          {/* Product Info */}
          <div className="space-y-1">
            <h1 className="font-bold text-2xl text-teal-900 tracking-tight">
              {product.name}
            </h1>

            {/* Price with optional discount */}
            <div className="space-y-2">
              {discountPercent > 0 ? (
                <>
                  {/* Discounted Price Display */}
                  <div className="flex items-center gap-3">
                    <div className="text-3xl text-green-600 font-bold">
                      <PriceDisplay amountGBP={getConvertedPrice((product.pricing?.[0]?.amount || product.price || 0) * (1 - discountPercent))} />
                    </div>
                    <div className="text-lg text-gray-400 line-through font-semibold">
                      <PriceDisplay amountGBP={getConvertedPrice(product.pricing?.[0]?.amount || product.price || 0)} />
                    </div>
                  </div>
                  {/* Discount Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                    <span>Save {Math.round(discountPercent * 100)}% OFF</span>
                  </div>
                  {/* Secondary reference handled by PriceDisplay */}
                </>
              ) : (
                <>
                  {/* Regular Price Display */}
                  <div className="flex items-baseline space-x-2">
                    <div className="text-2xl text-teal-800 font-bold">
                      <PriceDisplay amountGBP={getConvertedPrice(product.pricing?.[0]?.amount || product.price || 0)} />
                    </div>
                    {/* Secondary reference handled by PriceDisplay */}
                  </div>
                </>
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
                  <Label htmlFor="color" className="text-teal-600 text-sm block mb-1">
                    Color
                  </Label>
                  <div className="mt-1 flex gap-1 bg-gradient-to-r from-orange-100 to-teal-100 p-2 rounded-lg w-fit">
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
          <div className="ai-controls-panel space-y-3 rounded-lg border border-teal-200 p-4">
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
                    value={useNanoBanana ? nanoBananaModel : 'promptly-loras'}
                    onValueChange={(value) => {
                      if (value === 'nano-banana') {
                        setUseNanoBanana(true);
                        setNanoBananaModel('nano-banana');
                        setIsBaseModel(false);
                        setSelectedModels([]);
                      } else if (value === 'nano-banana-pro') {
                        setUseNanoBanana(true);
                        setNanoBananaModel('nano-banana-pro');
                        setIsBaseModel(false);
                        setSelectedModels([]);
                      } else if (value === 'promptly-loras') {
                        setUseNanoBanana(false);
                        setIsBaseModel(false);
                        setSelectedModels([LORAS[0].id]);
                        setModelWeights({ [LORAS[0].id]: LORAS[0].scale || 1.0 });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-8 border-teal-200 bg-white hover:border-teal-300 focus:ring-teal-500">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promptly-loras">
                        Promptly LORA's (Fine-tuned)
                      </SelectItem>
                      <SelectItem value="nano-banana">
                        Google Nano Banana (0.5 credits)
                      </SelectItem>
                      <SelectItem value="nano-banana-pro">
                        Google Nano Banana Pro (2 credits)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isBaseModel && !useNanoBanana && (
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
                              {model.name} (1 credit)
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

            {generationMode === 'image' && (
              <div>
                <div className="mb-3">
                  <Label className="mb-1 block text-teal-600 text-sm">
                    Select Image Editing Model
                  </Label>
                  <Select
                    value={useNanoBanana ? nanoBananaModel : (useFlux2Pro ? 'flux-2-pro' : 'kontext-loras')}
                    onValueChange={(value) => {
                      if (value === 'nano-banana') {
                        setUseNanoBanana(true);
                        setUseFlux2Pro(false);
                        setNanoBananaModel('nano-banana');
                        setIsBaseModel(false);
                        setSelectedKontextModels([]);
                      } else if (value === 'nano-banana-pro') {
                        setUseNanoBanana(true);
                        setUseFlux2Pro(false);
                        setNanoBananaModel('nano-banana-pro');
                        setIsBaseModel(false);
                        setSelectedKontextModels([]);
                      } else if (value === 'flux-2-pro') {
                        setUseNanoBanana(false);
                        setUseFlux2Pro(true);
                        setIsBaseModel(false);
                        setSelectedKontextModels([]);
                      } else if (value === 'kontext-loras') {
                        setUseNanoBanana(false);
                        setUseFlux2Pro(false);
                        setIsBaseModel(false);
                        setSelectedKontextModels([KONTEXT_LORAS[0].id]);
                        setModelWeights({ [KONTEXT_LORAS[0].id]: KONTEXT_LORAS[0].scale || 1.0 });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kontext-loras">
                        Promptly Kontext LORA's
                      </SelectItem>
                      <SelectItem value="flux-2-pro">
                        Flux 2 Pro (1 credit) - Up to 8 reference images
                      </SelectItem>
                      <SelectItem value="nano-banana">
                        Google Nano Banana (0.5 credits) - Up to 3 reference images
                      </SelectItem>
                      <SelectItem value="nano-banana-pro">
                        Google Nano Banana Pro (2 credits) - Up to 6 reference images
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isBaseModel && !useNanoBanana && selectedKontextModels.length > 0 && (
                  <>
                    <Label className="mb-2 block text-teal-600 text-sm">
                      Kontext LoRAs &amp; Styles
                    </Label>
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
                      {KONTEXT_LORAS.map((lora: KontextLora) => (
                        <div
                          key={lora.id}
                          className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-all duration-200 ${
                            selectedKontextModels.includes(lora.id)
                              ? 'ring-2 ring-teal-500'
                              : 'hover:ring-2 hover:ring-teal-200'
                          }`}
                          onClick={() => {
                            if (selectedKontextModels[0] === lora.id) return;
                            setSelectedKontextModels([lora.id]);
                            setModelWeights({ [lora.id]: lora.scale || 1.0 });
                          }}
                        >
                          <div className="relative h-full w-full">
                            <Image
                              src={lora.image}
                              alt={lora.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-1 backdrop-blur-sm">
                            <p className="text-center font-medium text-xs text-white">
                              {lora.name} (1 credit)
                            </p>
                          </div>
                          <div className="absolute top-1 left-1">
                            <Checkbox
                              id={`kontext-${lora.id}`}
                              checked={selectedKontextModels.includes(lora.id)}
                              className="border-teal-500 bg-white/90 data-[state=checked]:bg-teal-500 h-4 w-4"
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked: boolean) => {
                                if (checked) {
                                  setSelectedKontextModels([lora.id]);
                                  setModelWeights({
                                    [lora.id]: lora.scale || 1.0,
                                  });
                                } else if (
                                  selectedKontextModels.length === 1 &&
                                  selectedKontextModels[0] === lora.id
                                ) {
                                  // Prevent unchecking the only selected model
                                  return;
                                }
                              }}
                            />
                          </div>
                          {selectedKontextModels.includes(lora.id) && (
                            <div className="absolute right-0 bottom-8 left-0 px-2 py-1">
                              <Slider
                                value={[
                                  modelWeights[lora.id] || lora.scale || 1.0,
                                ]}
                                onValueChange={([value]) => {
                                  setModelWeights({ [lora.id]: value });
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

                {useNanoBanana && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2 mb-2">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-purple-900 mb-1">
                            Nano Banana - Conversational AI Editing
                          </h4>
                          <p className="text-xs text-purple-700">
                            Google's advanced image editing AI. Make iterative edits with natural language - the AI remembers your previous changes for seamless refinement.
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white rounded p-2">
                            <div className="font-medium text-purple-900">Multi-turn Editing</div>
                            <div className="text-purple-600">Remembers context</div>
                          </div>
                          <div className="bg-white rounded p-2">
                            <div className="font-medium text-purple-900">Character Consistency</div>
                            <div className="text-purple-600">Preserves features</div>
                          </div>
                          <div className="bg-white rounded p-2">
                            <div className="font-medium text-purple-900">Surgical Precision</div>
                            <div className="text-purple-600">Targeted changes</div>
                          </div>
                          <div className="bg-white rounded p-2">
                            <div className="font-medium text-purple-900">Ultra Fast</div>
                            <div className="text-purple-600">Seconds per edit</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {nanoBananaEditHistory.length > 0 && (
                      <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-purple-900 text-sm font-semibold">
                            Edit History ({nanoBananaEditHistory.length} edits)
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-purple-600 hover:text-purple-800"
                            onClick={() => setShowEditHistory(!showEditHistory)}
                          >
                            {showEditHistory ? 'Hide' : 'Show'}
                          </Button>
                        </div>

                        {showEditHistory && (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {nanoBananaEditHistory.map((edit, index) => (
                              <div key={index} className="bg-white rounded p-2 text-xs">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-purple-900">
                                      Edit {index + 1}
                                    </div>
                                    <div className="text-gray-600 mt-1">
                                      "{edit.prompt}"
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-purple-600 hover:text-purple-800"
                                    onClick={() => {
                                      setGeneratedImage(edit.imageUrl);
                                      toast({
                                        title: 'Restored',
                                        description: `Restored to edit ${index + 1}`,
                                      });
                                    }}
                                  >
                                    Restore
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {nanoBananaEditHistory.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
                        💡 <strong>Tip:</strong> Each new edit builds on the previous one. Try: "make the background brighter" then "change the color to blue" then "add a sunset"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {generatedImage && (
              <div className="space-y-3">
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

          {/* Design Selection Panel - Only show when multiple options exist */}
          {(generatedImage || referenceImage || processedImage) && (
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 rounded-xl p-6 space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Select Your Final Design</h3>
              </div>
              
              <p className="text-sm text-gray-600">
                Choose which design will be printed on your T-shirt
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option 1: Uploaded Image (if exists) */}
                {referenceImage && (
                  <label className={`relative cursor-pointer group ${
                    selectedDesignSource === 'uploaded' 
                      ? 'ring-4 ring-teal-500 ring-offset-2' 
                      : 'ring-2 ring-gray-200 hover:ring-teal-300'
                  } rounded-lg overflow-hidden transition-all`}>
                    <input
                      type="radio"
                      name="design-source"
                      value="uploaded"
                      checked={selectedDesignSource === 'uploaded'}
                      onChange={() => setSelectedDesignSource('uploaded')}
                      className="sr-only"
                    />
                    
                    <div className="aspect-square relative">
                      <img 
                        src={referenceImage} 
                        alt="Your uploaded image" 
                        className="w-full h-full object-cover"
                      />
                      
                      {selectedDesignSource === 'uploaded' && (
                        <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                          <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Will be printed
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-white">
                      <p className="font-medium text-sm text-gray-900">Your Upload</p>
                      <p className="text-xs text-gray-500">Original image</p>
                    </div>
                  </label>
                )}

                {/* Option 2: AI Generated (if exists and no processed version) */}
                {generatedImage && !processedImage && (
                  <label className={`relative cursor-pointer group ${
                    selectedDesignSource === 'generated' 
                      ? 'ring-4 ring-teal-500 ring-offset-2' 
                      : 'ring-2 ring-gray-200 hover:ring-teal-300'
                  } rounded-lg overflow-hidden transition-all`}>
                    <input
                      type="radio"
                      name="design-source"
                      value="generated"
                      checked={selectedDesignSource === 'generated'}
                      onChange={() => setSelectedDesignSource('generated')}
                      className="sr-only"
                    />
                    
                    <div className="aspect-square relative">
                      <img 
                        src={generatedImage} 
                        alt="AI generated design" 
                        className="w-full h-full object-cover"
                      />
                      
                      {selectedDesignSource === 'generated' && (
                        <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                          <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Will be printed
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-white">
                      <p className="font-medium text-sm text-gray-900">AI Generated</p>
                      <p className="text-xs text-gray-500">Created by AI</p>
                    </div>
                  </label>
                )}

                {/* Option 3: Processed (Background Removed) */}
                {processedImage && (
                  <label className={`relative cursor-pointer group ${
                    selectedDesignSource === 'processed' 
                      ? 'ring-4 ring-teal-500 ring-offset-2' 
                      : 'ring-2 ring-gray-200 hover:ring-teal-300'
                  } rounded-lg overflow-hidden transition-all`}>
                    <input
                      type="radio"
                      name="design-source"
                      value="processed"
                      checked={selectedDesignSource === 'processed'}
                      onChange={() => setSelectedDesignSource('processed')}
                      className="sr-only"
                    />
                    
                    <div className="aspect-square relative bg-gray-100">
                      <img 
                        src={processedImage} 
                        alt="Background removed" 
                        className="w-full h-full object-contain"
                      />
                      
                      {selectedDesignSource === 'processed' && (
                        <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                          <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Will be printed
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-white">
                      <p className="font-medium text-sm text-gray-900">No Background</p>
                      <p className="text-xs text-gray-500">Background removed</p>
                    </div>
                  </label>
                )}
              </div>

              {/* Quality Indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>All designs will be printed at <strong>300 DPI</strong> for premium quality</span>
              </div>
            </div>
          )}

          {/* Checkout Buttons */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              className="w-full sm:flex-1"
              variant="outline"
              size="default"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button
              className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:flex-1"
              size="default"
              onClick={handleCheckout}
              disabled={isPreparingCheckout || isCheckingOut || !selectedSize}
            >
              {isPreparingCheckout || isCheckingOut ? 'Processing...' : 'Buy Now'}
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="rounded-lg bg-teal-50 p-3">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-4 w-4 text-teal-600" />
              <h3 className="font-medium text-teal-700 text-sm">
                Shipping to {SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry)?.name}
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
    </div>
  );
}
