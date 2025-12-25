# ⚡ Conduii

**AI-Powered Universal Testing Platform**

Conduii automatically discovers, validates, and tests your deployed applications and integrations — no local server required.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

<p align="center">
  <img src="public/screenshot.png" alt="Conduii Dashboard" width="800" />
</p>

## 🚀 Features

- **Auto-Discovery** — Automatically detects your stack: frameworks, databases, auth, payments, and 50+ services
- **Live Testing** — Tests actual deployed infrastructure, not mocks. Validates real connections between services
- **AI-Powered Diagnostics** — Get intelligent root cause analysis and fix suggestions when tests fail
- **Zero Config** — Works out of the box. Just point it at your project and start testing
- **Multiple Interfaces** — CLI, Web Dashboard, GitHub Action, or conversational through Claude (MCP)
- **Team Collaboration** — Share projects, view test history, and collaborate with your team

## 📦 Supported Integrations

| Category | Services |
|----------|----------|
| **Platforms** | Vercel, Netlify, Railway, Fly.io, Render |
| **Databases** | Supabase, PlanetScale, Neon, MongoDB, Turso |
| **Auth** | Clerk, Auth0, NextAuth, Lucia, Supabase Auth |
| **Payments** | Stripe, Paddle, LemonSqueezy |
| **Email** | Resend, SendGrid, Postmark, Mailgun |
| **Storage** | S3, Cloudflare R2, UploadThing |
| **Monitoring** | Sentry, PostHog, LogSnag |
| **Repository** | GitHub, GitLab |

## 🏁 Quick Start

### Using the CLI

```bash
# Install globally
npm install -g @conduii/cli

# Initialize your project
conduii init

# Discover services
conduii discover

# Run all tests
conduii run

# Run specific test type
conduii run --type health
```

### Using the Web Dashboard

1. Sign up at [conduii.com](https://conduii.com)
2. Create a new project
3. Connect your repository
4. Watch Conduii auto-discover your services and generate tests

### Using GitHub Actions

```yaml
name: Conduii Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Conduii
        uses: conduii/conduii-action@v1
        with:
          test-type: all
          deployment-url: ${{ env.VERCEL_URL }}
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          supabase-url: ${{ secrets.SUPABASE_URL }}
          supabase-key: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## 🧪 Test Types

| Type | Description |
|------|-------------|
| **Health** | Service availability and response times |
| **Integration** | Connection and authentication validation |
| **API** | Endpoint testing with status code assertions |
| **E2E** | Full user flow testing with Playwright |
| **Performance** | Response time and throughput validation |
| **Security** | SSL certificate and security header checks |

## 🏗️ Project Structure

```
conduii/
├── apps/
│   └── web/               # Next.js web application
│       ├── app/           # App router pages
│       ├── components/    # React components
│       ├── lib/           # Utilities and helpers
│       └── prisma/        # Database schema
├── packages/
│   ├── core/              # Testing engine and adapters
│   ├── cli/               # Command-line interface
│   ├── mcp-server/        # Claude MCP integration
│   └── github-action/     # GitHub Action
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in `apps/web`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Stripe (for billing)
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
```

See `.env.example` for all available options.

### Project Configuration

Create a `conduii.config.json` in your project root:

```json
{
  "name": "my-app",
  "environments": {
    "default": {
      "name": "preview",
      "url": "https://my-app-preview.vercel.app"
    },
    "production": {
      "name": "production",
      "url": "https://my-app.com",
      "isProduction": true
    }
  },
  "adapters": [
    { "type": "platform", "name": "vercel", "enabled": true },
    { "type": "database", "name": "supabase", "enabled": true },
    { "type": "payment", "name": "stripe", "enabled": true }
  ]
}
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase/Neon)
- Clerk account
- Stripe account (for billing features)

### Setup

```bash
# Clone the repository
git clone https://github.com/ehudso7/conduii.git
cd conduii

# Install dependencies
npm install

# Setup environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your values

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build --filter=web
npm run build --filter=@conduii/cli
```

### Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## 📖 Documentation

- [CLI Reference](docs/cli.md)
- [API Documentation](docs/api.md)
- [SDK Guide](docs/sdk.md)
- [MCP Server](docs/mcp-server.md)
- [GitHub Action](docs/github-action.md)
- [Configuration](docs/configuration.md)

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/month | 3 projects, 100 runs/month, CLI access |
| **Pro** | $29/month | Unlimited projects, 5,000 runs/month, Dashboard, GitHub Action |
| **Enterprise** | Custom | Unlimited runs, SSO, SLA, Custom integrations |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Clerk](https://clerk.com/)
- Database by [Prisma](https://prisma.io/)
- Payments by [Stripe](https://stripe.com/)
- Deployed on [Vercel](https://vercel.com/)

---

<p align="center">
  Made with ❤️ by <a href="https://conduii.com">Conduii</a>
</p>
