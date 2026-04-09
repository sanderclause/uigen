# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup      # Install deps, generate Prisma client, run migrations
npm run dev        # Start dev server at http://localhost:3000 (uses Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npm test           # Run all tests with Vitest
npx vitest run src/path/to/__tests__/file.test.tsx  # Run a single test file
npm run db:reset   # Wipe and re-migrate the SQLite database
```

## Architecture

This is a Next.js 15 App Router app where users chat with Claude to generate React components that render in a live preview.

**Request flow:**
1. User types a prompt in `ChatInterface` → sent to `POST /api/chat`
2. The API route streams a response using Vercel AI SDK's `streamText` with two tools: `str_replace_editor` (create/edit files) and `file_manager` (rename/delete)
3. Tool calls are processed client-side in `FileSystemContext.handleToolCall`, which mutates the in-memory `VirtualFileSystem`
4. `PreviewFrame` renders the virtual files live using Babel standalone to transpile JSX in-browser

**Virtual file system** (`src/lib/file-system.ts`): All generated code lives in memory only — nothing is written to disk. `VirtualFileSystem` is a class with a `Map<string, FileNode>` store. It serializes to/from plain objects for API transport and database storage.

**AI provider** (`src/lib/provider.ts`): If `ANTHROPIC_API_KEY` is set, uses `claude-haiku-4-5` via `@ai-sdk/anthropic`. Otherwise falls back to `MockLanguageModel`, which returns static hardcoded components (counter, form, or card based on keywords in the prompt).

**Auth** (`src/lib/auth.ts`): JWT-based auth stored in an httpOnly cookie (`auth-token`). Uses `jose` for signing. Middleware in `src/middleware.ts` protects routes. Anonymous users can generate components but projects are only saved for authenticated users.

**Persistence**: Authenticated projects are stored in SQLite via Prisma. The `Project` model stores the full message history and serialized file system as JSON strings. Schema is in `prisma/schema.prisma`; generated client outputs to `src/generated/prisma/`.

**State management**: Two React contexts in `src/lib/contexts/`:
- `FileSystemContext` — owns the `VirtualFileSystem` instance and exposes file CRUD + `handleToolCall`
- `ChatContext` — owns message history and streaming state

**Tests** (`vitest`): Test files live in `__tests__` folders colocated with the code they test. Uses `@testing-library/react` and `jsdom`.
