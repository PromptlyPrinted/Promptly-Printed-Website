interface DesignPreviewProps {
  designUrl: string;
  productSku?: string;
  color?: string;
}

export function DesignPreview({ designUrl, productSku, color }: DesignPreviewProps) {
  // If we have a product configured, show it as a mockup
  // Otherwise, just show the raw design
  const showMockup = productSku && color;
  
  return (
    <div className="design-preview">
      {showMockup ? (
        <div className="mockup-container">
          <img 
            src={`/api/generate-mockup?sku=${productSku}&color=${encodeURIComponent(color)}&design=${encodeURIComponent(designUrl)}`}
            alt="Your design on product"
            onError={(e) => {
              // Fallback to raw design if mockup fails
              (e.target as HTMLImageElement).src = designUrl;
            }}
          />
          <div className="mockup-label">
            Preview on {productSku}
          </div>
        </div>
      ) : (
        <div className="design-container">
          <img 
            src={designUrl} 
            alt="Your design"
          />
          <div className="design-label">
            Your Design
          </div>
        </div>
      )}
    </div>
  );
}
