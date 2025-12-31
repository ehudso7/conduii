"use client";

import { useState, useEffect, useRef } from "react";
import {
  Server,
  Database,
  Globe,
  Cloud,
  Lock,
  CreditCard,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServiceNode {
  id: string;
  name: string;
  type: "api" | "database" | "auth" | "payment" | "email" | "storage" | "cdn" | "other";
  status: "healthy" | "degraded" | "down" | "unknown";
  url?: string;
  latency?: number;
  lastChecked: Date;
  dependencies: string[];
}

interface ServiceMapProps {
  projectId?: string;
}

export function ServiceMap({ projectId }: ServiceMapProps) {
  const [services, setServices] = useState<ServiceNode[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadServices();
  }, [projectId]);

  async function loadServices() {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setServices([
      {
        id: "1",
        name: "Next.js App",
        type: "api",
        status: "healthy",
        url: "https://app.example.com",
        latency: 45,
        lastChecked: new Date(),
        dependencies: ["2", "3", "4", "5"],
      },
      {
        id: "2",
        name: "PostgreSQL",
        type: "database",
        status: "healthy",
        latency: 12,
        lastChecked: new Date(),
        dependencies: [],
      },
      {
        id: "3",
        name: "Clerk Auth",
        type: "auth",
        status: "healthy",
        url: "https://clerk.com",
        latency: 89,
        lastChecked: new Date(),
        dependencies: [],
      },
      {
        id: "4",
        name: "Stripe",
        type: "payment",
        status: "degraded",
        url: "https://api.stripe.com",
        latency: 234,
        lastChecked: new Date(),
        dependencies: [],
      },
      {
        id: "5",
        name: "Resend",
        type: "email",
        status: "healthy",
        url: "https://api.resend.com",
        latency: 156,
        lastChecked: new Date(),
        dependencies: [],
      },
      {
        id: "6",
        name: "Vercel CDN",
        type: "cdn",
        status: "healthy",
        latency: 23,
        lastChecked: new Date(),
        dependencies: ["1"],
      },
      {
        id: "7",
        name: "S3 Storage",
        type: "storage",
        status: "healthy",
        url: "https://s3.amazonaws.com",
        latency: 67,
        lastChecked: new Date(),
        dependencies: [],
      },
    ]);

    setLoading(false);
  }

  function getServiceIcon(type: ServiceNode["type"]) {
    switch (type) {
      case "api":
        return Server;
      case "database":
        return Database;
      case "auth":
        return Lock;
      case "payment":
        return CreditCard;
      case "email":
        return Mail;
      case "storage":
        return FileText;
      case "cdn":
        return Globe;
      default:
        return Cloud;
    }
  }

  function getStatusColor(status: ServiceNode["status"]) {
    switch (status) {
      case "healthy":
        return "text-green-500 bg-green-500";
      case "degraded":
        return "text-yellow-500 bg-yellow-500";
      case "down":
        return "text-red-500 bg-red-500";
      default:
        return "text-gray-500 bg-gray-500";
    }
  }

  function getStatusIcon(status: ServiceNode["status"]) {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "down":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />;
    }
  }

  // Calculate positions for circular layout
  function getNodePosition(index: number, total: number, centerX: number, centerY: number, radius: number) {
    if (index === 0) {
      return { x: centerX, y: centerY };
    }
    const angle = ((index - 1) / (total - 1)) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Discovering services...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const centerX = 200;
  const centerY = 150;
  const radius = 120;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Service Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={loadServices}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Service Map Visualization */}
          <div
            ref={containerRef}
            className="relative flex-1 bg-muted/30 rounded-lg border overflow-hidden"
            style={{ minHeight: 300 }}
          >
            <svg
              className="w-full h-full"
              viewBox={`0 0 400 300`}
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              {/* Connection Lines */}
              {services.map((service, i) => {
                const pos = getNodePosition(i, services.length, centerX, centerY, radius);
                return service.dependencies.map((depId) => {
                  const depIndex = services.findIndex((s) => s.id === depId);
                  if (depIndex === -1) return null;
                  const depPos = getNodePosition(depIndex, services.length, centerX, centerY, radius);
                  const depService = services[depIndex];
                  return (
                    <line
                      key={`${service.id}-${depId}`}
                      x1={pos.x}
                      y1={pos.y}
                      x2={depPos.x}
                      y2={depPos.y}
                      stroke={depService?.status === "healthy" ? "#22c55e" : 
                              depService?.status === "degraded" ? "#eab308" : "#ef4444"}
                      strokeWidth="2"
                      strokeDasharray={depService?.status === "healthy" ? "0" : "5,5"}
                      opacity="0.5"
                    />
                  );
                });
              })}

              {/* Service Nodes */}
              {services.map((service, i) => {
                const pos = getNodePosition(i, services.length, centerX, centerY, radius);
                const Icon = getServiceIcon(service.type);
                const isSelected = selectedService?.id === service.id;

                return (
                  <g
                    key={service.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedService(isSelected ? null : service)}
                  >
                    {/* Outer ring for selection */}
                    <circle
                      r={isSelected ? 32 : 28}
                      fill="none"
                      stroke={isSelected ? "currentColor" : "transparent"}
                      strokeWidth="2"
                      className="text-primary transition-all"
                    />
                    {/* Background circle */}
                    <circle
                      r="24"
                      className={cn(
                        "fill-background stroke-2 transition-all",
                        service.status === "healthy" ? "stroke-green-500" :
                        service.status === "degraded" ? "stroke-yellow-500" :
                        service.status === "down" ? "stroke-red-500" : "stroke-gray-500"
                      )}
                    />
                    {/* Status indicator */}
                    <circle
                      r="4"
                      cx="16"
                      cy="-16"
                      className={cn(
                        getStatusColor(service.status).split(" ")[1],
                        "animate-pulse"
                      )}
                    />
                    {/* Icon (using foreignObject for React icons) */}
                    <foreignObject x="-12" y="-12" width="24" height="24">
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                    </foreignObject>
                    {/* Label */}
                    <text
                      y="40"
                      textAnchor="middle"
                      className="text-xs fill-muted-foreground font-medium"
                    >
                      {service.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Service Details Panel */}
          <div className="w-64 shrink-0">
            {selectedService ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getServiceIcon(selectedService.type);
                    return <Icon className="w-6 h-6" />;
                  })()}
                  <div>
                    <h4 className="font-medium">{selectedService.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedService.type}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={cn(
                      "capitalize",
                      selectedService.status === "healthy" ? "bg-green-100 text-green-700" :
                      selectedService.status === "degraded" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {getStatusIcon(selectedService.status)}
                      <span className="ml-1">{selectedService.status}</span>
                    </Badge>
                  </div>

                  {selectedService.latency && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Latency</span>
                      <span className={cn(
                        "font-medium",
                        selectedService.latency < 100 ? "text-green-600" :
                        selectedService.latency < 200 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {selectedService.latency}ms
                      </span>
                    </div>
                  )}

                  {selectedService.url && (
                    <div className="text-sm">
                      <span className="text-muted-foreground block mb-1">Endpoint</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                        {selectedService.url}
                      </code>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="text-muted-foreground">Last Checked</span>
                    <span className="ml-2">
                      {selectedService.lastChecked.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button size="sm" className="w-full">
                    Run Health Check
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    View Logs
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a service to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Degraded</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Down</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
