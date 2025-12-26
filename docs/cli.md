# Conduii CLI

The Conduii CLI provides command-line access to the Conduii testing platform. Test your deployments and integrations directly from your terminal.

## Installation

```bash
# Install globally
npm install -g @conduii/cli

# Or use npx
npx @conduii/cli <command>
```

## Authentication

Before using Conduii, you need to authenticate with your account:

1. Visit [https://conduii.com/cli/login](https://conduii.com/cli/login) to get your API token
2. Run the auth command:

```bash
conduii auth <your-token>
```

Your credentials are stored securely in `~/.conduii/config.json`.

## Commands

### `conduii discover`

Automatically discover services and integrations in your project.

```bash
conduii discover [options]

Options:
  -d, --dir <path>  Project directory (default: ".")
  --json            Output as JSON
```

**Example:**
```bash
$ conduii discover

Framework: Next.js

Detected Services:
┌──────────┬──────────┬────────────┐
│ Service  │ Type     │ Confidence │
├──────────┼──────────┼────────────┤
│ supabase │ database │ 95%        │
│ stripe   │ payment  │ 95%        │
│ clerk    │ auth     │ 95%        │
└──────────┴──────────┴────────────┘

Discovered Endpoints (1):
  GET    /api/health
```

### `conduii health`

Check the health of all detected services.

```bash
conduii health [options]

Options:
  -d, --dir <path>  Project directory (default: ".")
  --json            Output as JSON
```

**Example:**
```bash
$ conduii health

╭──────────────────────────────────────╮
│                                      │
│  ✅ Health Status: HEALTHY           │
│                                      │
│  3/3 services healthy                │
│                                      │
╰──────────────────────────────────────╯

┌──────────┬──────────┬───────────┬─────────┐
│ Service  │ Type     │ Status    │ Latency │
├──────────┼──────────┼───────────┼─────────┤
│ supabase │ database │ 🟢 healthy│ 45ms    │
│ stripe   │ payment  │ 🟢 healthy│ 89ms    │
│ clerk    │ auth     │ 🟢 healthy│ 32ms    │
└──────────┴──────────┴───────────┴─────────┘
```

### `conduii run`

Run tests against your deployment.

```bash
conduii run [options]

Options:
  -d, --dir <path>           Project directory (default: ".")
  -t, --type <type>          Test type: all, health, integration, api, e2e (default: "all")
  -e, --env <environment>    Environment name (default: "default")
  --parallel                 Run tests in parallel (default: true)
  --json                     Output as JSON
```

**Example:**
```bash
$ conduii run --type health

╭──────────────────────────────────────╮
│                                      │
│  ✓ Test Suite: PASSED                │
│                                      │
│  Status: PASSED                      │
│  Duration: 0.45s                     │
│  Environment: default                │
│                                      │
╰──────────────────────────────────────╯

Summary:
┌───────┬────────┬────────┬─────────┐
│ Total │ Passed │ Failed │ Skipped │
├───────┼────────┼────────┼─────────┤
│ 3     │ 3      │ 0      │ 0       │
└───────┴────────┴────────┴─────────┘

Test Results:
  ✓ Health Check: supabase (0.05s)
  ✓ Health Check: stripe (0.09s)
  ✓ Health Check: clerk (0.03s)
```

### `conduii init`

Initialize Conduii configuration in your project.

```bash
conduii init [options]

Options:
  -d, --dir <path>  Project directory (default: ".")
```

This creates a `conduii.config.json` file with detected services and default configuration.

### `conduii login`

Display login instructions.

```bash
conduii login
```

## Configuration

Conduii can be configured via `conduii.config.json`:

```json
{
  "$schema": "https://conduii.com/schema/config.json",
  "name": "my-project",
  "environments": {
    "default": {
      "name": "preview",
      "url": "https://preview.example.com"
    },
    "production": {
      "name": "production",
      "url": "https://example.com",
      "isProduction": true
    }
  },
  "adapters": [
    { "type": "database", "name": "supabase", "enabled": true },
    { "type": "payment", "name": "stripe", "enabled": true }
  ],
  "discovery": {
    "enabled": true
  },
  "defaults": {
    "timeout": 30000,
    "retries": 2,
    "parallel": true
  }
}
```

## Environment Variables

The CLI uses the following environment variables:

| Variable | Description |
|----------|-------------|
| `CONDUII_API_URL` | API URL (default: https://conduii.com) |
| `VERCEL_TOKEN` | Vercel API token for platform checks |
| `SUPABASE_URL` | Supabase project URL |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `GITHUB_TOKEN` | GitHub personal access token |

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | Test failure or error |

## Support

- Documentation: [https://conduii.com/docs](https://conduii.com/docs)
- Issues: [https://github.com/conduii/conduii/issues](https://github.com/conduii/conduii/issues)
