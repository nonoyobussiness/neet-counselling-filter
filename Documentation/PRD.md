# PRD.md — NEET Counselling College Selector

## 1. Problem
During NEET counselling, students fill a long list of college choices in a short window, under time pressure, usually with incomplete or scattered information (rank cutoffs, hospital size, infra, distance from home, reputation). Bad choice-filling leads to regret or wasted seats. This app exists so a student (starting point: the founder's sister) can filter and compare colleges on the criteria that actually matter to them, and walk away with a clear, ordered priority list.

## 2. Target user
- NEET UG aspirants in the choice-filling window of counselling (primary).
- Parents/family helping a student decide (secondary — hence "no login," fast, shareable).

## 3. Goals
- Let a user see all 69 Telangana MBBS colleges and narrow/rank them down fast.
- Let filtering be based on criteria that predict real-world experience, not just prestige: beds (verified vs. ~est), fees, city, distance from home, Google ratings and reviews.
- Let the user walk away with a downloadable PDF of their priority list — an official choice-filling document they can literally use while filling KNRUHS/MCC choices.

## 4. Non-goals (v1)
- No login/accounts, no saved profiles across devices/sessions.
- No live seat availability or rank-predictor/cutoff prediction (that's a different, harder data problem — deferred to v2).
- No community reviews/forum — reviews are pulled from Google Places, not authored in-app.
- No separate shortlist management queue — the live browse view's current filter/sort/rank order IS the export order.

## 5. Functional requirements
1. **College directory**: show all 69 Telangana MBBS colleges (government, private, deemed) with counselling codes (`college_code`), founding year, city, type, and quota fees.
2. **Filtering & Ranking**:
   - Hospital beds (with clear ~est badge for unverified figures vs. verified badges for Osmania, Kakatiya, Gandhi)
   - Google reviews (rating + review count)
   - City
   - Distance from user's selected home city (Haversine calculation)
   - Annual tuition fees (Category-A Government quota, plus Cat-B/C management quota info)
   - Institution type (Government / Private / Deemed)
3. **Live Ranking Engine**: results reorder live based on multi-criteria weights chosen by the user (or quick strategy presets / single-click column sort), normalized 0–100.
4. **Manual Drag-to-Reorder**: user can drag rows or cards up/down (or use touch chevron buttons) to customize positions for the current session. Filter or criteria changes reset the manual override back to fresh calculated rank order.
5. **Direct PDF & Print Export**: the active on-screen priority list exports directly into a 4-column compact submission document (Order #, College Code with full name fallback if null, College Name, City) with official KNRUHS form header and data provenance footnote.

## 6. Non-functional requirements
- **Intuitive**: a stressed 17-year-old (or their parent) should use it without instructions.
- **Scale**: comfortably handle ~100 concurrent users (counselling-window traffic spikes, not sustained high load).
- **No login**: zero friction — open the site, get to filtering immediately.
- **Fast & Offline-Capable**: all data loaded once as a static JSON bundle; all filter/sort/rank calculations occur instantly client-side without network requests.
- **Accessible & Responsive**: responsive down to 320px mobile viewports, WCAG AA compliant contrast, 2px focus indicators, and `prefers-reduced-motion` support.

## 7. Data needs & provenance (see Architecture.md §6)
- Canonical college list & codes: ASK IIT Medical Academy merit reference + KNRUHS/NMC listings (69 colleges).
- Reviews & Ratings: Google Places data.
- Fees: KNRUHS 2026–27 notified structures (via mdmsenquiry aggregator).
- Beds: Officially sourced for Osmania (1168), Kakatiya (1450), Gandhi (1200); remaining 66 filled from secondary landscape report and clearly tagged with `~est`.
- Distance: town-center coordinates + Haversine formula from user-selected Telangana home city.

## 8. Success criteria (v1)
- Sister (and test users) can go from "all 69 colleges" to "my customized priority list" in under 5 minutes.
- Exported PDF choice selection sheet can be keyed directly into KNRUHS web choice-filling portal without ambiguity.

## 9. Open questions & resolution
- **Data refresh cadence**: One-time static dataset for the 2026–27 counselling season (Architecture.md §7). No periodic scraping needed for v1.
- **Faculty quality / OPD volume**: Sourced filings unavailable across institutions; deferred from v1 criteria (Architecture.md §6).
- **Shortlist state**: Replaced with direct live browse export and in-memory manual reordering to eliminate redundant duplicate steps.