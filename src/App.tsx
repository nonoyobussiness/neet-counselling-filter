import { useState } from 'react';
import { useCollegeFilter } from './hooks/useCollegeFilter';
import { CollegeCard } from './components/CollegeCard';
import { CollegeTable } from './components/CollegeTable';
import { FilterControls } from './components/FilterControls';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { exportCollegesToPDF } from './utils/pdfExport';
import { REGISTERED_CRITERIA, CriterionId } from './utils/ranking';
import {
  Search,
  SlidersHorizontal,
  Building,
  Info,
  X,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export function App() {
  const {
    allColleges,
    filters,
    setFilters,
    filteredRankedColleges,
    displayColleges,
    isManuallyReordered,
    reorderColleges,
    resetManualOrder,
    availableCities,
    applySingleSort,
    activeSingleSortCriterion,
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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportPDF = async () => {
    if (displayColleges.length === 0) return;
    setIsExporting(true);
    const success = await exportCollegesToPDF('printable-submission-document');
    setIsExporting(false);
    if (success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Active strategy description
  const activeWeightsList = (Object.keys(filters.weights) as CriterionId[])
    .filter((cid) => (filters.weights[cid] || 0) > 0)
    .map((cid) => `${REGISTERED_CRITERIA[cid].shortLabel} (${filters.weights[cid]}%)`);

  const strategySummary =
    activeWeightsList.length > 0
      ? activeWeightsList.join(' + ')
      : 'Alphabetical order (no weights set)';

  // Summary counts for the current filtered list
  const govtCount = displayColleges.filter((c) => c.college.type === 'government').length;
  const privateCount = displayColleges.filter((c) => c.college.type === 'private').length;
  const deemedCount = displayColleges.filter((c) => c.college.type === 'deemed').length;
  const totalBeds = displayColleges.reduce((sum, c) => sum + (c.college.beds || 0), 0);

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans antialiased selection:bg-surgical selection:text-white">
      {/* 1. Official Header */}
      <header className="no-print border-b border-line bg-paper/95 backdrop-blur-xs sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Brand & Context */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 select-none">
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
          </div>

          {/* Search bar and PDF/Print Export Trigger */}
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
                  aria-label="Clear search query"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Print Action */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={displayColleges.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-paper border border-line text-xs font-mono text-ink transition disabled:opacity-40"
              title="Print official choice document"
            >
              <Printer className="w-3.5 h-3.5 text-surgical" />
              <span>Print</span>
            </button>

            {/* Export PDF Action */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting || displayColleges.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surgical hover:bg-surgical/90 text-white border border-surgical text-xs font-mono font-semibold shadow-xs disabled:opacity-40 transition"
              title="Export current filtered/sorted list to official PDF"
            >
              {exportSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                  <span>PDF Exported!</span>
                </>
              ) : isExporting ? (
                <span>Generating...</span>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF ({displayColleges.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notice Banner: Sourced vs Unverified Bed Counts */}
      <div className="no-print bg-white/80 border-b border-line px-4 sm:px-6 py-2 text-xs text-ink/75 font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-surgical shrink-0" />
            <span>
              <strong>Data Provenance:</strong> Bed counts for <strong>Osmania, Kakatiya, and Gandhi</strong> are officially verified; the other 66 colleges carry a <span className="font-mono text-ink font-bold">~est</span> badge per Architecture.md §6b.
            </span>
          </div>
          <span className="font-mono text-[11px] text-ink/60 hidden md:inline">
            Reference Origin: <strong>{filters.homeCity}</strong>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Persistent Left Rail */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-20">
            <FilterControls
              filters={filters}
              onFilterChange={setFilters}
              availableCities={availableCities}
              totalCollegesCount={allColleges.length}
              matchedCount={filteredRankedColleges.length}
            />
          </aside>

          {/* Right Section: Active Chips, Meta Bar, Card/Table View */}
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

            {/* List Meta & Action Header (View Mode Toggle + Strategy Descriptor + Manual Reorder Indicator) */}
            <div className="bg-white border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-surgical font-bold">
                    Live Priority Order
                  </span>
                  <span className="text-line">•</span>
                  <span className="font-mono text-xs text-ink/60">
                    {displayColleges.length} of {allColleges.length} colleges
                  </span>
                  {isManuallyReordered && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-marigold/20 border border-marigold/40 font-mono text-[10px] text-ink font-bold">
                      <span>Manual Override Active</span>
                      <button
                        type="button"
                        onClick={resetManualOrder}
                        className="hover:text-rank-red ml-1 underline cursor-pointer"
                        title="Reset to calculated rank order"
                      >
                        (Reset)
                      </button>
                    </span>
                  )}
                </div>
                <h2 className="font-display font-semibold text-base text-ink mt-0.5">
                  {strategySummary}
                </h2>
              </div>

              {/* Actions: View Mode Toggle & Mobile Filter Trigger */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                {/* Reset Manual Order Button if active */}
                {isManuallyReordered && (
                  <button
                    type="button"
                    onClick={resetManualOrder}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-paper hover:bg-paper/80 border border-line text-ink transition"
                    title="Reset list back to active multi-criteria rank order"
                  >
                    <RotateCcw className="w-3 h-3 text-surgical" />
                    <span className="hidden sm:inline">Reset Order</span>
                  </button>
                )}

                {/* View Mode Toggle: Cards vs Table (Architecture.md §5c, Design.md) */}
                <div className="flex items-center border border-line bg-paper p-0.5" role="group" aria-label="Browse view mode">
                  <button
                    type="button"
                    onClick={() => setViewMode('card')}
                    aria-pressed={viewMode === 'card'}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition ${
                      viewMode === 'card'
                        ? 'bg-ink text-white font-bold shadow-xs'
                        : 'text-ink/70 hover:text-ink'
                    }`}
                    title="Card view (Hall-ticket stub format with drag-to-reorder)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    aria-pressed={viewMode === 'table'}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition ${
                      viewMode === 'table'
                        ? 'bg-ink text-white font-bold shadow-xs'
                        : 'text-ink/70 hover:text-ink'
                    }`}
                    title="Table view (Dense ledger format with drag-to-reorder)"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                </div>

                {/* Mobile Filter Sheet Trigger */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex lg:hidden items-center justify-center gap-1.5 px-3 py-1.5 bg-surgical text-white text-xs font-mono font-medium shadow-xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter ({totalActiveFiltersCount})</span>
                </button>
              </div>
            </div>

            {/* College Card Stack or Dense Table View with Drag & Reorder */}
            {displayColleges.length > 0 ? (
              viewMode === 'card' ? (
                <div className="space-y-3.5">
                  {displayColleges.map((item, index) => (
                    <CollegeCard
                      key={item.college.id}
                      rankedItem={item}
                      rankIndex={index + 1}
                      homeCity={filters.homeCity}
                      totalCount={displayColleges.length}
                      onReorder={reorderColleges}
                    />
                  ))}
                </div>
              ) : (
                <CollegeTable
                  colleges={displayColleges}
                  homeCity={filters.homeCity}
                  onSingleSort={applySingleSort}
                  activeSingleSortCriterion={activeSingleSortCriterion}
                  onReorder={reorderColleges}
                />
              )
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
                  Try relaxing your distance, bed count, or fee filters to see more colleges in the list.
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
        </div>
      </main>

      {/* Mobile Primary Bottom-Sheet */}
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

      {/* Mobile Sticky Floating Action Trigger */}
      <div className="lg:hidden fixed bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportPDF}
          disabled={isExporting || displayColleges.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-3 bg-ink text-white font-mono text-xs font-bold shadow-lg border border-ink active:scale-98 transition disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>PDF ({displayColleges.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-surgical text-white font-mono text-xs font-semibold shadow-lg hover:bg-surgical/90 border border-surgical active:scale-98 transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters ({totalActiveFiltersCount})</span>
        </button>
      </div>

      {/* Printable Submission Document (Off-screen on display, captured by html2canvas and rendered on @media print) */}
      <div
        id="printable-submission-document"
        className="print-submission-document fixed left-[-9999px] top-0 w-[1024px] pointer-events-none bg-white p-6 sm:p-8 text-ink font-sans print:static print:left-auto print:w-full print:block"
      >
        {/* Document Header */}
        <div className="border-b-2 border-ink pb-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 bg-surgical inline-block" />
            <span className="font-mono text-xs uppercase tracking-widest text-surgical font-bold">
              KNRUHS · NEET UG CHOICE SELECTION FORM
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Telangana MBBS College Priority List
          </h1>
          <p className="text-xs font-mono text-ink/70 mt-1">
            Official Choice-Filling Priority Order Document · Reference Origin: <strong>{filters.homeCity}</strong> · Generated: {currentDateFormatted}
          </p>

          {/* Meta summary stats */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-line font-mono text-xs">
            <div className="bg-paper p-2 border border-line">
              <span className="text-[10px] text-ink/60 block uppercase">Matching Choices</span>
              <strong className="text-sm text-ink">{displayColleges.length} Colleges</strong>
            </div>
            <div className="bg-paper p-2 border border-line">
              <span className="text-[10px] text-ink/60 block uppercase">Govt / Private</span>
              <strong className="text-sm text-ink">{govtCount} Govt · {privateCount + deemedCount} Pvt</strong>
            </div>
            <div className="bg-paper p-2 border border-line">
              <span className="text-[10px] text-ink/60 block uppercase">Attached Beds</span>
              <strong className="text-sm text-ink">{totalBeds.toLocaleString()} Total</strong>
            </div>
            <div className="bg-paper p-2 border border-line">
              <span className="text-[10px] text-ink/60 block uppercase">Counselling Year</span>
              <strong className="text-sm text-ink">2026–2027</strong>
            </div>
          </div>
        </div>

        {/* 4-Column Compact Submission Table for Counselling Staff (always matches on-screen display order including drags) */}
        {displayColleges.length > 0 ? (
          <table className="w-full text-left border-collapse font-sans text-xs border border-line">
            <thead>
              <tr className="bg-paper border-b-2 border-line font-mono text-[11px] uppercase tracking-wider text-ink">
                <th scope="col" className="py-2.5 px-3 border-r border-line text-center w-16 shrink-0">
                  Order #
                </th>
                <th scope="col" className="py-2.5 px-3 border-r border-line w-40 sm:w-48 font-bold text-surgical">
                  College Code
                </th>
                <th scope="col" className="py-2.5 px-4 border-r border-line">
                  College / Institution Name
                </th>
                <th scope="col" className="py-2.5 px-3 w-32 sm:w-36">
                  City / Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              {displayColleges.map((item, index) => {
                const { college } = item;
                const priorityNum = String(index + 1).padStart(2, '0');
                const hasCode = Boolean(college.college_code);
                const codeDisplay = hasCode ? college.college_code : college.name;

                return (
                  <tr key={college.id} className="border-b border-line">
                    {/* 1. Priority Order Number */}
                    <td className="py-2.5 px-3 border-r border-line text-center font-mono font-bold text-sm bg-paper/40 text-ink">
                      {priorityNum}
                    </td>

                    {/* 2. College Code (Primary column, prominent, mono; full name fallback if null) */}
                    <td className="py-2.5 px-3 border-r border-line font-mono tracking-wider bg-surgical/5">
                      {hasCode ? (
                        <span className="text-sm font-bold font-mono text-ink bg-white px-2 py-0.5 border border-line inline-block">
                          {codeDisplay}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-ink font-sans leading-snug">
                          {codeDisplay}
                        </span>
                      )}
                    </td>

                    {/* 3. College Name */}
                    <td className="py-2.5 px-4 border-r border-line font-sans font-medium text-xs sm:text-sm text-ink leading-snug">
                      {college.name}
                    </td>

                    {/* 4. City */}
                    <td className="py-2.5 px-3 font-sans text-xs text-ink/80">
                      {college.city}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="border border-dashed border-line p-8 text-center space-y-2">
            <p className="font-display font-medium text-base text-ink">
              No matching colleges in current filter view.
            </p>
          </div>
        )}

        {/* Document Footnote / Provenance Disclaimers */}
        <div className="mt-8 pt-4 border-t-2 border-dashed border-line text-[11px] text-ink/60 font-sans leading-relaxed space-y-1">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-3 h-3 text-surgical mt-0.5 shrink-0" />
            <p>
              <strong>Data Provenance Notice:</strong> Bed counts for Osmania Medical College (1,168), Kakatiya Medical College/MGM (1,450), and Gandhi Medical College (1,200) are officially sourced. Colleges marked with <strong className="font-mono text-ink">~est</strong> reflect figures from a secondary educational report. Tuition fees reflect KNRUHS 2026–27 notified structures (via mdmsenquiry.com) — please verify against the official KNRUHS counselling brochure before final submission.
            </p>
          </div>
          <p className="font-mono text-[10px] text-ink/40 pt-1">
            Official NEET UG Choice Selection Form · Generated via NEET Choice Selector Form Companion · Offline Static Export
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
