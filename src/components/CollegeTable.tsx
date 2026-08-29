import React, { useRef } from 'react';
import { RankedCollege, CriterionId } from '../utils/ranking';
import { useDragReorder } from '../hooks/useDragReorder';
import {
  MapPin,
  Bed,
  Star,
  IndianRupee,
  Calendar,
  ShieldCheck,
  Award,
  AlertCircle,
  ArrowUpDown,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface CollegeTableProps {
  colleges: RankedCollege[];
  homeCity: string;
  onSingleSort: (criterionId: CriterionId) => void;
  activeSingleSortCriterion: CriterionId | null;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
}

export const CollegeTable: React.FC<CollegeTableProps> = ({
  colleges,
  homeCity,
  onSingleSort,
  activeSingleSortCriterion,
  onReorder,
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const {
    getItemProps,
    getHandleProps,
    activeDragIndex,
    hoverDropIndex,
  } = useDragReorder({
    itemCount: colleges.length,
    onReorder,
    scrollContainerRef: tableContainerRef,
    itemGapPx: 0,
    edgeZonePx: 80,
    maxScrollSpeed: 26,
    minScrollSpeed: 4,
    longPressDelayMs: 150,
  });

  // Format fee for compact table display
  const formatFee = (amount: number | null) => {
    if (amount === null) return '—';
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}k`;
  };

  // Helper to render sort indicator for a sortable column
  const renderSortIndicator = (
    criterionId: CriterionId,
    direction: 'higher_is_better' | 'lower_is_better'
  ) => {
    const isActive = activeSingleSortCriterion === criterionId;
    if (isActive) {
      return direction === 'higher_is_better' ? (
        <span
          className="inline-flex items-center text-surgical font-bold ml-1 text-xs"
          title="Sorted highest to lowest"
        >
          ▲
        </span>
      ) : (
        <span
          className="inline-flex items-center text-surgical font-bold ml-1 text-xs"
          title="Sorted lowest to highest (best)"
        >
          ▼
        </span>
      );
    }
    return (
      <ArrowUpDown className="w-3 h-3 text-ink/30 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />
    );
  };

  return (
    <div
      ref={tableContainerRef}
      className="bg-white border border-line shadow-2xs overflow-hidden"
    >
      {/* Scroll Container */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-left border-collapse text-xs font-sans select-none">
          {/* Table Header: Sticky Top with Hairline Dividers */}
          <thead className="sticky top-0 bg-paper z-20 border-b-2 border-line text-[11px] font-mono uppercase tracking-wider text-ink select-none">
            <tr>
              {/* Rank & Drag Column */}
              <th scope="col" className="py-3 px-2 border-r border-line text-center w-20 shrink-0">
                Order
              </th>

              {/* College Name Column */}
              <th
                scope="col"
                className="py-3 px-4 border-r border-line min-w-[240px] sm:min-w-[280px]"
              >
                Institution & Location
              </th>

              {/* Founding Year */}
              <th scope="col" className="py-3 px-3 border-r border-line text-center whitespace-nowrap">
                <span className="flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3 text-ink/50" />
                  Est.
                </span>
              </th>

              {/* Hospital Beds (Sortable) */}
              <th
                scope="col"
                onClick={() => onSingleSort('beds')}
                className={`py-3 px-3 border-r border-line text-right cursor-pointer hover:bg-white transition group whitespace-nowrap ${
                  activeSingleSortCriterion === 'beds' ? 'bg-surgical/10 text-surgical font-bold' : ''
                }`}
                title="Click to sort by hospital bed count"
              >
                <div className="flex items-center justify-end gap-1">
                  <Bed className="w-3.5 h-3.5 text-surgical shrink-0" />
                  <span>Beds</span>
                  {renderSortIndicator('beds', 'higher_is_better')}
                </div>
              </th>

              {/* Google Rating (Sortable) */}
              <th
                scope="col"
                onClick={() => onSingleSort('google_rating')}
                className={`py-3 px-3 border-r border-line text-right cursor-pointer hover:bg-white transition group whitespace-nowrap ${
                  activeSingleSortCriterion === 'google_rating' ? 'bg-surgical/10 text-surgical font-bold' : ''
                }`}
                title="Click to sort by Google rating & review volume"
              >
                <div className="flex items-center justify-end gap-1">
                  <Star className="w-3.5 h-3.5 text-marigold shrink-0" />
                  <span>Rating</span>
                  {renderSortIndicator('google_rating', 'higher_is_better')}
                </div>
              </th>

              {/* Distance from Home (Sortable) */}
              <th
                scope="col"
                onClick={() => onSingleSort('distance_from_home')}
                className={`py-3 px-3 border-r border-line text-right cursor-pointer hover:bg-white transition group whitespace-nowrap ${
                  activeSingleSortCriterion === 'distance_from_home' ? 'bg-surgical/10 text-surgical font-bold' : ''
                }`}
                title={`Click to sort by distance from ${homeCity}`}
              >
                <div className="flex items-center justify-end gap-1">
                  <MapPin className="w-3.5 h-3.5 text-surgical shrink-0" />
                  <span>Dist ({homeCity})</span>
                  {renderSortIndicator('distance_from_home', 'lower_is_better')}
                </div>
              </th>

              {/* Govt Quota Fee (Sortable) */}
              <th
                scope="col"
                onClick={() => onSingleSort('fee_category_a')}
                className={`py-3 px-3 border-r border-line text-right cursor-pointer hover:bg-white transition group whitespace-nowrap ${
                  activeSingleSortCriterion === 'fee_category_a' ? 'bg-surgical/10 text-surgical font-bold' : ''
                }`}
                title="Click to sort by Government Quota annual tuition fee"
              >
                <div className="flex items-center justify-end gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-surgical shrink-0" />
                  <span>Govt Fee</span>
                  {renderSortIndicator('fee_category_a', 'lower_is_better')}
                </div>
              </th>

              {/* Mgmt Quota Fee */}
              <th scope="col" className="py-3 px-3 border-r border-line text-right whitespace-nowrap">
                <span>Mgmt Fee</span>
              </th>

              {/* NIRF Rank */}
              <th scope="col" className="py-3 px-3 border-r border-line text-center whitespace-nowrap">
                <span>NIRF</span>
              </th>

              {/* Overall Match Score */}
              <th scope="col" className="py-3 px-3 text-right whitespace-nowrap">
                <span className="flex items-center justify-end gap-1">
                  <Award className="w-3.5 h-3.5 text-surgical" />
                  Match
                </span>
              </th>
            </tr>
          </thead>

          {/* Table Body with Smooth Drag Reordering */}
          <tbody className="divide-y divide-line font-mono">
            {colleges.map((item, index) => {
              const { college, distance_from_home, overallScore, isEstimatedBeds } = item;
              const rankIndex = index + 1;
              const isFirst = index === 0;
              const isLast = index === colleges.length - 1;
              const isGovt = college.type === 'government';
              const isDeemed = college.type === 'deemed';

              const itemProps = getItemProps(index);
              const handleProps = getHandleProps(index);
              const isBeingDragged = activeDragIndex === index;
              const isHoverTarget = hoverDropIndex === index && !isBeingDragged;

              return (
                <tr
                  key={college.id}
                  ref={itemProps.ref}
                  style={itemProps.style}
                  onPointerDown={itemProps.onPointerDown}
                  onTouchStart={itemProps.onTouchStart}
                  className={`group transition-colors select-none ${itemProps.className} ${
                    isHoverTarget ? 'bg-surgical/10 border-t-2 border-surgical' : 'hover:bg-paper/50'
                  }`}
                >
                  {/* Rank Column with Touch & Mouse Drag Grip & Up/Down Arrows */}
                  <td className="py-2 px-1 border-r border-line text-center text-xs font-bold text-rank-red bg-rank-red/5">
                    <div className="flex items-center justify-center gap-0.5" data-no-drag>
                      {/* Touch & Mouse Drag Grip Handle (0ms immediate drag) */}
                      <span
                        {...handleProps}
                        className="p-1 text-ink/50 hover:text-ink cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-surgical rounded-xs"
                        title="Drag to reorder position (or press-and-hold anywhere on row)"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </span>

                      {/* Rank Number */}
                      <span className="font-mono text-xs w-6 text-center">
                        #{rankIndex}
                      </span>

                      {/* Touch / Click Move Buttons */}
                      <div className="flex flex-col items-center" data-no-drag>
                        <button
                          type="button"
                          data-no-drag
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorder(index, index - 1);
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          disabled={isFirst}
                          className="p-0.5 hover:bg-white text-ink/60 hover:text-ink disabled:opacity-20 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-surgical"
                          title="Move up"
                          aria-label={`Move ${college.name} up`}
                        >
                          <ChevronUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          data-no-drag
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorder(index, index + 1);
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          disabled={isLast}
                          className="p-0.5 hover:bg-white text-ink/60 hover:text-ink disabled:opacity-20 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-surgical"
                          title="Move down"
                          aria-label={`Move ${college.name} down`}
                        >
                          <ChevronDown className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* College Name & Badges Column */}
                  <td className="py-2.5 px-4 border-r border-line bg-white group-hover:bg-[#F7FAFA]">
                    <div className="relative pl-2.5">
                      {/* Left indicator bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-surgical" />

                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {college.college_code && (
                          <span className="font-mono text-[10px] font-bold px-1 py-0.2 bg-paper border border-line text-ink">
                            {college.college_code}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-mono uppercase px-1 py-0.2 border ${
                            isGovt
                              ? 'bg-surgical/10 border-surgical/30 text-surgical'
                              : isDeemed
                              ? 'bg-ink/5 border-ink/20 text-ink'
                              : 'bg-paper border-line text-ink/70'
                          }`}
                        >
                          {college.type}
                        </span>
                      </div>

                      <div className="font-display font-semibold text-xs sm:text-sm text-ink leading-tight mt-0.5">
                        {college.name}
                      </div>

                      <div className="text-[11px] text-ink/60 font-sans flex items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-surgical" />
                          {college.city}
                        </span>
                        {college.data_notes && (
                          <span title={college.data_notes} className="cursor-help" data-no-drag>
                            <AlertCircle className="w-2.5 h-2.5 text-ink/40" />
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Founding Year */}
                  <td className="py-2.5 px-3 border-r border-line text-center text-xs text-ink/70">
                    {college.year_established ?? '—'}
                  </td>

                  {/* Beds (with ~est marker or verified shield) */}
                  <td className="py-2.5 px-3 border-r border-line text-right text-xs">
                    <span className="font-bold text-ink">
                      {college.beds ?? '—'}
                    </span>
                    {isEstimatedBeds ? (
                      <span
                        title="Bed count from secondary report (unverified estimate). Sourced officially for only 3 colleges."
                        className="text-[10px] font-semibold text-marigold bg-marigold/15 border border-marigold/40 px-1 py-0.2 ml-1 cursor-help"
                        data-no-drag
                      >
                        ~est
                      </span>
                    ) : college.beds !== null ? (
                      <span
                        title="Officially verified bed count (Architecture.md §6)"
                        className="text-surgical inline-block ml-1 align-text-bottom"
                        data-no-drag
                      >
                        <ShieldCheck className="w-3 h-3 inline" />
                      </span>
                    ) : null}
                  </td>

                  {/* Google Rating */}
                  <td className="py-2.5 px-3 border-r border-line text-right text-xs">
                    {college.google_rating !== null ? (
                      <div>
                        <strong className="text-ink">{college.google_rating}</strong>
                        <span className="text-marigold ml-0.5">★</span>
                        <span className="text-[10px] text-ink/50 block">
                          ({college.google_review_count ?? 0})
                        </span>
                      </div>
                    ) : (
                      <span className="text-ink/40 font-sans text-[11px]">No reviews</span>
                    )}
                  </td>

                  {/* Distance from Home */}
                  <td className="py-2.5 px-3 border-r border-line text-right text-xs">
                    {distance_from_home !== null ? (
                      <span className="font-medium text-ink">
                        {distance_from_home} <span className="text-[10px] text-ink/60">km</span>
                      </span>
                    ) : (
                      <span className="text-ink/40">—</span>
                    )}
                  </td>

                  {/* Govt Quota Fee */}
                  <td className="py-2.5 px-3 border-r border-line text-right text-xs font-semibold text-ink">
                    {formatFee(college.fee_category_a)}
                  </td>

                  {/* Mgmt Quota Fee */}
                  <td className="py-2.5 px-3 border-r border-line text-right text-xs text-ink/70">
                    {isGovt ? (
                      <span className="text-[10px] text-ink/40 font-sans">N/A</span>
                    ) : (
                      formatFee(college.fee_management_quota)
                    )}
                  </td>

                  {/* NIRF Rank */}
                  <td className="py-2.5 px-3 border-r border-line text-center text-xs">
                    {college.nirf_rank ? (
                      <span className="font-bold text-rank-red bg-rank-red/10 border border-rank-red/20 px-1.5 py-0.5 text-[11px]">
                        #{college.nirf_rank}
                      </span>
                    ) : (
                      <span className="text-ink/30">—</span>
                    )}
                  </td>

                  {/* Match Score */}
                  <td className="py-2.5 px-3 text-right text-xs">
                    {overallScore !== null ? (
                      <div className="font-bold text-surgical">
                        {overallScore}
                        <span className="text-[9px] text-ink/40 font-normal">/100</span>
                      </div>
                    ) : (
                      <span className="text-ink/30">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
