"use client";

import { useEffect, useCallback } from "react";
import { Search, Command } from "lucide-react";

export function DashboardSearch() {
  // Open command palette with keyboard shortcut
  const handleClick = useCallback(() => {
    // Dispatch a keyboard event to trigger the command palette
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted w-full max-w-sm hover:bg-muted/80 transition-colors text-left"
    >
      <Search className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground flex-1">
        Search projects, tests...
      </span>
      <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <Command className="w-3 h-3" />K
      </kbd>
    </button>
  );
}
