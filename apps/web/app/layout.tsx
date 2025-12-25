import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

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
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
