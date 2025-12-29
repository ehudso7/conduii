import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
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
  ],

  // Ignore these routes completely (no auth check at all)
  ignoredRoutes: ["/api/health"],
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
