import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy - Conduii",
  description: "Conduii privacy policy and data handling practices.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Conduii
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground" data-testid="back-home">
              Back to Home
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground" data-testid="nav-docs">
              Docs
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (name, email, password)</li>
              <li>Profile information (organization name, preferences)</li>
              <li>Project configuration and test results</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Communications you send to us</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve the platform</li>
              <li>Detect, investigate, and prevent fraudulent activities</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>With your consent or at your direction</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent misuse</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect
              your personal information. This includes encryption in transit and at rest,
              access controls, and regular security assessments. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as
              needed to provide you services. We may retain certain information for
              legitimate business purposes or as required by law. Test results and
              logs are retained according to your plan's retention policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have rights including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your data</li>
              <li>Data portability</li>
              <li>Objection to certain processing</li>
              <li>Withdrawal of consent</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to maintain your session,
              remember your preferences, and analyze how our services are used.
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to children under 13. We do not knowingly
              collect personal information from children under 13. If you believe we
              have collected such information, please contact us.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you
              of any changes by posting the new policy on this page and updating the
              "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this privacy policy, please contact us at{" "}
              <a href="mailto:privacy@conduii.com" className="text-primary hover:underline">
                privacy@conduii.com
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
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
