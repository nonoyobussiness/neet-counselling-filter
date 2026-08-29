import React from 'react';
import { RankedCollege } from '../utils/ranking';
import { Bookmark, MapPin, Award, AlertCircle, Calendar, Bed, Star, ShieldCheck, IndianRupee } from 'lucide-react';

interface CollegeCardProps {
  rankedItem: RankedCollege;
  rankIndex: number;
  homeCity: string;
  isShortlisted: boolean;
  onToggleShortlist: (id: string | number) => void;
  showScoreBreakdown?: boolean;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({
  rankedItem,
  rankIndex,
  homeCity,
  isShortlisted,
  onToggleShortlist,
}) => {
  const { college, distance_from_home, overallScore, isEstimatedBeds } = rankedItem;

  // Format fee for clean display
  const formatFee = (amount: number | null) => {
    if (amount === null) return '—';
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L/yr`;
    }
    return `₹${(amount / 1000).toFixed(0)}k/yr`;
  };

  const isGovt = college.type === 'government';
  const isDeemed = college.type === 'deemed';

  return (
    <article
      aria-label={`${college.name} - Match rank #${rankIndex}`}
      className={`relative bg-white border transition-all duration-150 shadow-2xs ${
        isShortlisted
          ? 'border-marigold bg-white/95 ring-1 ring-marigold/30'
          : 'border-line hover:border-surgical'
      }`}
    >
      {/* Hall-ticket stub perforated / solid indicator on left edge */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isShortlisted ? 'bg-marigold' : 'bg-surgical'
        }`}
      />

      <div className="p-4 sm:p-5 pl-4 sm:pl-5">
        {/* Top bar: Rank, Code, Badges, Shortlist Stamp */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Rank badge */}
            <span className="font-mono text-xs font-bold text-rank-red bg-rank-red/10 border border-rank-red/20 px-2 py-0.5 tracking-tight">
              #{rankIndex}
            </span>

            {/* Official College Code (omit gracefully if null) */}
            {college.college_code && (
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-paper border border-line text-ink tracking-wider">
                {college.college_code}
              </span>
            )}

            {/* Type badge */}
            <span
              className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                isGovt
                  ? 'bg-surgical/10 border-surgical/30 text-surgical font-medium'
                  : isDeemed
                  ? 'bg-ink/5 border-ink/20 text-ink font-medium'
                  : 'bg-paper border-line text-ink/80'
              }`}
            >
              {college.type}
            </span>

            {/* Founding year */}
            {college.year_established && (
              <span className="font-mono text-xs text-ink/60 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-ink/50" />
                Est. {college.year_established}
              </span>
            )}
          </div>

          {/* Shortlist Action */}
          <button
            type="button"
            onClick={() => onToggleShortlist(college.id)}
            aria-label={isShortlisted ? `Remove ${college.name} from shortlist` : `Add ${college.name} to shortlist`}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border transition-all ${
              isShortlisted
                ? 'bg-marigold text-ink font-semibold border-marigold shadow-xs'
                : 'bg-paper hover:bg-white text-ink/70 hover:text-ink border-line'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-ink text-ink' : ''}`} />
            <span>{isShortlisted ? 'SHORTLISTED' : 'SHORTLIST'}</span>
          </button>
        </div>

        {/* College Name & City */}
        <div className="mt-2.5">
          <h3 className="font-display font-semibold text-lg text-ink leading-snug">
            {college.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-ink/70 mt-1 font-sans flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-surgical shrink-0" />
              {college.city}
            </span>
            {distance_from_home !== null && (
              <>
                <span className="text-line">•</span>
                <span className="font-mono text-ink/90 font-medium">
                  {distance_from_home} km from {homeCity}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid in Hall-Ticket Data Layout */}
        <div className="mt-4 pt-3 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-3 bg-paper/40 p-2.5 border-dashed">
          {/* Hospital Beds */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink/60 flex items-center gap-1">
              <Bed className="w-3 h-3 text-surgical" />
              Beds
            </span>
            <div className="font-mono font-bold text-sm text-ink flex items-baseline gap-1">
              {college.beds ?? '—'}
              {isEstimatedBeds ? (
                <span
                  title="Bed count from secondary report (unverified estimate). Sourced officially for only 3 colleges."
                  className="text-[10px] font-normal px-1 py-0.2 bg-marigold/15 border border-marigold/40 text-ink/90 rounded-none cursor-help"
                >
                  ~est
                </span>
              ) : college.beds !== null ? (
                <span
                  title="Officially verified bed count (Architecture.md §6)"
                  className="text-[10px] font-normal text-surgical flex items-center"
                >
                  <ShieldCheck className="w-2.5 h-2.5 ml-0.5" />
                </span>
              ) : null}
            </div>
          </div>

          {/* Rating & Reviews */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink/60 flex items-center gap-1">
              <Star className="w-3 h-3 text-marigold" />
              Rating
            </span>
            <div className="font-mono font-bold text-sm text-ink">
              {college.google_rating !== null ? (
                <span>
                  {college.google_rating}
                  <span className="text-marigold text-xs font-normal ml-0.5">★</span>
                  <span className="text-[11px] font-normal text-ink/60 ml-1">
                    ({college.google_review_count ?? 0})
                  </span>
                </span>
              ) : (
                <span className="text-ink/40 font-normal text-xs">No reviews</span>
              )}
            </div>
          </div>

          {/* Govt / Convenor Fee */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink/60 flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-surgical" />
              Govt Quota (Cat-A)
            </span>
            <div className="font-mono font-bold text-sm text-ink">
              {formatFee(college.fee_category_a)}
            </div>
          </div>

          {/* Management / NIRF / Match Score */}
          <div className="space-y-0.5 text-right sm:text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink/60 flex items-center justify-end sm:justify-start gap-1">
              <Award className="w-3 h-3 text-surgical" />
              {overallScore !== null ? 'Match Score' : 'Mgmt Quota (Cat-B)'}
            </span>
            {overallScore !== null ? (
              <div className="font-mono font-bold text-base text-surgical flex items-baseline justify-end sm:justify-start gap-0.5">
                {overallScore}
                <span className="text-[10px] text-ink/50 font-normal">/100</span>
              </div>
            ) : (
              <div className="font-mono text-sm text-ink font-semibold">
                {isGovt ? (
                  <span className="text-xs text-ink/50 font-normal">N/A (Govt)</span>
                ) : (
                  formatFee(college.fee_management_quota)
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer: NIRF or Specific Sourced Notes */}
        {(college.nirf_rank || (!isGovt && college.fee_management_quota)) && (
          <div className="mt-2.5 pt-2 border-t border-line/60 flex items-center justify-between gap-2 text-xs font-mono">
            {college.nirf_rank ? (
              <span className="text-rank-red font-semibold bg-rank-red/10 border border-rank-red/20 px-2 py-0.5 inline-flex items-center gap-1">
                ★ NIRF Medical 2025 Rank #{college.nirf_rank}
              </span>
            ) : <span />}

            {!isGovt && college.fee_management_quota && (
              <span className="text-ink/60 text-[11px] ml-auto">
                Mgmt: {formatFee(college.fee_management_quota)} · NRI: {formatFee(college.fee_nri_quota)}
              </span>
            )}
          </div>
        )}

        {/* Sourced Data Caveats Footer (if beds or fee caveat exists) */}
        {college.data_notes && (
          <div className="mt-2 pt-1.5 border-t border-dashed border-line/50 text-[10px] text-ink/50 font-sans flex items-start gap-1 leading-normal">
            <AlertCircle className="w-2.5 h-2.5 text-ink/40 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{college.data_notes}</span>
          </div>
        )}
      </div>
    </article>
  );
};
