export interface College {
  id: string;
  name: string;
  aliases: string[];
  state: string;
  city: string;
  lat: number | null;
  lng: number | null;
  type: string; // govt / private / deemed / central
  quota_types: string[]; // AIQ, state, deemed, central
  total_seats: number | null;
  nirf_rank: number | null;
  nirf_score: number | null;
  beds: number | null;
  patient_count_opd: number | null;
  hostel_infra_score: number | null;
  faculty_signal: number | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  source_updated_at: string;
}
