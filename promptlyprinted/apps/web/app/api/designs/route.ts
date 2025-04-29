import { auth } from "@clerk/nextjs/server";
import { database } from "@repo/database";
import { SaveDesignSchema } from "@/types/design";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const validatedData = SaveDesignSchema.parse(data);

    // Verify the product exists
    const product = await database.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    // Look up app user
    const dbUser = await database.user.findUnique({ where: { clerkId: session.userId } });
    if (!dbUser) {
      return new Response("User not found", { status: 404 });
    }

    // Save the design
    const savedImage = await database.savedImage.create({
      data: {
        name: validatedData.name,
        url: validatedData.imageUrl,
        userId: dbUser.id,
        productId: validatedData.productId,
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            color: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(savedImage), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving design:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save design" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    // Fetch saved designs for user
    const dbUser = await database.user.findUnique({ where: { clerkId: session.userId } });
    if (!dbUser) {
      return new Response("User not found", { status: 404 });
    }

    const designs = await database.savedImage.findMany({
      where: {
        userId: dbUser.id,
        ...(productId ? { productId: parseInt(productId) } : {}),
      },
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

    return new Response(JSON.stringify(designs), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching designs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch designs" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
