import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { analyzeFailure, isAIConfigured } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if AI is configured
    if (!isAIConfigured()) {
      // Return a mock response when AI is not configured
      return NextResponse.json({
        analysis: {
          rootCause: "AI service not configured",
          explanation: "The AI analysis service is not configured. Please set up your ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable to enable intelligent failure analysis.",
          suggestedFixes: [
            {
              description: "Configure AI API keys in your environment",
              code: `# Add to your .env file\nANTHROPIC_API_KEY=your_api_key_here\n# or\nOPENAI_API_KEY=your_api_key_here`,
              priority: "high",
            },
          ],
          category: "configuration",
          confidence: 100,
        },
      });
    }

    const { testRunId, projectId, error, testName, testType } = await request.json();

    if (!error) {
      return NextResponse.json({ error: "Error message is required" }, { status: 400 });
    }

    // Use the AI failure analyzer
    const analysis = await analyzeFailure({
      errorMessage: error,
      stackTrace: error,
      testName: testName || "Unknown Test",
      testType: testType || "unknown",
      context: {
        testRunId,
        projectId,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("AI analysis error:", error);
    
    // Return a fallback response on error
    return NextResponse.json({
      analysis: {
        rootCause: "Analysis temporarily unavailable",
        explanation: "We encountered an issue while analyzing the failure. This could be due to API rate limits or connectivity issues. Please try again in a moment.",
        suggestedFixes: [
          {
            description: "Retry the analysis",
            priority: "medium",
          },
          {
            description: "Check the error logs manually",
            priority: "low",
          },
        ],
        category: "unknown",
        confidence: 0,
      },
    });
  }
}
