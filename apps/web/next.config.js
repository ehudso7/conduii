/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@conduii/core", "@conduii/ui"],
  images: {
    domains: ["img.clerk.com", "images.clerk.dev"],
  },
  async headers() {
    // Security headers for all routes
    const securityHeaders = [
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ];

    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // CORS headers for API routes
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
  // Powered by header removal for security
  poweredByHeader: false,
};

module.exports = nextConfig;
