import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default isClerkConfigured
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
  : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
