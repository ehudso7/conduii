"use client";

import { ReactNode } from "react";
import { CommandPaletteProvider } from "@/components/command-palette-context";

export function DashboardProviders({ children }: { children: ReactNode }) {
  return <CommandPaletteProvider>{children}</CommandPaletteProvider>;
}
