import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  CreditCard,
  Zap,
  Plus,
  Command,
  Brain,
  Globe,
  Wand2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { db } from "@/lib/db";
import { DashboardSearch } from "@/components/dashboard/search";
import { NotificationDropdown } from "@/components/dashboard/notifications";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { CommandPalette } from "@/components/command-palette";
import { DashboardProviders } from "@/components/dashboard/dashboard-providers";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Insights", href: "/dashboard/insights", icon: Brain },
  { name: "Discover", href: "/dashboard/discover", icon: Globe },
  { name: "Generate Tests", href: "/dashboard/generate", icon: Wand2 },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

async function getUserProjects(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  select: { id: true, name: true },
                  orderBy: { updatedAt: "desc" },
                  take: 10,
                },
              },
            },
          },
        },
      },
    });

    if (!user?.organizations[0]) return [];
    return user.organizations[0].organization.projects;
  } catch (error) {
    console.error("Database error in getUserProjects:", error);
    return [];
  }
}

function isClerkConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const hasValidPublishable =
    !!publishableKey && /^pk_(test|live)_[a-zA-Z0-9_-]+$/.test(publishableKey);
  const hasValidSecret = !!secretKey && /^sk_(test|live)_[a-zA-Z0-9_-]+$/.test(secretKey);
  return hasValidPublishable && hasValidSecret;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Clerk isn't configured (or middleware isn't active), treat as signed out.
  if (!isClerkConfigured()) {
    redirect("/sign-in");
  }

  let userId: string | null = null;
  try {
    userId = auth().userId ?? null;
  } catch {
    userId = null;
  }

  if (!userId) {
    redirect("/sign-in");
  }

  const projects = await getUserProjects(userId);

  return (
    <DashboardProviders>
      <div className="min-h-screen bg-background">
        {/* Command Palette */}
        <CommandPalette projects={projects} />

        {/* Sidebar - Hidden on mobile */}
        <aside className="fixed inset-y-0 left-0 z-50 w-72 hidden lg:flex lg:flex-col sidebar-futuristic border-r">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 h-16">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-shadow">
                <Zap className="w-5 h-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">Conduii</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Testing Platform</span>
              </div>
            </Link>
          </div>

          {/* Divider with glow */}
          <div className="mx-4 glow-line" />

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-3">Navigation</p>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-item-futuristic"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {/* Projects Section */}
            {projects.length > 0 && (
              <>
                <div className="pt-6" />
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-3">Recent Projects</p>
                {projects.slice(0, 4).map((project: { id: string; name: string }) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="nav-item-futuristic"
                  >
                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium truncate">{project.name}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 space-y-3">
            {/* Quick Action */}
            <Link href="/dashboard/projects/new" className="block">
              <div className="quick-action-btn w-full justify-center">
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </div>
            </Link>

            {/* Keyboard shortcut hint */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Quick search</span>
              <div className="flex items-center gap-1">
                <kbd className="kbd">
                  <Command className="w-3 h-3" />
                </kbd>
                <kbd className="kbd">K</kbd>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-72">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 h-16 bg-background/95 backdrop-blur-sm border-b dashboard-header">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              {/* Mobile menu button */}
              <div className="lg:hidden flex items-center gap-3">
                <MobileNav />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold">Conduii</span>
                </div>
              </div>

              {/* Search - Desktop */}
              <div className="hidden lg:flex flex-1 max-w-lg">
                <DashboardSearch />
              </div>

              {/* Status Indicator - Shows system is active */}
              <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="pulse-indicator" />
                <span>System Active</span>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2 lg:gap-3">
                <ThemeToggle />
                <NotificationDropdown />
                <div className="h-6 w-px bg-border hidden lg:block" />
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-primary/20",
                    },
                  }}
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-8 animate-fade-in">{children}</main>
        </div>
      </div>
    </DashboardProviders>
  );
}
