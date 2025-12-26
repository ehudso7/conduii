# Conduii API Reference

The Conduii API provides programmatic access to the testing platform. All API endpoints require authentication.

## Base URL

```text
https://conduii.com/api
```

## Authentication

All API requests require a Bearer token:

```bash
curl -H "Authorization: Bearer <your-api-key>" \
  https://conduii.com/api/projects
```

Generate API keys from your [dashboard settings](https://conduii.com/settings/api-keys).

## Endpoints

### Projects

#### List Projects

```http
GET /api/projects
```

Query parameters:
- `orgId` (optional): Filter by organization ID

Response:
```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "My App",
      "slug": "my-app",
      "description": "My application",
      "repoUrl": "https://github.com/user/repo",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "services": 3,
        "testRuns": 10
      },
      "testRuns": [
        {
          "id": "run_456",
          "status": "PASSED",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

#### Create Project

```http
POST /api/projects
```

Request body:
```json
{
  "name": "My App",
  "description": "My application description",
  "repoUrl": "https://github.com/user/repo",
  "organizationId": "org_123"
}
```

Response: `201 Created`
```json
{
  "project": {
    "id": "proj_123",
    "name": "My App",
    "slug": "my-app",
    "environments": [...],
    "testSuites": [...]
  }
}
```

### Test Runs

#### List Test Runs

```http
GET /api/test-runs
```

Query parameters:
- `projectId` (required): Project ID
- `limit` (optional): Number of results (default: 20)

Response:
```json
{
  "testRuns": [
    {
      "id": "run_456",
      "status": "PASSED",
      "trigger": "MANUAL",
      "duration": 1234,
      "startedAt": "2024-01-01T00:00:00Z",
      "finishedAt": "2024-01-01T00:00:01Z",
      "summary": {
        "total": 10,
        "passed": 9,
        "failed": 1,
        "skipped": 0
      },
      "environment": {
        "id": "env_789",
        "name": "production"
      },
      "triggeredBy": {
        "id": "user_123",
        "name": "John Doe"
      }
    }
  ]
}
```

#### Create Test Run

```http
POST /api/test-runs
```

Request body:
```json
{
  "projectId": "proj_123",
  "environmentId": "env_789",
  "testSuiteId": "suite_456",
  "testType": "all"
}
```

Test types: `all`, `health`, `integration`, `api`, `e2e`

Response: `201 Created`
```json
{
  "testRun": {
    "id": "run_456",
    "status": "PENDING",
    "environment": {...},
    "testSuite": {...}
  }
}
```

### CLI Validation

#### Validate Token

```http
POST /api/cli/validate
```

Headers:
```http
Authorization: Bearer <api-token>
```

Response:
```json
{
  "valid": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "keyName": "My CLI Key"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [...] // Optional validation errors
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

API requests are rate-limited based on your plan:

| Plan | Requests/minute |
|------|-----------------|
| Free | 60 |
| Pro | 300 |
| Enterprise | Unlimited |

Rate limit headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1704067200
```

## Webhooks

Configure webhooks to receive notifications about test runs:

```json
{
  "event": "test_run.completed",
  "data": {
    "testRunId": "run_456",
    "projectId": "proj_123",
    "status": "PASSED",
    "summary": {
      "total": 10,
      "passed": 10,
      "failed": 0
    }
  }
}
```

Webhook events:
- `test_run.started`
- `test_run.completed`
- `test_run.failed`
- `service.health_changed`
