import React, { useEffect } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  matchedCount: number;
  children: React.ReactNode;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  matchedCount,
  children,
}) => {
  // Prevent body scroll when open and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative bg-paper w-full max-h-[88vh] flex flex-col border-t-2 border-surgical shadow-2xl animate-in slide-in-from-bottom duration-200 motion-reduce:animate-none"
      >
        {/* Drag handle visual */}
        <div className="w-12 h-1 bg-line mx-auto mt-2.5 mb-1 rounded-full" />

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-line flex items-center justify-between bg-paper">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-surgical" />
            <h2 className="font-display font-bold text-base text-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink/70 hover:text-ink bg-white border border-line focus-visible:outline-2 focus-visible:outline-surgical focus-visible:outline-offset-2"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-4 flex-1 space-y-4">
          {children}
        </div>

        {/* Sticky Apply Button Footer */}
        <div className="p-4 border-t border-line bg-white sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-surgical hover:bg-surgical/90 text-white font-mono font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs active:bg-surgical/95 focus-visible:outline-2 focus-visible:outline-surgical focus-visible:outline-offset-2"
          >
            <Check className="w-4 h-4" />
            Apply & View ({matchedCount} Colleges)
          </button>
        </div>
      </div>
    </div>
  );
};
