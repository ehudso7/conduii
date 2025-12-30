"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  CreditCard,
  Search,
  Plus,
  Play,
  FileText,
  HelpCircle,
  LogOut,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useClerk } from "@clerk/nextjs";
import { useCommandPaletteContext } from "./command-palette-context";

interface CommandItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  projects?: Array<{ id: string; name: string }>;
}

export function CommandPalette({ projects = [] }: CommandPaletteProps) {
  const { isOpen, close, toggle } = useCommandPaletteContext();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { signOut } = useClerk();

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: "Go to Dashboard",
      description: "View your dashboard overview",
      shortcut: "G D",
      action: () => router.push("/dashboard"),
      category: "Navigation",
    },
    {
      id: "projects",
      icon: <FolderKanban className="w-4 h-4" />,
      label: "Go to Projects",
      description: "View all your projects",
      shortcut: "G P",
      action: () => router.push("/dashboard/projects"),
      category: "Navigation",
    },
    {
      id: "settings",
      icon: <Settings className="w-4 h-4" />,
      label: "Go to Settings",
      description: "Manage your account settings",
      shortcut: "G S",
      action: () => router.push("/dashboard/settings"),
      category: "Navigation",
    },
    {
      id: "billing",
      icon: <CreditCard className="w-4 h-4" />,
      label: "Go to Billing",
      description: "Manage subscription and billing",
      shortcut: "G B",
      action: () => router.push("/dashboard/billing"),
      category: "Navigation",
    },
    // Actions
    {
      id: "new-project",
      icon: <Plus className="w-4 h-4" />,
      label: "Create New Project",
      description: "Start a new testing project",
      shortcut: "C P",
      action: () => router.push("/dashboard/projects/new"),
      category: "Actions",
    },
    {
      id: "run-tests",
      icon: <Play className="w-4 h-4" />,
      label: "Run Tests",
      description: "Start a new test run",
      action: () => {
        if (projects.length > 0) {
          router.push(`/dashboard/projects/${projects[0].id}/runs`);
        } else {
          router.push("/dashboard/projects/new");
        }
      },
      category: "Actions",
    },
    // Resources
    {
      id: "docs",
      icon: <FileText className="w-4 h-4" />,
      label: "Documentation",
      description: "View the documentation",
      action: () => router.push("/docs"),
      category: "Resources",
    },
    {
      id: "help",
      icon: <HelpCircle className="w-4 h-4" />,
      label: "Help & Support",
      description: "Get help with Conduii",
      action: () => window.open("https://github.com/ehudso7/conduii/issues", "_blank"),
      category: "Resources",
    },
    // Account
    {
      id: "sign-out",
      icon: <LogOut className="w-4 h-4" />,
      label: "Sign Out",
      description: "Sign out of your account",
      action: async () => {
        try {
          await signOut();
          router.push("/");
        } catch (error) {
          console.error("Sign out error:", error);
          // Fallback to hard navigation
          window.location.href = "/";
        }
      },
      category: "Account",
    },
  ];

  // Add project-specific commands
  const projectCommands: CommandItem[] = projects.map((project) => ({
    id: `project-${project.id}`,
    icon: <FolderKanban className="w-4 h-4" />,
    label: project.name,
    description: "Open project",
    action: () => router.push(`/dashboard/projects/${project.id}`),
    category: "Projects",
  }));

  const allCommands = [...commands, ...projectCommands];

  const filteredCommands = allCommands.filter((command) => {
    const searchLower = search.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.category.toLowerCase().includes(searchLower)
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const flatCommands = Object.values(groupedCommands).flat();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        toggle();
        return;
      }

      // Only handle additional shortcuts when palette is open
      if (!isOpen) return;

      // Close with Escape (backup in case dialog doesn't handle it)
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [toggle, close, isOpen]);

  // Handle navigation within palette
  const handleKeyNavigation = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatCommands.length - 1
        );
      } else if (e.key === "Enter" && flatCommands[selectedIndex]) {
        e.preventDefault();
        try {
          await flatCommands[selectedIndex].action();
        } catch (error) {
          console.error("Command execution error:", error);
        } finally {
          close();
          setSearch("");
          setSelectedIndex(0);
        }
      } else if (e.key === "Escape") {
        close();
        setSearch("");
        setSelectedIndex(0);
      }
    },
    [flatCommands, selectedIndex, close]
  );

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = async (command: CommandItem) => {
    try {
      await command.action();
      close();
      setSearch("");
      setSelectedIndex(0);
    } catch (error) {
      console.error("Command execution error:", error);
      // Still close the palette even if action fails
      close();
      setSearch("");
      setSelectedIndex(0);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
      setSearch("");
      setSelectedIndex(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-lg">
        <div className="flex items-center border-b px-3">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <Input
            placeholder="Search commands, projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyNavigation}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ESC
          </kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found for &quot;{search}&quot;
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {category}
                </div>
                {items.map((command) => {
                  const isSelected =
                    flatCommands.indexOf(command) === selectedIndex;
                  return (
                    <button
                      key={command.id}
                      onClick={() => handleSelect(command)}
                      className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {command.icon}
                        </span>
                        <div className="flex flex-col items-start">
                          <span>{command.label}</span>
                          {command.description && (
                            <span className="text-xs text-muted-foreground">
                              {command.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {command.shortcut && (
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                          {command.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigate with</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5">↑</kbd>
            <kbd className="rounded border bg-muted px-1.5 py-0.5">↓</kbd>
          </div>
          <div className="flex items-center gap-2">
            <span>Select with</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5">Enter</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
