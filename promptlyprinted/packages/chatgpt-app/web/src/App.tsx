import { useOpenAI } from './hooks/useOpenAI';
import { DesignPreview } from './components/DesignPreview';
import { ProductSelector } from './components/ProductSelector';
import { PromoBar } from './components/PromoBar';
import { CheckoutButton } from './components/CheckoutButton';
import { useState } from 'react';

interface ConfiguredProduct {
  productSku: string;
  productName: string;
  color: string;
  size: string;
  designUrl: string;
  price: number;
}

function App() {
  const { toolOutput, colorScheme, isLoaded, isInChatGPT } = useOpenAI();
  const [configuredProduct, setConfiguredProduct] = useState<ConfiguredProduct | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  if (!isLoaded) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading...
      </div>
    );
  }

  // Parse the tool output
  const structuredContent = toolOutput?.structuredContent as {
    designUrl?: string;
    products?: Array<{
      sku: string;
      name: string;
      price: { amount: number };
      colors: Array<{ name: string; hex?: string }>;
      sizes: string[];
    }>;
    configuredProduct?: ConfiguredProduct;
    promo?: { code: string; discountValue: number };
    checkoutUrl?: string;
  } | undefined;

  const isDark = colorScheme === 'dark';

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      {/* Promo bar at the top */}
      <PromoBar 
        onPromoApplied={(code, discountValue) => {
          setPromoCode(code);
          setDiscount(discountValue);
        }} 
      />

      {/* Design preview if we have a design */}
      {structuredContent?.designUrl && (
        <DesignPreview 
          designUrl={structuredContent.designUrl}
          productSku={configuredProduct?.productSku}
          color={configuredProduct?.color}
        />
      )}

      {/* Product selector if we have products */}
      {structuredContent?.products && structuredContent.products.length > 0 && (
        <ProductSelector
          products={structuredContent.products}
          designUrl={structuredContent?.designUrl}
          onProductConfigured={setConfiguredProduct}
        />
      )}

      {/* Checkout button if product is configured */}
      {configuredProduct && (
        <CheckoutButton
          configuredProduct={configuredProduct}
          promoCode={promoCode}
          discount={discount}
        />
      )}

      {/* Development mode notice */}
      {!isInChatGPT && (
        <div className="dev-notice">
          🔧 Development Mode - Not running in ChatGPT
        </div>
      )}
    </div>
  );
}

export default App;
