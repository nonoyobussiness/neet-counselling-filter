# Phases.md — Build Phases

## Phase 0 — Foundations
- Finalize PRD.md, Architecture.md, Design.md (this session's output — revisit if anything shifts).
- Set up repo, TypeScript config, Tailwind, Prisma + Postgres, hosting accounts.
- Define the `College` schema in Prisma (Architecture.md §4).

## Phase 1 — Data pipeline (this is the riskiest phase — do it first)
- Write scraper/ETL scripts for: MCC seat matrix, NMC college list, NIRF rankings.
- Reconcile college names across sources into one canonical list (aliases field).
- Integrate Google Places API for ratings + place_id.
- Manually collect/verify beds, patient count, faculty signal, hostel/infra signal for a first batch of colleges (don't wait for 100% coverage before moving on).
- Seed the database. Output: a real, populated `colleges` table you can query.

## Phase 2 — Backend API
- `GET /colleges` — return full dataset (or paginated if payload gets large).
- `POST /rank` (or compute entirely client-side, per Architecture.md §8 — decide here which).
- Basic input validation, error handling per Rules.md.

## Phase 3 — Core frontend: browse + filter
- College list UI using Design.md card pattern.
- Filter rail (beds, reviews, patient count, city, infra, distance, faculty) with live client-side re-sort.
- Distance filter: geocode user-entered home city, compute haversine distance per college.

## Phase 4 — Shortlist + PDF export
- Shortlist state (add/remove colleges, the "stamp" interaction from Design.md).
- Shortlist panel UI.
- PDF export matching shortlist panel styling (Design.md).

## Phase 5 — Polish & responsiveness
- Full mobile responsiveness pass.
- Accessibility pass (contrast, focus states, reduced-motion) per Design.md quality floor.
- Empty/error states written in-product per interface voice (no logins to worry about, but handle "no results match your filters" etc. well).

## Phase 6 — Test & ship
- Test with a handful of real users (sister + a few others) doing an actual mock choice-filling run.
- Fix based on real usage friction, not assumptions.
- Deploy.

## Phase 7 — Post-launch (v2 candidates, not v1 scope)
- Rank/cutoff predictor.
- Broader faculty-quality data source if one becomes available.
- Possibly account-free "save my shortlist via link" (no login, but persistent shareable state).

Note: update Memory.md at the end of every session regardless of which phase you're in — phases are a guide for sequencing, not a substitute for the iteration log.
