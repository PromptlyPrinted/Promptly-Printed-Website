import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
  customization?: {
    sizing?: string;
    position?: any;
  };
  assets: {
    url: string;
    printArea: string;
  }[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

// Helper function to compress image URL if it's a base64 string
function compressImageUrl(url: string): string {
  if (url.startsWith('data:image')) {
    // Store the full base64 data
    return url;
  }
  return url;
}

// Helper function to decompress image URL if needed
async function decompressImageUrl(url: string): Promise<string> {
  if (url.startsWith('data:image')) {
    return url;
  }
  return url;
}

// Helper function to ensure high resolution image
async function ensureHighResImage(url: string): Promise<string> {
  if (url.startsWith('data:image')) {
    return url;
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 4680;
        canvas.height = 5790;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Error ensuring high res image:', error);
    return url;
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        );

        // Ensure high resolution image
        const highResImageUrl = await ensureHighResImage(item.imageUrl);

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          // Add new item with high res image
          set({
            items: [...currentItems, { ...item, imageUrl: highResImageUrl }],
          });
        }
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          imageUrl: compressImageUrl(item.imageUrl),
        })),
      }),
    }
  )
);

// Helper function to get cart items with decompressed images
export async function getCartItemsWithImages(): Promise<CartItem[]> {
  const items = useCartStore.getState().items;
  const itemsWithImages = await Promise.all(
    items.map(async (item) => ({
      ...item,
      imageUrl: await decompressImageUrl(item.imageUrl),
    }))
  );
  return itemsWithImages;
}
