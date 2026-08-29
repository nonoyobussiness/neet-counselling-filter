import React, { useState } from 'react';
import { RankedCollege } from '../utils/ranking';
import {
  MapPin,
  Award,
  AlertCircle,
  Calendar,
  Bed,
  Star,
  ShieldCheck,
  IndianRupee,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';

interface CollegeCardProps {
  rankedItem: RankedCollege;
  rankIndex: number;
  homeCity: string;
  totalCount: number;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  showScoreBreakdown?: boolean;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({
  rankedItem,
  rankIndex,
  homeCity,
  totalCount,
  onReorder,
}) => {
  const { college, distance_from_home, overallScore, isEstimatedBeds } = rankedItem;
  const [isDragOver, setIsDragOver] = useState(false);

  const currentIndex = rankIndex - 1;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCount - 1;

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

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(currentIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (!isNaN(sourceIndex) && sourceIndex !== currentIndex) {
      onReorder(sourceIndex, currentIndex);
    }
  };

  return (
    <article
      aria-label={`${college.name} - Match rank #${rankIndex}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative bg-white border transition-all duration-150 shadow-2xs ${
        isDragOver ? 'border-surgical border-2 bg-surgical/5 scale-[1.01]' : 'border-line hover:border-surgical/80'
      }`}
    >
      {/* Hall-ticket stub indicator on left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-surgical" />

      <div className="p-4 sm:p-5 pl-4 sm:pl-5">
        {/* Top bar: Reorder controls, Rank, Code, Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Rank badge + Reorder Drag Handle & Controls */}
            <div className="flex items-center gap-1 bg-paper border border-line p-0.5">
              {/* Drag Grip Handle */}
              <div
                className="cursor-grab active:cursor-grabbing p-0.5 text-ink/40 hover:text-ink"
                title="Drag to reorder position in list"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              {/* Rank Number */}
              <span className="font-mono text-xs font-bold text-rank-red px-1.5 py-0.5 tracking-tight">
                #{rankIndex}
              </span>

              {/* Mobile / Touch Move Up & Down Buttons */}
              <div className="flex items-center gap-0.5 border-l border-line/60 pl-0.5">
                <button
                  type="button"
                  onClick={() => onReorder(currentIndex, currentIndex - 1)}
                  disabled={isFirst}
                  className="p-1 hover:bg-white text-ink/60 hover:text-ink disabled:opacity-20 disabled:hover:bg-transparent"
                  title="Move college up in priority order"
                  aria-label={`Move ${college.name} up`}
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onReorder(currentIndex, currentIndex + 1)}
                  disabled={isLast}
                  className="p-1 hover:bg-white text-ink/60 hover:text-ink disabled:opacity-20 disabled:hover:bg-transparent"
                  title="Move college down in priority order"
                  aria-label={`Move ${college.name} down`}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

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

          {/* Top-right Match Score */}
          {overallScore !== null && (
            <div className="font-mono font-bold text-xs bg-surgical/10 border border-surgical/20 text-surgical px-2 py-0.5 flex items-center gap-1">
              <span>Score:</span>
              <span className="text-sm font-bold text-surgical">{overallScore}</span>
              <span className="text-[10px] text-surgical/70">/100</span>
            </div>
          )}
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

          {/* Management Fee / NIRF */}
          <div className="space-y-0.5 text-right sm:text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink/60 flex items-center justify-end sm:justify-start gap-1">
              <Award className="w-3 h-3 text-surgical" />
              Mgmt Quota (Cat-B)
            </span>
            <div className="font-mono text-sm text-ink font-semibold">
              {isGovt ? (
                <span className="text-xs text-ink/50 font-normal">N/A (Govt)</span>
              ) : (
                formatFee(college.fee_management_quota)
              )}
            </div>
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

        {/* Sourced Data Caveats Footer */}
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
