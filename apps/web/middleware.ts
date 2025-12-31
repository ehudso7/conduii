import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

function isClerkConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  // Match Clerk's base64url-ish key format (typically includes '-' and '_')
  const hasValidPublishable =
    !!publishableKey && /^pk_(test|live)_[a-zA-Z0-9_-]+$/.test(publishableKey);
  const hasValidSecret = !!secretKey && /^sk_(test|live)_[a-zA-Z0-9_-]+$/.test(secretKey);
  return hasValidPublishable && hasValidSecret;
}

const clerkConfigured = isClerkConfigured();

const middleware = clerkConfigured
  ? authMiddleware({
      // Routes that can be accessed while signed out
      publicRoutes: [
        "/",
        "/features",
        "/integrations",
        "/pricing",
        "/docs",
        "/docs/(.*)",
        "/blog",
        "/blog/(.*)",
        "/changelog",
        "/about",
        "/privacy",
        "/terms",
        "/sign-in",
        "/sign-in/(.*)",
        "/sign-up",
        "/sign-up/(.*)",
        "/forgot-password",
        "/api/webhooks",
        "/api/webhooks/(.*)",

        // Health should always be public
        "/api/health",
      ],

      // Keep this empty unless you have a *very specific* reason to bypass Clerk entirely
      ignoredRoutes: [],
    })
  : function middleware() {
      // If Clerk isn't configured (common in local/dev), don't block navigation.
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
