import { useState } from 'react';

interface Product {
  sku: string;
  name: string;
  price: { amount: number };
  colors: Array<{ name: string; hex?: string }>;
  sizes: string[];
}

interface ConfiguredProduct {
  productSku: string;
  productName: string;
  color: string;
  size: string;
  designUrl: string;
  price: number;
}

interface ProductSelectorProps {
  products: Product[];
  designUrl?: string;
  onProductConfigured: (product: ConfiguredProduct) => void;
}

export function ProductSelector({ products, designUrl, onProductConfigured }: ProductSelectorProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0]?.name || null);
    setSelectedSize(null);
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    
    // Once everything is selected, notify parent
    if (selectedProduct && selectedColor && designUrl) {
      onProductConfigured({
        productSku: selectedProduct.sku,
        productName: selectedProduct.name,
        color: selectedColor,
        size,
        designUrl,
        price: selectedProduct.price.amount,
      });
    }
  };

  return (
    <div className="product-selector">
      <h3>Choose Your Product</h3>
      
      {/* Product Grid */}
      <div className="product-grid">
        {products.map((product) => (
          <div
            key={product.sku}
            className={`product-card ${selectedProduct?.sku === product.sku ? 'selected' : ''}`}
            onClick={() => handleProductSelect(product)}
          >
            <div className="product-name">{product.name}</div>
            <div className="product-price">${product.price.amount}</div>
          </div>
        ))}
      </div>

      {/* Color selector - show when product is selected */}
      {selectedProduct && (
        <>
          <h3 style={{ marginTop: 16 }}>Select Color</h3>
          <div className="color-selector">
            {selectedProduct.colors.map((color) => (
              <div
                key={color.name}
                className={`color-swatch ${selectedColor === color.name ? 'selected' : ''}`}
                style={{ backgroundColor: color.hex || '#ccc' }}
                title={color.name}
                onClick={() => handleColorSelect(color.name)}
              />
            ))}
          </div>
          {selectedColor && (
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Selected: {selectedColor}
            </div>
          )}
        </>
      )}

      {/* Size selector - show when color is selected */}
      {selectedProduct && selectedColor && (
        <>
          <h3 style={{ marginTop: 16 }}>Select Size</h3>
          <div className="size-selector">
            {selectedProduct.sizes.map((size) => (
              <button
                key={size}
                className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => handleSizeSelect(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
