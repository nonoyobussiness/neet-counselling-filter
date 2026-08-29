import { useState, useMemo, useCallback, useEffect } from 'react';
import rawColleges from '../data/colleges.json';
import { College } from '../types/college';
import { FilterState, CollegeType, RANKING_PRESETS } from '../types/filter';
import { TELANGANA_CITIES } from '../utils/haversine';
import {
  CriterionId,
  computeCollegeRankings,
  sortRankedColleges,
  RankedCollege,
} from '../utils/ranking';

const allColleges = rawColleges as College[];

const INITIAL_FILTER_STATE: FilterState = {
  search: '',
  types: [],
  cities: [],
  homeCity: 'Hyderabad',
  minRating: null,
  minBeds: null,
  maxDistance: null,
  maxFeeGovt: null,
  weights: { ...RANKING_PRESETS[0].weights }, // Balanced Choice preset by default
  activePresetId: 'balanced',
};

export function useCollegeFilter() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [manualOrderIds, setManualOrderIds] = useState<(string | number)[] | null>(null);

  // When any filter or weight changes, reset manual reordering to fresh rank order
  useEffect(() => {
    setManualOrderIds(null);
  }, [filters]);

  // Home coordinates
  const homeCoords = useMemo(() => {
    const found = TELANGANA_CITIES.find((c) => c.city === filters.homeCity);
    return found ? { lat: found.lat, lng: found.lng } : null;
  }, [filters.homeCity]);

  // Unique cities list
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    allColleges.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, []);

  // Compute all rankings for all 69 colleges
  const allRankedColleges = useMemo(() => {
    return computeCollegeRankings(allColleges, filters.weights, homeCoords);
  }, [filters.weights, homeCoords]);

  const allRankedCollegesSorted = useMemo(() => {
    return sortRankedColleges(allRankedColleges);
  }, [allRankedColleges]);

  // Filter by hard constraints and sort by active multi-criteria / single sort
  const { filteredRankedColleges, totalActiveFiltersCount } = useMemo(() => {
    const filtered = allRankedColleges.filter(({ college, distance_from_home }) => {
      // Search term
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchName = college.name.toLowerCase().includes(query);
        const matchCity = college.city.toLowerCase().includes(query);
        const matchCode = college.college_code
          ? college.college_code.toLowerCase().includes(query)
          : false;
        if (!matchName && !matchCity && !matchCode) return false;
      }

      // Type filter
      if (filters.types.length > 0) {
        if (!filters.types.includes(college.type as CollegeType)) return false;
      }

      // City filter
      if (filters.cities.length > 0) {
        if (!filters.cities.includes(college.city)) return false;
      }

      // Minimum Beds
      if (filters.minBeds !== null) {
        if (college.beds === null || college.beds < filters.minBeds) return false;
      }

      // Minimum Rating
      if (filters.minRating !== null) {
        if (college.google_rating === null || college.google_rating < filters.minRating) return false;
      }

      // Max Distance
      if (filters.maxDistance !== null && distance_from_home !== null) {
        if (distance_from_home > filters.maxDistance) return false;
      }

      // Max Govt Fee
      if (filters.maxFeeGovt !== null) {
        if (college.fee_category_a !== null && college.fee_category_a > filters.maxFeeGovt) return false;
      }

      return true;
    });

    const sorted = sortRankedColleges(filtered);

    // Count active filters
    let activeCount = 0;
    if (filters.types.length > 0) activeCount += filters.types.length;
    if (filters.cities.length > 0) activeCount += filters.cities.length;
    if (filters.minBeds !== null) activeCount++;
    if (filters.minRating !== null) activeCount++;
    if (filters.maxDistance !== null) activeCount++;
    if (filters.maxFeeGovt !== null) activeCount++;
    if (filters.search.trim()) activeCount++;

    return {
      filteredRankedColleges: sorted,
      totalActiveFiltersCount: activeCount,
    };
  }, [filters, allRankedColleges]);

  // Derive final display order (applying manual position overrides if any exist for current filtered set)
  const displayColleges = useMemo(() => {
    if (!manualOrderIds) return filteredRankedColleges;

    const map = new Map(filteredRankedColleges.map((c) => [c.college.id, c]));
    const result: RankedCollege[] = [];

    for (const id of manualOrderIds) {
      const item = map.get(id);
      if (item) {
        result.push(item);
        map.delete(id);
      }
    }

    // Append any colleges not covered in manualOrderIds
    for (const item of map.values()) {
      result.push(item);
    }

    return result;
  }, [filteredRankedColleges, manualOrderIds]);

  // Reorder colleges (drag-to-reorder / Move Up / Move Down)
  const reorderColleges = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      const currentList = displayColleges;
      if (
        sourceIndex < 0 ||
        sourceIndex >= currentList.length ||
        destinationIndex < 0 ||
        destinationIndex >= currentList.length ||
        sourceIndex === destinationIndex
      ) {
        return;
      }

      const updated = [...currentList];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(destinationIndex, 0, moved);
      setManualOrderIds(updated.map((c) => c.college.id));
    },
    [displayColleges]
  );

  const resetManualOrder = useCallback(() => {
    setManualOrderIds(null);
  }, []);

  // Single sort shortcut (100% on one criterion)
  const applySingleSort = useCallback((criterionId: CriterionId) => {
    setFilters((prev) => ({
      ...prev,
      weights: {
        beds: 0,
        distance_from_home: 0,
        google_rating: 0,
        google_review_count: 0,
        fee_category_a: 0,
        [criterionId]: 100,
      },
      activePresetId: null,
    }));
  }, []);

  // Active single sort criterion helper (if exactly one criterion has 100% weight)
  const activeSingleSortCriterion = useMemo<CriterionId | null>(() => {
    const activeKeys = (Object.keys(filters.weights) as CriterionId[]).filter(
      (k) => (filters.weights[k] || 0) > 0
    );
    if (activeKeys.length === 1 && filters.weights[activeKeys[0]] === 100) {
      return activeKeys[0];
    }
    return null;
  }, [filters.weights]);

  // Helpers to reset specific filters
  const removeType = (type: CollegeType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.filter((t) => t !== type),
    }));
  };

  const removeCity = (city: string) => {
    setFilters((prev) => ({
      ...prev,
      cities: prev.cities.filter((c) => c !== city),
    }));
  };

  const resetMinRating = () => setFilters((prev) => ({ ...prev, minRating: null }));
  const resetMinBeds = () => setFilters((prev) => ({ ...prev, minBeds: null }));
  const resetMaxDistance = () => setFilters((prev) => ({ ...prev, maxDistance: null }));
  const resetMaxFee = () => setFilters((prev) => ({ ...prev, maxFeeGovt: null }));

  const resetWeight = (criterionId: CriterionId) => {
    setFilters((prev) => ({
      ...prev,
      weights: { ...prev.weights, [criterionId]: 0 },
      activePresetId: null,
    }));
  };

  const resetAllFilters = () => {
    setFilters((prev) => ({
      ...INITIAL_FILTER_STATE,
      homeCity: prev.homeCity, // keep selected home city
    }));
  };

  return {
    allColleges,
    filters,
    setFilters,
    filteredRankedColleges,
    displayColleges,
    isManuallyReordered: manualOrderIds !== null,
    reorderColleges,
    resetManualOrder,
    allRankedCollegesSorted,
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
  };
}
