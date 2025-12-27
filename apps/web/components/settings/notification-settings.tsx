"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface NotificationSettingsProps {
  initialSettings?: {
    testFailures: boolean;
    serviceHealth: boolean;
    weeklyDigest: boolean;
  };
}

export function NotificationSettings({ initialSettings }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    testFailures: initialSettings?.testFailures ?? true,
    serviceHealth: initialSettings?.serviceHealth ?? true,
    weeklyDigest: initialSettings?.weeklyDigest ?? false,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Test Failures</p>
          <p className="text-sm text-muted-foreground">
            Get notified when a test run fails
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.testFailures}
          onChange={(e) => setSettings({ ...settings, testFailures: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Service Health Alerts</p>
          <p className="text-sm text-muted-foreground">
            Get notified when a service becomes unhealthy
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.serviceHealth}
          onChange={(e) => setSettings({ ...settings, serviceHealth: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Weekly Digest</p>
          <p className="text-sm text-muted-foreground">
            Receive a weekly summary of your testing activity
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.weeklyDigest}
          onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
      </div>
      <Button onClick={handleSave} disabled={loading} className="mt-4">
        {loading ? "Saving..." : "Save Notification Preferences"}
      </Button>
    </div>
  );
}
