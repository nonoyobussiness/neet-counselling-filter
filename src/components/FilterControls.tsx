import React, { useState } from 'react';
import { FilterState, CollegeType, RANKING_PRESETS } from '../types/filter';
import { CriterionId, REGISTERED_CRITERIA } from '../utils/ranking';
import { TELANGANA_CITIES } from '../utils/haversine';
import { Sliders, MapPin, Building2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  availableCities: string[];
  totalCollegesCount: number;
  matchedCount: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  availableCities,
  totalCollegesCount,
  matchedCount,
}) => {
  const [showAdvancedWeights, setShowAdvancedWeights] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = RANKING_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onFilterChange((prev) => ({
      ...prev,
      weights: { ...preset.weights },
      activePresetId: presetId,
    }));
  };

  // Handle single sort selection (sets 100% on chosen criterion)
  const handleSingleSort = (criterionId: CriterionId) => {
    const newWeights: Partial<Record<CriterionId, number>> = {
      beds: 0,
      distance_from_home: 0,
      google_rating: 0,
      google_review_count: 0,
      fee_category_a: 0,
      [criterionId]: 100,
    };
    onFilterChange((prev) => ({
      ...prev,
      weights: newWeights,
      activePresetId: null,
    }));
  };

  // Handle individual weight change
  const handleWeightChange = (id: CriterionId, val: number) => {
    onFilterChange((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [id]: Math.max(0, Math.min(100, val)),
      },
      activePresetId: null, // Custom modification
    }));
  };

  // Toggle college type
  const handleToggleType = (type: CollegeType) => {
    onFilterChange((prev) => {
      const exists = prev.types.includes(type);
      const newTypes = exists
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types: newTypes };
    });
  };

  // Toggle city
  const handleToggleCity = (city: string) => {
    onFilterChange((prev) => {
      const exists = prev.cities.includes(city);
      const newCities = exists
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city];
      return { ...prev, cities: newCities };
    });
  };

  // Filter available cities by search term
  const filteredCitiesList = availableCities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const totalWeight = Object.values(filters.weights).reduce(
    (a, b) => (a || 0) + (b || 0),
    0
  );

  return (
    <div className="space-y-5 text-ink">
      {/* 1. Home Location */}
      <section className="bg-white border border-line p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-line pb-2.5 mb-3">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-ink flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-surgical" />
            1. Home Reference City
          </h3>
          <span className="font-mono text-[11px] text-surgical bg-surgical/10 px-1.5 py-0.5">
            Haversine
          </span>
        </div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-ink/70 mb-1">
          Select Your City
        </label>
        <select
          value={filters.homeCity}
          onChange={(e) =>
            onFilterChange((prev) => ({ ...prev, homeCity: e.target.value }))
          }
          className="w-full bg-paper border border-line px-3 py-2 text-xs font-sans text-ink focus:outline-2 focus:outline-surgical rounded-none"
        >
          {TELANGANA_CITIES.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city} ({c.lat}°N, {c.lng}°E)
            </option>
          ))}
        </select>
        <p className="text-[11px] text-ink/60 mt-1.5 font-sans leading-tight">
          Distances to all 69 colleges are calculated client-side from this center.
        </p>
      </section>

      {/* 2. Ranking Priorities (Unified Sort & Multi-Criteria Engine) */}
      <section className="bg-white border border-line p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-line pb-2.5 mb-3">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-ink flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-surgical" />
            2. Multi-Criteria Ranking
          </h3>
          <span className="font-mono text-xs text-ink/70">
            Weight Sum: <strong className="text-surgical">{totalWeight}</strong>
          </span>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5 mb-4">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink/70">
            Ranking Strategy Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {RANKING_PRESETS.map((preset) => {
              const isSelected = filters.activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`text-left p-2 border text-xs transition ${
                    isSelected
                      ? 'border-surgical bg-surgical/10 text-ink font-semibold'
                      : 'border-line bg-paper hover:bg-paper/80 text-ink/80'
                  }`}
                >
                  <div className="font-medium flex items-center justify-between">
                    <span>{preset.label}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-surgical" />
                    )}
                  </div>
                  <p className="text-[10px] text-ink/60 mt-0.5 line-clamp-1 font-mono">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Single Sort Quick Action Buttons */}
        <div className="mb-4 pt-3 border-t border-line">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink/70 mb-1.5">
            Or Single-Field Sort (100% Weight):
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleSingleSort('beds')}
              className="px-2 py-1 bg-paper hover:bg-paper/80 border border-line text-[11px] font-mono"
            >
              Most Beds
            </button>
            <button
              type="button"
              onClick={() => handleSingleSort('distance_from_home')}
              className="px-2 py-1 bg-paper hover:bg-paper/80 border border-line text-[11px] font-mono"
            >
              Closest Distance
            </button>
            <button
              type="button"
              onClick={() => handleSingleSort('google_rating')}
              className="px-2 py-1 bg-paper hover:bg-paper/80 border border-line text-[11px] font-mono"
            >
              Highest Rating
            </button>
            <button
              type="button"
              onClick={() => handleSingleSort('fee_category_a')}
              className="px-2 py-1 bg-paper hover:bg-paper/80 border border-line text-[11px] font-mono"
            >
              Lowest Govt Fee
            </button>
          </div>
        </div>

        {/* Custom Weight Sliders Toggle */}
        <div className="pt-2 border-t border-line">
          <button
            type="button"
            onClick={() => setShowAdvancedWeights(!showAdvancedWeights)}
            className="w-full flex items-center justify-between py-1 text-xs font-mono text-surgical hover:underline"
          >
            <span>{showAdvancedWeights ? 'Hide Custom Sliders' : 'Customize Signal Weights (Sliders)'}</span>
            {showAdvancedWeights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvancedWeights && (
            <div className="mt-3 space-y-3.5 bg-paper/50 p-3 border border-line/60">
              {(Object.keys(REGISTERED_CRITERIA) as CriterionId[]).map((cid) => {
                const config = REGISTERED_CRITERIA[cid];
                const val = filters.weights[cid] || 0;
                return (
                  <div key={cid} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-ink flex items-center gap-1">
                        {config.label}
                        <span className="text-[10px] text-ink/60 font-mono">
                          ({config.direction === 'lower_is_better' ? 'lower=better' : 'higher=better'})
                        </span>
                      </span>
                      <span className="font-mono text-xs font-semibold text-surgical bg-white px-1.5 py-0.5 border border-line">
                        {val}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={val}
                      onChange={(e) => handleWeightChange(cid, Number(e.target.value))}
                      className="w-full accent-surgical cursor-pointer"
                    />
                  </div>
                );
              })}

              <div className="p-2 bg-paper border border-line text-[10px] text-ink/70 font-sans leading-tight">
                <AlertCircle className="w-3 h-3 text-surgical inline mr-1" />
                Weights are relative and normalized. Beds carry a <span className="font-mono font-bold text-ink">~est</span> badge for 66 unverified estimate colleges.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Categorical & Range Filters */}
      <section className="bg-white border border-line p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-line pb-2.5 mb-3">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-ink flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-surgical" />
            3. Hard Filters
          </h3>
          <span className="font-mono text-xs text-ink/60">
            {matchedCount} / {totalCollegesCount}
          </span>
        </div>

        {/* Institution Type Filter */}
        <div className="space-y-2 mb-4">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-ink/70">
            College Type
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['government', 'private', 'deemed'] as CollegeType[]).map((t) => {
              const active = filters.types.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleToggleType(t)}
                  className={`py-1.5 px-2 text-center text-xs font-mono uppercase transition border ${
                    active
                      ? 'bg-surgical text-white font-semibold border-surgical shadow-2xs'
                      : 'bg-paper text-ink/70 border-line hover:bg-paper/80'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimum Beds Slider */}
        <div className="space-y-1 mb-4 pt-3 border-t border-line">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-ink font-mono text-[11px] uppercase tracking-wider">
              Minimum Hospital Beds
            </span>
            <span className="font-mono font-semibold text-surgical">
              {filters.minBeds !== null ? `≥ ${filters.minBeds}` : 'Any'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1500"
            step="50"
            value={filters.minBeds || 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              onFilterChange((prev) => ({
                ...prev,
                minBeds: val > 0 ? val : null,
              }));
            }}
            className="w-full accent-surgical cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-ink/50">
            <span>Any (0)</span>
            <span>500</span>
            <span>1000</span>
            <span>1500+</span>
          </div>
        </div>

        {/* Maximum Distance Slider */}
        <div className="space-y-1 mb-4 pt-3 border-t border-line">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-ink font-mono text-[11px] uppercase tracking-wider">
              Max Distance from {filters.homeCity}
            </span>
            <span className="font-mono font-semibold text-surgical">
              {filters.maxDistance !== null ? `≤ ${filters.maxDistance} km` : 'Any Distance'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={filters.maxDistance || 300}
            onChange={(e) => {
              const val = Number(e.target.value);
              onFilterChange((prev) => ({
                ...prev,
                maxDistance: val < 300 ? val : null,
              }));
            }}
            className="w-full accent-surgical cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-ink/50">
            <span>0 km</span>
            <span>100 km</span>
            <span>200 km</span>
            <span>Any (300km+)</span>
          </div>
        </div>

        {/* Minimum Google Rating */}
        <div className="space-y-1 mb-4 pt-3 border-t border-line">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-ink font-mono text-[11px] uppercase tracking-wider">
              Minimum Rating
            </span>
            <span className="font-mono font-semibold text-surgical">
              {filters.minRating !== null ? `≥ ${filters.minRating}★` : 'Any'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRating || 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              onFilterChange((prev) => ({
                ...prev,
                minRating: val > 0 ? val : null,
              }));
            }}
            className="w-full accent-surgical cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-ink/50">
            <span>Any</span>
            <span>3.5★</span>
            <span>4.0★</span>
            <span>4.5★+</span>
          </div>
        </div>

        {/* City Multi-Select Filter */}
        <div className="space-y-2 pt-3 border-t border-line">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-ink/70">
              Filter by District / City ({filters.cities.length > 0 ? `${filters.cities.length} selected` : 'All'})
            </label>
            {filters.cities.length > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange((prev) => ({ ...prev, cities: [] }))}
                className="text-[10px] font-mono text-rank-red hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Search cities..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className="w-full bg-paper border border-line px-2.5 py-1 text-xs font-sans text-ink placeholder:text-ink/40 focus:outline-2 focus:outline-surgical rounded-none mb-1.5"
          />
          <div className="max-h-36 overflow-y-auto border border-line bg-paper/30 p-1.5 space-y-1">
            {filteredCitiesList.map((city) => {
              const checked = filters.cities.includes(city);
              return (
                <label
                  key={city}
                  className="flex items-center gap-2 px-1.5 py-1 hover:bg-white text-xs cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleCity(city)}
                    className="accent-surgical w-3.5 h-3.5 rounded-none"
                  />
                  <span className="font-mono text-xs">{city}</span>
                </label>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
