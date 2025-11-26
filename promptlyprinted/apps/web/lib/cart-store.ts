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
  printReadyUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        );

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          // Add new item
          set({ items: [...currentItems, item] });
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
      // Custom storage that filters out base64 images before saving to localStorage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          // Filter out base64 data from imageUrl and assets before saving
          const filteredValue = {
            ...value,
            state: {
              ...value.state,
              items: value.state.items.map((item: CartItem) => ({
                ...item,
                // Don't store base64 imageUrl in localStorage
                imageUrl: item.imageUrl.startsWith('data:image') ? '' : item.imageUrl,
                // printReadyUrl should be a remote URL, but check just in case
                printReadyUrl: item.printReadyUrl?.startsWith('data:image') ? '' : item.printReadyUrl,
                assets: item.assets.map((asset) => {
                  // If the URL is a base64 string, don't store it in localStorage
                  if (asset.url.startsWith('data:image')) {
                    return {
                      ...asset,
                      url: '', // Store empty string instead of base64
                    };
                  }
                  return asset;
                }),
              })),
            },
          };
          localStorage.setItem(name, JSON.stringify(filteredValue));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

// Helper function to get cart items with images
export async function getCartItemsWithImages(): Promise<CartItem[]> {
  const items = useCartStore.getState().items;

  // Ensure items have valid image URLs
  return items.map(item => {
    // If imageUrl is empty but we have assets with URLs, use the first asset
    if ((!item.imageUrl || item.imageUrl.trim() === '') && item.assets && item.assets.length > 0) {
      const firstAssetWithUrl = item.assets.find(asset => asset.url && asset.url.trim() !== '');
      if (firstAssetWithUrl) {
        return {
          ...item,
          imageUrl: firstAssetWithUrl.url
        };
      }
    }
    return item;
  });
}
