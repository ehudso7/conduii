import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default authMiddleware({
  // Run BEFORE Clerk auth checks
  beforeAuth: (req: NextRequest) => {
    const host = req.headers.get("host") || "";
    // Force apex -> www so auth cookies are consistently sent
    if (host === "conduii.com") {
      const url = req.nextUrl.clone();
      url.hostname = "www.conduii.com";
      url.protocol = "https:";
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  },

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
