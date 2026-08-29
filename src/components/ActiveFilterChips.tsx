import React from 'react';
import { FilterState } from '../types/filter';
import { CriterionId, REGISTERED_CRITERIA } from '../utils/ranking';
import { X, RotateCcw } from 'lucide-react';

interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemoveType: (type: 'government' | 'private' | 'deemed') => void;
  onRemoveCity: (city: string) => void;
  onResetMinRating: () => void;
  onResetMinBeds: () => void;
  onResetMaxDistance: () => void;
  onResetMaxFee: () => void;
  onResetWeight: (criterionId: CriterionId) => void;
  onResetAll: () => void;
  totalActiveCount: number;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemoveType,
  onRemoveCity,
  onResetMinRating,
  onResetMinBeds,
  onResetMaxDistance,
  onResetMaxFee,
  onResetWeight,
  onResetAll,
  totalActiveCount,
}) => {
  if (totalActiveCount === 0) return null;

  return (
    <div className="bg-white border border-line p-3 flex flex-wrap items-center gap-2 text-xs shadow-2xs">
      <span className="font-mono text-xs uppercase tracking-wider text-ink/70 font-semibold mr-1">
        Active Criteria ({totalActiveCount}):
      </span>

      {/* College Type Tags */}
      {filters.types.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 bg-paper border border-line text-ink px-2 py-1 font-mono uppercase text-[11px]"
        >
          Type: {t}
          <button
            type="button"
            onClick={() => onRemoveType(t)}
            className="hover:text-rank-red transition"
            aria-label={`Remove ${t} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* City Tags */}
      {filters.cities.map((city) => (
        <span
          key={city}
          className="inline-flex items-center gap-1 bg-paper border border-line text-ink px-2 py-1 font-mono text-[11px]"
        >
          City: {city}
          <button
            type="button"
            onClick={() => onRemoveCity(city)}
            className="hover:text-rank-red transition"
            aria-label={`Remove ${city} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Min Beds Filter */}
      {filters.minBeds !== null && (
        <span className="inline-flex items-center gap-1 bg-paper border border-line text-ink px-2 py-1 font-mono text-[11px]">
          Beds ≥ {filters.minBeds}
          <button
            type="button"
            onClick={onResetMinBeds}
            className="hover:text-rank-red transition"
            aria-label="Remove minimum beds filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Min Rating Filter */}
      {filters.minRating !== null && (
        <span className="inline-flex items-center gap-1 bg-paper border border-line text-ink px-2 py-1 font-mono text-[11px]">
          Rating ≥ {filters.minRating}★
          <button
            type="button"
            onClick={onResetMinRating}
            className="hover:text-rank-red transition"
            aria-label="Remove minimum rating filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Max Distance Filter */}
      {filters.maxDistance !== null && (
        <span className="inline-flex items-center gap-1 bg-paper border border-line text-ink px-2 py-1 font-mono text-[11px]">
          Within {filters.maxDistance} km
          <button
            type="button"
            onClick={onResetMaxDistance}
            className="hover:text-rank-red transition"
            aria-label="Remove maximum distance filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Max Govt Fee Filter */}
      {filters.maxFeeGovt !== null && (
        <span className="inline-flex items-center gap-1 bg-paper border border-line text-ink px-2 py-1 font-mono text-[11px]">
          Fee ≤ ₹{(filters.maxFeeGovt / 1000).toFixed(0)}k
          <button
            type="button"
            onClick={onResetMaxFee}
            className="hover:text-rank-red transition"
            aria-label="Remove maximum fee filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Active Ranking Weight Weights */}
      {(Object.keys(filters.weights) as CriterionId[]).map((cid) => {
        const weight = filters.weights[cid];
        if (!weight || weight <= 0) return null;
        const config = REGISTERED_CRITERIA[cid];
        return (
          <span
            key={cid}
            className="inline-flex items-center gap-1 bg-surgical/10 border border-surgical/40 text-surgical px-2 py-1 font-mono text-[11px] font-medium"
          >
            Weight {config.shortLabel}: {weight}%
            <button
              type="button"
              onClick={() => onResetWeight(cid)}
              className="hover:text-rank-red transition ml-0.5"
              aria-label={`Reset ${config.shortLabel} weight`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        );
      })}

      {/* Clear All Reset Button */}
      <button
        type="button"
        onClick={onResetAll}
        className="ml-auto inline-flex items-center gap-1 text-xs font-mono text-ink/60 hover:text-rank-red transition px-2 py-1 border border-dashed border-line hover:border-rank-red"
      >
        <RotateCcw className="w-3 h-3" />
        Reset All
      </button>
    </div>
  );
};
