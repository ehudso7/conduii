/**
 * AI Service for Conduii
 * Handles all AI-powered features including test generation, analysis, and predictions
 *
 * Note: AI SDKs (@anthropic-ai/sdk, openai) are optional dependencies.
 * The service gracefully degrades when they're not installed.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

type AnthropicClient = any;
type OpenAIClient = any;

// Lazy-load AI clients to avoid build errors when SDKs aren't installed
let anthropic: AnthropicClient | null = null;
let openai: OpenAIClient | null = null;
let clientsInitialized = false;

function initializeClients() {
  if (clientsInitialized) return;
  clientsInitialized = true;

  // Use require with try-catch to make SDKs truly optional at runtime
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      // Dynamic require to avoid build-time resolution
      const modulePath = "@anthropic-ai/sdk";
      const Anthropic = require(modulePath).default || require(modulePath);
      anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    } catch {
      // Anthropic SDK not installed - this is fine
      // eslint-disable-next-line no-console
      console.debug("Anthropic SDK not available");
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      // Dynamic require to avoid build-time resolution
      const modulePath = "openai";
      const OpenAI = require(modulePath).default || require(modulePath);
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } catch {
      // OpenAI SDK not installed - this is fine
      // eslint-disable-next-line no-console
      console.debug("OpenAI SDK not available");
    }
  }
}

export type AIProvider = "anthropic" | "openai";

interface AIResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Send a message to the AI and get a response
 */
export async function chat(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  options: {
    provider?: AIProvider;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<AIResponse> {
  initializeClients();
  const { provider = "anthropic", maxTokens = 4096, temperature = 0.7 } = options;

  if (provider === "anthropic" && anthropic) {
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature,
      system: systemMessage?.content || "",
      messages: chatMessages,
    });

    const textContent = response.content.find((c: { type: string }) => c.type === "text");
    return {
      content: textContent?.type === "text" ? textContent.text : "",
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  if (provider === "openai" && openai) {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      max_tokens: maxTokens,
      temperature,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  throw new Error("No AI provider configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY.");
}

/**
 * Generate structured JSON output from AI
 */
export async function generateJSON<T>(
  prompt: string,
  schema: string,
  options: {
    provider?: AIProvider;
    maxTokens?: number;
  } = {}
): Promise<T> {
  const response = await chat(
    [
      {
        role: "system",
        content: `You are a helpful assistant that generates valid JSON. Always respond with valid JSON that matches the provided schema. Do not include any markdown formatting or code blocks, just the raw JSON.`,
      },
      {
        role: "user",
        content: `${prompt}\n\nRespond with JSON matching this schema:\n${schema}`,
      },
    ],
    { ...options, temperature: 0.3 }
  );

  try {
    return JSON.parse(response.content) as T;
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Check if AI is configured (sync check based on env vars)
 */
export function isAIConfigured(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
}

/**
 * Get the default AI provider
 */
export function getDefaultProvider(): AIProvider | null {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

/**
 * Simple failure analysis result
 */
export interface SimpleFailureAnalysis {
  rootCause: string;
  explanation: string;
  suggestedFixes: Array<{
    description: string;
    code?: string;
    priority: string;
  }>;
  category: string;
  confidence: number;
}

const SIMPLE_ANALYSIS_SCHEMA = `{
  "rootCause": "string - brief summary of the root cause",
  "explanation": "string - detailed explanation of what went wrong and why",
  "suggestedFixes": [
    {
      "description": "string - what to do to fix it",
      "code": "string - optional code snippet showing the fix",
      "priority": "high | medium | low"
    }
  ],
  "category": "string - one of: code_bug, configuration, infrastructure, flaky, data, external_dependency, unknown",
  "confidence": "number 0-100 - how confident are you in this analysis"
}`;

/**
 * Analyze a test failure without database access (for API use)
 */
export async function analyzeFailure(input: {
  errorMessage: string;
  stackTrace?: string;
  testName: string;
  testType: string;
  context?: Record<string, unknown>;
}): Promise<SimpleFailureAnalysis> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured");
  }

  const prompt = `Analyze this test failure and provide detailed root cause analysis:

Test Name: ${input.testName}
Test Type: ${input.testType}
Error Message: ${input.errorMessage}
${input.stackTrace ? `Stack Trace: ${input.stackTrace}` : ""}
${input.context ? `Additional Context: ${JSON.stringify(input.context, null, 2)}` : ""}

Analyze this failure and provide:
1. The most likely root cause
2. A detailed explanation of what went wrong
3. Specific, actionable fixes (with code if applicable)
4. Categorize the issue type
5. Your confidence level in this analysis`;

  return generateJSON<SimpleFailureAnalysis>(prompt, SIMPLE_ANALYSIS_SCHEMA);
}
