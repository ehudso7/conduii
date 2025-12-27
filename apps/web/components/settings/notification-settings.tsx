"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface NotificationSettingsProps {
  initialSettings?: {
    testFailures: boolean;
    serviceHealth: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
  };
}

export function NotificationSettings({ initialSettings }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    testFailures: initialSettings?.testFailures ?? true,
    serviceHealth: initialSettings?.serviceHealth ?? true,
    weeklyDigest: initialSettings?.weeklyDigest ?? false,
    securityAlerts: initialSettings?.securityAlerts ?? true,
    marketingEmails: initialSettings?.marketingEmails ?? false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update notifications");
      }

      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Notifications */}
      <div>
        <h4 className="text-sm font-medium mb-4">Test Notifications</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Test Failures</p>
              <p className="text-sm text-muted-foreground">
                Get notified when a test run fails
              </p>
            </div>
            <Switch
              checked={settings.testFailures}
              onCheckedChange={(checked) => setSettings({ ...settings, testFailures: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Service Health Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when a service becomes unhealthy
              </p>
            </div>
            <Switch
              checked={settings.serviceHealth}
              onCheckedChange={(checked) => setSettings({ ...settings, serviceHealth: checked })}
            />
          </div>
        </div>
      </div>

      {/* Email Digests */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-4">Email Digests</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your testing activity
              </p>
            </div>
            <Switch
              checked={settings.weeklyDigest}
              onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
            />
          </div>
        </div>
      </div>

      {/* Security & Updates */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-4">Security & Updates</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-muted-foreground">
                Important security notifications about your account
              </p>
            </div>
            <Switch
              checked={settings.securityAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, securityAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Product Updates</p>
              <p className="text-sm text-muted-foreground">
                News about new features and improvements
              </p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="mt-4">
        {loading ? "Saving..." : "Save Notification Preferences"}
      </Button>
    </div>
  );
}
