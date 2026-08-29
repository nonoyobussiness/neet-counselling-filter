# Prompts.md — AI Prompts per Phase

General instruction to prepend to every session, regardless of phase:

> Before doing anything else, read Memory.md to see what's already been done and what's in progress. Read Rules.md and follow it throughout. When you finish this session's work, update Memory.md with a new entry per its format, before ending the session.

---

## Phase 0 — Foundations
```
Read PRD.md, Architecture.md, Design.md, and Rules.md in full.
Set up the project skeleton per Architecture.md's stack section: React.js, TypeScript,
Tailwind, Prisma + Postgres. Create the College model in prisma/schema.prisma exactly matching
Architecture.md §4 — don't invent extra fields not listed there without flagging it to me first.
When done, update Memory.md with what was set up and any deviations from Architecture.md, and why.
```

## Phase 1 — Data pipeline
```
Read Architecture.md §4-7 and Rules.md §8-10 before writing any data code.
Build a script that pulls [MCC seat matrix / NMC college list / NIRF rankings] and writes into the
College table, reconciling names across sources using the aliases field. Every record must be
timestamped with source_updated_at per Rules.md #9 — do not fabricate or estimate any field.
Flag any college you can't confidently reconcile across sources instead of guessing.
When done, update Memory.md: what data is now in the DB, coverage gaps, and any name-reconciliation
assumptions you made (per Rules.md #16).
```

## Phase 2 — Backend API
```
Read Architecture.md's API section and Rules.md #11-13 (TypeScript, stateless, no server-side
filtering logic beyond what's specified) before writing endpoints.
Build GET /colleges [and POST /rank if we decided against fully client-side ranking — check
Architecture.md §8 for the current decision]. Include basic validation and error handling.
When done, update Memory.md with what endpoints exist, their contracts, and anything unresolved.
```

## Phase 3 — Browse + filter UI
```
Read Design.md in full before writing any component — use the exact color tokens, type roles, and
the hall-ticket-stub card pattern described there. Do not introduce new colors or fonts.
Build the college list view and filter rail per PRD.md §5 (all seven filter criteria) and
Architecture.md §5 (live client-side ranking based on user-selected weights, not a fixed order).
Distance filter should geocode the user's entered city and compute distance per Architecture.md §5.
Mark faculty-quality and hostel/infra filters as lower-confidence in the UI per Rules.md #10.
When done, update Memory.md with what's built, any Design.md deviations and why, and open UI issues.
```

## Phase 4 — Shortlist + PDF export
```
Read Design.md's "signature element" and layout sections again before building this — the shortlist
panel and the stamp interaction are the one place we spend visual flourish; keep everything else quiet
per Design.md's restraint note.
Build shortlist add/remove with the stamp animation (respecting prefers-reduced-motion), the shortlist
panel UI, and PDF export that visually mirrors the shortlist panel per Design.md.
When done, update Memory.md with what's built and any open issues with PDF rendering/fonts.
```

## Phase 5 — Polish & responsiveness
```
Read Design.md's accessibility/quality-floor section. Do a full pass: mobile responsiveness down to
small viewports, WCAG AA contrast check against the defined palette, visible focus states using the
surgical token, reduced-motion behavior, and empty/error state copy written in the interface's voice
(plain, specific, no filler) per the writing guidance implicitly carried from Design.md's tone.
When done, update Memory.md with what was fixed and anything deferred.
```

## Phase 6 — Test & ship
```
Before deployment, re-read PRD.md §8-9 (success criteria and open questions) and confirm each is
addressed or explicitly deferred. Deploy per the hosting choice in Architecture.md §3.
When done, update Memory.md with the deployment outcome, any last-minute fixes, and a final note on
which PRD open questions remain unresolved post-launch.
```

## Phase 7 — Post-launch / v2 ideas
```
Read PRD.md's non-goals and Phases.md's Phase 7 list before proposing any new feature — confirm it's
actually intended as v2 scope, not a v1 gap that should have been caught earlier.
When done, update Memory.md with what was scoped for v2 and why it wasn't v1.
```
