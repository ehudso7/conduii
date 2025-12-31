"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">
          We encountered an unexpected error. Our team has been notified and is working on a fix.
        </p>

        {/* Error Details (dev only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-muted-foreground">
          If this problem persists,{" "}
          <Link href="mailto:support@conduii.com" className="text-primary hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
