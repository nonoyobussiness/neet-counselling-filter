import { useState, useRef, useEffect, useCallback } from 'react';

interface UseDragReorderOptions {
  itemCount: number;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  edgeZonePx?: number;
  maxScrollSpeed?: number;
  minScrollSpeed?: number;
  itemGapPx?: number;
  longPressDelayMs?: number;
}

export interface DragReorderState {
  activeDragIndex: number | null;
  hoverDropIndex: number | null;
  isDragging: boolean;
  getItemProps: (index: number) => {
    ref: (el: HTMLElement | null) => void;
    style: React.CSSProperties;
    className: string;
    onPointerDown: (e: React.PointerEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  getHandleProps: (index: number) => {
    onPointerDown: (e: React.PointerEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    style: React.CSSProperties;
    title: string;
    'aria-grabbed': boolean;
    role: string;
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  cancelDrag: () => void;
}

export function useDragReorder({
  itemCount,
  onReorder,
  scrollContainerRef,
  edgeZonePx = 80,
  maxScrollSpeed = 26,
  minScrollSpeed = 4,
  itemGapPx = 0,
  longPressDelayMs = 500,
}: UseDragReorderOptions): DragReorderState {
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [hoverDropIndex, setHoverDropIndex] = useState<number | null>(null);

  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const activeDragIndexRef = useRef<number | null>(null);
  const hoverDropIndexRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastPointerYRef = useRef<number>(0);
  const startPointerRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const scrollSpeedRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const draggedItemHeightRef = useRef<number>(60);
  const prefersReducedMotionRef = useRef<boolean>(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sync refs with state
  useEffect(() => {
    activeDragIndexRef.current = activeDragIndex;
    hoverDropIndexRef.current = hoverDropIndex;
  }, [activeDragIndex, hoverDropIndex]);

  // Update hover target based on pointer Y position
  const updateHoverTarget = useCallback((clientY: number) => {
    const currentDrag = activeDragIndexRef.current;
    if (currentDrag === null) return;

    const elements = itemRefs.current;
    let targetIndex = currentDrag;
    let minDistance = Infinity;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - midY);

      if (clientY >= rect.top && clientY <= rect.bottom) {
        targetIndex = i;
        break;
      }

      if (dist < minDistance) {
        minDistance = dist;
        targetIndex = i;
      }
    }

    if (targetIndex !== hoverDropIndexRef.current) {
      hoverDropIndexRef.current = targetIndex;
      setHoverDropIndex(targetIndex);
    }
  }, []);

  // Stop auto-scroll animation loop
  const stopAutoScroll = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    scrollSpeedRef.current = 0;
  }, []);

  // Start auto-scroll animation loop
  const startAutoScroll = useCallback(() => {
    if (rafIdRef.current !== null) return;

    const step = () => {
      if (!isDraggingRef.current) {
        stopAutoScroll();
        return;
      }

      const speed = scrollSpeedRef.current;
      if (speed !== 0) {
        const container = scrollContainerRef?.current;
        if (container && container.scrollHeight > container.clientHeight) {
          const maxScroll = container.scrollHeight - container.clientHeight;
          const currentScroll = container.scrollTop;
          const nextScroll = Math.max(0, Math.min(maxScroll, currentScroll + speed));
          if (nextScroll !== currentScroll) {
            container.scrollTop = nextScroll;
          }
        } else {
          const scrollingElement =
            document.scrollingElement || document.documentElement || document.body;
          const maxScroll =
            scrollingElement.scrollHeight - window.innerHeight;
          const currentScroll =
            window.scrollY || window.pageYOffset || scrollingElement.scrollTop;
          const nextScroll = Math.max(0, Math.min(maxScroll, currentScroll + speed));
          if (nextScroll !== currentScroll) {
            window.scrollBy(0, speed);
          }
        }

        // Recompute hover target as items scroll beneath the stationary pointer/finger
        updateHoverTarget(lastPointerYRef.current);
      }

      rafIdRef.current = requestAnimationFrame(step);
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, [scrollContainerRef, stopAutoScroll, updateHoverTarget]);

  // Check edge proximity and compute auto-scroll speed
  const checkEdgeProximity = useCallback(
    (clientY: number) => {
      let topEdge = 0;
      let bottomEdge = window.innerHeight;

      const container = scrollContainerRef?.current;
      if (container && container.scrollHeight > container.clientHeight) {
        const containerRect = container.getBoundingClientRect();
        topEdge = containerRect.top;
        bottomEdge = containerRect.bottom;
      }

      const distTop = clientY - topEdge;
      const distBottom = bottomEdge - clientY;

      let speed = 0;

      if (distTop < edgeZonePx && distTop >= -40) {
        // Near top edge -> scroll up with progressive quadratic curve
        const intensity = Math.max(0, Math.min(1, (edgeZonePx - distTop) / edgeZonePx));
        speed = -(minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * Math.pow(intensity, 1.4));
      } else if (distBottom < edgeZonePx && distBottom >= -40) {
        // Near bottom edge -> scroll down with progressive quadratic curve
        const intensity = Math.max(0, Math.min(1, (edgeZonePx - distBottom) / edgeZonePx));
        speed = minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * Math.pow(intensity, 1.4);
      }

      scrollSpeedRef.current = speed;

      if (speed !== 0) {
        startAutoScroll();
      } else {
        stopAutoScroll();
      }
    },
    [edgeZonePx, maxScrollSpeed, minScrollSpeed, scrollContainerRef, startAutoScroll, stopAutoScroll]
  );

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Initiate active drag mode
  const startDrag = useCallback(
    (index: number, clientY: number) => {
      const targetEl = itemRefs.current[index];
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        draggedItemHeightRef.current = rect.height + itemGapPx;
      }

      // Optional light haptic feedback on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch {
          // ignore vibrate errors
        }
      }

      isDraggingRef.current = true;
      activeDragIndexRef.current = index;
      hoverDropIndexRef.current = index;
      lastPointerYRef.current = clientY;

      setActiveDragIndex(index);
      setHoverDropIndex(index);
      checkEdgeProximity(clientY);
    },
    [checkEdgeProximity, itemGapPx]
  );

  // Complete or cancel drag
  const finishDrag = useCallback(
    (commit: boolean) => {
      clearLongPressTimer();
      const source = activeDragIndexRef.current;
      const destination = hoverDropIndexRef.current;

      isDraggingRef.current = false;
      stopAutoScroll();

      if (
        commit &&
        source !== null &&
        destination !== null &&
        source !== destination &&
        destination >= 0 &&
        destination < itemCount
      ) {
        onReorder(source, destination);
      }

      setActiveDragIndex(null);
      setHoverDropIndex(null);
      activeDragIndexRef.current = null;
      hoverDropIndexRef.current = null;
      startPointerRef.current = null;
    },
    [clearLongPressTimer, itemCount, onReorder, stopAutoScroll]
  );

  const cancelDrag = useCallback(() => {
    finishDrag(false);
  }, [finishDrag]);

  // Window-level listeners for active drag & touch gestures
  useEffect(() => {
    if (activeDragIndex === null && longPressTimerRef.current === null) return;

    const handlePointerMove = (e: PointerEvent) => {
      lastPointerYRef.current = e.clientY;

      if (!isDraggingRef.current) {
        // If still waiting for long-press and moved > 10px, cancel long-press to allow normal scroll
        if (startPointerRef.current) {
          const dx = Math.abs(e.clientX - startPointerRef.current.x);
          const dy = Math.abs(e.clientY - startPointerRef.current.y);
          if (dx > 10 || dy > 10) {
            clearLongPressTimer();
            startPointerRef.current = null;
          }
        }
        return;
      }

      updateHoverTarget(e.clientY);
      checkEdgeProximity(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        lastPointerYRef.current = touch.clientY;

        if (isDraggingRef.current) {
          // CRITICAL FOR MOBILE: Prevent native scroll from stealing or cancelling the drag
          if (e.cancelable) {
            e.preventDefault();
          }
          updateHoverTarget(touch.clientY);
          checkEdgeProximity(touch.clientY);
        } else if (startPointerRef.current) {
          const dx = Math.abs(touch.clientX - startPointerRef.current.x);
          const dy = Math.abs(touch.clientY - startPointerRef.current.y);
          if (dx > 10 || dy > 10) {
            clearLongPressTimer();
            startPointerRef.current = null;
          }
        }
      }
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        finishDrag(true);
      } else {
        clearLongPressTimer();
      }
    };

    const handleTouchEnd = () => {
      if (isDraggingRef.current) {
        finishDrag(true);
      } else {
        clearLongPressTimer();
      }
    };

    const handleCancel = () => {
      clearLongPressTimer();
      if (isDraggingRef.current) {
        finishDrag(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearLongPressTimer();
        finishDrag(false);
      }
    };

    // Attach listeners with passive: false on touchmove to allow preventing native scroll during drag
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('pointercancel', handleCancel);
    window.addEventListener('touchcancel', handleCancel);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('touchcancel', handleCancel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeDragIndex,
    checkEdgeProximity,
    clearLongPressTimer,
    finishDrag,
    updateHoverTarget,
  ]);

  // Handle pointer down on grip handle (immediate drag start with 0ms delay)
  const handleImmediatePointerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      startDrag(index, e.clientY);
    },
    [startDrag]
  );

  const handleImmediateTouchStart = useCallback(
    (index: number, e: React.TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        startPointerRef.current = { x: touch.clientX, y: touch.clientY };
        startDrag(index, touch.clientY);
      }
    },
    [startDrag]
  );

  // Handle pointer down on row/card body (press-and-hold ~150ms to initiate drag)
  const handleBodyPointerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      if (e.button !== 0) return;
      // Do not intercept clicks on buttons or interactive controls
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('[data-no-drag]')
      ) {
        return;
      }

      startPointerRef.current = { x: e.clientX, y: e.clientY };
      clearLongPressTimer();

      longPressTimerRef.current = window.setTimeout(() => {
        startDrag(index, lastPointerYRef.current || e.clientY);
      }, longPressDelayMs);
    },
    [clearLongPressTimer, longPressDelayMs, startDrag]
  );

  const handleBodyTouchStart = useCallback(
    (index: number, e: React.TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('[data-no-drag]')
      ) {
        return;
      }

      const touch = e.touches[0];
      startPointerRef.current = { x: touch.clientX, y: touch.clientY };
      lastPointerYRef.current = touch.clientY;
      clearLongPressTimer();

      longPressTimerRef.current = window.setTimeout(() => {
        startDrag(index, lastPointerYRef.current || touch.clientY);
      }, longPressDelayMs);
    },
    [clearLongPressTimer, longPressDelayMs, startDrag]
  );

  // Generate props for each item (card or table row)
  const getItemProps = useCallback(
    (index: number) => {
      const isBeingDragged = activeDragIndex !== null && activeDragIndex === index;
      const isHoverTarget = hoverDropIndex !== null && hoverDropIndex === index && !isBeingDragged;

      let translateY = 0;
      const totalShift = draggedItemHeightRef.current || (60 + itemGapPx);

      if (
        activeDragIndex !== null &&
        hoverDropIndex !== null &&
        activeDragIndex !== hoverDropIndex
      ) {
        if (hoverDropIndex > activeDragIndex) {
          // Dragging downwards: items between activeDrag and hoverDrop shift UP smoothly
          if (index > activeDragIndex && index <= hoverDropIndex) {
            translateY = -totalShift;
          }
        } else if (hoverDropIndex < activeDragIndex) {
          // Dragging upwards: items between hoverDrop and activeDrag shift DOWN smoothly
          if (index >= hoverDropIndex && index < activeDragIndex) {
            translateY = totalShift;
          }
        }
      }

      const isReduced = prefersReducedMotionRef.current;

      const style: React.CSSProperties = {
        transform: isBeingDragged
          ? isReduced
            ? 'none'
            : 'scale(1.018)'
          : translateY !== 0 && !isReduced
          ? `translateY(${translateY}px)`
          : 'none',
        transition: isReduced
          ? 'none'
          : isBeingDragged
          ? 'box-shadow 150ms ease, transform 150ms ease, opacity 150ms ease'
          : 'transform 180ms cubic-bezier(0.2, 0, 0, 1)',
        zIndex: isBeingDragged ? 30 : translateY !== 0 ? 10 : 1,
        position: 'relative',
        opacity: isBeingDragged ? 0.92 : 1,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: isBeingDragged ? 'none' : 'pan-y',
      };

      const classes: string[] = [];
      if (isBeingDragged) {
        classes.push('ring-2 ring-surgical shadow-xl z-30 bg-paper/50');
      } else if (isHoverTarget) {
        classes.push('border-surgical');
      }

      return {
        ref: (el: HTMLElement | null) => {
          itemRefs.current[index] = el;
        },
        style,
        className: classes.join(' '),
        onPointerDown: (e: React.PointerEvent) => handleBodyPointerDown(index, e),
        onTouchStart: (e: React.TouchEvent) => handleBodyTouchStart(index, e),
      };
    },
    [activeDragIndex, handleBodyPointerDown, handleBodyTouchStart, hoverDropIndex, itemGapPx]
  );

  // Generate props for the grip handle
  const getHandleProps = useCallback(
    (index: number) => {
      const isGrabbed = activeDragIndex === index;
      return {
        onPointerDown: (e: React.PointerEvent) => handleImmediatePointerDown(index, e),
        onTouchStart: (e: React.TouchEvent) => handleImmediateTouchStart(index, e),
        style: {
          touchAction: 'none' as const,
          userSelect: 'none' as const,
          WebkitUserSelect: 'none' as const,
          cursor: isGrabbed ? 'grabbing' : 'grab',
        },
        title: 'Drag to reorder position in list (auto-scrolls near edges)',
        'aria-grabbed': isGrabbed,
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index > 0) onReorder(index, index - 1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (index < itemCount - 1) onReorder(index, index + 1);
          }
        },
      };
    },
    [activeDragIndex, handleImmediatePointerDown, handleImmediateTouchStart, itemCount, onReorder]
  );

  return {
    activeDragIndex,
    hoverDropIndex,
    isDragging: activeDragIndex !== null,
    getItemProps,
    getHandleProps,
    cancelDrag,
  };
}
