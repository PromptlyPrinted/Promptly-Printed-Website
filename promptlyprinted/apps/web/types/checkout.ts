export interface CheckoutImage {
  url: string;
  dpi?: number;
  width?: number;
  height?: number;
}

export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  copies?: number;
  images: CheckoutImage[];
  color: string;
  size: string;
  designUrl?: string;
  customization?: {
    printArea?: string;
    sizing?: string;
    position?: any;
  };
  recipientCostAmount?: number;
  currency?: string;
  merchantReference?: string;
  sku?: string;
}
