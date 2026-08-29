# PRD.md — NEET Counselling College Selector

## 1. Problem
During NEET counselling, students fill a long list of college choices in a short window, under time pressure, usually with incomplete or scattered information (rank cutoffs, hospital size, infra, distance from home, reputation). Bad choice-filling leads to regret or wasted seats. This app exists so a student (starting point: the founder's sister) can filter and compare colleges on the criteria that actually matter to them, and walk away with a clear, ordered shortlist.

## 2. Target user
- NEET UG aspirants in the choice-filling window of counselling (primary).
- Parents/family helping a student decide (secondary — hence "no login," fast, shareable).

## 3. Goals
- Let a user see all eligible colleges and narrow them down fast.
- Let filtering be based on criteria that predict real-world experience, not just prestige: beds, patient count, city, hostel/infra, distance from home, faculty quality, reviews.
- Let the user walk away with a downloadable PDF of their shortlist — something they can literally use while filling MCC/state choices.

## 4. Non-goals (v1)
- No login/accounts, no saved profiles across devices/sessions.
- No live seat availability or rank-predictor/cutoff prediction (that's a different, harder data problem — can be v2).
- No community reviews/forum — reviews are pulled from Google, not authored in-app.

## 5. Functional requirements
1. **College directory**: show all MBBS colleges participating in NEET counselling (AIQ + state + deemed + central, sourced from MCC/NMC).
2. **Filtering**, on:
   - Beds (hospital bed count)
   - Google reviews (rating + count)
   - Patient count / OPD volume
   - City
   - Hostel and college infra
   - Distance from user's home city
   - Faculty quality (best-available proxy signal — see Architecture.md data section)
3. **Ranking**: results reorder live based on which filters the user weights/prioritizes, not a single fixed order.
4. **Shortlist**: user can star/add colleges to a running shortlist.
5. **PDF export**: shortlist compiles into a clean, downloadable PDF (ordered list, with the key stats the user filtered on).

## 6. Non-functional requirements
- **Intuitive**: a stressed 17-year-old (or their parent) should use it without instructions.
- **Scale**: comfortably handle ~100 concurrent users (counselling-window traffic spikes, not sustained high load).
- **No login**: zero friction — open the site, get to filtering immediately.
- **Fast**: filter/sort interactions should feel instant (client-side re-sort over a pre-fetched dataset, not a server round-trip per filter tweak).

## 7. Data needs (see Architecture.md for pipeline)
- Canonical college list + seats: MCC, NMC
- Rankings: NIRF (annual)
- Reviews: Google Places API
- Beds/patient count/faculty: NMC disclosure filings, college sites
- Distance: geocoding + haversine/road-distance from user-entered city

## 8. Success criteria (v1)
- Sister (and a handful of other test users) can go from "list of 700 colleges" to "my top 15, filtered and ranked the way I care about" in under 5 minutes.
- PDF export actually gets used during real choice-filling.

## 9. Open questions
- How often should the data pipeline refresh (once per counselling season vs. periodic)?
- Faculty quality has no clean source — decide the acceptable proxy signal before building that filter (see Architecture.md).
