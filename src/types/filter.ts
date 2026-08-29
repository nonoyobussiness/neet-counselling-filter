import { UserWeights } from '../utils/ranking';

export type CollegeType = 'government' | 'private' | 'deemed';

export interface FilterState {
  search: string;
  types: CollegeType[];
  cities: string[];
  homeCity: string;
  minRating: number | null;
  minBeds: number | null;
  maxDistance: number | null;
  maxFeeGovt: number | null;
  weights: UserWeights;
  activePresetId: string | null;
}

export interface PresetConfig {
  id: string;
  label: string;
  description: string;
  weights: UserWeights;
}

export const RANKING_PRESETS: PresetConfig[] = [
  {
    id: 'balanced',
    label: 'Balanced Choice',
    description: 'Beds (35%), Distance (30%), Rating (20%), Reviews (15%)',
    weights: {
      beds: 35,
      distance_from_home: 30,
      google_rating: 20,
      google_review_count: 15,
      fee_category_a: 0,
    },
  },
  {
    id: 'distance_first',
    label: 'Closest to Home',
    description: 'Prioritize proximity (65%) with hospital size (35%)',
    weights: {
      distance_from_home: 65,
      beds: 35,
      google_rating: 0,
      google_review_count: 0,
      fee_category_a: 0,
    },
  },
  {
    id: 'hospital_heavy',
    label: 'Hospital Beds & Clinical Exposure',
    description: 'Maximum weight on bed volume (70%) and patient reviews (30%)',
    weights: {
      beds: 70,
      google_rating: 15,
      google_review_count: 15,
      distance_from_home: 0,
      fee_category_a: 0,
    },
  },
  {
    id: 'reputation',
    label: 'Top Student Ratings & Reviews',
    description: 'Focus on high ratings (60%) and review volume (40%)',
    weights: {
      google_rating: 60,
      google_review_count: 40,
      beds: 0,
      distance_from_home: 0,
      fee_category_a: 0,
    },
  },
  {
    id: 'budget_friendly',
    label: 'Budget & Govt Tuition',
    description: 'Invert fee (50%) + proximity (30%) + beds (20%)',
    weights: {
      fee_category_a: 50,
      distance_from_home: 30,
      beds: 20,
      google_rating: 0,
      google_review_count: 0,
    },
  },
];
