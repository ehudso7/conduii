import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conduii.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/features",
    "/integrations",
    "/pricing",
    "/docs",
    "/about",
    "/privacy",
    "/terms",
    "/sign-in",
    "/sign-up",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/pricing" ? 0.9 : 0.8,
  }));
}
