import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { basehub, fragmentOn } from "basehub";

// Define fragments for reusable parts of queries
const imageFragment = fragmentOn('BlockImage', {
  url: true,
  width: true,
  height: true,
  alt: true,
  blurDataURL: true,
});

const postFragment = fragmentOn('PostsItem', {
  _slug: true,
  _title: true,
  authors: {
    _title: true,
    avatar: imageFragment,
    xUrl: true,
  },
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
  categories: {
    _title: true,
  },
  date: true,
  description: true,
  image: imageFragment,
});

const legalPostFragment = fragmentOn('LegalPagesItem', {
  _slug: true,
  _title: true,
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
  description: true,
});

// Define queries using fragments
const queries = {
  "blog/posts": {
    blog: {
      posts: {
        items: postFragment,
      },
    },
  },
  "blog/authors": {
    blog: {
      authors: {
        items: {
          _title: true,
          avatar: imageFragment,
          xUrl: true,
        },
      },
    },
  },
  "blog/categories": {
    blog: {
      categories: {
        items: {
          _title: true,
        },
      },
    },
  },
  "legal/pages": {
    legalPages: {
      items: legalPostFragment,
    },
  },
};

async function fetchFromBasehub(path: string, options: RequestInit = {}) {
  const pathSegments = path.replace(/^\//, "").split("/");
  const contentType = pathSegments.slice(0, 2).join("/") as keyof typeof queries;

  if (options.method === "GET" && queries[contentType]) {
    try {
      const data = await basehub().query(queries[contentType]);
      return transformResponse(contentType, data);
    } catch (error) {
      console.error('Error fetching from Basehub:', error);
      // Return mock data for now
      return getMockData(contentType);
    }
  }

  if (options.method === "POST" || options.method === "PUT" || options.method === "DELETE") {
    // For now, return success response
    return { success: true };
  }

  throw new Error(`Invalid operation for path: ${path}`);
}

function transformResponse(contentType: keyof typeof queries, response: any) {
  switch (contentType) {
    case "blog/posts":
      return (response?.blog?.posts?.items || []).map((post: any) => ({
        id: post._slug,
        title: post._title,
        description: post.description,
        date: post.date,
        image: post.image?.url,
        authors: post.authors?.items?.map((author: any) => ({
          id: author._slug,
          title: author._title
        })) || [],
        categories: post.categories?.items?.map((category: any) => ({
          id: category._slug,
          title: category._title
        })) || [],
        body: post.body?.plainText || ""
      }));
    case "blog/authors":
      return (response?.blog?.authors?.items || []).map((author: any) => ({
        id: author._slug,
        title: author._title,
        avatar: author.avatar?.url,
        xUrl: author.xUrl
      }));
    case "blog/categories":
      return (response?.blog?.categories?.items || []).map((category: any) => ({
        id: category._slug,
        title: category._title
      }));
    case "legal/pages":
      return (response?.legalPages?.items || []).map((page: any) => ({
        id: page._slug,
        title: page._title,
        description: page.description,
        body: page.body?.plainText || ""
      }));
    default:
      return [];
  }
}

function getMockData(contentType: keyof typeof queries) {
  switch (contentType) {
    case "blog/posts":
      return [{
        id: "sample-post",
        title: "Sample Post",
        description: "This is a sample post",
        date: new Date().toISOString(),
        image: "https://picsum.photos/800/400",
        authors: [{
          id: "john-doe",
          title: "John Doe"
        }],
        categories: [{
          id: "general",
          title: "General"
        }],
        body: "Sample content"
      }];
    case "blog/authors":
      return [{
        id: "john-doe",
        title: "John Doe",
        avatar: "https://picsum.photos/200/200",
        xUrl: "https://x.com/johndoe"
      }];
    case "blog/categories":
      return [{
        id: "general",
        title: "General"
      }];
    case "legal/pages":
      return [{
        id: "terms-of-service",
        title: "Terms of Service",
        description: "Our terms of service",
        body: "Sample terms of service content"
      }];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { route: string[] } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.BASEHUB_TOKEN) {
      return NextResponse.json(
        { error: "BASEHUB_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const path = `/${params.route.join("/")}`;
    const data = await fetchFromBasehub(path, { method: "GET" });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API error:", {
      path: params.route?.join("/") || "unknown",
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests (Create operations).
 * Note: The code below is still “not yet implemented” for Basehub mutations.
 */
export async function POST(
  request: Request,
  { params }: { params: { route: string[] } }
) {
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const path = `/${params.route.join("/")}`;
    const body = await request.json();

    const data = await fetchFromBasehub(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handle PUT requests (Update operations).
 */
export async function PUT(
  request: Request,
  { params }: { params: { route: string[] } }
) {
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const path = `/${params.route.join("/")}`;
    const body = await request.json();

    const data = await fetchFromBasehub(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handle DELETE requests (Delete operations).
 */
export async function DELETE(
  request: Request,
  { params }: { params: { route: string[] } }
) {
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const path = `/${params.route.join("/")}`;

    const data = await fetchFromBasehub(path, {
      method: "DELETE",
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}