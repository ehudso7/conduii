import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

function isClerkConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const hasValidPublishable =
    !!publishableKey && /^pk_(test|live)_[a-zA-Z0-9_-]+$/.test(publishableKey);
  const hasValidSecret = !!secretKey && /^sk_(test|live)_[a-zA-Z0-9_-]+$/.test(secretKey);
  return hasValidPublishable && hasValidSecret;
}

const clerkConfigured = isClerkConfigured();

export default clerkConfigured
  ? authMiddleware({
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
        "/api/health",
      ],
      ignoredRoutes: [],
    })
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
