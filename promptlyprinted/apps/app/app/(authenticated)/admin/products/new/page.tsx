import { database as db } from "@repo/database";
import { checkAdmin } from "@/lib/auth-utils";
import { ProductForm } from "../components/product-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewProductPage() {
  await checkAdmin();

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">New Product</h2>
      </div>
      <div className="grid gap-4">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
} 