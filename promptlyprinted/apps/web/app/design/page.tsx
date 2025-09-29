import { redirect } from 'next/navigation';

// Redirect to default design product (Men's Classic T-Shirt)
export default function DesignPage() {
  redirect('/design/mens-classic-t-shirt');
}