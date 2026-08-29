# Architecture.md — NEET Counselling College Selector

## 1. Guiding constraints
- Solo dev, tight time/budget.
- No login → no user data to protect beyond nothing; keep it stateless and cheap to host.
- ~100 concurrent users → this is a *small* scale problem. Don't over-engineer (no need for microservices, queues, k8s).
- Data is mostly **static/slow-changing** (colleges, NIRF scores refresh yearly-ish) with a **live-computed** layer on top (ranking based on user's filter weights, distance from their city).
- **Critical: nothing user-facing ever calls MCC/NMC/NIRF/Google live.** The ETL step (§7) pre-fetches everything into Postgres ahead of time. A page load reads only from your own DB — this is what keeps the app fast and keeps you off external rate limits. The scraper is a completely separate, offline process from the app itself.

## 2. High-level shape

```
                    ┌─────────────────────┐
   Data sources ───▶│   ETL / scraper      │──▶ Postgres (colleges table)
 (MCC, NMC, NIRF,    │   (scheduled script) │
  Google Places)     └─────────────────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │   Backend API        │
                     │  (Node/Express, TS)  │
                     │  - GET /colleges      │
                     │  - POST /rank         │
                     │  - POST /export-pdf   │
                     └─────────────────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │   Frontend (SPA)     │
                     │  React + TS + Tailwind│
                     │  - filter/sort UI     │
                     │  - shortlist state    │
                     │  - PDF trigger        │
                     └─────────────────────┘
```

## 3. Stack (matches what you already know — reuse the Loop app stack)
- **Frontend**: React + TypeScript + Tailwind (TanStack Start if you want the same framework as Loop; plain Vite + React Router is fine too and slightly less overhead for a filter-heavy single-purpose app).
- **Backend**: Node.js + Express, TypeScript.
- **DB**: PostgreSQL (Prisma as ORM, same as Loop) — one `colleges` table is most of your schema.
- **Hosting**: Vercel/Netlify for frontend, Railway/Render for backend+DB (cheap tiers comfortably cover 100 concurrent users for this workload).
- **PDF generation**: client-side with a lightweight lib (e.g. jsPDF or html-to-pdf) OR a small server endpoint using Puppeteer if you want pixel-perfect print styling. Start client-side — simpler, no extra server cost.

## 4. Data model (core table)

```
College {
  id
  name
  aliases[]           // to reconcile "AIIMS Delhi" vs official long name across sources
  state, city
  lat, lng
  type                // govt / private / deemed / central
  quota_types[]        // AIQ, state, deemed, central
  total_seats
  nirf_rank, nirf_score
  beds
  patient_count_opd
  hostel_infra_score   // derived signal, see §6
  faculty_signal        // derived signal, see §6
  google_place_id
  google_rating, google_review_count
  source_updated_at
}
```

## 5. The ranking engine (this answers "how do I rank colleges")
Do **not** hardcode a single ranked list. Instead:
1. Store each raw signal per college (beds, rating, NIRF score, etc.) normalized to a 0–100 scale.
2. Let the user set which filters matter and (optionally) how much — even a simple "select up to 3 priorities" UI beats a fixed ranking.
3. Compute `distance_from_home` live per request (geocode user's city once, haversine against college lat/lng — no need for real road-distance for v1).
4. Final score = weighted sum of normalized signals the user picked. Sort by that. This makes ranking personal and always current, instead of a stale copied list.

## 6. Handling the two hard data signals
- **Faculty quality**: no clean public "quality" metric exists. Proxy with NMC-filed faculty-to-student ratio where available, and/or NIRF's "perception" sub-score. Flag this filter in the UI as a weaker signal ("limited data") rather than presenting it as equally solid to beds/reviews.
- **Hostel/infra**: no structured source. Proxy from NIRF's "Teaching, Learning & Resources" sub-score plus manually-collected notes for well-known colleges if time allows. Don't block v1 launch on this being perfect.

## 6b. Handling missing data (don't let gaps skew the ranking)
- If a field isn't found during ETL, store it as `null` — never estimate/interpolate a value to fill it (Rules.md #9).
- A college missing a given field is either excluded from sorting by that specific criterion, or shown at the bottom with a visible "data not available" tag — never silently defaulted to zero or an average, since that would quietly distort the weighted score.
- Track and expose a rough `coverage %` per field (e.g. "bed count available for 82% of colleges") so gaps are visible rather than hidden — good to surface in the UI, not just internally.

## 7. Data refresh cadence
- NIRF, MCC seat matrix, NMC filings: refresh once per counselling season (manual trigger is fine for v1 — this isn't hourly-changing data).
- Google ratings: safe to refresh monthly via a scheduled script (rate-limit aware).

## 8. Non-functional notes
- No auth = no session storage = fully stateless backend, easy horizontal scaling if ever needed (won't be, at this scale).
- Client-side re-filtering/re-sorting over the already-fetched college list keeps interactions instant — fetch the dataset once, do the ranking math in the browser.