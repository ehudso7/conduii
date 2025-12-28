import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conduii - AI-Powered Testing Platform",
  description:
    "Automatically discover, validate, and test your deployed applications and integrations. No local server required.",
  keywords: [
    "testing",
    "e2e",
    "integration testing",
    "deployment validation",
    "ai testing",
    "vercel",
    "supabase",
    "stripe",
  ],
  authors: [{ name: "Conduii" }],
  openGraph: {
    title: "Conduii - AI-Powered Testing Platform",
    description:
      "Automatically discover, validate, and test your deployed applications and integrations.",
    url: "https://conduii.com",
    siteName: "Conduii",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conduii - AI-Powered Testing Platform",
    description:
      "Automatically discover, validate, and test your deployed applications.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
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
    </ClerkProvider>
  );
}
