import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

function isClerkConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const hasValidPublishable =
    !!publishableKey && /^pk_(test|live)_[a-zA-Z0-9_-]+$/.test(publishableKey);
  const hasValidSecret = !!secretKey && /^sk_(test|live)_[a-zA-Z0-9_-]+$/.test(secretKey);
  return hasValidPublishable && hasValidSecret;
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Conduii - Deployment Testing Platform",
    template: "%s | Conduii",
  },
  description:
    "Automatically discover, validate, and test your deployed applications and integrations. Zero configuration required.",
  keywords: [
    "deployment testing",
    "integration testing",
    "CI/CD",
    "automated testing",
    "infrastructure validation",
    "Vercel testing",
    "Supabase testing",
    "API testing",
  ],
  authors: [{ name: "Conduii Team" }],
  creator: "Conduii",
  publisher: "Conduii",
  metadataBase: new URL("https://conduii.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Conduii - Deployment Testing Platform",
    description:
      "Automatically discover, validate, and test your deployed applications. Zero configuration required.",
    url: "https://conduii.com",
    siteName: "Conduii",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Conduii - Deployment Testing Platform",
      },
    ],
    locale: "en_US",
    type: "website",

  },
  twitter: {
    card: "summary_large_image",
    title: "Conduii - Deployment Testing Platform",
    description:
      "Automatically discover, validate, and test your deployed applications.",
    images: ["/og-image.png"],
    creator: "@conduii",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://conduii.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkConfigured = isClerkConfigured();
  const Provider = clerkConfigured ? ClerkProvider : ({ children: c }: { children: React.ReactNode }) => c;

  return (
    <Provider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </Provider>
  );
}
