import * as fs from "fs";
import * as path from "path";
import {
  AdapterType,
  TestType,
  DiscoveryResult,
  DiscoveredService,
  DiscoveredEndpoint,
  TestConfig,
} from "../types";

// =============================================================================
// SERVICE DETECTION PATTERNS
// =============================================================================

const SERVICE_PATTERNS: Record<
  string,
  {
    type: AdapterType;
    envVars: string[];
    packages?: string[];
    configFiles?: string[];
  }
> = {
  // Platforms
  vercel: {
    type: AdapterType.PLATFORM,
    envVars: ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"],
    configFiles: ["vercel.json"],
  },
  netlify: {
    type: AdapterType.PLATFORM,
    envVars: ["NETLIFY_AUTH_TOKEN"],
    configFiles: ["netlify.toml"],
  },
  railway: {
    type: AdapterType.PLATFORM,
    envVars: ["RAILWAY_TOKEN"],
    configFiles: ["railway.toml"],
  },

  // Databases
  supabase: {
    type: AdapterType.DATABASE,
    envVars: ["SUPABASE_URL", "SUPABASE_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    packages: ["@supabase/supabase-js"],
  },
  planetscale: {
    type: AdapterType.DATABASE,
    envVars: ["DATABASE_URL"],
    packages: ["@planetscale/database"],
  },
  neon: {
    type: AdapterType.DATABASE,
    envVars: ["DATABASE_URL", "NEON_DATABASE_URL"],
    packages: ["@neondatabase/serverless"],
  },
  mongodb: {
    type: AdapterType.DATABASE,
    envVars: ["MONGODB_URI", "MONGO_URL"],
    packages: ["mongodb", "mongoose"],
  },
  prisma: {
    type: AdapterType.DATABASE,
    envVars: ["DATABASE_URL"],
    packages: ["@prisma/client"],
    configFiles: ["prisma/schema.prisma"],
  },
  drizzle: {
    type: AdapterType.DATABASE,
    envVars: ["DATABASE_URL"],
    packages: ["drizzle-orm"],
  },

  // Auth
  clerk: {
    type: AdapterType.AUTH,
    envVars: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    packages: ["@clerk/nextjs", "@clerk/clerk-sdk-node"],
  },
  auth0: {
    type: AdapterType.AUTH,
    envVars: ["AUTH0_SECRET", "AUTH0_BASE_URL"],
    packages: ["@auth0/nextjs-auth0"],
  },
  nextauth: {
    type: AdapterType.AUTH,
    envVars: ["NEXTAUTH_SECRET", "NEXTAUTH_URL"],
    packages: ["next-auth"],
  },
  lucia: {
    type: AdapterType.AUTH,
    envVars: [],
    packages: ["lucia"],
  },

  // Payments
  stripe: {
    type: AdapterType.PAYMENT,
    envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    packages: ["stripe", "@stripe/stripe-js"],
  },
  paddle: {
    type: AdapterType.PAYMENT,
    envVars: ["PADDLE_API_KEY"],
    packages: ["@paddle/paddle-js"],
  },
  lemonsqueezy: {
    type: AdapterType.PAYMENT,
    envVars: ["LEMONSQUEEZY_API_KEY"],
    packages: ["@lemonsqueezy/lemonsqueezy.js"],
  },

  // Email
  resend: {
    type: AdapterType.EMAIL,
    envVars: ["RESEND_API_KEY"],
    packages: ["resend"],
  },
  sendgrid: {
    type: AdapterType.EMAIL,
    envVars: ["SENDGRID_API_KEY"],
    packages: ["@sendgrid/mail"],
  },
  postmark: {
    type: AdapterType.EMAIL,
    envVars: ["POSTMARK_API_KEY"],
    packages: ["postmark"],
  },

  // Storage
  s3: {
    type: AdapterType.STORAGE,
    envVars: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET"],
    packages: ["@aws-sdk/client-s3"],
  },
  cloudflare_r2: {
    type: AdapterType.STORAGE,
    envVars: ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"],
    packages: [],
  },
  uploadthing: {
    type: AdapterType.STORAGE,
    envVars: ["UPLOADTHING_SECRET"],
    packages: ["uploadthing"],
  },

  // Monitoring
  sentry: {
    type: AdapterType.MONITORING,
    envVars: ["SENTRY_DSN"],
    packages: ["@sentry/nextjs", "@sentry/node"],
  },
  posthog: {
    type: AdapterType.ANALYTICS,
    envVars: ["NEXT_PUBLIC_POSTHOG_KEY"],
    packages: ["posthog-js", "posthog-node"],
  },

  // Repository
  github: {
    type: AdapterType.REPOSITORY,
    envVars: ["GITHUB_TOKEN", "GH_TOKEN"],
    packages: ["@octokit/rest"],
  },
};

// =============================================================================
// FRAMEWORK DETECTION
// =============================================================================

const FRAMEWORK_PATTERNS: Record<
  string,
  { packages: string[]; configFiles?: string[] }
> = {
  nextjs: {
    packages: ["next"],
    configFiles: ["next.config.js", "next.config.mjs", "next.config.ts"],
  },
  remix: {
    packages: ["@remix-run/react"],
    configFiles: ["remix.config.js"],
  },
  nuxt: {
    packages: ["nuxt"],
    configFiles: ["nuxt.config.js", "nuxt.config.ts"],
  },
  sveltekit: {
    packages: ["@sveltejs/kit"],
    configFiles: ["svelte.config.js"],
  },
  astro: {
    packages: ["astro"],
    configFiles: ["astro.config.mjs"],
  },
  express: { packages: ["express"] },
  fastify: { packages: ["fastify"] },
  hono: { packages: ["hono"] },
};

// =============================================================================
// DISCOVERY ENGINE
// =============================================================================

export class DiscoveryEngine {
  private projectDir: string;
  private packageJson: Record<string, unknown> | null = null;
  private envVars: Set<string> = new Set();

  constructor(projectDir: string = process.cwd()) {
    this.projectDir = projectDir;
  }

  async discover(): Promise<DiscoveryResult> {
    await this.loadProjectFiles();

    const framework = this.detectFramework();
    const services = this.detectServices();
    const endpoints = await this.discoverEndpoints(framework);
    const suggestedTests = this.generateSuggestedTests(services, endpoints);

    return {
      projectType: this.determineProjectType(),
      framework,
      services,
      endpoints,
      environmentVariables: Array.from(this.envVars),
      suggestedTests,
    };
  }

  private async loadProjectFiles(): Promise<void> {
    // Load package.json
    const pkgPath = path.join(this.projectDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      this.packageJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    }

    // Load env files
    const envFiles = [".env", ".env.local", ".env.development", ".env.example"];
    for (const envFile of envFiles) {
      const envPath = path.join(this.projectDir, envFile);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const matches = content.match(/^([A-Z_][A-Z0-9_]*)=/gm);
        if (matches) {
          matches.forEach((m) => this.envVars.add(m.replace("=", "")));
        }
      }
    }
  }

  private detectFramework(): string | undefined {
    if (!this.packageJson) return undefined;

    const deps = {
      ...(this.packageJson.dependencies as Record<string, string>),
      ...(this.packageJson.devDependencies as Record<string, string>),
    };

    for (const [framework, pattern] of Object.entries(FRAMEWORK_PATTERNS)) {
      const hasPackage = pattern.packages.some((pkg) => pkg in deps);
      const hasConfig = pattern.configFiles?.some((file) =>
        fs.existsSync(path.join(this.projectDir, file))
      );

      if (hasPackage || hasConfig) {
        return framework;
      }
    }

    return undefined;
  }

  private detectServices(): DiscoveredService[] {
    const services: DiscoveredService[] = [];

    if (!this.packageJson) return services;

    const deps = {
      ...(this.packageJson.dependencies as Record<string, string>),
      ...(this.packageJson.devDependencies as Record<string, string>),
    };

    for (const [serviceName, pattern] of Object.entries(SERVICE_PATTERNS)) {
      let confidence = 0;
      const foundEnvVars: string[] = [];
      let configFile: string | undefined;

      // Check env vars
      for (const envVar of pattern.envVars) {
        if (this.envVars.has(envVar) || process.env[envVar]) {
          confidence += 0.3;
          foundEnvVars.push(envVar);
        }
      }

      // Check packages
      if (pattern.packages) {
        for (const pkg of pattern.packages) {
          if (pkg in deps) {
            confidence += 0.4;
          }
        }
      }

      // Check config files
      if (pattern.configFiles) {
        for (const file of pattern.configFiles) {
          if (fs.existsSync(path.join(this.projectDir, file))) {
            confidence += 0.3;
            configFile = file;
          }
        }
      }

      if (confidence >= 0.3) {
        services.push({
          type: pattern.type,
          name: serviceName,
          configFile,
          envVars: foundEnvVars.length > 0 ? foundEnvVars : undefined,
          confidence: Math.min(confidence, 1),
        });
      }
    }

    return services.sort((a, b) => b.confidence - a.confidence);
  }

  private async discoverEndpoints(
    framework?: string
  ): Promise<DiscoveredEndpoint[]> {
    const endpoints: DiscoveredEndpoint[] = [];

    if (framework === "nextjs") {
      // App Router
      const appApiDir = path.join(this.projectDir, "app/api");
      if (fs.existsSync(appApiDir)) {
        this.scanNextjsAppRouter(appApiDir, "/api", endpoints);
      }

      // Pages Router
      const pagesApiDir = path.join(this.projectDir, "pages/api");
      if (fs.existsSync(pagesApiDir)) {
        this.scanNextjsPagesRouter(pagesApiDir, "/api", endpoints);
      }
    }

    // Add src directory variants
    const srcAppApiDir = path.join(this.projectDir, "src/app/api");
    if (fs.existsSync(srcAppApiDir)) {
      this.scanNextjsAppRouter(srcAppApiDir, "/api", endpoints);
    }

    return endpoints;
  }

  private scanNextjsAppRouter(
    dir: string,
    basePath: string,
    endpoints: DiscoveredEndpoint[]
  ): void {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        let segment = entry.name;
        if (segment.startsWith("[") && segment.endsWith("]")) {
          segment = `:${segment.slice(1, -1)}`;
        }
        if (segment.startsWith("(") && segment.endsWith(")")) {
          // Route group, don't add to path
          this.scanNextjsAppRouter(
            path.join(dir, entry.name),
            basePath,
            endpoints
          );
        } else {
          this.scanNextjsAppRouter(
            path.join(dir, entry.name),
            `${basePath}/${segment}`,
            endpoints
          );
        }
      } else if (entry.name === "route.ts" || entry.name === "route.js") {
        const content = fs.readFileSync(path.join(dir, entry.name), "utf-8");
        const methods: Array<DiscoveredEndpoint["method"]> = [];

        if (/export\s+(async\s+)?function\s+GET/i.test(content))
          methods.push("GET");
        if (/export\s+(async\s+)?function\s+POST/i.test(content))
          methods.push("POST");
        if (/export\s+(async\s+)?function\s+PUT/i.test(content))
          methods.push("PUT");
        if (/export\s+(async\s+)?function\s+PATCH/i.test(content))
          methods.push("PATCH");
        if (/export\s+(async\s+)?function\s+DELETE/i.test(content))
          methods.push("DELETE");

        for (const method of methods) {
          endpoints.push({ path: basePath, method });
        }
      }
    }
  }

  private scanNextjsPagesRouter(
    dir: string,
    basePath: string,
    endpoints: DiscoveredEndpoint[]
  ): void {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        let segment = entry.name;
        if (segment.startsWith("[") && segment.endsWith("]")) {
          segment = `:${segment.slice(1, -1)}`;
        }
        this.scanNextjsPagesRouter(
          path.join(dir, entry.name),
          `${basePath}/${segment}`,
          endpoints
        );
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
        const name = entry.name.replace(/\.(ts|js)$/, "");
        if (name === "index") {
          endpoints.push({ path: basePath, method: "GET" });
        } else {
          let segment = name;
          if (segment.startsWith("[") && segment.endsWith("]")) {
            segment = `:${segment.slice(1, -1)}`;
          }
          endpoints.push({ path: `${basePath}/${segment}`, method: "GET" });
        }
      }
    }
  }

  private determineProjectType(): string {
    if (!this.packageJson) return "unknown";

    const deps = this.packageJson.dependencies as Record<string, string>;
    if (deps?.next) return "nextjs";
    if (deps?.react) return "react";
    if (deps?.vue) return "vue";
    if (deps?.express) return "express";

    return "node";
  }

  private generateSuggestedTests(
    services: DiscoveredService[],
    endpoints: DiscoveredEndpoint[]
  ): TestConfig[] {
    const tests: TestConfig[] = [];

    // Health checks for each service
    for (const service of services) {
      tests.push({
        id: `health:${service.name}`,
        name: `Health Check: ${service.name}`,
        type: TestType.HEALTH,
        enabled: true,
        timeout: 10000,
        retries: 2,
        tags: ["health", service.type],
        config: { service: service.name },
      });

      tests.push({
        id: `integration:${service.name}`,
        name: `Integration: ${service.name}`,
        type: TestType.INTEGRATION,
        enabled: true,
        timeout: 30000,
        retries: 2,
        tags: ["integration", service.type],
        config: { service: service.name },
      });
    }

    // API tests for endpoints
    for (const endpoint of endpoints.slice(0, 20)) {
      tests.push({
        id: `api:${endpoint.method}:${endpoint.path}`,
        name: `API: ${endpoint.method} ${endpoint.path}`,
        type: TestType.API,
        enabled: true,
        timeout: 15000,
        retries: 1,
        tags: ["api", endpoint.method.toLowerCase()],
        config: {
          endpoint: endpoint.path,
          method: endpoint.method,
          expectedStatus: 200,
        },
      });
    }

    return tests;
  }
}

export async function discoverProject(
  projectDir?: string
): Promise<DiscoveryResult> {
  const engine = new DiscoveryEngine(projectDir);
  return engine.discover();
}
