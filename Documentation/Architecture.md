# Architecture.md — NEET Counselling College Selector

## 1. Guiding constraints
- Solo dev, tight time/budget.
- **One-month tool, not a maintained product.** Data is hardcoded as of today's one-time pull — no refresh pipeline, no scheduling, no "keeping anything current" concern at all. This is the single biggest simplification vs. earlier drafts of this doc and it cascades through everything below.
- No login → no user data to protect beyond nothing; keep it stateless and cheap to host.
- ~100 concurrent users → this is a *small* scale problem. Don't over-engineer (no need for microservices, queues, k8s, or even a database — see §3).
- Data is **fully static** (colleges CSV, filled in once) with a **live-computed** layer on top (ranking based on user's filter weights, distance from their city — computed client-side, see §5).
- **Nothing user-facing ever calls MCC/NMC/NIRF/Google/OpenStreetMap live.** There is no scraper and no scheduled job. The CSV *is* the data pipeline — filled in by hand once, bundled with the frontend, done.

## 2. High-level shape

```
        (one-time, by hand)
   colleges.csv  ──▶  colleges.json  ──▶  bundled with frontend
   (69 rows, filled                        │
    in manually)                           ▼
                                  ┌─────────────────────┐
                                  │   Frontend (SPA)     │
                                  │  React + TS + Tailwind│
                                  │  - loads JSON once     │
                                  │  - filter/sort/rank UI │
                                  │    (all client-side)   │
                                  │  - shortlist state      │
                                  │  - PDF trigger           │
                                  └─────────────────────┘
```

No backend, no ETL, no scraper, no scheduled script. One static file, loaded once, everything else happens in the browser.

## 3. Stack (matches what you already know — reuse the Loop app stack, minus what you don't need this time)
- **Frontend**: React + TypeScript + Tailwind (plain Vite + React Router — no need for TanStack Start's SSR machinery for a static, filter-heavy single-purpose app).
- **Backend**: none for v1. If you later want server-side PDF generation, a tiny serverless function is enough — don't stand up Express/Postgres for that alone.
- **DB**: none. The colleges dataset is a single `colleges.json` (converted from your filled CSV) bundled into the frontend build and loaded once on page load.
- **Hosting**: Vercel/Netlify for the frontend. That's it — no backend host, no DB host, no monthly infra cost beyond the free tier.
- **PDF generation**: client-side with a lightweight lib (e.g. jsPDF or html-to-pdf). Simpler, no server round-trip, no extra cost.

## 4. Data model (shape of each row in colleges.json)

```
College {
  id
  name
  college_code           // short official/counselling code (e.g. "GAND", "OMCH") — from the merit-rank reference list; null for colleges not on that list, see §6
  year_established        // year the college was founded — from the same reference list as college_code; null where not found, see §6
  fee_category_a          // annual tuition, government/convenor quota (INR) — real, sourced from KNRUHS-notified fee structure; see §6
  fee_management_quota    // annual tuition, management/Category-B quota (INR) — private/deemed colleges only, null for government colleges (not applicable) and for colleges the source didn't cover
  fee_nri_quota            // annual tuition, NRI/Category-C quota (INR) — private/deemed colleges only, same coverage caveat as fee_management_quota
  city                 // disambiguates colleges that share a generic name, e.g. two "Government Medical College"s
  type                 // government / private / deemed — sourced, see §6
  lat, lng             // approximate town-center coordinates, hardcoded once (see §5) — not live-geocoded
  nirf_rank, nirf_score  // null for ~68 of 69 colleges — see §6, this is real and expected, not a gap to chase
  beds                  // filled only where an official/verifiable source was found (a handful of colleges) — null elsewhere
  google_rating, google_review_count   // manually collected by you
  data_notes             // free-text source/caveat per row, e.g. conflicting bed figures, seat count instead of beds
}
```

Wider than the earlier "ratings-only" version of this doc, but still thin by design — this reflects what turned out to actually be findable online (§6), not the full criteria list from PRD.md §5. Beds, patient count, and faculty quality remain mostly unfilled; see §6 for why and Rules.md #9 for why they're `null` rather than guessed.

`college_code` and `year_established` are useful UI/display fields (a short code is easier to scan on a mobile card than a full name, and founding year is a quick trust signal for older institutions) but are **not** ranking/filter criteria — don't wire them into the weighted-score engine in §5.

`fee_category_a`/`fee_management_quota`/`fee_nri_quota` are real, sourced figures (unlike the beds exception in §6b) — but "sourced" here means a third-party aggregator's transcription of the KNRUHS-notified fee structure, not the KNRUHS brochure itself. Treat them as a good starting estimate, not a value to build a hard cost filter on without a "verify before you commit" caveat in the UI.

## 5. The ranking engine (this answers "how do I rank colleges")
Do **not** hardcode a single ranked list, and do **not** hardcode the engine to just two signals either. Build a **generic multi-criteria engine**: new criteria get added by registering a normalized signal, not by rewriting the scoring function.
1. Store each raw signal per college, normalized to a 0–100 scale. **v1 signal set**: `google_rating`, `google_review_count`, `beds`, `distance_from_home` (computed, see step 3), `fee_category_a` (budget-conscious users want *lower* to score higher — invert before normalizing). Each signal needs its own normalization direction declared explicitly — rating/reviews/beds are "higher is better," distance/fees are "lower is better." Don't assume every signal normalizes the same way.
2. Let the user pick which criteria matter and (optionally) how much — even a simple "select up to 3 priorities" UI beats a fixed ranking. This covers both use cases in one mechanism: a plain single-field sort (e.g. "sort by beds") is just a rank with one criterion weighted 100%, and a combined rank (e.g. "beds 60% + distance 40%") is the same math with more than one weight set.
3. Compute `distance_from_home`: each college row now carries its own approximate town-center `lat`/`lng` (filled directly, not via live geocoding — see §6). For the user's home city, reuse this same city→coordinate list rather than a separate geocoder. Distance is plain haversine math, done entirely client-side. No Nominatim, no external API, no network call of any kind.
4. Final score = weighted sum of normalized signals the user picked. Sort by that. This makes ranking personal, instant, and fully offline-capable — it just won't reflect anything that changes after today's data pull, which is fine given the one-month scope.
5. **The confidence flag rides along with the signal, not just the display.** `beds` carries a per-row confidence flag (officially sourced vs. user-supplied estimate — see §6b). When beds feeds into a filter, a plain sort, or a weighted rank, any result that includes an unverified-estimate row must still surface its low-confidence badge — folding the value into a numeric score must never cause that flag to quietly disappear.
6. **Adding a new criterion later** (e.g. hand-filling more beds, or a brand-new column): (a) add the raw field to `colleges.json`/the `College` type per §4, (b) add one normalization rule + direction for it here, (c) surface it in the filter/sort/weight UI. Nothing else should need to change — that's the whole point of not hardcoding a fixed formula.

## 6. Scope note: what a real search pass actually turned up
A full web-search pass was done across all 69 colleges for the remaining PRD.md §5 criteria (beds, patient count, NIRF rank, faculty quality, seats). Honest result, per criterion:

- **NIRF rank/score**: only **1 of 69** colleges (Osmania Medical College, #48) has an actual NIRF Medical-category rank. This isn't a data-collection gap — NIRF Medical only ranks ~150 institutes nationally, and almost nothing on this list is in that set. Don't build UI that implies most colleges "just don't have a rank yet"; they're simply outside NIRF's scope. Treat this as an optional bonus field for the one college that has it, not a real filter criterion.
- **Beds**: **3 colleges** (Osmania 1168, Kakatiya's attached MGM Hospital Warangal 1450, Gandhi ~1200–2200 with conflicting official figures) have a bed count from an official/verifiable source, flagged in `data_notes`. The remaining **66** are filled from a single user-supplied secondary landscape report rather than a verified per-college source — the user explicitly asked for these to be kept despite acknowledging they're not reliably sourced. Every one of those 66 rows carries a `data_notes` caveat saying so. **These 66 values are not held to the same confidence bar as the original 3 and must not be presented in the UI as equivalent** — see Rules.md #10 and §6b below.
- **Patient count/OPD volume, faculty quality, seat matrix**: effectively **not found** for individual colleges via search. Seats exist as one big KNRUHS PDF (not machine-fetchable here) rather than per-college web pages; faculty/OPD data simply isn't published per-institution outside official filings you'd need to request directly.
- **Type (govt/private/deemed)**: fully filled for all 69 — this one *is* reliably derivable (name pattern + one confirming search: only 2 NMC-recognised deemed medical colleges exist in Telangana, both Malla Reddy institutions).
- **City → coordinates**: filled for all 69 as approximate town-center lat/lng (§5), not sourced per-college, just built directly.
- **college_code / year_established**: matched from a separate merit-rank-based reference list (ASK IIT Medical Academy's Telangana NEET MBBS colleges list, 63 entries) by college name. **62 of 69** colleges matched and got a code + year. **7 of 69 have no code/year** because they aren't on that reference list at all: AIIMS Bibinagar, Nizam's Institute of Medical Sciences, Government Dental College and Hospital (not MBBS), Mallareddy Medical College for Women's, Malla Reddy Institute of Medical Sciences, Neelima Institute of Medical Sciences, and Christian Medical College Hospital Nizamabad. Left `null` for these per Rules.md #9 — not guessed.
- **fee_category_a / fee_management_quota / fee_nri_quota**: pulled from a third-party aggregator's (mdmsenquiry.com) transcription of the KNRUHS-notified 2026–27 fee structure. **64 of 69** colleges got at least one fee value. **5 of 69** (GMC Kodangal, Government Dental College and Hospital, Mallareddy Medical College for Women's, Malla Reddy Institute of Medical Sciences, Prathima Relief Institute of Medical Sciences Warangal) have all three fee fields `null` — not on the source table. Government colleges only carry `fee_category_a` (management/NRI quotas aren't applicable to them); private/deemed colleges carry all three where the source had them. This is a real, named source, but it's a secondary aggregator, not the KNRUHS brochure directly — every filled row's `data_notes` carries a "verify before relying on it" caveat.

Net effect: the "other criteria" filters from PRD.md §5 (patient count, faculty, hostel/infra) will only ever be meaningfully populated for a handful of well-known colleges, and now have zero coverage even as info fields. Beds is the one exception — it has full 69/69 coverage, but 66 of those 69 values are an unverified estimate the user chose to keep anyway (see above), not independently confirmed data. **The app ships beds as a real filter, sort, and weighted-rank criterion** (PRD.md §5) — it needs visible "unverified estimate" framing for those 66 rows in every one of those views (browse card, filter chip, sort results, combined-rank results) — see §6b — rather than presenting all 69 values as equally trustworthy.

## 6b. Handling missing data (don't let gaps skew the ranking)
- A blank rating/review-count cell (expected for the ~9 brand-new 2024–2025 colleges) is stored as `null` — never estimated or defaulted to 0/average, since that would quietly distort the weighted score.
- A college missing a given field is either excluded from sorting by that specific criterion, or shown with a visible "no reviews yet" tag — not silently dropped to the bottom by a zero.
- **Exception, logged not hidden**: beds is the one field where an unverified estimate was deliberately kept instead of left `null`, at the user's explicit request (see §6). This is a documented exception to the "never fabricate/estimate" default in Rules.md #9, not a precedent for other fields. UI implication: any college whose `data_notes` contains the "user-supplied secondary landscape report" caveat must render its bed count with a visible low-confidence marker (e.g. a tilde or "~unverified" tag) — never presented with the same visual weight as Osmania/Kakatiya/Gandhi's sourced figures, per Rules.md #10. This applies everywhere beds is surfaced, not just the default browse card: an active "beds" filter chip, a beds-sorted list, and a combined weighted-rank result must all carry the same marker on the same rows.

## 7. Data refresh — none
This is a one-month tool. There is no refresh cadence, no scheduled script, no "keep this current" concern. The CSV is filled in once, converted to JSON once, bundled into the frontend build once. If the tool needs to live past a month, *that's* the point to reintroduce a refresh story — not before.

## 8. Non-functional notes
- No backend, no auth, no session storage → the whole app is a static bundle. Deploy = push to Vercel/Netlify, done.
- Client-side re-filtering/re-sorting over the already-loaded 69-college list keeps interactions instant — the dataset loads once on page load, all ranking math happens in the browser from there.