# Design.md — Visual Direction & Design System

## Concept
Grounded in the actual artifact this app replaces: the **hall ticket / choice-filling form**. NEET counselling runs entirely on official-looking paper documents — admit cards, rank cards, seat matrices. The app should feel like a calmer, smarter version of that world: same trustworthy "official form" bones, but legible and fast instead of a scanned PDF.

## Color palette
| Token | Hex | Use |
|---|---|---|
| `paper` | `#EFF3F3` | Background — cool, pale, official-form paper (not warm cream) |
| `ink` | `#152B3C` | Primary text, deep navy-black, like form print |
| `surgical` | `#3E7C74` | Primary interactive color (buttons, active filters, links) — a muted teal, evokes scrubs/clinical trust without being sterile-cold |
| `marigold` | `#E1A83E` | Accent — used for star ratings and secondary indicators (`~est` badge) |
| `rank-red` | `#B23A34` | Reserved for rank/cutoff numbers and match priority indicators — echoes the red ink stamps on official documents |
| `line` | `#C3CFCE` | Hairline borders, dividers, the "form field" underlines |

Avoid: warm cream/terracotta combos (generic AI-default look), pure black backgrounds with neon accents, and rounded "SaaS card" gradients — none of that fits an official-document-inspired system.

## Typography
- **Display / headers**: a slab or semi-condensed sans with institutional weight — **Fraunces** (medium/semibold) for section headers and college titles, used sparingly.
- **Body / UI**: a clean humanist sans — **Inter** / system sans — for all filter labels, descriptions, and buttons.
- **Data / numbers**: a monospace face — **JetBrains Mono** / **IBM Plex Mono** — for every number that behaves like form data: seat counts, NIRF rank, bed count, fee figures, priority order numbers (`01`, `02`...), and `college_code`.

## Layout notes
- **Card View**: College list = a stack of **card units shaped like a hall-ticket stub**: a solid/perforated left surgical edge, college name top-left, key stats in mono in a tight grid (beds · rating · distance · fees · NIRF rank) with drag-to-reorder grip and Move Up/Down touch controls.
- **Table View**: Dense marksheet/ledger format with hairline dividers and mono data columns. Sticky header row on top with column-sort triggers. The whole table scrolls horizontally as one normal block on mobile (no frozen/sticky left name column) so that touch gestures scroll smoothly without getting trapped.
- **Filters**: Persistent left rail (desktop) / bottom sheet (mobile). Each active filter renders as a small tag the user can dismiss, like fields filled in on a form.
- **PDF Export**: Renders a compact 4-column key-entry submission document for counselling staff (Order #, College Code, College Name, City) with official header and data provenance footnote, directly mirroring the active on-screen order (including manual drags).

## Accessibility / quality floor
- All text meets WCAG AA contrast against `paper`/`ink`.
- Visible keyboard focus rings using `surgical` at 2px.
- Respect `prefers-reduced-motion`.
- Fully responsive down to small mobile viewports with smooth horizontal scrolling across dense data tables.