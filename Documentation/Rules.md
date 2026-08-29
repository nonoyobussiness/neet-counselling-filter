# Rules.md — Rules to follow while building this app

These are standing rules for any AI assistant (or yourself) working on this project across sessions. Read this before making changes. Read `PRD.md`, `Architecture.md`, and `Design.md` before starting *any* new piece of work — don't rely on memory of them from earlier in a conversation.

## Process rules
1. **Before writing UI**, re-check `Design.md`. Every new screen/component must use the defined color tokens, type roles, and layout patterns — no ad-hoc colors or fonts introduced mid-project.
2. **Before writing backend/data logic**, re-check `Architecture.md`. Don't introduce a new service, new database, or new hosting dependency without updating that doc first — the doc should always describe what's actually true, not what was true at project start.
3. **Before starting any work session**, read `Memory.md` to know what was done last, what's in progress, and what broke.
4. **At the end of every work session/iteration**, update `Memory.md` — no exceptions, even for small changes. This is the only continuity mechanism across sessions.
5. If a requirement in `PRD.md` needs to change based on something learned while building, update `PRD.md` and note why in `Memory.md` — don't silently drift from spec.

## Scope discipline
6. Stick to v1 scope in `PRD.md`. Do not add login/accounts, cutoff prediction, or community reviews unless the PRD is explicitly updated first — these are called out as non-goals for a reason (time/budget).
7. Prefer the simplest version of a feature that satisfies the PRD. This is a solo/small-budget project — don't reach for infra or patterns meant for large teams or high scale (see Architecture.md constraints: ~100 concurrent users, no login).

## Data integrity rules
8. Never hardcode a static "ranking" of colleges. Ranking is always computed from stored raw signals + the user's chosen weights (see Architecture.md §5). If you're tempted to paste in a fixed ranked list, stop — store the raw data instead.
9. Any data pulled from an external source (MCC, NMC, NIRF, Google Places) must be traceable to that source and timestamped (`source_updated_at`). Never fabricate or estimate a data point and store it as if it were sourced.
10. Flag weak-signal filters (faculty quality, hostel/infra — see Architecture.md §6) in the UI as lower-confidence, rather than presenting them with the same visual weight as hard data like beds or seat count.

## Code quality rules
11. TypeScript everywhere (frontend and backend) — no implicit `any` on new code.
12. Keep the backend stateless (no login = no sessions to manage) — don't introduce server-side session state.
13. Filtering/sorting interactions must stay client-side once the dataset is fetched (see Architecture.md §8) — don't add a server round-trip per filter tweak.
14. Every new component should be responsive down to mobile by default, not patched in later.

## Communication rules
15. When unsure whether a change is in scope, ask rather than assume — don't silently expand scope "while in there."
16. Call out any assumption made about ambiguous data (e.g., how to reconcile a college appearing under two different names) directly in `Memory.md`, not buried only in code comments.
