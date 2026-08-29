import React from 'react';
import { RankedCollege } from '../utils/ranking';
import { CollegeCard } from './CollegeCard';
import { useDragReorder } from '../hooks/useDragReorder';

interface CollegeCardListProps {
  colleges: RankedCollege[];
  homeCity: string;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
}

export const CollegeCardList: React.FC<CollegeCardListProps> = ({
  colleges,
  homeCity,
  onReorder,
}) => {
  const {
    getItemProps,
    getHandleProps,
    activeDragIndex,
    hoverDropIndex,
  } = useDragReorder({
    itemCount: colleges.length,
    onReorder,
    itemGapPx: 14, // spacing between cards in space-y-3.5
    edgeZonePx: 80, // generous edge threshold zone
    maxScrollSpeed: 26,
    minScrollSpeed: 4,
    longPressDelayMs: 220,
    moveThresholdPx: 14,
  });

  return (
    <div className="space-y-3.5 relative">
      {colleges.map((item, index) => {
        const itemProps = getItemProps(index);
        const handleProps = getHandleProps(index);
        const isBeingDragged = activeDragIndex === index;
        const isHoverTarget = hoverDropIndex === index && activeDragIndex !== index;

        return (
          <CollegeCard
            key={item.college.id}
            rankedItem={item}
            rankIndex={index + 1}
            homeCity={homeCity}
            totalCount={colleges.length}
            onReorder={onReorder}
            dragItemProps={itemProps}
            dragHandleProps={handleProps}
            isBeingDragged={isBeingDragged}
            isHoverTarget={isHoverTarget}
          />
        );
      })}
    </div>
  );
};
