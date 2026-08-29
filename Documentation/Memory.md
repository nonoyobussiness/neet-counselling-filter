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



