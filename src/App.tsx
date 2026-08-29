import { useState, useMemo } from 'react';
import rawColleges from './data/colleges.json';
import { College } from './types/college';
import { TELANGANA_CITIES } from './utils/haversine';
import {
  CriterionId,
  REGISTERED_CRITERIA,
  UserWeights,
  computeCollegeRankings,
  sortRankedColleges,
  validateWeights,
} from './utils/ranking';

const colleges = rawColleges as College[];

export function App() {
  const [selectedCity, setSelectedCity] = useState<string>('Hyderabad');
  const [weights, setWeights] = useState<UserWeights>({
    beds: 40,
    distance_from_home: 30,
    google_rating: 30,
    fee_category_a: 0,
    google_review_count: 0,
  });

  // Find coordinates of selected home city
  const homeCoords = useMemo(() => {
    const found = TELANGANA_CITIES.find((c) => c.city === selectedCity);
    return found ? { lat: found.lat, lng: found.lng } : null;
  }, [selectedCity]);

  // Validation
  const validation = useMemo(() => validateWeights(weights), [weights]);

  // Compute live ranking
  const rankedColleges = useMemo(() => {
    const computed = computeCollegeRankings(colleges, weights, homeCoords);
    return sortRankedColleges(computed);
  }, [weights, homeCoords]);

  const handleWeightChange = (id: CriterionId, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(100, val)),
    }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => (a || 0) + (b || 0), 0);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-line bg-paper px-4 sm:px-6 py-4 sticky top-0 z-20 backdrop-blur-sm bg-paper/95">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-surgical rounded-sm"></div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-ink">
                NEET Choice Selector
              </h1>
              <p className="text-xs text-ink/70">Telangana MBBS Counselling Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-1 bg-white border border-line text-ink rounded shadow-2xs">
              {colleges.length} Colleges · 100% Client-Side Engine
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Rail / Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Home City Selector */}
          <div className="bg-white border border-line p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h2 className="font-display font-semibold text-ink text-base">
                1. Your Home Location
              </h2>
              <span className="font-mono text-xs text-surgical">Haversine</span>
            </div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink/80 mb-2">
              Select Reference City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-paper border border-line px-3 py-2 text-sm font-sans text-ink focus:outline-2 focus:outline-surgical rounded-none"
            >
              {TELANGANA_CITIES.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.lat}°N, {c.lng}°E)
                </option>
              ))}
            </select>
            <p className="text-xs text-ink/60 mt-2">
              Distances to all 69 colleges are computed live in-browser using exact coordinates.
            </p>
          </div>

          {/* Ranking Weights */}
          <div className="bg-white border border-line p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h2 className="font-display font-semibold text-ink text-base">
                2. Ranking Priorities
              </h2>
              <span className="font-mono text-xs text-ink/70">
                Sum: <strong className="text-surgical">{totalWeight}</strong>
              </span>
            </div>

            <div className="space-y-4">
              {(Object.keys(REGISTERED_CRITERIA) as CriterionId[]).map((criterionId) => {
                const config = REGISTERED_CRITERIA[criterionId];
                const currentVal = weights[criterionId] || 0;
                return (
                  <div key={criterionId} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-ink flex items-center gap-1.5">
                        {config.shortLabel}
                        <span className="text-[10px] text-ink/60 font-mono">
                          ({config.direction === 'lower_is_better' ? 'lower=better' : 'higher=better'})
                        </span>
                      </span>
                      <span className="font-mono font-semibold text-surgical bg-paper px-1.5 py-0.5 border border-line">
                        {currentVal}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentVal}
                      onChange={(e) => handleWeightChange(criterionId, Number(e.target.value))}
                      className="w-full accent-surgical cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            {!validation.isValid && (
              <div className="mt-4 p-2 bg-rank-red/10 border border-rank-red text-rank-red text-xs">
                {validation.errors.join(' ')}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-line flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setWeights({
                    beds: 50,
                    distance_from_home: 50,
                    google_rating: 0,
                    fee_category_a: 0,
                    google_review_count: 0,
                  })
                }
                className="flex-1 text-xs py-1.5 bg-paper hover:bg-paper/80 border border-line font-mono text-ink text-center transition"
              >
                Beds + Distance
              </button>
              <button
                type="button"
                onClick={() =>
                  setWeights({
                    beds: 0,
                    distance_from_home: 0,
                    google_rating: 70,
                    google_review_count: 30,
                    fee_category_a: 0,
                  })
                }
                className="flex-1 text-xs py-1.5 bg-paper hover:bg-paper/80 border border-line font-mono text-ink text-center transition"
              >
                Reputation Only
              </button>
            </div>
          </div>
        </div>

        {/* Right Section / Results */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-line p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-surgical font-semibold">
                Live Ranking Results
              </span>
              <h3 className="font-display font-semibold text-lg text-ink">
                Sorted by Custom Weighted Score
              </h3>
            </div>
            <div className="text-right font-mono text-xs text-ink/70">
              Showing <strong>{rankedColleges.length}</strong> colleges
            </div>
          </div>

          <div className="space-y-3">
            {rankedColleges.map((item, index) => {
              const { college, distance_from_home, overallScore, isEstimatedBeds } = item;
              return (
                <div
                  key={college.id}
                  className="bg-white border border-line p-4 hover:border-surgical transition duration-150 relative overflow-hidden shadow-2xs"
                >
                  {/* Perforated edge effect on left border */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-surgical"></div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pl-2">
                    {/* Left: College info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-rank-red bg-rank-red/10 px-1.5 py-0.5 rounded-none">
                          #{index + 1}
                        </span>
                        {college.college_code && (
                          <span className="font-mono text-xs bg-paper border border-line text-ink px-1.5 py-0.5 font-semibold">
                            {college.college_code}
                          </span>
                        )}
                        <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 bg-paper text-ink/80 border border-line">
                          {college.type}
                        </span>
                        {college.year_established && (
                          <span className="font-mono text-xs text-ink/60">
                            Est. {college.year_established}
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-semibold text-base text-ink pt-1">
                        {college.name}
                      </h4>
                      <p className="text-xs text-ink/70">
                        {college.city} · {distance_from_home !== null ? `${distance_from_home} km from ${selectedCity}` : 'Distance unavailable'}
                      </p>
                    </div>

                    {/* Right: Score & Key Stats */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 border-line pt-2 sm:pt-0">
                      {overallScore !== null && (
                        <div className="text-right">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-ink/60 block">
                            Match Score
                          </span>
                          <span className="font-mono font-bold text-lg text-surgical">
                            {overallScore}
                            <span className="text-xs text-ink/60">/100</span>
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-right font-mono text-xs">
                        <div className="text-ink/80">
                          Beds:{' '}
                          <strong className="text-ink">
                            {college.beds ?? '—'}
                          </strong>
                          {isEstimatedBeds && (
                            <span
                              title="Bed count from secondary report (unverified estimate)"
                              className="text-[10px] text-marigold font-bold ml-0.5"
                            >
                              ~est
                            </span>
                          )}
                        </div>
                        <div className="text-ink/80">
                          Rating:{' '}
                          <strong className="text-ink">
                            {college.google_rating !== null ? `${college.google_rating}★` : '—'}
                          </strong>
                        </div>
                        <div className="text-ink/80">
                          Reviews:{' '}
                          <strong className="text-ink">
                            {college.google_review_count ?? '—'}
                          </strong>
                        </div>
                        <div className="text-ink/80">
                          Fee:{' '}
                          <strong className="text-ink">
                            {college.fee_category_a !== null
                              ? `₹${(college.fee_category_a / 1000).toFixed(0)}k`
                              : '—'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NIRF Rank or Data note highlight */}
                  {college.nirf_rank && (
                    <div className="mt-3 pt-2 border-t border-line text-xs font-mono text-surgical flex items-center gap-1">
                      <span>★ NIRF Medical 2025 Rank #{college.nirf_rank}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
