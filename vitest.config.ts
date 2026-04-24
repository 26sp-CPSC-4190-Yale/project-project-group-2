import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
    env: {
      TZ: "UTC",
      JWT_SECRET: "test-secret-please-do-not-use-in-production",
      NODE_ENV: "test",
      GOOGLE_CLIENT_ID: "test-google-client-id",
      GOOGLE_CLIENT_SECRET: "test-google-client-secret",
      GOOGLE_REDIRECT_URI: "http://localhost:4000/api/auth/google/callback",
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      SUPABASE_SERVICE_ROLE_KEY: "test-supabase-service-role-key",
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.module.css",
        "src/app/layout.tsx",
        "src/app/globals.css",
      ],
      reporter: ["text", "html"],
    },
  },
});
