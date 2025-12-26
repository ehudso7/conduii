# Conduii MCP Server

The Conduii MCP (Model Context Protocol) Server enables Claude and other AI assistants to interact with the Conduii testing platform through natural language.

## Overview

The MCP Server allows you to:
- Discover services in your project through conversation
- Run tests with natural language commands
- Get AI-powered analysis of test results
- Receive intelligent suggestions for fixing issues

## Installation

```bash
# Install globally
npm install -g @conduii/mcp-server

# Or add to Claude Desktop
# See configuration below
```

## Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "conduii": {
      "command": "npx",
      "args": ["@conduii/mcp-server"],
      "env": {
        "CONDUII_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Usage Examples

### Discovering Services

> "What services does my project use?"

Claude will run service discovery and report:
- Detected frameworks (Next.js, Remix, etc.)
- Database connections (Supabase, PlanetScale, etc.)
- Authentication providers (Clerk, Auth0, etc.)
- Payment integrations (Stripe, etc.)
- And more

### Running Tests

> "Run health checks on my deployment"

> "Test all integrations for my production environment"

> "Run API tests against my preview deployment"

### Analyzing Results

> "Why did the Stripe integration test fail?"

Claude will analyze the failure and provide:
- Root cause analysis
- Suggested fixes
- Links to relevant documentation

### Checking Health

> "Is my production deployment healthy?"

> "Check the status of all my services"

## Available Commands

The MCP server exposes these tools to Claude:

| Tool | Description |
|------|-------------|
| `conduii_discover` | Discover services in a project |
| `conduii_health` | Check health of all services |
| `conduii_run` | Run tests |
| `conduii_status` | Get current status |
| `conduii_diagnose` | Analyze test failures |

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CONDUII_API_KEY` | Your Conduii API key | Yes |
| `CONDUII_PROJECT_DIR` | Project directory | No |
| `CONDUII_ENVIRONMENT` | Default environment | No |

### Server Options

```json
{
  "mcpServers": {
    "conduii": {
      "command": "npx",
      "args": [
        "@conduii/mcp-server",
        "--project-dir", "/path/to/project",
        "--environment", "production"
      ]
    }
  }
}
```

## Example Conversations

### Full Test Run

```
User: Run all tests for my project and tell me if anything is broken

Claude: I'll run a full test suite for your project.

[Running tests...]

Here are the results:

✅ Test Suite: PASSED

Summary:
- Total: 15 tests
- Passed: 14
- Failed: 1
- Duration: 3.45s

The failing test:
❌ API: GET /api/users - returned 500 instead of 200

This appears to be a database connection issue. The error message indicates
the connection pool is exhausted. I recommend:

1. Check your database connection limits
2. Ensure connections are being properly released
3. Consider increasing the pool size in your database config
```

### Service Discovery

```
User: What does my project use?

Claude: I'll scan your project to detect integrations.

[Discovering services...]

I found the following in your project:

Framework: Next.js 14

Services detected:
| Service   | Type     | Confidence |
|-----------|----------|------------|
| Vercel    | Platform | 95%        |
| Supabase  | Database | 95%        |
| Clerk     | Auth     | 95%        |
| Stripe    | Payment  | 90%        |
| Resend    | Email    | 85%        |

Endpoints discovered:
- GET  /api/health
- POST /api/users
- GET  /api/projects
- POST /api/checkout

I can generate and run tests for all of these. Would you like me to proceed?
```

## Security

- API keys are stored securely and never exposed in responses
- All requests are authenticated
- Sensitive data is redacted from test results

## Troubleshooting

### Server Not Starting

1. Check Node.js version (18+ required)
2. Verify API key is set correctly
3. Check Claude Desktop logs

### Tests Not Running

1. Ensure project directory is accessible
2. Verify environment variables are configured
3. Check network connectivity

### Authentication Errors

1. Regenerate your API key
2. Update the configuration
3. Restart Claude Desktop

## Support

- Documentation: [https://conduii.com/docs/mcp](https://conduii.com/docs/mcp)
- Issues: [https://github.com/conduii/conduii/issues](https://github.com/conduii/conduii/issues)
