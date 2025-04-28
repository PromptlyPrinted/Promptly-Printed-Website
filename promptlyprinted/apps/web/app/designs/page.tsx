import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { database } from "@repo/database";
import { DesignCard } from "@/components/design-card";
import type { SavedImage } from "@repo/database";

export const metadata = {
  title: "My Designs | Promptly Printed",
  description: "View and manage your saved designs",
};

export default async function DesignsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const designs = await database.savedImage.findMany({
    where: { userId: userId },
    include: {
      product: {
        select: {
          name: true,
          sku: true,
          color: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">My Designs</h1>
      {designs.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            No designs yet
          </h2>
          <p className="text-gray-500">
            Start customizing products to create and save your designs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}
