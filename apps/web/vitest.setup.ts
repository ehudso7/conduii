import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk - matches @clerk/nextjs v4.29.x API
vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn(() => ({
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    getToken: vi.fn().mockResolvedValue(null),
    has: vi.fn().mockReturnValue(false),
  })),
  currentUser: vi.fn(() => null),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    sessionId: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    getToken: vi.fn().mockResolvedValue(null),
    has: vi.fn().mockReturnValue(false),
    signOut: vi.fn().mockResolvedValue(undefined),
  }),
  useUser: () => ({
    isLoaded: true,
    user: null,
  }),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
