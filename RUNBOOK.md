# Conduii Operations Runbook

This runbook provides operational procedures for deploying, monitoring, and troubleshooting Conduii.

## Table of Contents

1. [Deployment](#deployment)
2. [Rollback](#rollback)
3. [Monitoring](#monitoring)
4. [Incident Response](#incident-response)
5. [Common Issues](#common-issues)

---

## Deployment

### Prerequisites

1. Vercel account with project configured
2. All environment variables set (see [ENVIRONMENT.md](./docs/ENVIRONMENT.md))
3. Database provisioned (Supabase, Neon, or PostgreSQL)
4. Clerk application configured
5. Stripe account with products/prices created

### Automated Deployment (Recommended)

Vercel automatically deploys when changes are pushed:

- **Production**: Push to `main` branch
- **Preview**: Push to any other branch or create a PR

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://conduii.com/api/health
   # Expected: {"status":"ok"}
   ```

2. **Homepage Loads**
   - Visit https://conduii.com
   - Verify navigation works
   - Check dark/light mode toggle

3. **Auth Flow**
   - Click "Sign Up"
   - Complete registration
   - Verify redirect to dashboard

4. **API Check**
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://conduii.com/api/projects
   ```

---

## Rollback

### Vercel Rollback (Fastest)

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last working deployment
3. Click the three dots (⋯) menu
4. Select "Promote to Production"

### Git Rollback

```bash
# Find the last good commit
git log --oneline -10

# Revert to specific commit
git revert HEAD~1  # Revert last commit

# Or hard reset (use with caution)
git reset --hard <commit-hash>
git push origin main --force-with-lease
```

### Database Rollback

If database migration caused issues:

```bash
# Connect to database and review changes
psql $DATABASE_URL

# Prisma doesn't have built-in rollback
# You may need to manually revert schema changes
# or restore from backup
```

---

## Monitoring

### Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/health` | Basic API health |
| `/` | Homepage loads |
| `/dashboard` | Auth-protected route |

### Logs

**Vercel Logs:**
1. Vercel Dashboard → Project → Deployments
2. Click on a deployment
3. View "Functions" tab for API logs

**Database Logs:**
- Supabase: Dashboard → Logs → API
- Neon: Console → Project → Logs

### Alerts (Recommended Setup)

1. **Uptime Monitoring**: Use Vercel's monitoring or Better Uptime
2. **Error Tracking**: Configure Sentry (optional)
3. **Database Alerts**: Configure in Supabase/Neon dashboard

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P1 | Service down | Immediate | API not responding |
| P2 | Major feature broken | 1 hour | Auth not working |
| P3 | Minor issue | 24 hours | UI glitch |
| P4 | Enhancement | Next sprint | Feature request |

### P1 Response Procedure

1. **Acknowledge** - Confirm you're investigating
2. **Assess** - Check Vercel status, API health, database
3. **Mitigate** - Rollback if needed
4. **Communicate** - Update status page/stakeholders
5. **Resolve** - Fix root cause
6. **Document** - Post-incident review

### Quick Diagnostics

```bash
# Check API health
curl https://conduii.com/api/health

# Check Vercel status
open https://www.vercel-status.com/

# Check database connectivity
# (requires database client)
psql $DATABASE_URL -c "SELECT 1"

# Check Clerk status
open https://status.clerk.com/

# Check Stripe status
open https://status.stripe.com/
```

---

## Common Issues

### 1. "Unauthorized" Errors

**Symptoms**: 401 errors on API calls

**Causes**:
- Clerk session expired
- Invalid API key
- Middleware misconfiguration

**Fix**:
1. Clear browser cookies and re-login
2. Regenerate API key in dashboard
3. Verify `CLERK_SECRET_KEY` is set correctly

### 2. Database Connection Errors

**Symptoms**: 500 errors, "Connection refused"

**Causes**:
- Database URL incorrect
- Connection pool exhausted
- Database service down

**Fix**:
1. Verify `DATABASE_URL` in Vercel env vars
2. Check database dashboard for status
3. If using Supabase, check for IP restrictions

### 3. Stripe Webhook Failures

**Symptoms**: Payments succeed but plan not updated

**Causes**:
- Webhook secret mismatch
- Webhook URL not configured
- Signature verification failing

**Fix**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Check Stripe Dashboard → Developers → Webhooks → Events
3. Re-trigger failed webhook from Stripe

### 4. Build Failures

**Symptoms**: Deployment fails

**Causes**:
- Missing environment variables
- Prisma client not generated
- Type errors

**Fix**:
1. Check build logs in Vercel
2. Ensure all required env vars are set
3. Run `yarn typecheck` locally to find errors

### 5. Rate Limiting

**Symptoms**: 429 errors

**Causes**:
- Too many requests from single IP/user
- Misconfigured client making excessive calls

**Fix**:
1. Wait for rate limit window to reset (1 minute)
2. Implement proper backoff in client
3. Check for runaway processes making API calls

---

## Emergency Contacts

| Role | Responsibility |
|------|----------------|
| On-call Engineer | First responder for P1/P2 |
| Database Admin | Database-related issues |
| Security Lead | Security incidents |

---

## Maintenance Windows

- **Preferred**: Tuesday-Thursday, 10am-2pm UTC
- **Avoid**: Fridays, weekends, holidays
- **Communication**: 24h notice for planned maintenance

---

## Backup & Recovery

### Database Backups

- **Supabase**: Automatic daily backups (Pro plan)
- **Neon**: Point-in-time recovery
- **Self-hosted**: Configure `pg_dump` cron job

### Recovery Procedure

1. Identify the backup point needed
2. Create new database from backup
3. Update `DATABASE_URL` to point to restored database
4. Verify data integrity
5. Redirect traffic

---

*Last updated: 2024-12-29*
