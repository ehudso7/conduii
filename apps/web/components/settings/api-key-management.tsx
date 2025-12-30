"use client";

import { useState } from "react";
import { Key, Plus, Copy, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date | string;
  lastUsedAt: Date | string | null;
  expiresAt: Date | string | null;
}

interface ApiKeyManagementProps {
  apiKeys: ApiKey[];
  organizationId: string;
}

export function ApiKeyManagement({ apiKeys: initialKeys, organizationId: _organizationId }: ApiKeyManagementProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [expiresIn, setExpiresIn] = useState<string>("90d");
  const [creating, setCreating] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!keyName.trim()) {
      toast({
        title: "Validation Error",
        description: "API key name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim(), expiresIn }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.apiKey || !data.apiKey.key) {
        throw new Error("Invalid response from server");
      }

      setNewKeyValue(data.apiKey.key);
      setApiKeys([data.apiKey, ...apiKeys]);
      setKeyName("");

      toast({
        title: "API Key Created",
        description: "Make sure to copy your key - it won't be shown again!",
      });
    } catch (error) {
      console.error("API key creation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/api-keys?id=${keyId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      toast({
        title: "API Key Revoked",
        description: "The API key has been revoked successfully.",
      });
    } catch (error) {
      console.error("API key deletion error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke API key",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(keyId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {showCreateForm && (
        <div className="p-4 mb-4 rounded-lg bg-muted/50 space-y-4">
          {newKeyValue ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-yellow-600">
                Copy your API key now - it won&apos;t be shown again!
              </p>
              <div className="flex gap-2">
                <code className="flex-1 p-2 bg-black text-green-400 rounded font-mono text-sm overflow-x-auto">
                  {newKeyValue}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(newKeyValue, "new")}
                >
                  {copiedId === "new" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setNewKeyValue(null);
                  setShowCreateForm(false);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Name</label>
                  <Input
                    placeholder="e.g., Production CLI"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expires In</label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="365d">1 year</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={creating || !keyName}>
                  {creating ? "Creating..." : "Create Key"}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No API keys created yet.</p>
          <p className="text-sm">Create an API key to use the CLI or API.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div>
                <p className="font-medium">{key.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {key.key.includes("...") ? key.key : `${key.key.slice(0, 8)}...${key.key.slice(-4)}`}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    Created {formatDate(key.createdAt)}
                  </span>
                  {key.lastUsedAt && (
                    <span className="text-xs text-muted-foreground">
                      • Last used {formatDate(key.lastUsedAt)}
                    </span>
                  )}
                  {key.expiresAt && (
                    <span className="text-xs text-muted-foreground">
                      • Expires {formatDate(key.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(key.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
