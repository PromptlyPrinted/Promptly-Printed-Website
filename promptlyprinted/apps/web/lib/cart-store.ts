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
  previewUrl?: string; // Small JPEG for cart/checkout display
  customization?: {
    sizing?: string;
    position?: any;
  };
  assets: {
    url: string;
    printArea: string;
  }[];
  printReadyUrl?: string; // 300 DPI PNG for Prodigi printing
}

/**
 * Check if a URL is a base64 data URL
 */
function isBase64Url(url: string | undefined): boolean {
  return !!url && url.startsWith('data:');
}

/**
 * Filter out base64 URLs from a string, returning empty string if base64
 */
function filterBase64(url: string | undefined): string {
  if (!url) return '';
  return isBase64Url(url) ? '' : url;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

/**
 * Sanitize a cart item to remove any base64 data BEFORE adding to store
 */
function sanitizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    imageUrl: filterBase64(item.imageUrl),
    previewUrl: filterBase64(item.previewUrl),
    printReadyUrl: filterBase64(item.printReadyUrl),
    assets: item.assets?.map((asset) => ({
      ...asset,
      url: filterBase64(asset.url),
    })).filter(asset => asset.url) || [], // Remove empty assets
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        // CRITICAL: Sanitize item BEFORE adding to remove base64 data
        const sanitizedItem = sanitizeCartItem(item);
        
        // Validate that we have valid URLs
        if (!sanitizedItem.imageUrl && !sanitizedItem.previewUrl && !sanitizedItem.printReadyUrl) {
          console.error('[CartStore] Cannot add item with no valid image URLs. Item was likely base64 only.');
          return; // Don't add items with no valid URLs
        }
        
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (i) =>
            i.productId === sanitizedItem.productId &&
            i.size === sanitizedItem.size &&
            i.color === sanitizedItem.color
        );

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += sanitizedItem.quantity;
          set({ items: updatedItems });
        } else {
          // Add new item (already sanitized)
          set({ items: [...currentItems, sanitizedItem] });
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
          if (typeof window === 'undefined') return null;
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            return JSON.parse(str);
          } catch (error) {
            console.error('[CartStore] Failed to read cart from localStorage:', error);
            // Clear corrupted data
            try {
              localStorage.removeItem(name);
            } catch {}
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          try {
            // Filter out base64 data from ALL URL fields before saving
            const filteredValue = {
              ...value,
              state: {
                ...value.state,
                items: value.state.items.map((item: CartItem) => ({
                  ...item,
                  // Filter out base64 from all URL fields
                  imageUrl: filterBase64(item.imageUrl),
                  previewUrl: filterBase64(item.previewUrl),
                  printReadyUrl: filterBase64(item.printReadyUrl),
                  assets: item.assets?.map((asset) => ({
                    ...asset,
                    url: filterBase64(asset.url),
                  })) || [],
                })),
              },
            };
            
            const jsonString = JSON.stringify(filteredValue);
            
            // Check if the data is too large (localStorage typically has 5MB limit)
            // JSON string length * 2 bytes per character (UTF-16)
            const sizeInBytes = jsonString.length * 2;
            const maxSize = 4 * 1024 * 1024; // 4MB safe limit
            
            if (sizeInBytes > maxSize) {
              console.error('[CartStore] Cart data too large:', sizeInBytes, 'bytes. Clearing old items.');
              // Keep only the most recent items that fit
              const reducedItems = filteredValue.state.items.slice(-5);
              const reducedValue = {
                ...filteredValue,
                state: { ...filteredValue.state, items: reducedItems }
              };
              localStorage.setItem(name, JSON.stringify(reducedValue));
            } else {
              localStorage.setItem(name, jsonString);
            }
          } catch (error) {
            console.error('[CartStore] Failed to save cart to localStorage:', error);
            // If quota exceeded, try to clear and save minimal data
            if (error instanceof Error && error.name === 'QuotaExceededError') {
              try {
                localStorage.removeItem(name);
                // Try saving just the last item
                const minimalValue = {
                  ...value,
                  state: {
                    ...value.state,
                    items: value.state.items.slice(-1).map((item: CartItem) => ({
                      ...item,
                      imageUrl: filterBase64(item.imageUrl),
                      previewUrl: filterBase64(item.previewUrl),
                      printReadyUrl: filterBase64(item.printReadyUrl),
                      assets: [],
                    })),
                  },
                };
                localStorage.setItem(name, JSON.stringify(minimalValue));
              } catch (retryError) {
                console.error('[CartStore] Failed to save even minimal cart:', retryError);
              }
            }
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('[CartStore] Failed to remove cart from localStorage:', error);
          }
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

/**
 * Get estimated localStorage usage
 */
export function getCartStorageSize(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const str = localStorage.getItem('cart-storage');
    return str ? str.length * 2 : 0; // UTF-16 is 2 bytes per character
  } catch {
    return 0;
  }
}

/**
 * Force clear all cart data from localStorage
 * Call this if the user is having quota issues
 */
export function forceCleatCartStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('cart-storage');
    localStorage.removeItem('cartItems');
    useCartStore.getState().clearCart();
    console.log('[CartStore] Force cleared cart storage');
  } catch (error) {
    console.error('[CartStore] Failed to force clear cart:', error);
  }
}
