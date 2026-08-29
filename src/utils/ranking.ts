import { College } from '../types/college';
import { haversineDistance } from './haversine';

export type CriterionId =
  | 'google_rating'
  | 'google_review_count'
  | 'beds'
  | 'fee_category_a'
  | 'distance_from_home';

export type NormalizationDirection = 'higher_is_better' | 'lower_is_better';

export interface SignalDefinition {
  id: CriterionId;
  label: string;
  shortLabel: string;
  description: string;
  direction: NormalizationDirection;
  unit: string;
  isConfidenceSensitive?: boolean;
}

export const REGISTERED_CRITERIA: Record<CriterionId, SignalDefinition> = {
  google_rating: {
    id: 'google_rating',
    label: 'Google Rating',
    shortLabel: 'Rating',
    description: 'Average student/visitor rating on Google Places',
    direction: 'higher_is_better',
    unit: '★',
  },
  google_review_count: {
    id: 'google_review_count',
    label: 'Review Volume',
    shortLabel: 'Reviews',
    description: 'Total number of Google reviews (popularity signal)',
    direction: 'higher_is_better',
    unit: 'reviews',
  },
  beds: {
    id: 'beds',
    label: 'Hospital Bed Count',
    shortLabel: 'Beds',
    description: 'Operational bed count of attached teaching hospital',
    direction: 'higher_is_better',
    unit: 'beds',
    isConfidenceSensitive: true,
  },
  fee_category_a: {
    id: 'fee_category_a',
    label: 'Govt Quota Fee (Cat-A)',
    shortLabel: 'Tuition Fee',
    description: 'Annual tuition fee under government/convenor quota (lower is better)',
    direction: 'lower_is_better',
    unit: '₹/yr',
  },
  distance_from_home: {
    id: 'distance_from_home',
    label: 'Distance from Home',
    shortLabel: 'Distance',
    description: 'Straight-line distance from selected home town (lower is better)',
    direction: 'lower_is_better',
    unit: 'km',
  },
};

export type UserWeights = Partial<Record<CriterionId, number>>;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  activeCriteriaCount: number;
}

/**
 * Validates user-entered filter weights.
 * - Weights must be finite, non-negative numbers
 * - At least one weight > 0 is needed for ranking
 */
export function validateWeights(weights: UserWeights): ValidationResult {
  const errors: string[] = [];
  let activeCount = 0;

  for (const [key, value] of Object.entries(weights)) {
    if (value === undefined || value === null) continue;
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`Weight for ${key} must be a valid number.`);
    } else if (value < 0) {
      errors.push(`Weight for ${key} cannot be negative.`);
    } else if (value > 0) {
      activeCount++;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    activeCriteriaCount: activeCount,
  };
}

export interface Bounds {
  min: number;
  max: number;
}

/**
 * Calculates dataset min/max for a criterion.
 */
export function calculateCriterionBounds(
  colleges: College[],
  criterionId: CriterionId,
  homeCoords: { lat: number; lng: number } | null,
): Bounds {
  let min = Infinity;
  let max = -Infinity;

  for (const college of colleges) {
    let rawVal: number | null = null;

    if (criterionId === 'distance_from_home') {
      if (homeCoords && college.lat !== null && college.lng !== null) {
        rawVal = haversineDistance(
          homeCoords.lat,
          homeCoords.lng,
          college.lat,
          college.lng,
        );
      }
    } else {
      rawVal = college[criterionId as keyof College] as number | null;
    }

    if (rawVal !== null && typeof rawVal === 'number' && !isNaN(rawVal)) {
      if (rawVal < min) min = rawVal;
      if (rawVal > max) max = rawVal;
    }
  }

  if (min === Infinity || max === -Infinity) {
    return { min: 0, max: 100 };
  }

  // Prevent divide-by-zero if all values are identical
  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

/**
 * Normalizes a raw signal to a 0–100 scale.
 * Respects 'higher_is_better' vs 'lower_is_better'.
 */
export function normalizeSignal(
  val: number | null,
  bounds: Bounds,
  direction: NormalizationDirection,
): number | null {
  if (val === null || isNaN(val)) return null;

  const { min, max } = bounds;
  if (max === min) return 50;

  // Clamped fraction 0..1
  const clampedVal = Math.max(min, Math.min(max, val));
  const ratio = (clampedVal - min) / (max - min);

  if (direction === 'higher_is_better') {
    return Math.round(ratio * 100 * 10) / 10;
  } else {
    // Invert so lowest value gets 100 and highest gets 0
    return Math.round((1 - ratio) * 100 * 10) / 10;
  }
}

export interface RankedCollege {
  college: College;
  distance_from_home: number | null;
  overallScore: number | null; // 0–100 weighted score, or null if no criteria weighted
  normalizedSignals: Partial<Record<CriterionId, number>>;
  rawSignals: Partial<Record<CriterionId, number | null>>;
  missingSignals: CriterionId[];
  isEstimatedBeds: boolean;
  dataNotes: string | null;
}

/**
 * Checks if a college's bed count is from an unverified secondary estimate
 * based on the documented caveat in data_notes.
 */
export function isUnverifiedBeds(college: College): boolean {
  if (!college.data_notes) return false;
  return college.data_notes.includes('unverified, low-confidence estimate');
}

/**
 * Computes live ranking for all colleges given user weights and home coordinates.
 * Completely client-side and deterministic.
 */
export function computeCollegeRankings(
  colleges: College[],
  weights: UserWeights,
  homeCoords: { lat: number; lng: number } | null,
): RankedCollege[] {
  // Validate weights
  const validation = validateWeights(weights);
  const activeWeights: Partial<Record<CriterionId, number>> = {};

  if (validation.isValid) {
    for (const [key, val] of Object.entries(weights)) {
      if (val && val > 0) {
        // If distance is weighted but no home coordinates set, ignore distance weight
        if (key === 'distance_from_home' && !homeCoords) {
          continue;
        }
        activeWeights[key as CriterionId] = val;
      }
    }
  }

  const activeCriteria = Object.keys(activeWeights) as CriterionId[];
  const totalWeight = activeCriteria.reduce(
    (sum, k) => sum + (activeWeights[k] || 0),
    0,
  );

  // Pre-calculate bounds for all active criteria
  const boundsMap: Partial<Record<CriterionId, Bounds>> = {};
  for (const criterionId of Object.keys(REGISTERED_CRITERIA) as CriterionId[]) {
    boundsMap[criterionId] = calculateCriterionBounds(
      colleges,
      criterionId,
      homeCoords,
    );
  }

  // Score each college
  const ranked: RankedCollege[] = colleges.map((college) => {
    let distance: number | null = null;
    if (homeCoords && college.lat !== null && college.lng !== null) {
      distance = haversineDistance(
        homeCoords.lat,
        homeCoords.lng,
        college.lat,
        college.lng,
      );
    }

    const rawSignals: Partial<Record<CriterionId, number | null>> = {
      google_rating: college.google_rating,
      google_review_count: college.google_review_count,
      beds: college.beds,
      fee_category_a: college.fee_category_a,
      distance_from_home: distance,
    };

    const normalizedSignals: Partial<Record<CriterionId, number>> = {};
    const missingSignals: CriterionId[] = [];

    // Normalize all available signals
    for (const criterionId of Object.keys(REGISTERED_CRITERIA) as CriterionId[]) {
      const rawVal = rawSignals[criterionId] ?? null;
      const bounds = boundsMap[criterionId]!;
      const config = REGISTERED_CRITERIA[criterionId];
      const norm = normalizeSignal(rawVal, bounds, config.direction);

      if (norm !== null) {
        normalizedSignals[criterionId] = norm;
      } else {
        missingSignals.push(criterionId);
      }
    }

    // Compute weighted overall score
    let overallScore: number | null = null;

    if (totalWeight > 0 && activeCriteria.length > 0) {
      let weightedSum = 0;
      let usedWeightSum = 0;

      for (const criterionId of activeCriteria) {
        const weight = activeWeights[criterionId]!;
        const normVal = normalizedSignals[criterionId];

        if (normVal !== undefined && normVal !== null) {
          weightedSum += normVal * weight;
          usedWeightSum += weight;
        }
      }

      if (usedWeightSum > 0) {
        // Normalize against sum of available weights for fair scoring without zero-penalty
        overallScore = Math.round((weightedSum / usedWeightSum) * 10) / 10;
      }
    }

    return {
      college,
      distance_from_home: distance,
      overallScore,
      normalizedSignals,
      rawSignals,
      missingSignals,
      isEstimatedBeds: isUnverifiedBeds(college),
      dataNotes: college.data_notes,
    };
  });

  return ranked;
}

/**
 * Sorts ranked colleges.
 * - If overallScore exists, sorts descending by overallScore.
 * - Fallback to alphabetical by name.
 */
export function sortRankedColleges(ranked: RankedCollege[]): RankedCollege[] {
  return [...ranked].sort((a, b) => {
    if (a.overallScore !== null && b.overallScore !== null) {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
    } else if (a.overallScore !== null && b.overallScore === null) {
      return -1;
    } else if (a.overallScore === null && b.overallScore !== null) {
      return 1;
    }
    return a.college.name.localeCompare(b.college.name);
  });
}
