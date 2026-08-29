# Design.md — Visual Direction & Design System

## Concept
Grounded in the actual artifact this app replaces: the **hall ticket / choice-filling form**. NEET counselling runs entirely on official-looking paper documents — admit cards, rank cards, seat matrices. The app should feel like a calmer, smarter version of that world: same trustworthy "official form" bones, but legible and fast instead of a scanned PDF. The signature moment: shortlisting a college "stamps" it, like marking a choice on a real form.

## Color palette
| Token | Hex | Use |
|---|---|---|
| `paper` | `#EFF3F3` | Background — cool, pale, official-form paper (not warm cream) |
| `ink` | `#152B3C` | Primary text, deep navy-black, like form print |
| `surgical` | `#3E7C74` | Primary interactive color (buttons, active filters, links) — a muted teal, evokes scrubs/clinical trust without being sterile-cold |
| `marigold` | `#E1A83E` | Accent — used ONLY for the "shortlist/stamp" action and shortlist badges, like a highlighter mark on a form |
| `rank-red` | `#B23A34` | Reserved for rank/cutoff numbers and "competitive" indicators — echoes the red ink stamps on official documents |
| `line` | `#C3CFCE` | Hairline borders, dividers, the "form field" underlines |

Avoid: warm cream/terracotta combos (generic AI-default look), pure black backgrounds with neon accents, and rounded "SaaS card" gradients — none of that fits an official-document-inspired system.

## Typography
- **Display / headers**: a slab or semi-condensed sans with a bit of institutional weight — e.g. **Fraunces** (medium/semibold) for section headers only, used sparingly, not for body copy.
- **Body / UI**: a clean humanist sans — **Inter** or **IBM Plex Sans** — for all filter labels, descriptions, buttons.
- **Data / numbers**: a monospace face — **IBM Plex Mono** or **JetBrains Mono** — for every number (and code) that behaves like form data: seat counts, NIRF rank, bed count, distance in km, college code, year established. This is the detail that sells the "form" concept: numbers should visually read as data, not prose.

## Layout notes
- College list = a stack of **card units shaped like a hall-ticket stub**: a slightly perforated/dashed left edge, college name in display face top-left with its `college_code` set in mono directly beside/beneath it (like a form's reference-number field — omit gracefully for the ~7 colleges with no code, don't show a placeholder), key stats in mono along the right in a tight grid (beds · rating · distance · NIRF rank · year established). Any bed count sourced from the unverified secondary report (Architecture.md §6b) gets a small distinct marker (e.g. a `~` prefix or a muted "est." tag) directly next to the number — and that same marker must reappear wherever that college's beds value resurfaces: an active beds filter chip, a beds-sorted position in the list, a combined weighted-rank result.
- Filtering, sorting, and ranking is the app's primary feature (PRD.md §5) and phone-in-hand is the primary usage context — design the **bottom sheet as the default target**, not a shrunk-down afterthought of a desktop rail. Left rail on desktop is the secondary adaptation of that same bottom-sheet content, not the other way around. Each active filter/sort/rank criterion renders as a small tag the user can dismiss, like fields filled in on a form.
- Shortlist panel is a running "form in progress" — visually distinct from the browse list (paper color shifts slightly, e.g. white instead of `paper`), reinforcing "this is the document you're building."
- PDF export should visually mirror the actual shortlist panel styling as closely as possible — the export should feel like it's printing what's on screen, not a re-themed report.

## Signature element
**The stamp.** When a user adds a college to their shortlist, a small circular "stamped" mark (in `marigold`, subtle rotation, like an ink stamp) appears on that card. This is the one piece of flourish/motion in the whole app — everything else stays quiet and disciplined. No other animation beyond this and standard hover/focus states.

## Accessibility / quality floor
- All text meets WCAG AA contrast against `paper`/`ink`.
- Visible keyboard focus rings using `surgical` at 2px.
- Respect `prefers-reduced-motion` — the stamp animation should degrade to an instant appearance.
- Fully responsive down to a small mobile viewport (this will very likely be used on a phone, mid-counselling, on the move).
