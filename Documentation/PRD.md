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
1. **College directory**: show all MBBS colleges participating in NEET counselling (AIQ + state + deemed + central, sourced from MCC/NMC). Where available, display each college's official `college_code` and `year_established` as reference info on its card (not a filter) — see Architecture.md §4/§6 for coverage (62/69 colleges).
2. **Filtering, sorting & ranking** — coverage confirmed via a full search pass (Architecture.md §6). **This is the primary feature of v1**: a stressed user should be able to narrow the list, sort it, or rank it by a combination of criteria in a few taps, on a phone. Splits into these tiers:
   - **Full coverage, real filter/sort/rank criteria**: Google rating, Google review count, city, distance from user's home city, and **bed count**. Beds is promoted from "info only" to a full filter/sort/rank criterion in v1 (see Architecture.md §5/§6/§6b): 3/69 colleges have an officially sourced figure, the other 66/69 are an unverified estimate the user explicitly chose to keep anyway. Every one of those 66 must carry a visible low-confidence badge wherever its bed count is shown — on the browse card, in an active filter chip, in a beds-sorted list, and in a combined weighted-rank result — never presented as equal-confidence to the 3 sourced rows. Users can combine beds with any other criterion into one weighted rank (e.g. "rank by bed count + distance") — see Architecture.md §5.
   - **Near-full coverage, real filter/sort criterion with a "verify before relying" caveat**: fees (`fee_category_a`, and for private/deemed colleges `fee_management_quota`/`fee_nri_quota`). 64/69 colleges have at least the government/convenor-quota fee; the source is a third-party aggregator's copy of the KNRUHS-notified structure, not the brochure itself — usable as a real budget filter/sort criterion, but the UI should note it's not the official source. 5/69 are `null` (Architecture.md §6).
   - **Full coverage, simple categorical filter**: college `type` (government / private / deemed) — no confidence caveat needed.
   - **Sparse — surface as info, not a filter**: NIRF rank (found for 1/69).
   - **No public data found — dropped from v1 filter list**: patient count / OPD volume, hostel and college infra, faculty quality. Revisit only if a real source turns up (see §9).
3. **Ranking**: results reorder live based on which criteria the user weights/prioritizes — any single criterion alone (e.g. "just sort by beds") or a weighted combination of several (e.g. "beds 60% + distance 40%"), not a single fixed order. Architecture.md §5 defines this as a generic multi-criteria engine so new criteria can be added later without a rewrite.
4. **Shortlist**: user can star/add colleges to a running shortlist.
5. **PDF export**: shortlist compiles into a clean, downloadable PDF (ordered list, with the key stats the user filtered on).
6. **Mobile-first interactions**: filtering, sorting, and ranking must be fully usable one-handed on a phone — that's the primary usage context for this app, not a secondary breakpoint (see Design.md's mobile filter-sheet pattern).

## 6. Non-functional requirements
- **Intuitive**: a stressed 17-year-old (or their parent) should use it without instructions.
- **Scale**: comfortably handle ~100 concurrent users (counselling-window traffic spikes, not sustained high load).
- **No login**: zero friction — open the site, get to filtering immediately.
- **Fast**: filter/sort interactions should feel instant (client-side re-sort over a pre-fetched dataset, not a server round-trip per filter tweak).

## 7. Data needs (see Architecture.md §4-6 for what was actually found)
- Canonical college list: hand-compiled from KNRUHS-referenced sources, 69 colleges (38 government incl. dental, 2 deemed, 29 private).
- Reviews: manually collected from Google by you — full coverage.
- Type (govt/private/deemed): derived + confirmed via search — full coverage.
- Rankings: NIRF Medical 2025 — only Osmania Medical College is actually ranked (#48); this is real, not a gap.
- Beds: officially sourced for 3 colleges (Osmania, Kakatiya's MGM Hospital, Gandhi) from official/Wikipedia sources. The other 66 are filled with an unverified figure from a user-supplied secondary report — kept at the user's explicit request despite no confirmed source, and flagged as low-confidence in `data_notes` (Architecture.md §6/§6b). This field is wired as a full filter/sort/rank criterion in the app (§5), not just card info — the low-confidence flag must travel with the value everywhere it's surfaced, including inside a combined weighted rank.
- Fees: government/convenor-quota tuition for 64/69 colleges, plus management- and NRI-quota tuition for the private/deemed colleges among them, from a third-party aggregator's transcription of the KNRUHS-notified fee structure — real named source, but not the brochure itself, so flagged with a "verify" caveat. 5/69 colleges have no fee data (Architecture.md §6).
- Patient count/OPD, faculty quality, seat matrix: no usable per-college public source found — not in v1.
- Distance: hardcoded approximate town-center coordinates + haversine, computed client-side. No live geocoding.
- College code / year established: matched from a merit-rank reference list — full coverage for 62/69 colleges, `null` for the remaining 7 (not on that list; see Architecture.md §6). Display-only, not a filter or ranking signal.

## 8. Success criteria (v1)
- Sister (and a handful of other test users) can go from "list of 700 colleges" to "my top 15, filtered and ranked the way I care about" in under 5 minutes.
- PDF export actually gets used during real choice-filling.

## 9. Open questions
- ~~How often should the data pipeline refresh?~~ Resolved — there is no pipeline; data is a one-time hardcoded pull for the one-month tool (Architecture.md §7).
- ~~Faculty quality proxy signal~~ Resolved as: no usable proxy exists at this scope, dropped from v1 (§2, §7).
- Do you want to hand-fill beds for more than the 3 colleges currently covered? That's a manual per-college lookup, same grind as the ratings CSV was — worth doing only for colleges your sister is actually seriously considering, not all 69.
