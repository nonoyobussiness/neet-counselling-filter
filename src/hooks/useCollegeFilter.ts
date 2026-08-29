import { useState, useMemo, useEffect } from 'react';
import rawColleges from '../data/colleges.json';
import { College } from '../types/college';
import { FilterState, CollegeType, RANKING_PRESETS } from '../types/filter';
import { TELANGANA_CITIES } from '../utils/haversine';
import {
  CriterionId,
  computeCollegeRankings,
  sortRankedColleges,
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

const SHORTLIST_STORAGE_KEY = 'neet_shortlisted_college_ids';

export function useCollegeFilter() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [shortlistIds, setShortlistIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save shortlist to localStorage for convenience
  useEffect(() => {
    try {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlistIds));
    } catch {
      // ignore
    }
  }, [shortlistIds]);

  const toggleShortlist = (id: string | number) => {
    setShortlistIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

  // Compute ranking & apply filters
  const { filteredRankedColleges, totalActiveFiltersCount } = useMemo(() => {
    // 1. First compute distance and score for all colleges
    const allRanked = computeCollegeRankings(allColleges, filters.weights, homeCoords);

    // 2. Filter by hard constraints
    const filtered = allRanked.filter(({ college, distance_from_home }) => {
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

    // 3. Sort according to weighted ranking score (or fallback)
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
  }, [filters, homeCoords]);

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
  };
}
