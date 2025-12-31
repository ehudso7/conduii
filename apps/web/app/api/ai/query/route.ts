import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { chat, isAIConfigured, generateJSON } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, context, conversationHistory } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Check if AI is configured
    if (!isAIConfigured()) {
      return NextResponse.json({
        result: {
          answer: "AI service is not configured. Please add your ANTHROPIC_API_KEY or OPENAI_API_KEY to enable the AI assistant.",
          suggestedActions: [
            {
              label: "Configure API keys",
              action: "settings",
              priority: "high",
            },
          ],
        },
      });
    }

    // Build the system prompt
    const systemPrompt = `You are an expert test failure analyst and debugging assistant for the Conduii testing platform. You help developers understand and fix test failures.

Context about the current test:
- Test Run ID: ${context?.testRunId || "unknown"}
- Project ID: ${context?.projectId || "unknown"}
- Test Name: ${context?.testName || "unknown"}
- Error: ${context?.error || "No error provided"}

You should:
1. Provide clear, actionable explanations
2. Suggest specific code fixes when relevant
3. Reference best practices for testing
4. Be concise but thorough
5. Format code blocks with appropriate language tags

When suggesting fixes:
- Provide complete, working code examples
- Explain why the fix works
- Mention any potential side effects`;

    // Build the schema string for generateJSON
    const schemaString = `{
  "answer": "string - your response to the user's question",
  "codeBlocks": [
    {
      "language": "string - programming language",
      "code": "string - the code snippet",
      "filename": "string - optional filename",
      "canApply": "boolean - whether this can be applied automatically"
    }
  ],
  "suggestedActions": [
    {
      "label": "string - action description",
      "action": "string - action identifier",
      "priority": "high | medium | low"
    }
  ]
}`;

    // Build context for the prompt
    const historyContext = conversationHistory?.map((m: { role: string; content: string }) => 
      `${m.role}: ${m.content}`
    ).join("\n\n") || "";

    const fullPrompt = `${systemPrompt}

Previous conversation:
${historyContext}

User's question: ${query}

Provide a helpful response with code examples if applicable.`;

    // Use structured output for consistent responses
    const result = await generateJSON(fullPrompt, schemaString);

    if (!result) {
      // Fallback to simple chat if structured output fails
      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory?.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })) || [],
        { role: "user" as const, content: query },
      ];
      
      const response = await chat(messages);

      return NextResponse.json({
        result: {
          answer: response?.content || "I couldn't generate a response. Please try again.",
        },
      });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI query error:", error);
    
    return NextResponse.json({
      result: {
        answer: "I encountered an error processing your question. Please try again.",
        suggestedActions: [
          {
            label: "Retry",
            action: "retry",
            priority: "medium",
          },
        ],
      },
    });
  }
}
