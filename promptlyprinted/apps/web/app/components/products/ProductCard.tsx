'use client';

import type { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

// Utility function for consistent URL generation
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Color hex mapping for T-shirt colors
const colorHexMap: Record<string, string> = {
  'army-green': '#4B5320',
  'ash': '#B2BEB5',
  'asphalt': '#36454F',
  'athletic-heather': '#D3D3D3',
  'baby-blue': '#89CFF0',
  'black': '#000000',
  'blue': '#0000FF',
  'bottle-green': '#006A4E',
  'brown': '#A52A2A',
  'burgundy': '#800020',
  'burnt-orange': '#CC5500',
  'cardinal': '#C41E3A',
  'charcoal': '#36454F',
  'chocolate': '#D2691E',
  'cranberry': '#DC143C',
  'dark-grey': '#A9A9A9',
  'forest': '#228B22',
  'gold': '#FFD700',
  'heather-blue': '#4682B4',
  'heather-grey': '#999999',
  'heather-prism-lilac': '#C8A2C8',
  'heather-prism-mint': '#98FB98',
  'heather-prism-peach': '#FFCBA4',
  'irish-green': '#009A49',
  'kiwi': '#8EE53F',
  'light-blue': '#ADD8E6',
  'light-pink': '#FFB6C1',
  'maroon': '#800000',
  'natural': '#F5F5DC',
  'navy': '#000080',
  'orange': '#FFA500',
  'pink': '#FFC0CB',
  'purple': '#800080',
  'red': '#FF0000',
  'royal': '#4169E1',
  'slate': '#708090',
  'sport-grey': '#9E9E9E',
  'tan': '#D2B48C',
  'white': '#FFFFFF',
  'yellow': '#FFFF00'
};

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const categorySlug = createSlug(product.category?.name || '');
  const productSlug = createSlug(product.name);
  const productUrl = `/products/${categorySlug}/${productSlug}`;

  // Get available colors from product data
  const availableColors = product.prodigiVariants?.colorOptions || [];
  const colors = product.specifications?.color || [];

  // Function to get the correct image URL
  const getCurrentImageUrl = () => {
    if (!isHovered) {
      return product.imageUrls.cover;
    }
    
    if (selectedColor && product.prodigiVariants?.colorOptions) {
      const colorOption = product.prodigiVariants.colorOptions.find(
        option => option.name.toLowerCase() === selectedColor.toLowerCase()
      );
      if (colorOption && product.prodigiVariants.imageUrls?.base) {
        return `${product.prodigiVariants.imageUrls.base}/${colorOption.filename}`;
      }
    }
    
    // Fallback to base image with current color index
    if (colors.length > 0 && product.prodigiVariants?.imageUrls?.base) {
      const currentColor = colors[currentColorIndex];
      return `${product.prodigiVariants.imageUrls.base}/${currentColor}.png`;
    }
    
    return product.imageUrls.cover;
  };

  const handlePrevColor = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentColorIndex === 0 ? colors.length - 1 : currentColorIndex - 1;
    setCurrentColorIndex(newIndex);
    // Set the selected color to the new current color
    if (colors[newIndex]) {
      setSelectedColor(colors[newIndex]);
    }
  };

  const handleNextColor = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentColorIndex === colors.length - 1 ? 0 : currentColorIndex + 1;
    setCurrentColorIndex(newIndex);
    // Set the selected color to the new current color
    if (colors[newIndex]) {
      setSelectedColor(colors[newIndex]);
    }
  };

  const handleColorSelect = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(color);
    // Update the current color index to match the selected color
    const colorIndex = colors.findIndex(c => c === color);
    if (colorIndex !== -1) {
      setCurrentColorIndex(colorIndex);
    }
  };

  // Create the final product URL with color parameter if selected
  const finalProductUrl = useMemo(() => {
    const baseUrl = productUrl;
    if (selectedColor) {
      return `${baseUrl}?color=${encodeURIComponent(selectedColor)}`;
    }
    return baseUrl;
  }, [productUrl, selectedColor]);

  return (
    <div 
      className="group relative bg-white rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setSelectedColor(null);
        setCurrentColorIndex(0);
      }}
    >
        <div className="relative aspect-square overflow-hidden">
          <Link href={finalProductUrl}>
            <Image
              src={getCurrentImageUrl()}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-[1.03] transition-all duration-300"
            />
          </Link>

          {/* Design icon on hover */}
          {isHovered && (
            <div className="absolute top-3 right-3 z-20">
              <div className="bg-white bg-opacity-75 rounded-full p-2 shadow-sm">
                <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
          )}

        </div>

        {/* Color swatches positioned completely outside the image */}
        {colors.length > 0 && (
          <div className="px-4 pt-2 pb-1">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {colors.map((color, index) => {
                    const colorHex = colorHexMap[color.toLowerCase()] || '#CCCCCC';
                    const isSelected = selectedColor === color || (!selectedColor && index === currentColorIndex);
                    
                return (
                  <button
                    key={color}
                    onClick={(e) => handleColorSelect(e, color)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    className={`relative w-6 h-6 rounded-full transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                      isSelected 
                        ? 'scale-110 shadow-md' 
                        : 'hover:shadow-sm'
                    }`}
                    style={{ 
                      transform: isSelected ? 'scale(1.1) translateY(-1px)' : 'scale(1)'
                    }}
                    aria-label={`Select ${color.replace(/-/g, ' ')}`}
                    title={color.replace(/-/g, ' ')}
                  >
                    {/* Full-filled color circle with contrasting ring */}
                    <div 
                      className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-gray-800' 
                          : 'border-white hover:border-gray-200'
                      }`}
                      style={{ 
                        backgroundColor: colorHex,
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Product Info */}
        <div className="p-4">
          <Link href={finalProductUrl}>
            <h3 className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
              {product.name}
            </h3>
          </Link>
          {selectedColor && (
            <p className="text-xs text-gray-500 mt-1">
              Color: {selectedColor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-lg font-bold text-gray-900">${(product.price || 0).toFixed(2)}</p>
          </div>

          {/* Design Now Button */}
          <Link href={finalProductUrl}>
            <button
              className="w-full mt-4 py-3 px-6 rounded-full font-medium text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-orange-500 hover:bg-orange-600"
              style={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {selectedColor 
                ? `Design in ${selectedColor.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                : 'Design Now'
              }
            </button>
          </Link>
        </div>
      </div>
  );
}