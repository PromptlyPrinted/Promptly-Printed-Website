import { useState } from 'react';
import { toast } from 'sonner';

export interface SavedImage {
  id: number;
  name: string;
  url: string;
  userId: number;
  productId: number | null;
  createdAt: Date;
  product?: {
    name: string;
    sku: string;
    color: string | null;
  } | null;
}

export function useSavedImages() {
  const [isLoading, setIsLoading] = useState(false);

  const getSavedImages = async (): Promise<SavedImage[]> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/saved-images');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved images');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching saved images:', error);
      toast.error('Failed to fetch saved images');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getSavedImages,
  };
}