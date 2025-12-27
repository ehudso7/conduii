"use client";

import { useState, useEffect } from "react";
import { Search, Command } from "lucide-react";
import { useCommandPaletteContext } from "@/components/command-palette-context";

export function DashboardSearch() {
  const [isMac, setIsMac] = useState(true);
  const { open } = useCommandPaletteContext();

  useEffect(() => {
    // Detect if user is on Mac
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  return (
    <button
      onClick={open}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted w-full max-w-sm hover:bg-muted/80 transition-colors text-left"
    >
      <Search className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground flex-1">
        Search projects, tests...
      </span>
      <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        {isMac ? <Command className="w-3 h-3" /> : "Ctrl+"}K
      </kbd>
    </button>
  );
}
