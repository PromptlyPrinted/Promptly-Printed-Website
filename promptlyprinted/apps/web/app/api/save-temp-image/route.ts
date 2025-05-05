import { database } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const data = await request.json();
    const { url } = data;

    if (!url) {
      return new Response(
        JSON.stringify({ error: "Missing URL" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check if the image is already saved
    const existingImage = await database.savedImage.findFirst({
      where: { url }
    });

    if (existingImage) {
      return new Response(
        JSON.stringify({ id: existingImage.id }), 
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the database user ID from the Clerk user ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: session.userId }
    });

    if (!dbUser) {
      return new Response(
        JSON.stringify({ error: "User not found in database" }), 
        { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Save the image to the database
    const savedImage = await database.savedImage.create({
      data: {
        name: "Checkout Image",
        url,
        userId: dbUser.id,
      }
    });

    return new Response(
      JSON.stringify({ id: savedImage.id }), 
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to process image" 
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const rawUrl = url.searchParams.get("url");

    if (id) {
      // Get the image from the database
      const savedImage = await database.savedImage.findUnique({
        where: { id }
      });

      if (!savedImage) {
        return new Response(
          JSON.stringify({ error: "Image not found" }), 
          { 
            status: 404,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // Proxy the image
      try {
        const fetched = await fetch(savedImage.url);
        const contentType = fetched.headers.get("content-type") || "application/octet-stream";
        return new Response(fetched.body, {
          headers: { "Content-Type": contentType }
        });
      } catch (error) {
        console.error("Error proxying image:", error);
        return new Response(
          JSON.stringify({ error: "Failed to proxy image" }), 
          { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    if (rawUrl) {
      try {
        const decodedUrl = decodeURIComponent(rawUrl);
        const response = await fetch(decodedUrl);
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        return new Response(response.body, {
          headers: { "Content-Type": contentType }
        });
      } catch (error) {
        console.error("Error proxying raw URL:", error);
        return new Response(
          JSON.stringify({ error: "Failed to proxy URL" }), 
          { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Missing id or url parameter" }), 
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error retrieving image:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to retrieve image" 
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
