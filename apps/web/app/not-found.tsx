import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Graphic */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary/20 select-none">404</div>
          <div className="relative -mt-16">
            <Search className="w-24 h-24 mx-auto text-muted-foreground" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. 
          It might have been moved, deleted, or never existed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Help Link */}
        <p className="mt-8 text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/docs" className="text-primary hover:underline">
            Check our documentation
          </Link>{" "}
          or{" "}
          <Link href="mailto:support@conduii.com" className="text-primary hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
