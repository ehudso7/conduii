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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { db } from "@/lib/db";
import { DashboardSearch } from "@/components/dashboard/search";
import { NotificationDropdown } from "@/components/dashboard/notifications";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { CommandPalette } from "@/components/command-palette";
import { DashboardProviders } from "@/components/dashboard/dashboard-providers";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const projects = await getUserProjects(userId);

  return (
    <DashboardProviders>
      <div className="min-h-screen bg-muted/30">
        {/* Command Palette */}
        <CommandPalette projects={projects} />

        {/* Sidebar - Hidden on mobile */}
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r hidden md:block">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 h-16 border-b">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Conduii</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <Link href="/dashboard/projects/new">
              <Button className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:pl-64">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between h-full px-4 md:px-6">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <MobileNav />
              </div>

              {/* Search */}
              <div className="hidden md:block flex-1 max-w-md">
                <DashboardSearch />
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-2 md:gap-4">
                <ThemeToggle />
                <NotificationDropdown />
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </DashboardProviders>
  );
}
