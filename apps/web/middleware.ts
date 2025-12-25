import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/api/webhooks(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/pricing",
    "/docs(.*)",
    "/blog(.*)",
    "/changelog",
    "/about",
    "/privacy",
    "/terms",
  ],
  // Routes that should always be treated as public
  ignoredRoutes: [
    "/api/health",
    "/api/webhooks/clerk",
    "/api/webhooks/stripe",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
