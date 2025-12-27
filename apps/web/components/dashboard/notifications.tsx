"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications from API
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/user/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      // Use sample notifications if API fails
      setNotifications(getSampleNotifications());
    } finally {
      setLoading(false);
    }
  }

  function getSampleNotifications(): Notification[] {
    return [
      {
        id: "1",
        type: "success",
        title: "Test run completed",
        description: "All 24 tests passed in 12.4s",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        read: false,
        link: "/dashboard/projects",
      },
      {
        id: "2",
        type: "info",
        title: "New service detected",
        description: "Stripe integration discovered",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        read: false,
        link: "/dashboard/projects",
      },
      {
        id: "3",
        type: "warning",
        title: "Usage approaching limit",
        description: "You've used 80% of your test runs",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true,
        link: "/dashboard/billing",
      },
    ];
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // TODO: Call API to mark as read
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // TODO: Call API to mark all as read
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto p-1"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
                asChild={!!notification.link}
              >
                {notification.link ? (
                  <Link href={notification.link}>
                    <div className="flex items-start gap-3 w-full">
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-medium truncate ${
                              !notification.read ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium truncate ${
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4" />
                Notification Settings
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
