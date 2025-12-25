"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell, Plus, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  organization: {
    id: string;
    name: string;
    plan: string;
    testRunsUsed: number;
    testRunLimit: number;
  };
}

export function DashboardHeader({ organization }: DashboardHeaderProps) {
  const usagePercent = organization.testRunLimit > 0
    ? Math.round((organization.testRunsUsed / organization.testRunLimit) * 100)
    : 0;

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search projects, tests..."
          className="pl-9 pr-12"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <Command className="w-3 h-3" />K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Usage */}
        {organization.plan === "FREE" && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{organization.testRunsUsed}</span>
            <span>/{organization.testRunLimit} runs</span>
            {usagePercent >= 80 && (
              <Badge variant="warning" className="ml-2">
                {100 - usagePercent}% left
              </Badge>
            )}
          </div>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Test run completed</p>
                <p className="text-xs text-muted-foreground">
                  All 24 tests passed in 12.4s
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">New service detected</p>
                <p className="text-xs text-muted-foreground">
                  Stripe integration discovered
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New Project */}
        <Link href="/dashboard/projects/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>
    </header>
  );
}
