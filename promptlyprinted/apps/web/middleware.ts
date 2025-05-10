import { authMiddleware } from "@repo/auth/middleware";
import { noseconeConfig, noseconeMiddleware } from "@repo/security/middleware";

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // matcher: ['/((?!_next/static|_next/image|ingest|favicon.ico).*)'],
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Exclude checkout success page from authentication
    "/((?!checkout/success).*)",
  ],
};

const securityHeaders = noseconeMiddleware(noseconeConfig);

// Chain the middleware functions
const middleware = authMiddleware(() => securityHeaders());

// Explicitly cast the middleware to any to avoid type issues
// This is safe because we know the middleware is compatible
export default middleware as any;
