import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
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
    "/api/health",
    "/api/webhooks",
    "/api/webhooks/(.*)",
  ],
  // Debug mode to help identify issues (remove in production after fixing)
  debug: process.env.NODE_ENV === "development",
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
