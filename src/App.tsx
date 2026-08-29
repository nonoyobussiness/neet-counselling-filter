import { useState } from 'react';
import { useCollegeFilter } from './hooks/useCollegeFilter';
import { CollegeCard } from './components/CollegeCard';
import { FilterControls } from './components/FilterControls';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { REGISTERED_CRITERIA, CriterionId } from './utils/ranking';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  Building,
  Info,
  X,
} from 'lucide-react';

export function App() {
  const {
    allColleges,
    filters,
    setFilters,
    filteredRankedColleges,
    availableCities,
    shortlistIds,
    toggleShortlist,
    totalActiveFiltersCount,
    removeType,
    removeCity,
    resetMinRating,
    resetMinBeds,
    resetMaxDistance,
    resetMaxFee,
    resetWeight,
    resetAllFilters,
  } = useCollegeFilter();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  // Colleges to display
  const displayedColleges = showShortlistOnly
    ? filteredRankedColleges.filter((c) => shortlistIds.includes(c.college.id))
    : filteredRankedColleges;

  // Active strategy description
  const activeWeightsList = (Object.keys(filters.weights) as CriterionId[])
    .filter((cid) => (filters.weights[cid] || 0) > 0)
    .map((cid) => `${REGISTERED_CRITERIA[cid].shortLabel} (${filters.weights[cid]}%)`);

  const strategySummary =
    activeWeightsList.length > 0
      ? activeWeightsList.join(' + ')
      : 'Alphabetical order (no weights set)';

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans antialiased selection:bg-surgical selection:text-white">
      {/* 1. Official Header per Design.md */}
      <header className="border-b border-line bg-paper/95 backdrop-blur-xs sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Brand & Context */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-surgical rounded-xs shrink-0" />
              <div>
                <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink leading-tight">
                  NEET Choice Selector
                </h1>
                <p className="text-[11px] font-mono text-ink/70">
                  Telangana MBBS Counselling Form Companion · 2026–27
                </p>
              </div>
            </div>

            {/* Mobile shortlist button in header */}
            <button
              type="button"
              onClick={() => setShowShortlistOnly(!showShortlistOnly)}
              className={`sm:hidden flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border ${
                showShortlistOnly
                  ? 'bg-marigold text-ink font-bold border-marigold'
                  : 'bg-white text-ink/80 border-line'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${shortlistIds.length > 0 ? 'fill-marigold text-marigold' : ''}`} />
              <span>{shortlistIds.length}</span>
            </button>
          </div>

          {/* Search bar & Shortlist toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" />
              <input
                type="text"
                placeholder="Search college, code, or city..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full bg-white border border-line pl-8.5 pr-8 py-1.5 text-xs font-sans text-ink placeholder:text-ink/40 focus:outline-2 focus:outline-surgical rounded-none"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Desktop Shortlist Tab */}
            <button
              type="button"
              onClick={() => setShowShortlistOnly(!showShortlistOnly)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-mono border transition ${
                showShortlistOnly
                  ? 'bg-marigold text-ink font-bold border-marigold shadow-xs'
                  : 'bg-white hover:bg-paper text-ink border-line'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${shortlistIds.length > 0 ? 'fill-marigold text-marigold' : ''}`} />
              <span>
                {showShortlistOnly ? 'VIEW ALL COLLEGES' : `MY SHORTLIST (${shortlistIds.length})`}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Notice Banner: Sourced vs Unverified Bed Counts */}
      <div className="bg-white/80 border-b border-line px-4 sm:px-6 py-2 text-xs text-ink/75 font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-surgical shrink-0" />
            <span>
              <strong>Data Trust Note:</strong> Bed counts for <strong>Osmania, Kakatiya, and Gandhi</strong> are officially verified; the other 66 colleges are unverified estimates flagged with <span className="font-mono text-ink font-bold">~est</span> per Architecture.md §6b.
            </span>
          </div>
          <span className="font-mono text-[11px] text-ink/60 hidden md:inline">
            Reference Origin: <strong>{filters.homeCity}</strong>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Persistent Left Rail (Secondary adaptation per Design.md) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-20">
          <FilterControls
            filters={filters}
            onFilterChange={setFilters}
            availableCities={availableCities}
            totalCollegesCount={allColleges.length}
            matchedCount={filteredRankedColleges.length}
          />
        </aside>

        {/* Right Section: Active Chips, Meta Bar, Card Stack */}
        <section className="lg:col-span-8 space-y-4">
          {/* Active Filter Chips */}
          <ActiveFilterChips
            filters={filters}
            onRemoveType={removeType}
            onRemoveCity={removeCity}
            onResetMinRating={resetMinRating}
            onResetMinBeds={resetMinBeds}
            onResetMaxDistance={resetMaxDistance}
            onResetMaxFee={resetMaxFee}
            onResetWeight={resetWeight}
            onResetAll={resetAllFilters}
            totalActiveCount={totalActiveFiltersCount}
          />

          {/* List Meta & Strategy Descriptor Header */}
          <div className="bg-white border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-surgical font-bold">
                  {showShortlistOnly ? 'Shortlisted Candidates' : 'Live Match Ranking'}
                </span>
                <span className="text-line">•</span>
                <span className="font-mono text-xs text-ink/60">
                  {displayedColleges.length} of {allColleges.length} colleges
                </span>
              </div>
              <h2 className="font-display font-semibold text-base text-ink mt-0.5">
                {showShortlistOnly
                  ? `Your Choice-Filling Shortlist (${shortlistIds.length} selected)`
                  : strategySummary}
              </h2>
            </div>

            {/* Mobile Filter Sheet Trigger */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-surgical text-white text-xs font-mono font-medium shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter & Rank ({totalActiveFiltersCount})
              </button>
            </div>
          </div>

          {/* College Card Stack */}
          {displayedColleges.length > 0 ? (
            <div className="space-y-3.5">
              {displayedColleges.map((item, index) => (
                <CollegeCard
                  key={item.college.id}
                  rankedItem={item}
                  rankIndex={index + 1}
                  homeCity={filters.homeCity}
                  isShortlisted={shortlistIds.includes(item.college.id)}
                  onToggleShortlist={toggleShortlist}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-line p-10 text-center space-y-3">
              <div className="w-10 h-10 bg-paper border border-line rounded-full flex items-center justify-center mx-auto text-ink/40">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink">
                No colleges match your active criteria
              </h3>
              <p className="text-xs text-ink/70 max-w-md mx-auto font-sans leading-relaxed">
                {showShortlistOnly
                  ? "You haven't added any colleges to your shortlist yet. Click the SHORTLIST button on any card to star it."
                  : 'Try relaxing your distance, bed count, or fee filters to see more colleges in the list.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2 bg-paper hover:bg-paper/80 border border-line text-xs font-mono text-ink transition"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Primary Bottom-Sheet (Primary design target per Design.md) */}
      <MobileBottomSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter & Rank Priorities"
        matchedCount={filteredRankedColleges.length}
      >
        <FilterControls
          filters={filters}
          onFilterChange={setFilters}
          availableCities={availableCities}
          totalCollegesCount={allColleges.length}
          matchedCount={filteredRankedColleges.length}
        />
      </MobileBottomSheet>

      {/* Mobile Sticky Floating Action Trigger (if sheet is closed) */}
      <div className="lg:hidden fixed bottom-4 right-4 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-surgical text-white font-mono text-xs font-semibold shadow-lg hover:bg-surgical/90 border border-surgical active:scale-98 transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters & Rank ({totalActiveFiltersCount})</span>
        </button>
      </div>
    </div>
  );
}

export default App;
