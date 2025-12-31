"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Code,
  Lightbulb,
  AlertTriangle,
  Wand2,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  thinking?: string;
  codeBlocks?: CodeBlock[];
  suggestions?: Suggestion[];
  isStreaming?: boolean;
  timestamp: Date;
}

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  canApply?: boolean;
}

interface Suggestion {
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
}

interface TestContext {
  testName: string;
  testType: string;
  error?: string;
  duration?: number;
  assertions?: Record<string, unknown>;
}

interface AIAssistantProps {
  testRunId: string;
  projectId: string;
  context?: TestContext;
  onApplyFix?: (code: string, filename: string) => void;
}

const SUGGESTED_PROMPTS = [
  "Why did this test fail?",
  "How can I fix this error?",
  "Is this a flaky test?",
  "Generate a fix for this failure",
  "What tests should I add to prevent this?",
];

export function AIAssistant({ testRunId, projectId, context, onApplyFix }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with context if provided
  useEffect(() => {
    if (context?.error && messages.length === 0) {
      const systemMessage: Message = {
        id: "system-1",
        role: "system",
        content: `I'm analyzing the test failure for **${context.testName}**. Here's what I found:`,
        timestamp: new Date(),
      };
      setMessages([systemMessage]);
      
      // Auto-trigger analysis
      setTimeout(() => {
        handleAnalyzeFailure();
      }, 500);
    }
  }, [context]);

  async function handleAnalyzeFailure() {
    if (!context?.error) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Analyze this test failure and suggest fixes",
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      thinking: "Analyzing the error stack trace and test context...",
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/analyze-failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testRunId,
          projectId,
          error: context.error,
          testName: context.testName,
          testType: context.testType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Simulate streaming effect
        await simulateStreaming(assistantMessage.id, data.analysis);
      } else {
        updateMessage(assistantMessage.id, {
          content: "I encountered an error while analyzing the failure. Please try again.",
          isStreaming: false,
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      updateMessage(assistantMessage.id, {
        content: "Failed to connect to AI service. Please check your connection.",
        isStreaming: false,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function simulateStreaming(messageId: string, analysis: {
    rootCause: string;
    explanation: string;
    suggestedFixes: Array<{ description: string; code?: string; priority: string }>;
    category: string;
    confidence: number;
  }) {
    const thinkingSteps = [
      "Parsing error stack trace...",
      "Identifying error pattern...",
      `Detected: ${analysis.category} issue`,
      "Generating fix suggestions...",
      `Confidence: ${analysis.confidence}%`,
    ];

    // Show thinking steps
    for (const step of thinkingSteps) {
      await new Promise(resolve => setTimeout(resolve, 300));
      updateMessage(messageId, { thinking: step });
    }

    // Build the response content
    const content = `## Root Cause Analysis\n\n**${analysis.rootCause}**\n\n${analysis.explanation}\n\n`;
    
    // Stream the content character by character (simulated)
    updateMessage(messageId, { thinking: undefined });
    
    const words = content.split(" ");
    let displayedContent = "";
    
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 20));
      displayedContent += word + " ";
      updateMessage(messageId, { content: displayedContent });
    }

    // Add code blocks and suggestions
    const codeBlocks: CodeBlock[] = analysis.suggestedFixes
      .filter(fix => fix.code)
      .map((fix, i) => ({
        language: "typescript",
        code: fix.code!,
        filename: `fix-${i + 1}.ts`,
        canApply: true,
      }));

    const suggestions: Suggestion[] = analysis.suggestedFixes.map(fix => ({
      title: fix.description,
      description: fix.description,
      action: "apply",
      priority: fix.priority.toLowerCase() as "high" | "medium" | "low",
    }));

    updateMessage(messageId, {
      content: displayedContent,
      codeBlocks,
      suggestions,
      isStreaming: false,
    });
  }

  function updateMessage(id: string, updates: Partial<Message>) {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      thinking: "Processing your question...",
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input.trim(),
          context: {
            testRunId,
            projectId,
            testName: context?.testName,
            error: context?.error,
          },
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Simulate streaming
        const words = data.result.answer.split(" ");
        let displayedContent = "";
        
        updateMessage(assistantMessage.id, { thinking: undefined });
        
        for (const word of words) {
          await new Promise(resolve => setTimeout(resolve, 15));
          displayedContent += word + " ";
          updateMessage(assistantMessage.id, { content: displayedContent });
        }

        updateMessage(assistantMessage.id, {
          content: data.result.answer,
          codeBlocks: data.result.codeBlocks,
          suggestions: data.result.suggestedActions?.map((a: { label: string }) => ({
            title: a.label,
            description: a.label,
            action: "execute",
            priority: "medium" as const,
          })),
          isStreaming: false,
        });
      } else {
        updateMessage(assistantMessage.id, {
          content: "I couldn't process that request. Please try again.",
          isStreaming: false,
        });
      }
    } catch (error) {
      console.error("Query failed:", error);
      updateMessage(assistantMessage.id, {
        content: "Connection error. Please try again.",
        isStreaming: false,
      });
    } finally {
      setIsLoading(false);
    }
  }

  function toggleThinking(messageId: string) {
    setExpandedThinking(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-xl bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Test Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by Claude</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {context?.testName && (
            <Badge variant="secondary" className="text-xs">
              {context.testName}
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setMessages([])}
            className="text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-12 h-12 text-primary/50 mb-4" />
            <h3 className="font-semibold mb-2">AI-Powered Test Analysis</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Ask me anything about your test failures. I can analyze errors, 
              suggest fixes, and help you understand what went wrong.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role !== "user" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {/* Thinking indicator */}
              {message.thinking && (
                <div 
                  className="flex items-center gap-2 text-xs text-muted-foreground mb-2 cursor-pointer"
                  onClick={() => toggleThinking(message.id)}
                >
                  {expandedThinking.has(message.id) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="italic">{message.thinking}</span>
                </div>
              )}

              {/* Content */}
              {message.content && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {message.content.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return <h3 key={i} className="text-base font-semibold mt-2 mb-1">{line.replace("## ", "")}</h3>;
                    }
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={i} className="font-semibold">{line.replace(/\*\*/g, "")}</p>;
                    }
                    return <p key={i} className="my-1">{line}</p>;
                  })}
                </div>
              )}

              {/* Streaming cursor */}
              {message.isStreaming && !message.thinking && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              )}

              {/* Code blocks */}
              {message.codeBlocks && message.codeBlocks.length > 0 && (
                <div className="mt-3 space-y-3">
                  {message.codeBlocks.map((block, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border">
                      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 text-zinc-400 text-xs">
                        <div className="flex items-center gap-2">
                          <Code className="w-3 h-3" />
                          <span>{block.filename || block.language}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-zinc-400 hover:text-white"
                            onClick={() => copyCode(block.code)}
                          >
                            {copiedCode === block.code ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                          {block.canApply && onApplyFix && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-primary hover:text-primary"
                              onClick={() => onApplyFix(block.code, block.filename || "fix.ts")}
                            >
                              <Wand2 className="w-3 h-3 mr-1" />
                              Apply
                            </Button>
                          )}
                        </div>
                      </div>
                      <pre className="p-3 bg-zinc-950 text-zinc-100 text-sm overflow-x-auto">
                        <code>{block.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Suggested Actions
                  </p>
                  {message.suggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-lg border text-sm",
                        suggestion.priority === "high" && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
                        suggestion.priority === "medium" && "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950",
                        suggestion.priority === "low" && "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
                      )}
                    >
                      <AlertTriangle className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0",
                        suggestion.priority === "high" && "text-red-500",
                        suggestion.priority === "medium" && "text-yellow-500",
                        suggestion.priority === "low" && "text-blue-500"
                      )} />
                      <span>{suggestion.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback buttons */}
              {message.role === "assistant" && !message.isStreaming && message.content && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Was this helpful?</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">You</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this test failure..."
              rows={1}
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI can make mistakes. Verify suggestions before applying.
        </p>
      </div>
    </div>
  );
}
