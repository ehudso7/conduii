import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Blog - Conduii",
  description: "Insights, tutorials, and updates from the Conduii team",
};

const posts = [
  {
    title: "Introducing Conduii: AI-Powered Testing for Modern Apps",
    description: "Learn how Conduii automatically discovers your services and generates comprehensive tests for your deployed infrastructure.",
    date: "Dec 20, 2024",
    readTime: "5 min read",
    category: "Announcement",
    slug: "introducing-conduii",
  },
  {
    title: "Why Traditional E2E Testing Falls Short",
    description: "Explore the limitations of traditional testing approaches and how testing deployed infrastructure changes the game.",
    date: "Dec 15, 2024",
    readTime: "8 min read",
    category: "Engineering",
    slug: "traditional-testing-limitations",
  },
  {
    title: "Getting Started with Service Discovery",
    description: "A deep dive into how Conduii automatically detects your tech stack and integrations.",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    category: "Tutorial",
    slug: "service-discovery-guide",
  },
  {
    title: "Best Practices for Deployment Validation",
    description: "Learn the industry best practices for validating your deployments before they reach production.",
    date: "Dec 5, 2024",
    readTime: "7 min read",
    category: "Best Practices",
    slug: "deployment-validation",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          data-testid="back-to-home-link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Insights, tutorials, and updates from the Conduii team
        </p>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="hover:shadow-lg transition cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl hover:text-primary transition">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="text-primary flex items-center gap-1 text-sm font-medium">
                      Read more
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
