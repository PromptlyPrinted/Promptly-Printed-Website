import { Suspense } from 'react';
import ProductsPageContent from './ProductsPageContent';

// Best practice: Main listing page with 1-hour cache (more dynamic than individual products)
export const revalidate = 3600; // 1 hour
export const dynamic = 'force-static';

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading products...</div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
