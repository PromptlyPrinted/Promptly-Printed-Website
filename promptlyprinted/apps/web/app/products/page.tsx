import { Suspense } from 'react';
import ProductsPageContent from './ProductsPageContent';

export const revalidate = 600;

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
