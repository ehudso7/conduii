"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  project?: string;
  timestamp: Date;
  read: boolean;
  grouped?: boolean;
  groupCount?: number;
  actionUrl?: string;
}

export function EnhancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    // Group similar notifications
    const rawNotifications: Notification[] = [
      {
        id: "1",
        type: "success",
        title: "Test Run Completed",
        message: "All 24 tests passed for Web Application",
        project: "Web Application",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
      },
      {
        id: "2",
        type: "error",
        title: "Test Failures Detected",
        message: "3 tests failed in Payment Service",
        project: "Payment Service",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        read: false,
        grouped: true,
        groupCount: 3,
      },
      {
        id: "3",
        type: "warning",
        title: "Flaky Test Warning",
        message: "User Authentication test has been flaky recently",
        project: "API Gateway",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
      },
      {
        id: "4",
        type: "info",
        title: "New Service Discovered",
        message: "Redis cache service automatically detected",
        project: "API Gateway",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: true,
      },
      {
        id: "5",
        type: "success",
        title: "Coverage Improved",
        message: "Test coverage increased to 87%",
        project: "Web Application",
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        read: true,
      },
    ];

    setNotifications(rawNotifications);
    setUnreadCount(rawNotifications.filter(n => !n.read).length);
  }

  function markAsRead(id: string) {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  function deleteNotification(id: string) {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function getIcon(type: Notification["type"]) {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  }

  function formatTime(date: Date) {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  }

  const filteredNotifications = filter === "all"
    ? notifications
    : notifications.filter(n => n.type === filter);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="h-8 text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 p-2 border-b">
          {["all", "error", "warning", "success", "info"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs capitalize"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors group",
                  !notification.read && "bg-primary/5"
                )}
              >
                <div className="flex gap-3">
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn(
                          "text-sm",
                          !notification.read && "font-medium"
                        )}>
                          {notification.title}
                          {notification.groupCount && notification.groupCount > 1 && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              +{notification.groupCount - 1} similar
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {notification.project && (
                          <Badge variant="outline" className="text-xs">
                            {notification.project}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DropdownMenuSeparator />
        
        {/* Footer */}
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            <Settings className="w-4 h-4 mr-1" />
            Notification Settings
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
