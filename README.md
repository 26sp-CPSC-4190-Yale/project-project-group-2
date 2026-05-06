# Planar

Planar is a calendar and scheduling app built with Next.js. Users sign in with Google, manage calendars, groups, tasks, and events, share calendars or events with other users, upload PDF schedules, and use OpenAI models to extract dates from PDFs or propose calendar changes/additions through a chat on the homepage.

## Features

- Google OAuth login with signed session cookies.
- Calendar, group, event, and task CRUD backed by Prisma and Supabase Postgres.
- Event and calendar invitations, including accepted shared events.
- File upload, PDF preview, and signed Supabase Storage access.
- AI PDF extraction that converts schedule-like PDFs into event/task drafts.
- AI calendar chat that proposes events or tasks for confirmation before saving.
- Unit, component, API, and browser smoke tests with Vitest, MSW, Testing Library, and Playwright.

## Tech Stack

- Next.js App Router, React, TypeScript, and CSS modules.
- Prisma 7 with the PostgreSQL adapter.
- Supabase Postgres and Supabase Storage with the user uploaded PDF file bucket.
- Google OAuth, JWT session cookies, and `jose`.
- OpenAI Responses API structured JSON output in strict mode with custom tools.
- Vitest and Playwright for tests.

## Getting Started

### Prerequisites

- Node.js and npm.
- Access to a Supabase project with a Postgres database and a `user-files` storage bucket.
- Google OAuth client credentials.
- An OpenAI API key for the AI chat and PDF extraction routes.

On macOS, the repository includes a convenience script that installs Homebrew, Node, Git, project dependencies, and generates the Prisma client:

```bash
./macos_install.sh
```

If you already have Node and Git installed, the normal setup is:

```bash
npm install
npx prisma generate
```

### Environment

Create a `.env` file in the project root.

Required variables:

```bash
DATABASE_URL="postgresql://..."

NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"
# For HTTPS:
# GOOGLE_REDIRECT_URI="https://localhost:4000/api/auth/google/callback"

JWT_SECRET="..."

OPENAI_API_KEY="..."
# Optional model overrides:
OPENAI_CHAT_MODEL="..."
OPENAI_EXTRACT_MODEL="..."
```

### Run The App

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000). The development server runs on port `4000`.

For local HTTPS:

```bash
npm run dev:https
```

Ensure the Google OAuth redirect URI in your environment variable match the dev server option you have chosen.

## Database And Storage

The Prisma schema lives in `prisma/schema.prisma`. It defines users, calendars, groups, events, tasks, uploaded files, invitations, calendar invitations, and shared events.

Generate the Prisma client after schema changes:

```bash
npx prisma generate
```

Push schema changes to the configured database:

```bash
npx prisma db push
```

Uploaded PDFs are stored in the Supabase Storage bucket named `user-files`. The app stores file metadata in Postgres and generates short-lived signed URLs when previewing PDFs.

## Scripts

```bash
npm run dev            # Start Next.js on port 4000
npm run dev:https      # Start Next.js on port 4000 with local HTTPS
npm run build          # Build the production app
npm run start          # Start the production server
npm run lint           # Run ESLint
npm run test           # Run Vitest once
npm run test:watch     # Run Vitest in watch mode
npm run test:coverage  # Run Vitest with coverage
npm run test:e2e       # Run Playwright end-to-end tests
```

## Testing

Vitest tests live under `tests/**/*.test.{ts,tsx}`. The setup file mocks Prisma, authentication, and Supabase where appropriate, and MSW handles component-level network calls.

```bash
npm run test
```

Playwright tests live under `tests/e2e`. The Playwright config starts `npm run dev` on port `4000` and reuses an existing server when available.

```bash
npm run test:e2e
```

E2E tests use the development-only `/api/test/login` endpoint to create a real session without going through Google OAuth. That endpoint returns `404` when `NODE_ENV` is `production`.

## Project Layout

```text
src/app/                 Next.js pages (slim wrappers purely for routing) and API routes
src/components/          UI components grouped by feature scope and function
src/hooks/               Shared React hooks
src/lib/                 Prisma, auth, API, Supabase, OpenAI, and formatting helpers
src/types/               Shared API and AI request/response types
prisma/schema.prisma     Database schema
tests/                   Vitest, MSW, Testing Library, and Playwright tests
public/                  Images/icons
```

## Helpful Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)

