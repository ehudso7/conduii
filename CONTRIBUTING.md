# Contributing to Conduii

Thank you for your interest in contributing to Conduii! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 10.2.0 or higher
- Git

### Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/conduii.git
cd conduii
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your values
```

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Start development server:
```bash
npm run dev
```

## Project Structure

```text
conduii/
├── apps/
│   └── web/           # Next.js web application
├── packages/
│   ├── core/          # Core testing engine
│   ├── cli/           # Command-line interface
│   └── github-action/ # GitHub Action
├── docs/              # Documentation
└── package.json       # Root workspace config
```

## Development Workflow

### Branching

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes

3. Run tests:
```bash
npm run test
```

4. Run linting:
```bash
npm run lint
```

5. Run type checking:
```bash
npm run typecheck
```

6. Commit your changes:
```bash
git commit -m "feat: add your feature description"
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```text
feat: add Stripe webhook handler
fix: resolve authentication error on refresh
docs: update CLI documentation
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch
```

### Writing Tests

- Place tests in `__tests__` directories or with `.test.ts` suffix
- Use descriptive test names
- Follow the existing testing patterns

Example:
```typescript
import { describe, it, expect } from "vitest";

describe("MyFeature", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

## Code Style

- Use TypeScript
- Follow ESLint rules
- Format with Prettier
- Use meaningful variable names
- Add comments for complex logic

### Formatting

```bash
npm run format
```

## Pull Requests

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG if applicable
5. Request review from maintainers

### PR Title Format

Follow the commit message format:
```text
feat: add new authentication method
fix: resolve database connection issue
```

### PR Description

Include:
- What changes were made
- Why the changes were made
- How to test the changes
- Screenshots (if UI changes)

## Documentation

- Keep README.md up to date
- Document new features in `/docs`
- Add JSDoc comments to exported functions
- Update API documentation for endpoint changes

## Issues

### Reporting Bugs

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case / motivation
- Proposed implementation (optional)

## Package Development

### Core Package (@conduii/core)

```bash
cd packages/core
npm run dev      # Watch mode
npm run build    # Build
npm run test     # Run tests
```

### CLI Package (@conduii/cli)

```bash
cd packages/cli
npm run dev      # Watch mode
npm run build    # Build
npm run start    # Run CLI
```

### Web App

```bash
cd apps/web
npm run dev      # Development server
npm run build    # Production build
```

## Release Process

Releases are handled by maintainers:

1. Update version in package.json files
2. Update CHANGELOG.md
3. Create a git tag
4. Push to trigger CI/CD

## Getting Help

- Check existing [issues](https://github.com/conduii/conduii/issues)
- Join our [Discord](https://discord.gg/conduii)
- Read the [documentation](https://conduii.com/docs)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
