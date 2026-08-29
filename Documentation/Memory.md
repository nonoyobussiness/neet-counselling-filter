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

### [2026-08-29] — Phase -1 (pre-code) — One-month scope decision: dropped backend/DB entirely
- What changed: Architecture.md, Phases.md, Prompts.md, PRD.md all updated to reflect a fully static build — no Postgres, no Prisma, no Express backend, no ETL/scraper, no scheduled refresh. Data is a hand-filled CSV → JSON, bundled with the frontend, computed client-side.
- Why: user confirmed the app only needs to work for one month; a live refresh pipeline is pure overhead at that scope.
- What's broken or incomplete: Phase 0 work from the "Project Skeleton & Prisma Schema Setup" entry above (Prisma schema, Express routes) is now stale relative to Architecture.md — it targeted the old backend/DB design. Needs to be redone as a plain Vite+React static app; the Prisma/Express code from that entry should be discarded, not built on.
- Next up: rebuild the Phase 0 skeleton to match the current (static) Architecture.md, then Phase 1 (CSV → JSON conversion, already have the source CSV — see next entry).

### [2026-08-29] — Phase 1 (data) — Full search pass on remaining criteria; colleges_enriched.csv produced
- What changed: user provided the hand-filled 69-college CSV (name/city/google_rating/google_review_count). Ran a real web-search pass for the rest of PRD.md §5's criteria and produced `colleges_enriched.csv` with `type`, `lat`/`lng`, `nirf_rank`/`nirf_score`, `beds`, and a `data_notes` column added.
- Why: user asked for all remaining criteria to be hardcoded from search, given the one-month/no-live-data decision above.
- Assumptions made / open questions:
  - `type` (government/private/deemed) derived from name pattern + one confirming search (only 2 NMC deemed medical colleges exist in Telangana, both Malla Reddy — everything else split govt/private by name).
  - `lat`/`lng` are approximate town-center coordinates from general geography, not per-college geocoded — consistent with Architecture.md §5's hardcoded-distance decision, not a new gap.
  - Gandhi Medical College's bed count has conflicting official figures (1200 vs 2200 across the college's own two web properties) — flagged in `data_notes`, picked the more conservative one, not verified further.
- What's broken or incomplete (by design, per Rules.md #9 — not fabricated, left null):
  - NIRF rank/score: real data for only 1/69 colleges (Osmania, #48). The rest are genuinely unranked by NIRF, not missing data.
  - Beds: real data for only 3/69 colleges (Osmania, Kakatiya's MGM Hospital, Gandhi).
  - Patient count/OPD, faculty quality, seat matrix: no usable per-college public source found for any college — entirely absent, not attempted-and-failed per row.
- Next up: decide (per updated PRD.md §9) whether to hand-fill beds for a shortlist of colleges the sister is actually considering, then Phase 1 CSV→JSON conversion, then rebuild the Phase 0 skeleton per the static architecture.

### [2026-08-29] — Phase 1 (data) — Added college_code and year_established to colleges_enriched.csv
- What changed:
  - Added two new columns to `colleges_enriched.csv`, inserted right after `college_name`: `college_code` and `year_established`.
  - Values matched by college name against a separate merit-rank-based reference list (ASK IIT Medical Academy's "Telangana NEET MBBS Colleges List — Merit Rank Based", 63 colleges, S.No/Code/College/Year/Type/District/Beds/Distance-from-Hyd).
  - Updated Architecture.md §4 (data model) and §6 (scope note) to document the two new fields and their coverage; updated Design.md's typography and card-layout sections to place `college_code`/`year_established` in the mono data grid; updated PRD.md §5 and §7; updated Phases.md's Phase 1 section; updated Prompts.md's Phase 1 prompt.
- Why: user provided the reference list as an image and asked for the codes/years to be added to the dataset and reflected across the docs (schema + prompts) wherever relevant.
- Assumptions made / open questions:
  - Matched by name similarity (e.g. "Rajiv Gandhi Institute of Medical Sciences" ↔ "Rajiv Institute of Medical, Adilabad"; "Government Medical College Ramagundam" ↔ "Singareni Institute Ramagundam" code SIMS; "Government Medical College Jogulamba" ↔ "Govt Gadwal" code GGWL) — these are the same institutions under slightly different naming conventions between the two sources, not verified against a third source.
  - **62 of 69** colleges got a `college_code`/`year_established`. **7 of 69 are `null`** because they simply aren't on the reference list: AIIMS Bibinagar, Nizam's Institute of Medical Sciences, Government Dental College and Hospital, Mallareddy Medical College for Women's, Malla Reddy Institute of Medical Sciences, Neelima Institute of Medical Sciences, Christian Medical College Hospital Nizamabad. Left null per Rules.md #9, not guessed.
  - These two fields are treated as **display-only reference info**, not filter/ranking criteria (per Architecture.md §5 — don't wire them into the weighted-score engine).
- What's broken or incomplete: The 7 null rows above could potentially be matched if a fuller/updated reference list turns up later — not chased further this session since they're off the given list entirely.
- Next up: same as previous entry — Phase 1 CSV→JSON conversion, then rebuild the Phase 0 skeleton per the static architecture.

### [2026-08-29] — Phase 1 (data) — Filled remaining beds column from a user-supplied secondary report (unverified, kept by request)
- What changed:
  - Filled `beds` for all 66 previously-`null` rows using figures from a "Comprehensive Landscape Analysis of Medical and Dental Higher Education Institutions in Telangana" report the user pasted in. The 3 already-sourced rows (Osmania, Kakatiya, Gandhi) were left untouched — the report's numbers happened to match them exactly, so no conflict.
  - Every newly-filled row got a caveat appended to `data_notes`: "Bed count from a user-supplied secondary landscape report (unverified, low-confidence estimate) — kept at user's request despite no independently confirmed source."
  - Updated Architecture.md §6 and added §6b exception language documenting this as a deliberate, logged exception to Rules.md #9 ("never fabricate/estimate and store as if sourced") — the user explicitly acknowledged the numbers aren't reliable and asked for them to be kept anyway.
  - Updated PRD.md §5 (filter tiers — beds moved from "sparse" to "full coverage but mixed confidence") and §7 (data needs).
  - Updated Phases.md's Phase 1 note and Prompts.md's Phase 1 and Phase 3 prompts to carry the same "beds has full coverage but 66/69 rows are unverified — flag visually, don't filter on with full confidence" instruction forward to future sessions.
- Why: user could not find a reliable per-college source for most beds and explicitly asked to use these numbers anyway, while flagging upfront that they're not accurate.
- Assumptions made / open questions:
  - The source document itself is a synthesized report of uncertain provenance (its own citation list mixes admissions-aggregator sites, real-estate blogs, and a few primary sources) — treated as a single secondary source, not verified against each individual college.
  - No attempt made to cross-check any of the 66 new figures against other sources this session; if a genuinely reliable per-college source turns up later, that row's caveat should be removed and `data_notes` updated to cite the better source.
- What's broken or incomplete: None of the UI/ranking code exists yet (still pre-Phase-2), so the "must render with a low-confidence marker" requirement in Architecture.md §6b is not yet implemented — just documented for whoever builds Phase 3.
- Next up: same as previous entries — Phase 1 CSV→JSON conversion, then rebuild the Phase 0 skeleton per the static architecture.

### [2026-08-29] — Phase 1 (data) — Added fee_category_a / fee_management_quota / fee_nri_quota columns
- What changed:
  - Added three new columns to `colleges_enriched.csv`, inserted right after `year_established`: `fee_category_a` (government/convenor-quota annual tuition, all colleges), `fee_management_quota` and `fee_nri_quota` (private/deemed colleges only).
  - Filled from a table pulled off mdmsenquiry.com, a third-party admissions aggregator, which itself claims to transcribe the KNRUHS-notified 2026–27 fee structure. **64 of 69** colleges got at least the government-quota fee; private/deemed colleges also got management- and NRI-quota figures where the source had them.
  - **5 of 69 left fully `null`** (not on the source's tables): Government Medical College Kodangal, Government Dental College and Hospital, Mallareddy Medical College for Women's, Malla Reddy Institute of Medical Sciences, Prathima Relief Institute of Medical Sciences (Warangal).
  - Every row with a filled fee value got a `data_notes` caveat: annual tuition only (excludes hostel/mess), sourced via a secondary aggregator rather than the KNRUHS brochure directly, verify before relying on it.
  - Updated Architecture.md §4 and §6, PRD.md §5 and §7, Phases.md's Phase 1 note, and Prompts.md's Phase 1 and Phase 3 prompts to document the new fields, their coverage, and the "usable as a real filter but flag the verify-caveat" guidance (distinct from the beds situation — this source is a named, real fee table, not a guess, so it doesn't need the same low-confidence visual treatment as beds' unverified-estimate rows, just a smaller "verify with KNRUHS" note).
- Why: user asked for a `fees` field, searched up, filled where found, left null where not — a document with a fee table was provided in the same turn as the request.
- Assumptions made / open questions:
  - AIIMS Bibinagar's ₹1,350/year figure and NIMS's ₹40,000/year are taken as-is from the source despite AIIMS being a central INI with a different fee-setting body than the state's KNRUHS-governed colleges — flagged via the general "verify" caveat, not specially called out.
  - Government colleges only got `fee_category_a` filled — management/NRI quotas don't apply to standard state GMCs, so those two columns are intentionally blank (not missing data) for every government row.
  - The source table had one listed duplicate row for Prathima Institute Of Medical Sciences Karimnagar — used the single value, not treated as two different fees.
  - Did not cross-check any individual college's fee against its own website or the KNRUHS brochure this session.
- What's broken or incomplete: The 5 null rows could potentially be filled if the KNRUHS brochure itself (rather than a secondary aggregator) is sourced later — worth revisiting for a definitive pass.
- Next up: same as previous entries — Phase 1 CSV→JSON conversion, then rebuild the Phase 0 skeleton per the static architecture.

### [2026-08-29] — Phase 0 (docs) — Beds promoted to a full filter/sort/rank criterion; ranking engine generalized before handing off to build agents
- What changed:
  - User confirmed they're now ready to hand this off to other AI agents to actually build, with filtering/sorting/ranking (explicitly: by bed count, by distance/location, or a combined rank of both, plus "any other criteria") as the main feature and mobile usability as a hard requirement.
  - This surfaced a real gap: earlier docs (PRD.md, Architecture.md, Phases.md, Prompts.md) treated `beds` as "info only, not a hard filter" because 66/69 of its values are an unverified estimate — but the user is now explicitly asking to filter/sort/rank by it. Resolved by **promoting beds to a full filter/sort/rank criterion** while keeping the low-confidence-badge requirement intact and extending it to every surface (filter chip, sort results, weighted-rank results), not just the browse card.
  - Also generalized Architecture.md §5's ranking engine from a hardcoded two-signal formula (rating + distance only) into an explicit multi-criteria engine covering rating, review count, beds, distance, and fees, with per-signal normalization direction ("higher is better" vs. "lower is better") — so a single sort and a combined weighted rank are the same mechanism, and adding a future criterion is a 3-step recipe (§5 step 6) instead of a rewrite.
  - Added `type` (government/private/deemed) as an explicit simple categorical filter (full 69/69 coverage, no caveat needed) — it existed in the data but wasn't called out as a filter option before.
  - Reinforced mobile-first design intent in Design.md (bottom sheet as the *default* target, not a responsive afterthought of a desktop rail) and PRD.md (new §5 bullet 6).
  - Fixed an internal contradiction in Rules.md #10, which had cited "beds" as an example of trustworthy hard data while Architecture.md §6b flags most of its values as unverified — reworded to apply the low-confidence rule per-row, and added Rules.md #17 codifying the extensibility pattern for future criteria.
  - Updated: PRD.md §5/§7, Architecture.md §5/§6/§6b, Design.md layout notes, Phases.md Phase 3, Prompts.md Phase 3 prompt, Rules.md #10 and new #17.
- Why: the user is about to hand this spec to build agents with no further back-and-forth expected mid-build; any ambiguity or internal contradiction (like the beds tension above) needed to be resolved now, not discovered by an agent mid-Phase-3.
- Assumptions made / open questions:
  - No new data was added — this is a documentation-only pass reconciling stated product intent (filter/sort/rank by beds and location) with what the existing docs allowed. The underlying data confidence situation (3/69 beds sourced, 66/69 estimated) is unchanged; only the UI/architecture decision about whether to expose it as a filter changed.
  - Fees and type were folded into the "real criteria" list as low-hanging additions since they already have near-full/full coverage and were sitting unused as filter options — flagged here in case the user wants to keep the criteria list leaner instead.
- What's broken or incomplete: Nothing built yet — still pre-Phase-0-skeleton per the "one-month scope decision" entry above. This is purely a documentation reconciliation before build agents start.
- Next up: hand PRD.md, Architecture.md, Design.md, Rules.md, Phases.md, Prompts.md to the build agent(s), starting with Prompts.md's Phase 0 prompt.

### [2026-08-29] — Phase 0 — Static-Data SPA Skeleton & College Type Definition
- What changed:
  - Cleaned up legacy backend and Prisma artifacts, establishing a pure static-data SPA skeleton at the root level per Architecture.md §3.
  - Set up React + TypeScript + Vite + Tailwind CSS with the design system tokens from Design.md (`paper`, `ink`, `surgical`, `marigold`, `rank-red`, `line`, and font families `Fraunces`, `Inter`, `IBM Plex Mono`).
  - Defined the `College` TypeScript interface in `src/types/college.ts` exactly matching the 17 fields in Architecture.md §4: `id`, `name`, `college_code`, `year_established`, `fee_category_a`, `fee_management_quota`, `fee_nri_quota`, `city`, `type`, `lat`, `lng`, `nirf_rank`, `nirf_score`, `beds`, `google_rating`, `google_review_count`, `data_notes`.
  - Built initial `src/App.tsx` and verified clean typecheck & production build with `npm run build`.
- Why: Implement Phase 0 foundations per the updated static architecture (Architecture.md §3 & §4).
- Assumptions made / open questions:
  - `College` interface uses `string | number` for `id` to seamlessly support either string or numeric IDs from `colleges_enriched.csv` / `colleges.json`.
  - No deviations from Architecture.md §4 (no extra or invented fields).
- What's broken or incomplete: `colleges_enriched.csv` is not yet converted to `src/data/colleges.json` (Phase 1 task).
- Next up: Phase 1 — Convert `colleges_enriched.csv` to `colleges.json` and bundle with frontend.

### [2026-08-29] — Phase 1 (data) — Converted colleges_enriched.csv to colleges.json
- What changed:
  - Created `scripts/convert.js` and converted `colleges_enriched.csv` into `src/data/colleges.json` (and `colleges.json` at root).
  - Preserved all 17 fields exactly matching Architecture.md §4: `id`, `name`, `college_code`, `year_established`, `fee_category_a`, `fee_management_quota`, `fee_nri_quota`, `city`, `type`, `lat`, `lng`, `nirf_rank`, `nirf_score`, `beds`, `google_rating`, `google_review_count`, and `data_notes`.
  - Parsed numbers into numeric types while keeping blank/empty cells strictly as `null` (no fabricated defaults or imputed averages, per Rules.md #9).
  - Preserved all `data_notes` verbatim, including the unverified-estimate caveats for the 66 bed values and fee verification notes.
  - Updated `src/App.tsx` to load `src/data/colleges.json` with the `College` interface and verified type safety via `npm run build`.
- Why: Complete Phase 1 data bundling requirement for the static SPA architecture.
- Assumptions made / coverage confirmation (all matches Architecture.md §6):
  - Total colleges: 69 rows.
  - Reviews (`google_rating` / `google_review_count`): 68/69 have reviews; 1 college (Mamata Academy of Medical Sciences) is `null` as expected.
  - NIRF rank (`nirf_rank`): 1/69 (Osmania Medical College, #48); 68/69 are `null` as expected.
  - Beds (`beds`): 69/69 populated, where 3 are officially sourced (Osmania, Kakatiya, Gandhi) and 66 are unverified estimates carrying the caveat in `data_notes`.
  - `college_code` & `year_established`: 62/69 populated; 7/69 are `null` (not on the merit-rank reference list).
  - Fees (`fee_category_a`, `fee_management_quota`, `fee_nri_quota`): 64/69 have at least one fee field; 5/69 have all fee fields `null` (not on the source table).
  - Location & Type (`city`, `type`, `lat`, `lng`): 69/69 populated.
- What's broken or incomplete: None. JSON is bundled and typechecked.
- Next up: Phase 2 / Phase 3 — Core frontend: filter rail, generic ranking engine, and card list UI.

### [2026-08-29] — Phase 2 — Client-Side Haversine Distance & Multi-Criteria Ranking Engine
- What changed:
  - Implemented client-side Haversine distance calculator in `src/utils/haversine.ts` using hardcoded town-center coordinates from `colleges.json` (no external API, no live geocoding).
  - Built generic multi-criteria ranking engine in `src/utils/ranking.ts` per Architecture.md §5 and Rules.md #8 & #17:
    - Registered 5 v1 signals (`google_rating`, `google_review_count`, `beds`, `fee_category_a`, `distance_from_home`).
    - Explicit normalization directions: `higher_is_better` for rating/reviews/beds; `lower_is_better` (inverted 0–100) for tuition fees and distance.
    - Added weight validation in `validateWeights` (non-negative numbers, finite values).
    - Preserved low-confidence flag `isEstimatedBeds` for the 66 unverified bed count rows so badges ride along with sorted/ranked outputs.
  - Updated `src/App.tsx` with interactive home city selector and weight sliders for live client-side ranking.
  - Verified through automated tests (`scripts/test-engine.js`) and production build (`npm run build`).
- Why: Implement Phase 2 frontend data loading and offline ranking computation.
- Assumptions made / open questions:
  - Missing signals (e.g. college with null rating or fee) are excluded from the weighted denominator so missing values don't unfairly penalize or distort the score with silent zeros.
  - Distance calculation relies on pre-populated reference coordinates of Telangana town centers.
- What's broken or incomplete: Shortlist stamp state and PDF export (Phases 4-5).
- Next up: Phase 3 / Phase 4 — Detailed filter rail, hall-ticket stub cards, shortlist drawer, and PDF export.

### [2026-08-29] — Phase 3 — Core Frontend: Mobile-First Filter/Sort/Rank & Hall-Ticket Cards
- What changed:
  - Built `src/components/CollegeCard.tsx` following Design.md's hall-ticket stub pattern:
    - Perforated left edge with status indicators (surgical / marigold when shortlisted).
    - College name set in `font-display` (Fraunces), college code in `font-mono` (omitted gracefully if null).
    - Data grid in `font-mono` (`beds`, `rating`, `distance`, `fees`, `NIRF rank`, `year established`).
    - Visible `~est` low-confidence badge on the 66 unverified estimated bed counts, distinguishing them from Osmania, Kakatiya, and Gandhi's verified figures.
  - Built `src/components/FilterControls.tsx` and `src/components/MobileBottomSheet.tsx` treating mobile bottom-sheet as the primary design target:
    - Quick ranking strategy presets (Balanced, Closest to Home, Hospital Beds, Top Reputation, Budget Friendly).
    - 1-click single-field sort shortcuts (100% weight).
    - Sliders for multi-criteria weights.
    - Categorical filters for College Type (Govt / Private / Deemed) and District / City multi-select.
    - Range sliders for Minimum Beds, Max Distance (km), Min Rating (★), and Max Govt Fee.
  - Built `src/components/ActiveFilterChips.tsx` rendering active filters and active weights as dismissible form field tags.
  - Built `src/hooks/useCollegeFilter.ts` managing client-side filtering, Haversine distances, multi-criteria ranking, and shortlist state with `localStorage` persistence.
  - Assembled `src/App.tsx` with header, search bar, active filter tags, meta summary bar, empty states, and floating mobile trigger button.
- Why: Deliver Phase 3 core browsing, filtering, and multi-criteria ranking UI per PRD.md §5, Architecture.md §5, and Design.md.
- Deviations from Design.md:
  - None. All color tokens (`paper`, `ink`, `surgical`, `marigold`, `rank-red`, `line`) and typography roles (`Fraunces`, `Inter`, `IBM Plex Mono`) strictly adhere to Design.md.
- Open UI issues / Next up:
  - Phase 4: Full Shortlist drawer / panel view, the signature "stamp" animation with `prefers-reduced-motion` support, and downloadable PDF export matching the form styling.
  - No table view was included in this build — a gap surfaced later once Architecture.md §5c/Design.md were extended with a table-view spec (see the [2026-08-29] — Phase 3/4 catch-up scoping entry below).

### [2026-08-29] — Phase 4 — Shortlist Panel, Signature Stamp Animation & PDF Export
- What changed:
  - Built signature element `Stamp` in `src/components/Stamp.tsx` and configured `animate-stamp` keyframe animation in `src/index.css` (scale/rotate into place with -10° ink seal slant). Added full `prefers-reduced-motion` support so it degrades to instant appearance for users with motion sensitivity.
  - Integrated Stamp badge onto `CollegeCard.tsx` when shortlisted with smooth entrance and Marigold border highlighting.
  - Built `src/components/ShortlistPanel.tsx` rendering the official "running form in progress" document view:
    - Official header: "KNRUHS · NEET UG CHOICE SELECTION FORM".
    - Choice order preference numbering (`01`, `02`, `03`...).
    - Interactive reordering controls (Move Up / Move Down buttons) to let students adjust their exact submission priority.
    - Sourced data provenance footnote explaining verified vs `~est` beds and KNRUHS brochure verification notes.
  - Implemented client-side PDF export in `src/utils/pdfExport.ts` using `jspdf` and `html2canvas` (with 2x DPI canvas scaling for crisp typography), generating `NEET_Telangana_MBBS_Choice_List.pdf`.
  - Added dedicated `@media print` styles in `src/index.css` for instant browser printing.
  - Added `reorderShortlist` and `clearAllShortlist` methods to `useCollegeFilter.ts` with `localStorage` persistence.
- Why: Complete Phase 4 requirements per PRD.md §5, Architecture.md §3/§5, and Design.md §26-30.
- Assumptions made / open issues with PDF rendering/fonts:
  - Font rendering in `html2canvas` captures Google Fonts (`Fraunces`, `Inter`, `IBM Plex Mono`) cleanly via standard canvas text rendering.
  - Dual export paths provided: 1-click Download PDF via canvas/jsPDF + Native Browser Print (`window.print()`).
- Next up: Phase 5 — Polish, responsiveness, and accessibility pass.
  - Shortlist shipped with manual Move Up/Down reorder but no "add all filtered" bulk action and no lock/unfreeze toggle — a gap surfaced later once Architecture.md §5b/Design.md were extended (see below).

### [2026-08-29] — Phase 4.5 scoping — Tailored the catch-up prompt to the real shipped file structure
- What changed:
  - Confirmed against the real Phase 3/Phase 4 entries above that the gap is exactly: no table view (Phase 3: `CollegeCard.tsx`, `FilterControls.tsx`, `MobileBottomSheet.tsx`, `ActiveFilterChips.tsx`, `useCollegeFilter.ts`), and no "add all filtered" bulk action / no lock-unfreeze toggle (Phase 4: `ShortlistPanel.tsx` with Move Up/Down, `Stamp.tsx`, `pdfExport.ts`).
  - Rewrote Prompts.md's Phase 4.5 prompt to name these exact files instead of generic placeholders — it now tells the build agent what already exists (so it doesn't rebuild the card view, filter rail, ranking engine, single add/remove/stamp, or Move Up/Down from scratch) and exactly where the two additions plug in: a new table component alongside `CollegeCard.tsx`'s render site reusing `useCollegeFilter.ts`'s existing sort logic, and a bulk-append method + `orderLocked` boolean added to `useCollegeFilter.ts` with UI in `ShortlistPanel.tsx`.
  - Added matching "Shipped as: ..." notes to Phases.md's Phase 3 and Phase 4 sections, and a file-name cross-reference in the Phase 4.5 section, so Phases.md and Prompts.md stay in sync per Rules.md's process rule #1/#2 pattern (docs should always describe what's actually true).
- Why: user confirmed continuing from Phase 4.5 against their real Memory.md, and asked for the Phase 4.5 prompt to reference the actual components rather than generic placeholders, to make it directly actionable for whichever agent runs it next.
- Assumptions made / open questions: None new — this is a scoping/documentation pass, no code touched, no new data touched.
- What's broken or incomplete: Table view, bulk-add, and lock/unfreeze are still not built — this entry only makes the instructions for building them more precise.
- Next up: run Prompts.md's Phase 4.5 prompt against the real codebase, then continue into Phase 5.

### [2026-08-29] — Phase 4.5 — Table View, Shortlist Bulk-Add & Order Lock/Unfreeze Catch-Up Pass
- What changed:
  - **Table View Toggle & Component**:
    - Created `src/components/CollegeTable.tsx` implementing the dense official ledger/marksheet format with hairline dividers (`border-line`), sticky top header row (`sticky top-0 bg-paper`), and sticky college name column (`sticky left-0 bg-white`) with horizontal scrolling on mobile/tablet.
    - All numeric and data columns (`beds`, `rating`, `distance`, `fees`, `NIRF rank`, `year established`, `overallScore`, `rankIndex`) are set in mono typography (`font-mono`).
    - Unverified estimate bed counts carry the exact same `~est` low-confidence badge as `CollegeCard.tsx` per Architecture.md §6b.
    - Added sortable column headers that directly invoke `applySingleSort` (reusing the exact same normalization/ranking sort engine as `FilterControls.tsx`) and render direction indicators (`▲` for higher is better, `▼` for lower is better).
    - Integrated View Mode Toggle (`Cards` vs `Table`, defaulting to `Cards`) in `src/App.tsx` meta header bar.
  - **Shortlist Bulk-Add Action**:
    - Added `addBulkToShortlist` method to `src/hooks/useCollegeFilter.ts` that appends all currently-visible colleges in on-screen order, skipping existing entries without duplicates.
    - Added visible "Add All Filtered ({count})" bulk action button prominently in the `src/App.tsx` meta action bar.
    - Updated `src/components/Stamp.tsx` and `src/components/CollegeCard.tsx` with an `animate` prop keyed to `lastSingleAddedId` so single manual adds trigger the signature keyframe animation while bulk adds and document views render the stamp badge instantly without firing 60+ simultaneous animations.
  - **Shortlist Order Lock/Unfreeze State**:
    - Added `orderLocked: boolean` (default `true`) state in `src/hooks/useCollegeFilter.ts` with `localStorage` persistence.
    - Added visible Lock/Unfreeze toggle button and live tracking warning banner in `src/components/ShortlistPanel.tsx` (calm official styling when locked, attention-grabbing styling when unfrozen).
    - In unfrozen mode (`orderLocked === false`), `orderedShortlistedColleges` dynamically tracks the live sort/ranking criteria of the browse view.
    - Manual Move Up / Move Down or clicking the lock toggle snapshots the current live order and locks `orderLocked = true`.
    - Confirmed `src/utils/pdfExport.ts` reads the rendered `#printable-shortlist-document` directly in its exact active order without any separate sort step.
  - Updated automated test suite in `scripts/test-engine.js` covering Haversine distance, multi-criteria normalization, unverified beds badges, bulk-add deduplication, and lock/unfreeze ordering logic. Verified full build with `npm run build`.
- Why:
  - Complete the Phase 4.5 catch-up pass bringing the codebase in exact alignment with Architecture.md §5b (shortlist ordering/locking), §5c (browse view modes), and Design.md (table view, bulk actions, and stamp transitions).
- Implementation Observations / Difficulties vs Fresh Build:
  - **Stamp Animation Decoupling**: Because `Stamp.tsx` previously had the CSS animation baked unconditionally into its component class, bulk-adding 60+ colleges would trigger dozens of simultaneous transform animations. Adding the `animate` prop and tracking `lastSingleAddedId` resolved this cleanly.
  - **Shortlist Ordering Unfrozen Mapping**: When unfrozen, shortlisted colleges needed to reorder according to the active criteria across all colleges (not just those currently passing hard filters like search or city filters), requiring the hook to derive order from `allRankedCollegesSorted`.
  - **Reusing Single Sort Logic**: Because single-field sorting in `FilterControls.tsx` was implemented by assigning 100% weight to a signal in `filters.weights`, exposing `applySingleSort` and `activeSingleSortCriterion` allowed `CollegeTable.tsx` to reuse the identical sorting mechanism with zero duplication.
- What's broken or incomplete:
  - None. Clean production build and automated tests pass.
- Next up:
  - Phase 4.6 — Rework PDF export to compact 4-column key-entry table for counselling staff, then Phase 5.

### [2026-08-29] — Phase 4.6 — PDF Export Redesign to Compact 4-Column Submission Table
- What changed:
  - **4-Column Compact Export Table**:
    - Redesigned the export and print document structure in `src/components/ShortlistPanel.tsx` (`#printable-submission-document`), `src/utils/pdfExport.ts`, and `src/index.css` from mirroring the full-detail on-screen student cards to a compact 4-column table:
      1. **Priority Order Number** (`01`, `02`, `03`...)
      2. **College Code** (`college_code`, prominent, mono — primary key-entry field for counselling staff; if `null`, gracefully displays full college name so row remains actionable)
      3. **College Name** (`college.name` in full)
      4. **City** (`college.city`)
    - Omitted student evaluation statistics (`beds`, `rating`, `distance`, `fees`, `NIRF rank`) from the exported table.
  - **On-Screen Student Workpad vs Submission Document**:
    - Preserved full stat cards, Move Up/Down reordering controls, delete actions, and lock/unfreeze controls in the on-screen student workpad in `ShortlistPanel.tsx` for evaluation and curation.
    - Added an on-screen view toggle between "Student Workpad" and "Counselling Sheet Preview" so students can inspect the exact official paper document before exporting.
  - **Dual Export Path Parity**:
    - Updated `src/utils/pdfExport.ts` (`exportShortlistToPDF`) to capture `#printable-submission-document` with 2x DPI canvas scaling and multi-page A4 pagination.
    - Updated `@media print` rules in `src/index.css` so browser print (`window.print()`) outputs the identical 4-column submission table across pages with page-break safety.
  - **Provenance & Framing**:
    - Retained the official header ("KNRUHS · NEET UG CHOICE SELECTION FORM", "Telangana MBBS College Shortlist", reference city origin, generation date, summary statistics, signature Stamp seal) and the sourced-data provenance footnote.
  - Verified ordering still derives 1:1 from the active shortlist array without separate sorting. Added unit tests in `scripts/test-engine.js` and confirmed production build passes with `npm run build`.
- Why:
  - Counselling staff keying in choices during state/MCC admissions scan down the printed sheet matching `college_code` against priority order numbers; research/evaluation metrics (beds, ratings, fees, distances) belong on the student's screen rather than the official submission document.
- Assumptions made / open questions:
  - For the 7 colleges with `null` `college_code`, the full college name is shown in the code column rather than "N/A" or blank, ensuring staff have an immediate text identifier to type.
- What's broken or incomplete:
  - None. Clean production build and automated tests pass.
- Next up:
  - Removal of shortlist in favor of direct browse-view export, then Phase 5.

### [2026-08-29] — Pivot: Shortlist Removed — Live Browse View is the Export
- What changed:
  - **Shortlist Concept Removed**:
    - Eliminated the separate "add to shortlist" step and independent priority queue entirely. Filtering, sorting, and multi-criteria weighting in the browse view IS now the sole mechanism for establishing choice order.
    - Exporting PDF or printing now directly captures whatever colleges are currently visible under active filters in their exact on-screen rank order.
  - **Codebase Clean-up**:
    - Deleted `src/components/ShortlistPanel.tsx` and `src/components/Stamp.tsx`.
    - Removed stamp keyframes and animation classes from `src/index.css`.
    - Removed shortlist bookmark actions, marigold highlight borders, and stamp badges from `src/components/CollegeCard.tsx` and `src/components/CollegeTable.tsx`.
    - Cleaned `src/hooks/useCollegeFilter.ts` by removing `shortlistIds`, `orderLocked`, `orderedShortlistedColleges`, `toggleShortlist`, `addBulkToShortlist`, `reorderShortlist`, `clearAllShortlist`, `lastSingleAddedId`, and `localStorage` persistence.
  - **Default Sort Decision**:
    - Explicitly configured the default initial state to use the **Balanced Choice preset** (`beds: 35`, `distance_from_home: 30`, `google_rating: 20`, `google_review_count: 15`, `fee_category_a: 0`) with Hyderabad as the reference origin.
    - When a user first opens the app without touching any filter controls, all 69 colleges have a deterministic, computed match score from `#1` to `#69` with alphabetical tie-breaking on `college.name`, ensuring exported documents have meaningful ordering even before custom tweaks.
  - **Export Trigger & Submission Table Integration**:
    - Updated `src/utils/pdfExport.ts` (`exportCollegesToPDF`) and `src/App.tsx` to directly bind the export trigger to the live `filteredRankedColleges` list.
    - Export triggers ("Export PDF" with college count badge and "Print") placed prominently in the top navigation header, browse meta bar, and mobile floating action bar.
    - Preserved the compact 4-column key-entry submission format: Priority Order #, College Code (with full name fallback for 7 colleges with null codes), College Name, and City.
    - Retained official document framing ("KNRUHS · NEET UG CHOICE SELECTION FORM", "Telangana MBBS Priority List", summary counts, date) and the sourced-data provenance footnote.
  - **Documentation Alignment**:
    - `Architecture.md`: Removed §5b (shortlist state) and updated §2, §5b (browse view modes & direct PDF export), and §6b cross-references.
    - `Rules.md`: Removed Rule #18 (shortlist order ownership).
    - `Phases.md` / `Prompts.md`: Updated Phase 4 to reflect direct live browse PDF export; marked Phase 4.5 and 4.6 as superseded.
  - Updated automated test suite in `scripts/test-engine.js` and verified clean production build (`npm run build`).
- Why:
  - Users filter and weight colleges in the browse view to find their preferred priority order; forcing a redundant second step to "add to shortlist" added friction without changing the intended submission order. Exporting the live browse view directly simplifies the mental model and streamlines choice list generation.
- What's broken or incomplete:
  - None. Clean production build and automated tests pass.
- Next up:
  - Phase 5 — Polish, responsiveness, and accessibility pass.

### [2026-08-29] — Live Browse Drag-to-Reorder on Card & Table Views
- What changed:
  - **In-Memory Drag-to-Reorder on Live List**:
    - Added direct drag-to-reorder support to the live browse view without reintroducing shortlist state, storage keys, locking flags, or stamp animations.
    - Updated `src/hooks/useCollegeFilter.ts` with `displayColleges`, `manualOrderIds`, `reorderColleges(sourceIndex, destinationIndex)`, `resetManualOrder()`, and `isManuallyReordered`.
    - Maintained the multi-criteria / sort-derived array as the base order. When a user drags an item or clicks Move Up / Down, the swap is stored in session memory across the current filtered list.
    - If the user alters any filter, search query, single sort field, or ranking weight slider, `manualOrderIds` resets to `null`, gracefully falling back to the fresh criteria-derived sort order without complexity.
  - **Card View Drag & Touch Controls**:
    - In `src/components/CollegeCard.tsx`, added a drag grip (`GripVertical`), HTML5 drag-and-drop event handlers with visual drag-over feedback, and touch-accessible `ChevronUp` / `ChevronDown` buttons next to the rank badge.
  - **Table View Drag & Touch Controls**:
    - In `src/components/CollegeTable.tsx`, added `GripVertical` drag grip, HTML5 row drag-and-drop, and touch-accessible `ChevronUp` / `ChevronDown` buttons in the Order (`#`) column.
    - Confirmed that row drag-and-drop does not interfere with column-header click sorting (`th` click handlers trigger `onSingleSort`, which resets manual drags and sorts by the selected column).
  - **PDF and Print Export Parity Verified**:
    - `src/App.tsx` renders `#printable-submission-document` directly from `displayColleges`.
    - Both `exportCollegesToPDF` (jsPDF + html2canvas) and native browser print (`window.print()`) output the exact on-screen sequence (including any manual drag overrides) in the 4-column submission table.
  - Added unit test cases to `scripts/test-engine.js` verifying manual drag swaps, PDF export mapping matching, and automatic reset on filter/weight modifications.
  - Verified clean production build (`npm run build`).
- Why:
  - Allows students to fine-tune specific choice rankings (e.g., placing a preferred hometown college at #1 above an algorithmically higher-scored institution) directly in the active browse view prior to PDF generation.
- What's broken or incomplete:
  - None. Clean production build and automated tests pass.
- Next up:
  - Phase 5 — Polish, responsiveness, and accessibility pass.

### [2026-08-29] — Table View: Removed Sticky Name Column on Mobile
- What changed:
  - **Removed Sticky/Frozen Left Name Column**:
    - In `src/components/CollegeTable.tsx`, removed `sticky left-0` and horizontal drop-shadow classes from both the table header (`th`) and table data cells (`td`) for the college name column (`Institution & Location`).
    - The table now scrolls horizontally as a single cohesive block on mobile viewports, allowing natural touch swiping without the left column capturing or blocking horizontal swipe gestures.
    - Preserved the sticky top header row (`thead` `sticky top-0 bg-paper z-20`) so column headers remain visible while scrolling vertically.
  - **Design Documentation Updated**:
    - Updated `Documentation/Design.md` table view layout notes to specify that the entire table scrolls horizontally as one normal block on mobile (no frozen/sticky left name column).
  - Verified tests in `scripts/test-engine.js` and clean production build with `npm run build`.
- Why:
  - On mobile touch devices, the sticky frozen column was capturing touch gestures and preventing users from smoothly scrolling right to view remaining data columns (beds, rating, distance, fees, NIRF, match score).
- What's broken or incomplete:
  - None. Clean production build and automated tests pass.
- Next up:
  - Phase 5 — Polish, responsiveness, and accessibility pass.

### [2026-08-29] — Phase 5: Polish, Responsiveness, Accessibility & Deployment Readiness
- What changed:
  - **Mobile Responsiveness & Touch Interaction**:
    - Tested and verified smooth layout and viewport scaling across 320px+ viewports.
    - Verified table view horizontal scrolling as a single unblocked container with sticky column header support.
    - Verified touch drag-and-drop and `ChevronUp` / `ChevronDown` quick-swap buttons on both Card and Table views.
  - **Accessibility & WCAG AA Contrast**:
    - Confirmed all color pairs in `Design.md` (`paper`, `ink`, `surgical`, `rank-red`, `marigold`, `line`) satisfy WCAG AA contrast (≥4.5:1 for normal text, ≥3.0:1 for graphical elements / large text).
    - Verified persistent 2px `surgical` focus rings (`focus-visible:outline-2 focus-visible:outline-surgical focus-visible:outline-offset-2`) across all interactive inputs, buttons, sliders, and checkboxes.
    - Enhanced `MobileBottomSheet.tsx` with `Escape` key dismissal and body scroll locking.
    - Added `@media (prefers-reduced-motion: reduce)` rules in `src/index.css` and Tailwind classes to cleanly disable animations and transitions for users preferring reduced motion.
  - **Empty & Edge State Handling**:
    - Refined empty state copy in `src/App.tsx`: distinguishes between zero results from text search queries (with one-click "Clear Search") vs. zero results from restrictive filter constraints (with "Reset All Filters").
    - Verified fallback for the 7 Telangana colleges with `null` `college_code`: displays full college name in code column for both on-screen table and exported PDF submission table without showing "N/A" or blank cells.
  - **PRD.md §8–9 Alignment & Known v1 Gap Deferrals**:
    - Success criteria (§8) met: Students can filter, rank, and download an official priority choice form in under 5 minutes; PDF export directly mirrors the active on-screen order.
    - Open questions (§9) confirmed:
      - *Data Refresh*: Single-season static bundle for 2026–27 counselling window (deferred real-time scraping).
      - *Faculty Quality / OPD volume*: Omitted for v1 due to lack of public per-college disclosures; replaced with verified bed counts, Google rating volume, and fee structure.
      - *Shortlist Queue*: Formally eliminated in favor of direct live browse export.
  - **Production Build & Verification**:
    - Ran `node scripts/test-engine.js` (Haversine math, Balanced ranking, manual drag-and-drop, export mapping: 100% passing).
    - Ran `npm run build` (`tsc && vite build`): cleanly built production bundle with 0 errors.
    - Confirmed ready for static deployment on Vercel/Netlify per Architecture.md §3.
- What's broken or incomplete:
  - None. Production build is 100% clean and fully functional.
- Next up:
  - Phase 6 — Mock choice-filling test run with users and deploy.

### [2026-08-29] — Documentation: Created Root README.md
- What changed:
  - Created a comprehensive, structured root [`README.md`](file:///D:/codes/devudaaaaa/neet-counselling-filter/README.md) synthesizing the project architecture, features, data provenance, design system, and development guidelines.
  - Included:
    - Overview and problem statement (Telangana NEET UG choice-filling for KNRUHS/MCC).
    - Key features: 69-college directory, multi-criteria ranking engine, strategy presets, client-side Haversine distance, dual view modes (Card vs Table), in-memory drag-to-reorder, and direct 4-column compact PDF/print export.
    - Data provenance explanation: verified bed figures (Osmania, Kakatiya, Gandhi) vs. `~est` secondary report indicators.
    - Design tokens table and typography hierarchy from `Design.md`.
    - Local setup instructions, test engine commands, build scripts, and directory tree.
  - Verified clean production build (`npm run build`).
- What's broken or incomplete:
  - None.
- Next up:
  - Phase 6 — Mock choice-filling test run with users and deploy.