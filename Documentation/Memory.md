# Memory.md — Iteration Log

Purpose: this file is the continuity thread across every AI session/iteration on this project. Update it at the END of every session, no exceptions (see Rules.md #4). Read it at the START of every session, before touching code.

Each entry should be quick to write and quick to scan — not a full changelog, just enough for the next session (AI or human) to pick up context instantly.

## Entry format
```
### [YYYY-MM-DD] — Phase X — <one-line summary>
- What changed:
- Why:
- Assumptions made / open questions:
- What's broken or incomplete:
- Next up:
```

## Log

### [Project start] — Phase 0 — Docs created
- What changed: Created PRD.md, Architecture.md, Design.md, Rules.md, Phases.md, Prompts.md, Memory.md.
- Why: Establish shared spec before any code is written.
- Assumptions made / open questions: Faculty-quality data source not finalized (Architecture.md §6); refresh cadence for data pipeline not finalized (Architecture.md §7); frontend framework choice (TanStack Start vs plain Vite+React) left open in Architecture.md §3.
- What's broken or incomplete: Nothing built yet.
- Next up: Phase 1 — data pipeline.

### [2026-08-29] — Phase 0 — Project Skeleton & Prisma Schema Setup
- What changed:
  - Initialized monorepo with npm workspaces (`client`, `server`).
  - Set up React + TypeScript + Vite + Tailwind CSS frontend with color tokens (`paper`, `ink`, `surgical`, `marigold`, `rank-red`, `line`) and typography (`Fraunces`, `Inter`, `IBM Plex Mono`) defined in Design.md.
  - Set up Node.js + Express + TypeScript backend with API routes (`GET /colleges`, `/health`) and Prisma client integration.
  - Defined the `College` model in `prisma/schema.prisma` matching Architecture.md §4 exactly with PostgreSQL provider.
  - Generated Prisma client and verified TypeScript build pipeline across client and server.
- Why: Establish Phase 0 foundation matching the stack in Architecture.md and design tokens in Design.md.
- Assumptions made / open questions:
  - Used Vite + React SPA architecture (per Architecture.md §3) for minimal overhead.
  - Primary key `id` defined as `String @id @default(cuid())`; no extra or invented fields added beyond the 20 attributes in Architecture.md §4.
- What's broken or incomplete: Database is not yet populated (awaiting Phase 1 ETL scripts and seed data).
- Next up: Phase 1 — Data pipeline (ETL scripts for MCC, NMC, NIRF, and Google Places).
