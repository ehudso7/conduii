# Conduii GitHub Action

Run Conduii tests automatically in your CI/CD pipeline.

## Quick Start

Add this to your GitHub Actions workflow:

```yaml
name: Test Deployment

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

      - name: Run Conduii Tests
        uses: conduii/conduii-action@v1
        with:
          api-key: ${{ secrets.CONDUII_API_KEY }}
          deployment-url: ${{ env.DEPLOYMENT_URL }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `api-key` | Conduii API key | No | - |
| `test-type` | Type of tests to run | No | `all` |
| `environment` | Environment name | No | `preview` |
| `deployment-url` | URL of the deployment | No | - |
| `working-directory` | Project directory | No | `.` |
| `fail-on-error` | Fail the workflow on test failure | No | `true` |
| `vercel-token` | Vercel API token | No | - |
| `supabase-url` | Supabase project URL | No | - |
| `supabase-key` | Supabase service role key | No | - |
| `stripe-key` | Stripe secret key | No | - |
| `github-token` | GitHub token for PR comments | No | - |

### Test Types

- `all` - Run all test types
- `health` - Health checks only
- `integration` - Integration tests
- `api` - API endpoint tests
- `e2e` - End-to-end tests

## Outputs

| Output | Description |
|--------|-------------|
| `status` | Test suite status (passed/failed) |
| `total` | Total number of tests |
| `passed` | Number of passed tests |
| `failed` | Number of failed tests |
| `duration` | Test duration in milliseconds |
| `summary` | Full JSON summary |

## Examples

### With Vercel Deployment

```yaml
name: Deploy & Test

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    outputs:
      url: ${{ steps.deploy.outputs.url }}
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        id: deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  test:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Conduii Tests
        uses: conduii/conduii-action@v1
        with:
          api-key: ${{ secrets.CONDUII_API_KEY }}
          deployment-url: ${{ needs.deploy.outputs.url }}
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Health Checks Only

```yaml
- name: Run Health Checks
  uses: conduii/conduii-action@v1
  with:
    test-type: health
    deployment-url: https://my-app.vercel.app
```

### With Full Service Testing

```yaml
- name: Run Full Test Suite
  uses: conduii/conduii-action@v1
  with:
    api-key: ${{ secrets.CONDUII_API_KEY }}
    deployment-url: https://my-app.vercel.app
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    supabase-url: ${{ secrets.SUPABASE_URL }}
    supabase-key: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    stripe-key: ${{ secrets.STRIPE_SECRET_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Using Outputs

```yaml
- name: Run Tests
  id: tests
  uses: conduii/conduii-action@v1
  with:
    deployment-url: https://my-app.vercel.app

- name: Check Results
  run: |
    echo "Status: ${{ steps.tests.outputs.status }}"
    echo "Passed: ${{ steps.tests.outputs.passed }}/${{ steps.tests.outputs.total }}"
```

## Pull Request Comments

When `github-token` is provided, Conduii automatically posts test results as a PR comment:

```markdown
## ✅ Conduii Test Results

### Summary

| Metric | Value |
|--------|-------|
| Status | ✅ Passed |
| Duration | 1.23s |
| Total Tests | 10 |
| Passed | 10 |
| Failed | 0 |

### Test Results

| Test | Type | Status | Duration |
|------|------|--------|----------|
| Health Check: Vercel | health | ✅ passed | 0.15s |
| Health Check: Supabase | health | ✅ passed | 0.09s |
| Integration: Database | integration | ✅ passed | 0.46s |
```

## Secrets Setup

1. Go to your repository **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

| Secret | Description |
|--------|-------------|
| `CONDUII_API_KEY` | Your Conduii API key |
| `VERCEL_TOKEN` | Vercel API token |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
