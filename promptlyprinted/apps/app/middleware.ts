import { authMiddleware } from "@repo/auth/middleware";
import { noseconeConfig, noseconeMiddleware } from "@repo/security/middleware";

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Protect authenticated routes
    "/(authenticated|admin)/(.*)",
  ],
};

const securityHeaders = noseconeMiddleware(noseconeConfig);

// Chain the middleware functions
const middleware = authMiddleware(() => securityHeaders());

// Explicitly cast the middleware to any to avoid type issues
// This is safe because we know the middleware is compatible
export default middleware as any;
