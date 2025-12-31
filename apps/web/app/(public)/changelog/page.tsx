import Link from "next/link";
import { ArrowLeft, Sparkles, Bug, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const releases = [
  {
    version: "1.0.0",
    date: "December 2024",
    title: "Initial Release",
    changes: [
      { type: "feature", text: "Auto-discovery of services and integrations" },
      { type: "feature", text: "Support for 50+ service types" },
      { type: "feature", text: "AI-powered diagnostics and suggestions" },
      { type: "feature", text: "Web dashboard with real-time results" },
      { type: "feature", text: "CLI tool for local development" },
      { type: "feature", text: "GitHub Action for CI/CD integration" },
      { type: "feature", text: "Team collaboration features" },
    ],
  },
  {
    version: "0.9.0",
    date: "November 2024",
    title: "Beta Release",
    changes: [
      { type: "feature", text: "Health check monitoring" },
      { type: "feature", text: "API endpoint testing" },
      { type: "improvement", text: "Improved test execution performance" },
      { type: "fix", text: "Fixed authentication flow issues" },
    ],
  },
  {
    version: "0.8.0",
    date: "October 2024",
    title: "Alpha Release",
    changes: [
      { type: "feature", text: "Core testing engine" },
      { type: "feature", text: "Basic service discovery" },
      { type: "feature", text: "Initial CLI implementation" },
    ],
  },
];

function getIcon(type: string) {
  switch (type) {
    case "feature":
      return <Sparkles className="w-4 h-4 text-green-500" />;
    case "improvement":
      return <Zap className="w-4 h-4 text-blue-500" />;
    case "fix":
      return <Bug className="w-4 h-4 text-orange-500" />;
    case "security":
      return <Shield className="w-4 h-4 text-red-500" />;
    default:
      return <Sparkles className="w-4 h-4 text-gray-500" />;
  }
}

function getBadgeVariant(type: string) {
  switch (type) {
    case "feature":
      return "default";
    case "improvement":
      return "secondary";
    case "fix":
      return "warning";
    case "security":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Changelog</h1>
        <p className="text-xl text-muted-foreground mb-12">
          All the latest updates, improvements, and fixes to Conduii
        </p>

        <div className="space-y-12">
          {releases.map((release) => (
            <div key={release.version} className="relative pl-8 border-l-2 border-muted">
              <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />

              <div className="mb-4">
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant="outline" className="font-mono">
                    v{release.version}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{release.date}</span>
                </div>
                <h2 className="text-2xl font-semibold">{release.title}</h2>
              </div>

              <ul className="space-y-3">
                {release.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {getIcon(change.type)}
                    <div className="flex items-center gap-2">
                      <Badge variant={getBadgeVariant(change.type) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                        {change.type}
                      </Badge>
                      <span className="text-sm">{change.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
