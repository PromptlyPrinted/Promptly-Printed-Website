/**
 * Utility to extract dominant colors from T-shirt images
 */

interface ColorInfo {
  color: string;
  count: number;
}

/**
 * Extract the dominant color from an image URL
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    console.log('Attempting to extract color from:', imageUrl);
    
    const img = new Image();
    // Remove crossOrigin for now to avoid CORS issues
    // img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        console.log('Image loaded successfully');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.log('Failed to get canvas context');
          resolve('#CCCCCC');
          return;
        }

        // Use a smaller canvas for performance
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        console.log('Image data extracted, length:', data.length);
        
        let r = 0, g = 0, b = 0, count = 0;
        
        // Calculate average color, skipping very light pixels
        for (let i = 0; i < data.length; i += 4) {
          const pixelR = data[i];
          const pixelG = data[i + 1];
          const pixelB = data[i + 2];
          const pixelA = data[i + 3];
          
          // Skip transparent pixels
          if (pixelA < 128) continue;
          
          // Skip very light colors (likely background)
          if (pixelR > 230 && pixelG > 230 && pixelB > 230) continue;
          
          r += pixelR;
          g += pixelG;
          b += pixelB;
          count++;
        }
        
        if (count === 0) {
          console.log('No valid pixels found, using fallback');
          resolve('#CCCCCC');
          return;
        }
        
        // Calculate average
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        const dominantColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        console.log('Extracted color:', dominantColor);
        resolve(dominantColor);
        
      } catch (error) {
        console.error('Error extracting color:', error);
        resolve('#CCCCCC');
      }
    };
    
    img.onerror = (error) => {
      console.error('Image failed to load:', error);
      resolve('#CCCCCC');
    };
    
    img.src = imageUrl;
  });
}

/**
 * Cache for extracted colors to avoid re-processing the same images
 */
const colorCache = new Map<string, string>();

/**
 * Get color with caching
 */
export async function getCachedDominantColor(imageUrl: string): Promise<string> {
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }
  
  const color = await extractDominantColor(imageUrl);
  colorCache.set(imageUrl, color);
  return color;
}

/**
 * Extract colors for all variants of a product
 */
export async function extractProductColors(
  product: any
): Promise<{ [colorName: string]: string }> {
  const colorMap: { [colorName: string]: string } = {};
  
  if (!product.prodigiVariants?.colorOptions || !product.prodigiVariants?.imageUrls?.base) {
    return colorMap;
  }
  
  const extractionPromises = product.prodigiVariants.colorOptions.map(async (colorOption: any) => {
    const imageUrl = `${product.prodigiVariants.imageUrls.base}/${colorOption.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    const dominantColor = await getCachedDominantColor(imageUrl);
    return {
      name: colorOption.name.toLowerCase().replace(/\s+/g, '-'),
      color: dominantColor
    };
  });
  
  const results = await Promise.all(extractionPromises);
  
  results.forEach(({ name, color }) => {
    colorMap[name] = color;
  });
  
  return colorMap;
}