# Prompts.md — AI Prompts per Phase

General instruction to prepend to every session, regardless of phase:

> Before doing anything else, read Memory.md to see what's already been done and what's in progress. Read Rules.md and follow it throughout. When you finish this session's work, update Memory.md with a new entry per its format, before ending the session.

---

## Phase 0 — Foundations
```
Read Memory.md first to see what's already been done and what's in progress — don't assume a
blank slate. Read PRD.md, Architecture.md, Design.md, and Rules.md in full.
Set up the project skeleton per Architecture.md's stack section: React, TypeScript, Tailwind,
Vite. No backend, no database — this is a static-data SPA (Architecture.md §3). Define the
College TypeScript type exactly matching Architecture.md §4 — don't invent extra fields not
listed there without flagging it to me first.
When done, update Memory.md with what was set up and any deviations from Architecture.md, and why.
```

## Phase 1 — Data (static CSV, not a pipeline)
```
Read Memory.md first to see what's already been done and what's in progress — don't assume a
blank slate. Read Architecture.md §4-6, §6b and Rules.md §8-10 before touching the data file.
Convert colleges_enriched.csv into colleges.json, preserving every field including data_notes,
college_code, year_established, fee_category_a, fee_management_quota, and fee_nri_quota.
Do not fill any null field with an estimate or a guess — Architecture.md §6 documents exactly
which criteria have real coverage (reviews, distance, type: all 69; NIRF: 1 college; beds: 69
of 69, but only 3 officially sourced — the other 66 are a deliberately-kept unverified estimate,
see below; college_code/year_established: 62 of 69; fees: 64 of 69) and which don't (patient
count, faculty, seat matrix, college_code/year_established for the 7 colleges not on the
reference list, and fees for the 5 colleges not on the fee source table) — null means "not
found," not "not yet fetched."
IMPORTANT — beds is a documented exception to the "never estimate" rule: 66 of the 69 bed
values came from a single unverified secondary report the user asked to keep anyway. Every
one of those rows has a caveat appended to `data_notes`. When building the UI (later phases),
render any college whose `data_notes` contains that caveat with a visible low-confidence
marker — do not display it with the same visual weight as the 3 officially sourced bed counts
(Osmania, Kakatiya, Gandhi). Do not silently drop the caveat during JSON conversion.
When done, update Memory.md: confirm the JSON matches the CSV, note the coverage gaps above are
expected (not a bug to chase), and flag anything you had to change to make the conversion work.
```

## Phase 2 — Frontend data loading + ranking
```
Read Memory.md first to see what's already been done and what's in progress — don't assume a
blank slate. Read Architecture.md §5 and Rules.md #8 (never hardcode a fixed ranking) before writing this.
Load colleges.json once on mount. Compute the weighted ranking score and haversine distance
entirely client-side from each college's own lat/lng — no backend call, no live geocoding.
Include basic validation on user-entered filter weights.
When done, update Memory.md with what's built and anything unresolved.
```

## Phase 3 — Browse + filter/sort/rank UI
```
Read Memory.md first to see what's already been done and what's in progress — don't assume a
blank slate. Read Design.md in full before writing any component — use the exact color tokens, type roles, and
the hall-ticket-stub card pattern described there. Do not introduce new colors or fonts. Treat the
mobile bottom-sheet filter pattern as the primary design target, not a shrunk-down desktop rail
(Design.md) — this app is mainly used one-handed on a phone, and filtering/sorting/ranking is the
app's primary feature (PRD.md §5), not a secondary panel.

Build the college list with two view modes: the default card view (Design.md's hall-ticket-stub
pattern) and a table view toggle (Design.md, Architecture.md §5c) — both render the SAME already
filtered/sorted/ranked array, just differently. Table view uses sortable column headers that call
the exact same sort logic as the filter rail (don't write a second sort implementation), a sticky
header row, hairline dividers, and a sticky name column on mobile so the rest can scroll
horizontally instead of cramming everything into a narrow viewport.

Build the college list view and filter/sort/rank UI per Architecture.md §5 — a generic, extensible
multi-criteria ranking engine, live client-side, based on user-selected weights, not a fixed order
and not hardcoded to just two signals. Wire in these criteria as real filter/sort/rank options:
- rating, review count, city, distance-from-home: full coverage, no caveat needed.
- bed count: full 69/69 coverage, but only 3/69 officially sourced (Architecture.md §6/§6b) — ships
  as a full filter, sort, AND weighted-rank criterion (not just card info). Every one of the 66
  unverified-estimate rows must show a visible low-confidence badge everywhere its number appears:
  browse card, table cell, active filter chip, beds-sorted list, and combined weighted-rank results.
  Never give it the same visual weight as the 3 sourced rows, even mid-calculation.
- fees (`fee_category_a`/`fee_management_quota`/`fee_nri_quota`, 64/69 coverage): a real filter/sort
  criterion with a smaller "verify against the official KNRUHS brochure" caveat nearby, since the
  source is a third-party aggregator, not KNRUHS itself.
- type (government/private/deemed): a simple full-coverage categorical filter, no caveat needed.
- NIRF rank (1/69): card info only, not a filter — too sparse.
- patient count/faculty/hostel-infra: no data, drop from v1's filter list or handle per Rules.md #10
  if kept as a note field.

Support combining any subset of the above into one weighted rank (e.g. "beds 60% + distance 40%"),
not just single-field sorting — a plain sort is just a rank with one weight at 100%, so build one
mechanism for both. See Architecture.md §5 for how the engine generalizes so more criteria can be
added later (e.g. if more beds get hand-filled) without a rewrite.

Distance filter uses each college's hardcoded lat/lng, not live geocoding, per Architecture.md §5.
When done, update Memory.md with what's built, any Design.md deviations and why, and open UI issues.
```

## Phase 4 — PDF export directly from live browse view
```
Read Memory.md first to see what's already been done and what's in progress — don't assume a
blank slate. The shortlist concept was removed in favor of direct live export: filtering/sorting/ranking
the browse view IS the sole mechanism for creating a priority order, and export means "generate an
official PDF of what I am looking at right now."

Wire the PDF export and browser print functionality to read directly from `filteredRankedColleges`
in its current active on-screen order (with deterministic default ranking when unadjusted):
- 4-column compact submission table: priority order number (`01`, `02`...), `college_code` (primary
  mono column; fallback to full college name for colleges without a code), college name, city.
- Official framing: "KNRUHS · NEET UG CHOICE SELECTION FORM", "Telangana MBBS Priority List",
  reference origin city, generated timestamp, summary counts (total matching, govt/pvt, beds),
  and the sourced-data provenance footnote.
- Export triggers (Download PDF and Print) live prominently in the header and browse meta controls.
When done, update Memory.md with what's built.
```

## Phase 4.5 & 4.6 — Superseded
Shortlist-specific catch-up and table mirroring steps are superseded since shortlist state and panels were removed in favor of direct browse-view PDF/print export.

## Phase 5 — Polish & responsiveness
```
Read Memory.md first to see what's already been done and what's in progress — don't assume a
blank slate. There is no shortlist, stamp animation, or lock/unfreeze toggle in the current app
(removed — see Memory.md's shortlist-removal entry) — do this pass against what's actually live:
the browse view with card/table toggle, manual drag-to-reorder on both views, and direct PDF/print
export. Read Design.md's accessibility/quality-floor section before starting.

Do a full pass:
- Mobile responsiveness down to small viewports, including table view's horizontal scroll (no
  sticky column) and the drag-to-reorder controls (drag handle + up/down buttons) on both card and
  table view.
- WCAG AA contrast check against the palette in Design.md.
- Visible keyboard focus states using the `surgical` token at 2px.
- `prefers-reduced-motion` behavior for any remaining transitions (drag-drop feedback, sort
  re-ordering) — should degrade gracefully, not jump or flash.
- Empty/error state copy: no colleges match current filters, search with zero results, and the
  edge case of a college with a null `college_code` appearing correctly (full name fallback) in
  both the on-screen table and the exported PDF.
- Re-read PRD.md §8-9 (success criteria and open questions) and confirm each is addressed or
  explicitly deferred — note anything still open.
- Confirm production build (`npm run build`) is clean with no console warnings/errors.

When done, update Memory.md with what was fixed, anything deferred as a known v1 gap, and confirm
it's ready to deploy per Architecture.md §3 (Vercel/Netlify, static build, no backend).
```

## Phase 6 — Test & ship
```
Read Memory.md first to see what's already been done and what's in progress — don't assume a
blank slate. Before deployment, re-read PRD.md §8-9 (success criteria and open questions) and confirm each is
addressed or explicitly deferred. Deploy per the hosting choice in Architecture.md §3.
When done, update Memory.md with the deployment outcome, any last-minute fixes, and a final note on
which PRD open questions remain unresolved post-launch.
```

## Phase 7 — Post-launch / v2 ideas
```
Read Memory.md first to see what's already been done and what's in progress — don't assume a
blank slate. Read PRD.md's non-goals and Phases.md's Phase 7 list before proposing any new feature — confirm it's
actually intended as v2 scope, not a v1 gap that should have been caught earlier.
When done, update Memory.md with what was scoped for v2 and why it wasn't v1.
```