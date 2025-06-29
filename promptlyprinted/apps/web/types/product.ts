export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  shippingCost: number;
  imageUrl: string;
  imageUrlMap?: Record<string, string>;
  images?: string[];
  sku?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  specifications?: {
    dimensions: {
      width: number;
      height: number;
      units: string;
    };
    brand: string;
    style: string;
    color: string[];
    size: string[];
  };
  shipping?: {
    methods: Array<{
      method: string;
      cost: number;
      currency: string;
      estimatedDays: number;
    }>;
  };
  prodigiVariants?: {
    imageUrls?: {
      base: string;
    };
    colorOptions?: Array<{
      name: string;
      filename: string;
    }>;
    width?: number;
    height?: number;
    units?: string;
    brand?: string;
    style?: string;
    colors?: string[];
    sizes?: string[];
  };
  savedImages: any[];
  wishedBy: any[];
}
