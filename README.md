# NEET Choice Selector

> **Telangana MBBS Counselling Companion (2026–2027)**  
> *A fast, zero-backend, client-side decision companion for NEET UG choice-filling.*

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Overview

During NEET UG counselling, medical aspirants must submit a prioritized list of college choices to **KNRUHS** (Kaloji Narayana Rao University of Health Sciences) and **MCC** (Medical Counselling Committee) in a narrow time window. 

Most students and families face scattered information, conflicting figures, and opaque prestige biases. **NEET Choice Selector** is built to solve this by providing:
1. **Instant, transparent multi-criteria ranking** based on factors that actually matter (hospital bed capacity, proximity to home city, Google review ratings/volume, and quota fees).
2. **Interactive manual curation** via drag-and-drop and touch-friendly quick-swap controls directly on the live list.
3. **Direct PDF & Print Export** formatted as an official 4-column choice selection sheet (`Order #`, `College Code`, `College Name`, `City`) ready for counselling staff to key into admission portals.

---

## ✨ Key Features

- 🏛️ **Complete Directory of 69 Telangana Medical Colleges**:
  - Covers all **Government**, **Private**, and **Deemed** MBBS institutions.
  - Sourced counselling codes (`college_code`), founding years (`year_established`), and 2026–27 notified fee structures (Convenor/Category-A, Management/Category-B, and NRI/Category-C quotas).

- ⚖️ **Multi-Criteria Ranking Engine**:
  - Normalized 0–100 scored ranking computed live in the browser.
  - Includes ready-to-use strategy presets:
    - **Balanced Choice** (*Default*): Beds (35%) + Distance (30%) + Rating (20%) + Reviews (15%)
    - **Hospital Size First**: Beds (60%) + Distance (20%) + Rating (20%)
    - **Proximity First**: Distance (60%) + Beds (25%) + Rating (15%)
    - **Budget Conscious**: Lower Govt Fees (50%) + Beds (30%) + Rating (20%)
    - **Top Rated**: Google Rating (50%) + Review Volume (30%) + Beds (20%)
  - Custom weight sliders and one-click single criterion sorts.

- 📍 **Client-Side Haversine Proximity**:
  - Live distance calculation from user-selected Telangana reference cities (Hyderabad, Warangal, Nizamabad, Karimnagar, Khammam, Nalgonda, Mahabubnagar, etc.) using approximate town-center coordinates without third-party geocoding API calls.

- 🗂️ **Dual Browse View Modes**:
  - **Cards View**: Hall-ticket stub format with full statistics breakdown, tags, and score indicators.
  - **Table View**: Dense marksheet/ledger format with sortable headers and horizontal scroll on mobile.

- 🔄 **Live Drag-to-Reorder**:
  - Fine-tune specific choices directly in the live list using drag grips (`GripVertical`) or mobile touch buttons (`ChevronUp` / `ChevronDown`).
  - Swaps persist in-memory for the active view and reset cleanly whenever filter/ranking criteria change.

- 📄 **Official 4-Column Choice Submission Export**:
  - **Download PDF** (`jsPDF` + `html2canvas`) and **Print List** (`@media print`) export directly from the active on-screen order.
  - Generates a compact table (`Order #`, `College Code`, `College Name`, `City`) tailored for admission staff key-entry.
  - Graceful fallback displays full college name in the code column for institutions without official short codes.
  - Includes document metadata header and data provenance footnotes.

- 🔍 **Data Provenance Badging**:
  - Verified badges for officially sourced bed counts (**Osmania: 1,168**, **Kakatiya/MGM: 1,450**, **Gandhi: 1,200**).
  - Prominent `~est` badges for figures from secondary educational reports to prevent misleading students.

---

## 🏗️ Architecture & Philosophy

The application follows an **offline-first, zero-backend static architecture**:

```text
        (one-time manual compilation)
   colleges.csv  ──▶  src/data/colleges.json  ──▶  Bundled in Vite build
                                                            │
                                                            ▼
                                                ┌────────────────────────┐
                                                │     React + TS SPA     │
                                                │ - Loads JSON once      │
                                                │ - Haversine distance   │
                                                │ - Multi-criteria rank  │
                                                │ - In-memory reordering │
                                                │ - Client PDF / Print   │
                                                └────────────────────────┘
```

- **Zero Server Overhead**: No database, no backend API, no authentication, no external scraping runtime.
- **Instant Client-Side Computation**: All filtering, ranking math, and sorting happen in <1ms in the browser.
- **Static Deployment**: Easily hosted on free tiers of Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

---

## 🎨 Design System

Grounded in an **official paper form / hall-ticket** aesthetic:

| Token | Hex Value | Purpose |
|---|---|---|
| `paper` | `#EFF3F3` | Cool, pale official-form background |
| `ink` | `#152B3C` | Primary navy-black text (form print) |
| `surgical` | `#3E7C74` | Primary interactive teal (buttons, active tabs, focus rings) |
| `marigold` | `#E1A83E` | Accent gold (star ratings, `~est` badges) |
| `rank-red` | `#B23A34` | Priority rank numbers and cutoff markers |
| `line` | `#C3CFCE` | Hairline borders, dividers, dashed form fields |

- **Typography**: Display serif (**Fraunces**), UI sans (**Inter** / system sans), and tabular data monospace (**JetBrains Mono** / **IBM Plex Mono**).
- **Accessibility**: WCAG AA compliant contrast (>4.5:1), 2px `surgical` focus rings (`*:focus-visible`), and `@media (prefers-reduced-motion: reduce)` support.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/neet-counselling-filter.git

# Navigate into project directory
cd neet-counselling-filter

# Install dependencies
npm install
```

### Development

```bash
# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Test Engine Verification

Run the automated mathematical ranking, Haversine, drag-drop, and export parity test suite:

```bash
node scripts/test-engine.js
```

### Production Build

```bash
# Typecheck and build static production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Project Structure

```text
neet-counselling-filter/
├── Documentation/              # Architecture, PRD, Design, Rules & Session Logs
│   ├── Architecture.md
│   ├── Design.md
│   ├── Memory.md
│   ├── PRD.md
│   ├── Phases.md
│   ├── Prompts.md
│   └── Rules.md
├── scripts/
│   └── test-engine.js          # Unit tests for ranking math, Haversine, and export mapping
├── src/
│   ├── components/             # React UI components
│   │   ├── ActiveFilterChips.tsx
│   │   ├── CollegeCard.tsx     # Hall-ticket stub card view
│   │   ├── CollegeTable.tsx    # Dense marksheet table view
│   │   ├── FilterControls.tsx  # Sliders, presets, and facet controls
│   │   └── MobileBottomSheet.tsx # Responsive mobile bottom sheet
│   ├── data/
│   │   └── colleges.json       # Canonical 69 Telangana MBBS colleges dataset
│   ├── hooks/
│   │   └── useCollegeFilter.ts # Central state: filtering, scoring, and reordering
│   ├── types/
│   │   ├── college.ts          # TypeScript interfaces for college rows
│   │   └── filter.ts           # Filter state and presets definitions
│   ├── utils/
│   │   ├── haversine.ts        # Great-circle distance calculations & city coordinates
│   │   ├── pdfExport.ts        # jsPDF + html2canvas multi-page export
│   │   └── ranking.ts          # Normalization bounds and multi-criteria engine
│   ├── App.tsx                 # Main layout, printable container, and navigation
│   ├── index.css               # Tailwind directives, print media CSS, focus states
│   └── main.tsx                # React entrypoint
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
