import { redirect } from 'next/navigation';

// Redirect to default Halloween design product (Men's Classic T-Shirt with Halloween theme)
export default function HalloweenDesignPage() {
  redirect('/design/mens-classic-t-shirt?campaign=halloween');
}
