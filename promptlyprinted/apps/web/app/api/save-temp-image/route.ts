import { temporaryImageStore } from "@/lib/temp-image-store";

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of temporaryImageStore.entries()) {
    if (now - entry.timestamp > temporaryImageStore.IMAGE_TTL) {
      temporaryImageStore.delete(id);
    }
  }
}, temporaryImageStore.CLEANUP_INTERVAL);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url, isPublic } = data;

    if (!url) {
      return new Response(
        JSON.stringify({ error: "Missing URL" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const id = crypto.randomUUID();
    temporaryImageStore.set(id, { url, timestamp: Date.now(), isPublic });

    return new Response(
      JSON.stringify({ id }), 
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
      const entry = temporaryImageStore.get(id);
      if (!entry) {
        return new Response(
          JSON.stringify({ error: "Image not found" }), 
          { 
            status: 404,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // For checkout process, we want to return the actual URL
      if (entry.isPublic) {
        return new Response(
          JSON.stringify({ url: entry.url }), 
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // For private images, proxy the request
      try {
        const response = await fetch(entry.url);
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        return new Response(response.body, {
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
