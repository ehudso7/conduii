# Conduii Environment Variables Guide

This guide documents all environment variables used by Conduii, organized by category.

## Quick Setup

For local development:

```bash
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your values
```

For Vercel deployment:
1. Go to Project Settings → Environment Variables
2. Add each variable below
3. Redeploy for changes to take effect

---

## Required Variables

These must be set for the application to function.

### Database

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Supabase, Neon, or your DB provider |
| `DIRECT_URL` | Direct database URL (for migrations) | Same as DATABASE_URL | Same provider |

**Supabase Setup:**
1. Go to Supabase Dashboard → Project → Settings → Database
2. Copy "Connection string" under "Connection pooling"
3. For `DIRECT_URL`, use the non-pooled connection

**Neon Setup:**
1. Go to Neon Console → Project → Connection Details
2. Copy the "Connection string"
3. Use `?sslmode=require` at the end

### Authentication (Clerk)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_test_...` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` | Clerk Dashboard → Webhooks |

**Clerk Setup:**
1. Create account at [clerk.com](https://clerk.com)
2. Create a new application
3. Go to API Keys page and copy keys
4. Set up webhook at `https://yourdomain.com/api/webhooks/clerk`

### Billing (Stripe)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` | Stripe Dashboard → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` | Same location |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` | Stripe Dashboard → Webhooks |

**Stripe Price IDs:**

| Variable | Description | Plan |
|----------|-------------|------|
| `STRIPE_BASIC_MONTHLY_PRICE_ID` | Basic monthly price | Basic ($9.99/mo) |
| `STRIPE_BASIC_YEARLY_PRICE_ID` | Basic yearly price | Basic ($99.99/yr) |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Pro monthly price | Pro ($29.99/mo) |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Pro yearly price | Pro ($299.99/yr) |
| `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID` | Enterprise monthly | Enterprise ($99.99/mo) |
| `STRIPE_ENTERPRISE_YEARLY_PRICE_ID` | Enterprise yearly | Enterprise ($999.99/yr) |

**Stripe Setup:**
1. Create account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys and copy keys
3. Create products and prices in Products section
4. Set up webhook at `https://yourdomain.com/api/webhooks/stripe`
   - Subscribe to: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

### Application

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your application URL | `https://conduii.com` |
| `NODE_ENV` | Environment mode | `production` or `development` |

---

## Optional Variables

These enhance functionality but aren't required.

### Email (Resend)

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key | `re_...` |
| `EMAIL_FROM` | Sender email | `Conduii <hello@conduii.com>` |

**Setup:** Create account at [resend.com](https://resend.com) and get API key.

### Monitoring (Sentry)

| Variable | Description | Example |
|----------|-------------|---------|
| `SENTRY_DSN` | Sentry DSN (server-side) | `https://...@sentry.io/...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (client-side) | Same as above |

**Setup:** Create project at [sentry.io](https://sentry.io) and copy DSN.

### Analytics (PostHog)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host | `https://app.posthog.com` |

**Setup:** Create account at [posthog.com](https://posthog.com) and get project key.

### External Integrations

| Variable | Description | Used For |
|----------|-------------|----------|
| `VERCEL_TOKEN` | Vercel API token | Testing Vercel deployments |
| `GITHUB_TOKEN` | GitHub personal access token | Repository integration |

---

## CLI & GitHub Action Variables

For `@conduii/cli` and `@conduii/github-action`:

| Variable | Description | Example |
|----------|-------------|---------|
| `CONDUII_API_KEY` | Your Conduii API key | `ck_...` |
| `CONDUII_API_URL` | API endpoint | `https://conduii.com` |

**Get your API key:**
1. Sign in to Conduii dashboard
2. Go to Settings → API Keys
3. Create a new key

---

## MCP Server Variables

For `@conduii/mcp-server`:

| Variable | Description | Example |
|----------|-------------|---------|
| `CONDUII_API_KEY` | Your Conduii API key | `ck_...` |
| `CONDUII_API_URL` | API endpoint (optional) | `https://conduii.com` |

---

## Vercel-Specific Variables

These are automatically set by Vercel:

| Variable | Description |
|----------|-------------|
| `VERCEL` | Set to "1" when running on Vercel |
| `VERCEL_ENV` | `production`, `preview`, or `development` |
| `VERCEL_URL` | Deployment URL (e.g., `myapp-abc.vercel.app`) |

---

## Security Notes

1. **Never commit secrets** - Use `.env.local` for local development
2. **Rotate keys regularly** - Especially after team member offboarding
3. **Use test keys for development** - Clerk and Stripe have test/live modes
4. **Restrict API key scopes** - Only grant necessary permissions

---

## Troubleshooting

### "Environment variable not found"

1. Check variable is set in Vercel (not just locally)
2. Redeploy after adding new variables
3. Ensure variable name matches exactly (case-sensitive)

### "Invalid API key"

1. Verify key is from correct environment (test vs. live)
2. Check key hasn't been revoked
3. Ensure no extra whitespace in value

### Database connection issues

1. Verify connection string format
2. Check SSL requirements (`?sslmode=require`)
3. Ensure IP is allowed if using firewall

---

## Example .env.local

```bash
# Database
DATABASE_URL="postgresql://user:password@db.example.com:5432/conduii?sslmode=require"
DIRECT_URL="postgresql://user:password@db.example.com:5432/conduii?sslmode=require"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"
STRIPE_BASIC_MONTHLY_PRICE_ID="price_xxxxxxxxxxxx"
STRIPE_BASIC_YEARLY_PRICE_ID="price_xxxxxxxxxxxx"
STRIPE_PRO_MONTHLY_PRICE_ID="price_xxxxxxxxxxxx"
STRIPE_PRO_YEARLY_PRICE_ID="price_xxxxxxxxxxxx"
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_xxxxxxxxxxxx"
STRIPE_ENTERPRISE_YEARLY_PRICE_ID="price_xxxxxxxxxxxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Optional
RESEND_API_KEY=""
SENTRY_DSN=""
```

---

*Last updated: 2024-12-29*
