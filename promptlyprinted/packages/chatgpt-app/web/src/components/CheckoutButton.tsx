interface ConfiguredProduct {
  productSku: string;
  productName: string;
  color: string;
  size: string;
  designUrl: string;
  price: number;
}

interface CheckoutButtonProps {
  configuredProduct: ConfiguredProduct;
  promoCode: string | null;
  discount: number; // percentage
}

const PROMPTLY_PRINTED_URL = 'https://promptlyprinted.com';

export function CheckoutButton({ configuredProduct, promoCode, discount }: CheckoutButtonProps) {
  const subtotal = configuredProduct.price;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  // Build checkout URL
  const params = new URLSearchParams({
    sku: configuredProduct.productSku,
    color: configuredProduct.color,
    size: configuredProduct.size,
    design: configuredProduct.designUrl,
    source: 'chatgpt',
    qty: '1',
  });

  if (promoCode) {
    params.set('promo', promoCode);
  }

  const checkoutUrl = `${PROMPTLY_PRINTED_URL}/checkout/quick?${params.toString()}`;

  const handleCheckout = () => {
    // Open in new tab (per OpenAI guidelines: external checkout)
    window.open(checkoutUrl, '_blank');
  };

  return (
    <div className="checkout-section">
      <div className="checkout-summary">
        <div className="item">
          <span>{configuredProduct.productName}</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="item" style={{ fontSize: 14, opacity: 0.9 }}>
          <span>Color: {configuredProduct.color} • Size: {configuredProduct.size}</span>
        </div>
        
        {discount > 0 && (
          <div className="item" style={{ color: '#a5f3fc' }}>
            <span>Discount ({discount}%)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="item total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button className="checkout-button" onClick={handleCheckout}>
        Complete Order on PromptlyPrinted →
      </button>

      <div style={{ 
        textAlign: 'center', 
        marginTop: 12, 
        fontSize: 12, 
        opacity: 0.9 
      }}>
        🔒 Secure checkout • 📦 Ships in 5-10 days • 🌍 Free shipping
      </div>
    </div>
  );
}
