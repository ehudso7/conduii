import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service - Conduii",
  description: "Conduii terms of service and acceptable use policy.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Conduii
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground" data-testid="header-home">
              Back to Home
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground" data-testid="header-docs">
              Docs
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" data-testid="header-sign-in">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button data-testid="header-get-started">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Conduii ("the Service"), you agree to be bound by
              these Terms of Service ("Terms"). If you do not agree to these Terms,
              you may not use the Service. We reserve the right to update these Terms
              at any time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Conduii provides an AI-powered testing platform that helps developers
              test their deployed applications. The Service includes discovery of
              integrations, automated test generation, test execution, and diagnostic
              analysis. Features may vary based on your subscription plan.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground mb-4">
              To use the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service to test systems you don't have permission to test</li>
              <li>Share your account credentials with others</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use the Service to transmit malware or harmful code</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payment</h2>
            <p className="text-muted-foreground mb-4">
              Paid plans are billed in advance on a monthly or annual basis. You agree that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All fees are non-refundable unless otherwise stated</li>
              <li>You authorize us to charge your payment method</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>We may change prices with 30 days notice</li>
              <li>Usage exceeding plan limits may result in additional charges</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Service and its original content, features, and functionality are
              owned by Conduii and are protected by international copyright, trademark,
              and other intellectual property laws. Your test configurations and results
              remain your property, but you grant us a license to process them as
              needed to provide the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
            <p className="text-muted-foreground">
              Your use of the Service is subject to our Privacy Policy, which describes
              how we collect, use, and share information. By using the Service, you
              consent to the collection and use of information as described in our
              Privacy Policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
              OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE
              WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. TEST RESULTS ARE PROVIDED
              FOR INFORMATIONAL PURPOSES AND SHOULD NOT BE RELIED UPON AS THE SOLE
              BASIS FOR DEPLOYMENT DECISIONS.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CONDUII SHALL NOT BE LIABLE FOR
              ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
              OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
              INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE
              LOSSES.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your access to the Service immediately,
              without prior notice, for any reason, including breach of these Terms.
              Upon termination, your right to use the Service will cease immediately.
              You may export your data before termination.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the
              laws of the State of Delaware, without regard to its conflict of law
              provisions. Any disputes shall be resolved in the courts of Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@conduii.com" className="text-primary hover:underline">
                legal@conduii.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Conduii. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground" data-testid="footer-privacy">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground" data-testid="footer-terms">
                Terms
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground" data-testid="footer-docs">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
