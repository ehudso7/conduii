"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AITestGenerator } from "@/components/test-generation/ai-generator";

export default function GenerateTestsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Generate Tests</h1>
          <p className="text-muted-foreground">
            Use AI to automatically generate tests for your applications
          </p>
        </div>
      </div>

      {/* AI Generator */}
      <AITestGenerator
        projectId="default"
        onTestsGenerated={(_tests) => {
          // Tests generated callback - could save to project or navigate
        }}
      />
    </div>
  );
}
