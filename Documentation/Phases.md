# Phases.md — Build Phases

## Phase 0 — Foundations
- Finalize PRD.md, Architecture.md, Design.md (this session's output — revisit if anything shifts).
- Set up repo, TypeScript config, Tailwind, hosting account (Vercel/Netlify). No backend/DB setup — see Architecture.md §3.
- Define the `College` shape as a TypeScript type matching Architecture.md §4 exactly — this is a static type, not a Prisma/DB schema.

## Phase 1 — Data (done as a one-time hand-filled CSV, not a pipeline)
- `colleges_enriched.csv` — 69 colleges, columns per Architecture.md §4: name, college_code, year_established, fee_category_a, fee_management_quota, fee_nri_quota, city, type, lat/lng, nirf_rank/score, beds, google_rating/review_count, data_notes.
- `college_code`/`year_established` matched from a merit-rank reference list — 62/69 colleges have both, 7/69 are `null` (not on that list; see Architecture.md §6). Display fields only, not filters.
- `fee_category_a`/`fee_management_quota`/`fee_nri_quota` sourced from a third-party aggregator's copy of the KNRUHS fee structure — 64/69 colleges have at least the government-quota fee, 5/69 are `null` (see Architecture.md §6). Usable as a real filter, but surface the "verify against official KNRUHS brochure" caveat from `data_notes` in the UI.
- No scraper, no ETL script, no scheduled job — see Architecture.md §6 for what was actually searchable (NIRF: 1 college officially ranked; beds: 3 colleges officially sourced, 66 more filled from an unverified user-supplied report and flagged as such; type + coordinates: all 69) versus what stayed `null` by necessity (patient count, faculty, seat matrix).
- Convert the CSV to `colleges.json` once and bundle it with the frontend build — this is the entire "data pipeline."
- If you want more coverage later (e.g. beds for more colleges), it's a matter of adding rows/columns to the CSV by hand and re-converting — not re-running a pipeline.

## Phase 2 — Frontend data loading
- Load `colleges.json` once on page mount.
- Compute the live ranking score and haversine distance entirely in the browser (Architecture.md §5) — no backend, no `/rank` endpoint.
- Basic validation on the user's filter/weight inputs.

## Phase 3 — Core frontend: browse + filter/sort/rank
- College list UI using Design.md card pattern, plus a **table view toggle** (Design.md, Architecture.md §5c) rendering the same filtered/sorted/ranked array in a denser, sortable-column table — column headers reuse the exact same sort logic as the filter rail, not a second implementation. Default to card view.
- Filter/sort/rank UI (mobile: bottom sheet as the default target, per Design.md) covering the full v1 criteria set (PRD.md §5): **rating, review count, city, distance-from-home, bed count, fees, and type** are real filter/sort/rank criteria with usable coverage — build these as the primary interactions of the app. Bed count (69/69 coverage, but only 3/69 officially sourced — Architecture.md §6/§6b) ships as a full filter/sort/rank criterion, not just card info — every row using the unverified estimate must carry its low-confidence badge in every view that surfaces it (card, table cell, filter chip, sort results, combined-rank results). Fees carry a "verify against the official KNRUHS brochure" caveat (64/69 coverage). Type (govt/private/deemed) is a simple full-coverage categorical filter. NIRF rank is sparse (1/69) — show as card info only, not a filter. Patient count, faculty quality, hostel/infra have no data at all — drop them from PRD.md §5's filter list for v1, or keep as a manual/qualitative note field if you still want the column to exist.
- Support combined weighted ranking across any subset of the above (Architecture.md §5) — e.g. "rank by bed count + distance" — not just single-field sorting, using the same generic engine for both.
- Distance filter: use each college's hardcoded lat/lng (Architecture.md §5) and the same city list for the user's home city — no live geocoding.
- **Shipped as:** `CollegeCard.tsx`, `FilterControls.tsx`, `MobileBottomSheet.tsx`, `ActiveFilterChips.tsx`, `useCollegeFilter.ts` (see Memory.md's Phase 3 entry). No table view shipped yet — see Phase 4.5.

## Phase 4 — PDF export directly from live browse view
- The separate shortlist concept was removed: the PDF export always reflects whatever colleges are currently visible under the active filter/sort/rank in the browse view, in that exact on-screen order.
- PDF export reads directly from the live `filteredRankedColleges` array with no separate sort step or independent shortlist array.
- Compact 4-column submission table format: priority order number (`01`, `02`...), `college_code` (primary column; fallback to full college name if null), college name, city.
- Official header ("KNRUHS · NEET UG CHOICE SELECTION FORM", "Telangana MBBS Priority List") and data provenance footnote preserved.
- Export triggers (Download PDF and Print) live alongside browse controls in the header, meta bar, and mobile action triggers.
- **Shipped as:** `src/utils/pdfExport.ts`, `src/App.tsx`, `src/index.css`. Shortlist panels, stamp animations, and manual shortlist storage have been removed.

## Phase 5 — Polish & responsiveness
- Full mobile responsiveness pass, including the table view's horizontal-scroll/sticky-column behavior and the shortlist's lock/unfreeze toggle.
- Accessibility pass (contrast, focus states, reduced-motion — including the batched stamp animation for bulk shortlist adds) per Design.md quality floor.
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