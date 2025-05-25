import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
  imageUrl: string
  customization?: {
    sizing?: string
    position?: any
  }
  assets: {
    url: string
    printArea: string
  }[]
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

// Helper function to compress image URL if it's a base64 string
function compressImageUrl(url: string): string {
  if (url.startsWith('data:image')) {
    // If it's a base64 image, store a reference instead
    return `/api/save-temp-image?url=${encodeURIComponent(url)}`
  }
  return url
}

// Helper function to decompress image URL if needed
async function decompressImageUrl(url: string): Promise<string> {
  if (url.startsWith('/api/save-temp-image')) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch image')
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error decompressing image:', error)
      return url
    }
  }
  return url
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items
        const existingItemIndex = currentItems.findIndex(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        )

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = [...currentItems]
          updatedItems[existingItemIndex].quantity += item.quantity
          set({ items: updatedItems })
        } else {
          // Add new item with compressed image URL
          const compressedItem = {
            ...item,
            imageUrl: compressImageUrl(item.imageUrl)
          }
          set({ items: [...currentItems, compressedItem] })
        }
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId)
        }))
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        }))
      },
      clearCart: () => {
        set({ items: [] })
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
        items: state.items.map(item => ({
          ...item,
          imageUrl: compressImageUrl(item.imageUrl)
        }))
      })
    }
  )
)

// Helper function to get cart items with decompressed images
export async function getCartItemsWithImages(): Promise<CartItem[]> {
  const items = useCartStore.getState().items
  const itemsWithImages = await Promise.all(
    items.map(async (item) => ({
      ...item,
      imageUrl: await decompressImageUrl(item.imageUrl)
    }))
  )
  return itemsWithImages
} 