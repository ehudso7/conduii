import { redirect } from "next/navigation";
import { User, Building2, Key, Bell, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import {
  ProfileForm,
  OrganizationForm,
  ApiKeyManagement,
  NotificationSettings,
  DangerZone,
} from "@/components/settings";

async function getUserSettings(userId: string) {
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              apiKeys: {
                where: {
                  revokedAt: null,
                  OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                  ],
                },
                orderBy: { createdAt: "desc" },
              },
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      imageUrl: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  projects: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return user;
}

export default async function SettingsPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/sign-in");

  const user = await getUserSettings(authUser.clerkId);

  if (!user) {
    redirect("/sign-in");
  }

  const organization = user.organizations[0]?.organization;

  // Transform data for client components
  const userForProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
  };

  const orgForForm = organization ? {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    plan: organization.plan,
    members: organization.members.map((m: {
      id: string;
      role: string;
      user: { id: string; name: string | null; email: string; imageUrl: string | null };
    }) => ({
      id: m.id,
      role: m.role,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        imageUrl: m.user.imageUrl,
      },
    })),
  } : null;

  const apiKeysForManagement = organization?.apiKeys.map((k: {
    id: string;
    name: string;
    key: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
  }) => ({
    id: k.id,
    name: k.name,
    key: k.key,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt?.toISOString() || null,
    expiresAt: k.expiresAt?.toISOString() || null,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary uppercase tracking-wider">Configuration</p>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organization settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your personal account information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={userForProfile} />
          </CardContent>
        </Card>

        {/* Organization Section */}
        {orgForForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <CardTitle>Organization</CardTitle>
                </div>
                <Badge variant="outline">{organization?.plan}</Badge>
              </div>
              <CardDescription>
                Manage your organization settings and team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationForm organization={orgForForm} />
            </CardContent>
          </Card>
        )}

        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              <CardTitle>API Keys</CardTitle>
            </div>
            <CardDescription>
              Manage API keys for CLI and programmatic access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApiKeyManagement
              apiKeys={apiKeysForManagement}
              organizationId={organization?.id || ""}
            />
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettings />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {organization && (
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DangerZone
                organizationId={organization.id}
                organizationName={organization.name}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
