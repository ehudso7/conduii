"use client";

import { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Play,
  Pause,
  RotateCcw,
  Download,
  Maximize2,
  Minimize2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LogLine {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "warning" | "test-start" | "test-pass" | "test-fail" | "suite";
  content: string;
  testName?: string;
  duration?: number;
}

interface StreamingOutputProps {
  testRunId: string;
  status: "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "CANCELLED";
  onTestClick?: (testName: string) => void;
}

export function StreamingOutput({ testRunId, status, onTestClick }: StreamingOutputProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (status !== "RUNNING" && status !== "PENDING") return;

    // Simulate WebSocket connection (in production, use actual WebSocket)
    const simulateLogs = () => {
      const testSuites = [
        { name: "Health Checks", tests: ["API Health", "Database Connection", "Redis Connection"] },
        { name: "API Tests", tests: ["GET /api/users", "POST /api/users", "PUT /api/users/:id", "DELETE /api/users/:id"] },
        { name: "Integration", tests: ["User Registration Flow", "Authentication Flow", "Payment Processing"] },
      ];

      let logIndex = 0;
      
      const addLog = (log: Omit<LogLine, "id">) => {
        if (isPaused) return;
        setLogs(prev => [...prev, { ...log, id: `log-${logIndex++}` }]);
      };

      // Initial logs
      addLog({ timestamp: new Date(), type: "info", content: "Starting test run..." });
      addLog({ timestamp: new Date(), type: "info", content: `Environment: ${process.env.NODE_ENV || "development"}` });
      addLog({ timestamp: new Date(), type: "info", content: "Connecting to test server..." });

      let delay = 500;
      
      testSuites.forEach((suite) => {
        setTimeout(() => {
          addLog({ 
            timestamp: new Date(), 
            type: "suite", 
            content: `\n▶ ${suite.name}` 
          });
        }, delay);
        delay += 300;

        suite.tests.forEach((test) => {
          setTimeout(() => {
            addLog({ 
              timestamp: new Date(), 
              type: "test-start", 
              content: `  ○ ${test}`,
              testName: test,
            });
          }, delay);
          delay += Math.random() * 1000 + 500;

          setTimeout(() => {
            const passed = Math.random() > 0.2;
            const duration = Math.floor(Math.random() * 500 + 50);
            addLog({
              timestamp: new Date(),
              type: passed ? "test-pass" : "test-fail",
              content: passed 
                ? `  ✓ ${test} (${duration}ms)`
                : `  ✗ ${test} (${duration}ms)`,
              testName: test,
              duration,
            });

            if (!passed) {
              addLog({
                timestamp: new Date(),
                type: "error",
                content: `    Error: Expected response status 200, received 500`,
              });
              addLog({
                timestamp: new Date(),
                type: "error",
                content: `    at tests/${suite.name.toLowerCase().replace(/ /g, "-")}/${test.toLowerCase().replace(/ /g, "-")}.spec.ts:42:5`,
              });
            }
          }, delay);
          delay += 200;
        });
      });

      // Final summary
      setTimeout(() => {
        addLog({ timestamp: new Date(), type: "info", content: "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" });
        addLog({ timestamp: new Date(), type: "info", content: "Test Run Complete" });
        addLog({ timestamp: new Date(), type: "success", content: "  Passed: 8" });
        addLog({ timestamp: new Date(), type: "error", content: "  Failed: 2" });
        addLog({ timestamp: new Date(), type: "info", content: "  Duration: 4.2s" });
        addLog({ timestamp: new Date(), type: "info", content: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" });
      }, delay + 500);
    };

    simulateLogs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [testRunId, status, isPaused]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(log => {
        if (filter === "errors") return log.type === "error" || log.type === "test-fail";
        if (filter === "tests") return log.type.startsWith("test-");
        return true;
      });

  function getLogColor(type: LogLine["type"]) {
    switch (type) {
      case "success":
      case "test-pass":
        return "text-green-400";
      case "error":
      case "test-fail":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "suite":
        return "text-blue-400 font-semibold";
      case "test-start":
        return "text-zinc-400";
      default:
        return "text-zinc-300";
    }
  }

  function downloadLogs() {
    const content = logs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.content}`
    ).join("\n");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-run-${testRunId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div 
      className={cn(
        "flex flex-col border rounded-xl bg-zinc-950 overflow-hidden transition-all",
        isFullscreen && "fixed inset-4 z-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">Live Output</span>
          {status === "RUNNING" && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 animate-pulse">
              <Play className="w-3 h-3 mr-1" />
              Running
            </Badge>
          )}
          {status === "PASSED" && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Passed
            </Badge>
          )}
          {status === "FAILED" && (
            <Badge variant="secondary" className="bg-red-500/20 text-red-400">
              <XCircle className="w-3 h-3 mr-1" />
              Failed
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5">
            {["all", "tests", "errors"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  filter === f 
                    ? "bg-zinc-700 text-white" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Controls */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            onClick={() => setLogs([])}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            onClick={downloadLogs}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Log Output */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm min-h-[300px] max-h-[500px]"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
          setAutoScroll(isAtBottom);
        }}
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>Waiting for test output...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredLogs.map((log) => (
              <div 
                key={log.id}
                className={cn(
                  "flex items-start gap-2 py-0.5 hover:bg-zinc-900/50 rounded px-1 -mx-1",
                  log.testName && "cursor-pointer"
                )}
                onClick={() => log.testName && onTestClick?.(log.testName)}
              >
                <span className="text-zinc-600 text-xs flex-shrink-0 w-20">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={cn("whitespace-pre-wrap", getLogColor(log.type))}>
                  {log.content}
                </span>
                {log.testName && (
                  <ChevronRight className="w-3 h-3 text-zinc-600 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                )}
              </div>
            ))}
            {status === "RUNNING" && (
              <div className="flex items-center gap-2 py-1">
                <span className="text-zinc-600 text-xs w-20">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && logs.length > 0 && (
        <button
          onClick={() => {
            setAutoScroll(true);
            containerRef.current?.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="absolute bottom-16 right-4 flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs shadow-lg hover:bg-primary/90 transition-colors"
        >
          <ChevronRight className="w-3 h-3 rotate-90" />
          New output
        </button>
      )}
    </div>
  );
}
