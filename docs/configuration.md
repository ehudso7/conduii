# Configuration Guide

This guide covers all configuration options for Conduii.

## Configuration File

Create a `conduii.config.json` in your project root:

```json
{
  "$schema": "https://conduii.com/schema/config.json",
  "name": "my-project",
  "environments": {},
  "adapters": [],
  "discovery": {},
  "defaults": {}
}
```

## Schema Reference

### Root Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `$schema` | string | - | JSON schema URL for IDE support |
| `name` | string | - | Project name |
| `version` | string | - | Project version |
| `environments` | object | - | Environment configurations |
| `adapters` | array | - | Service adapter configurations |
| `discovery` | object | - | Auto-discovery settings |
| `defaults` | object | - | Default test settings |

### Environments

Define different environments for testing:

```json
{
  "environments": {
    "default": {
      "name": "preview",
      "url": "https://preview.example.com"
    },
    "production": {
      "name": "production",
      "url": "https://example.com",
      "isProduction": true,
      "variables": {
        "API_VERSION": "v2"
      }
    },
    "staging": {
      "name": "staging",
      "url": "https://staging.example.com"
    }
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | required | Environment display name |
| `url` | string | - | Base URL for API tests |
| `isProduction` | boolean | `false` | Mark as production environment |
| `variables` | object | - | Environment-specific variables |

### Adapters

Configure service integrations:

```json
{
  "adapters": [
    {
      "type": "database",
      "name": "supabase",
      "enabled": true,
      "credentials": {
        "url": "${SUPABASE_URL}",
        "key": "${SUPABASE_SERVICE_ROLE_KEY}"
      },
      "options": {
        "schema": "public"
      }
    },
    {
      "type": "payment",
      "name": "stripe",
      "enabled": true,
      "credentials": {
        "secretKey": "${STRIPE_SECRET_KEY}"
      }
    },
    {
      "type": "auth",
      "name": "clerk",
      "enabled": true,
      "credentials": {
        "secretKey": "${CLERK_SECRET_KEY}"
      }
    }
  ]
}
```

#### Adapter Types

| Type | Services |
|------|----------|
| `platform` | Vercel, Netlify, Railway, Fly.io |
| `database` | Supabase, PlanetScale, Neon, MongoDB |
| `auth` | Clerk, Auth0, NextAuth, Supabase Auth |
| `payment` | Stripe, LemonSqueezy |
| `email` | Resend, SendGrid, Postmark |
| `storage` | S3, Cloudflare R2, Supabase Storage |
| `monitoring` | Sentry, LogRocket |
| `repository` | GitHub, GitLab |
| `analytics` | PostHog, Mixpanel |
| `custom` | Custom integrations |

### Discovery

Configure auto-discovery behavior:

```json
{
  "discovery": {
    "enabled": true,
    "scanPackageJson": true,
    "scanEnvFiles": true,
    "scanConfigFiles": true,
    "exclude": [
      "node_modules",
      ".git",
      "dist"
    ]
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable auto-discovery |
| `scanPackageJson` | boolean | `true` | Detect from dependencies |
| `scanEnvFiles` | boolean | `true` | Detect from .env files |
| `scanConfigFiles` | boolean | `true` | Detect from config files |
| `exclude` | array | - | Paths to exclude |

### Defaults

Set default test configuration:

```json
{
  "defaults": {
    "timeout": 30000,
    "retries": 2,
    "parallel": true,
    "maxConcurrency": 5,
    "stopOnFirstFailure": false
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `timeout` | number | `30000` | Test timeout in ms |
| `retries` | number | `2` | Retry count for flaky tests |
| `parallel` | boolean | `true` | Run tests in parallel |
| `maxConcurrency` | number | `5` | Max concurrent tests |
| `stopOnFirstFailure` | boolean | `false` | Stop on first failure |

## Environment Variables

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `STRIPE_SECRET_KEY` | Stripe secret key |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `CONDUII_API_URL` | Custom API URL |
| `VERCEL_TOKEN` | Vercel API token |
| `GITHUB_TOKEN` | GitHub access token |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key |
| `RESEND_API_KEY` | Resend email API key |
| `SENTRY_DSN` | Sentry DSN |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog key |

## Example Configurations

### Next.js + Supabase + Stripe

```json
{
  "$schema": "https://conduii.com/schema/config.json",
  "name": "my-saas",
  "environments": {
    "default": {
      "name": "preview",
      "url": ""
    },
    "production": {
      "name": "production",
      "url": "https://my-saas.com",
      "isProduction": true
    }
  },
  "adapters": [
    {
      "type": "platform",
      "name": "vercel",
      "enabled": true
    },
    {
      "type": "database",
      "name": "supabase",
      "enabled": true
    },
    {
      "type": "payment",
      "name": "stripe",
      "enabled": true
    },
    {
      "type": "auth",
      "name": "clerk",
      "enabled": true
    }
  ],
  "defaults": {
    "timeout": 30000,
    "retries": 2,
    "parallel": true
  }
}
```

### Minimal Configuration

```json
{
  "$schema": "https://conduii.com/schema/config.json",
  "name": "my-app",
  "discovery": {
    "enabled": true
  }
}
```

## CLI Override

Override config values via CLI:

```bash
# Override environment
conduii run --env production

# Override test type
conduii run --type health

# Override timeout
CONDUII_TIMEOUT=60000 conduii run
```
