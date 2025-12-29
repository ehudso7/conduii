import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/integrations",
  "/pricing",
  "/docs",
  "/docs(.*)",
  "/blog",
  "/blog(.*)",
  "/changelog",
  "/about",
  "/privacy",
  "/terms",
  "/sign-in",
  "/sign-in(.*)",
  "/sign-up",
  "/sign-up(.*)",
  "/forgot-password",

  // Webhooks should be callable without a user session
  "/api/webhooks",
  "/api/webhooks(.*)",

  // Health must be callable without auth
  "/api/health",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;
  auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
