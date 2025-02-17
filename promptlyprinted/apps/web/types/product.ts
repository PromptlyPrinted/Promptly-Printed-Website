export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  images?: string[]
  rating?: number
  reviewCount?: number
  category?: {
    id: string
    name: string
  }
} 