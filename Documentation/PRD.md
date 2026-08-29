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

## Phase 4 — Shortlist + PDF export
- Shortlist state as an **ordered array**, not a set (Architecture.md §5b), plus an `orderLocked` boolean (default `true`) — add/remove/reorder must all operate on that array directly.
- Shortlist UI: individual add/remove (the "stamp" interaction from Design.md) AND a visible **"add all filtered/sorted" bulk action** that appends every currently-visible college in on-screen order, skipping duplicates — this is the primary path for building a full counselling priority list (PRD.md §4).
- **Lock/unfreeze toggle** (Design.md): while locked (default), shortlist order is stable regardless of filter/rank changes elsewhere. When unfrozen, the shortlist order live-recomputes to track the currently active sort/rank criteria — reordering only, never adding/removing colleges. Re-locking snapshots the current live order as fixed.
- Drag-to-reorder (with up/down button fallback for mobile touch) in the shortlist panel while locked, so the user can hand-tune priority after a bulk add.
- Shortlist panel UI: numbered, ordered list, visually distinct per Design.md.
- PDF export that reads the shortlist array directly in its current order — no separate sort/compute step — and matches shortlist panel styling (Design.md).
- **Shipped as:** `ShortlistPanel.tsx` (Move Up/Down buttons for manual reorder), `Stamp.tsx`, `pdfExport.ts` (see Memory.md's Phase 4 entry). No "add all filtered" bulk action and no lock/unfreeze toggle shipped yet — see Phase 4.5.

## Phase 4.5 — Catch-up (only if Phase 3/4 were already built before table view / bulk-add / unfreeze were added to the docs)
- If Phase 3 shipped without the table view toggle, or Phase 4 shipped without the "add all filtered" bulk action and the lock/unfreeze toggle, retrofit them now rather than treating Phase 3/4 above as done. See Prompts.md's Phase 4.5 prompt for the exact scope, tailored to the real file names above (`CollegeCard.tsx`, `FilterControls.tsx`, `MobileBottomSheet.tsx`, `ActiveFilterChips.tsx`, `useCollegeFilter.ts`, `ShortlistPanel.tsx`, `Stamp.tsx`, `pdfExport.ts`).
- Skip entirely if Phase 3/4 were built fresh from the current Phase 3/4 descriptions above — they already include this work.

## Phase 4.6 — Fix: PDF export switches from a full-detail mirror to a compact code/order table
- Run only if Phase 4 (or Phase 4.5) shipped a PDF export that mirrors the shortlist panel's full card detail (beds, rating, distance, fees, NIRF rank). Counselling staff read the exported document to key `college_code` against priority order — they don't need the full stat set there, only on-screen. Skip if the PDF is already this compact table.
- Rework the export (Design.md, PRD.md §5) to a 4-column table: priority order number, `college_code` (primary column, prominent, mono), college name, city. Drop all other fields from the export. For the 7/69 colleges with no `college_code` (Architecture.md §6), show the college name in that column instead of a blank/placeholder.
- Keep the official header and provenance footnote — only the per-college detail columns change.
- Order still comes directly from the shortlist array, regardless of lock state — no separate sort step (Architecture.md §5b, Rules.md #18). Update both the jsPDF/html2canvas download and the native browser print styles so neither is left showing the old layout.
- See Prompts.md's Phase 4.6 prompt for the exact scope against the real file (`pdfExport.ts`).

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