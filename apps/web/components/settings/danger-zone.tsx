"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface DangerZoneProps {
  organizationId: string;
  organizationName: string;
}

export function DangerZone({ organizationId, organizationName }: DangerZoneProps) {
  const [deleteOrgConfirm, setDeleteOrgConfirm] = useState("");
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState("");
  const [showOrgDelete, setShowOrgDelete] = useState(false);
  const [showAccountDelete, setShowAccountDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteOrg = async () => {
    if (deleteOrgConfirm !== organizationName) {
      toast({
        title: "Confirmation Required",
        description: "Please type the organization name exactly to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/organizations?id=${organizationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete organization");
      }

      toast({
        title: "Organization Deleted",
        description: "Your organization has been permanently deleted.",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete organization",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountConfirm !== "DELETE") {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-red-200 bg-red-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Organization</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your organization and all data
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowOrgDelete(!showOrgDelete)}
          >
            Delete Organization
          </Button>
        </div>
        {showOrgDelete && (
          <div className="mt-4 pt-4 border-t border-red-200 space-y-4">
            <p className="text-sm text-red-600">
              This action cannot be undone. All projects, test runs, and data will be permanently deleted.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type <strong>{organizationName}</strong> to confirm:
              </label>
              <Input
                value={deleteOrgConfirm}
                onChange={(e) => setDeleteOrgConfirm(e.target.value)}
                placeholder={organizationName}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteOrg}
                disabled={loading || deleteOrgConfirm !== organizationName}
              >
                {loading ? "Deleting..." : "Permanently Delete Organization"}
              </Button>
              <Button variant="ghost" onClick={() => setShowOrgDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-lg border border-red-200 bg-red-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowAccountDelete(!showAccountDelete)}
          >
            Delete Account
          </Button>
        </div>
        {showAccountDelete && (
          <div className="mt-4 pt-4 border-t border-red-200 space-y-4">
            <p className="text-sm text-red-600">
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <Input
                value={deleteAccountConfirm}
                onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                placeholder="DELETE"
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading || deleteAccountConfirm !== "DELETE"}
              >
                {loading ? "Deleting..." : "Permanently Delete Account"}
              </Button>
              <Button variant="ghost" onClick={() => setShowAccountDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
