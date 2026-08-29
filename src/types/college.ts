export interface College {
  id: string | number;
  name: string;
  college_code: string | null;
  year_established: number | null;
  fee_category_a: number | null;
  fee_management_quota: number | null;
  fee_nri_quota: number | null;
  city: string;
  type: string; // government / private / deemed
  lat: number | null;
  lng: number | null;
  nirf_rank: number | null;
  nirf_score: number | null;
  beds: number | null;
  google_rating: number | null;
  google_review_count: number | null;
  data_notes: string | null;
}
