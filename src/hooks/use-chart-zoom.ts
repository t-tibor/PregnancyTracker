"use client";

import { useState, useRef, useCallback } from "react";

interface ChartZoomState {
  /** Current zoom domain [left, right] or null when not zoomed */
  zoomDomain: [number, number] | null;
  /** Whether user is currently dragging */
  isDragging: boolean;
  /** Left edge of the drag selection (null when not dragging) */
  refAreaLeft: number | null;
  /** Right edge of the drag selection (null when not dragging) */
  refAreaRight: number | null;
  /** Whether the chart is currently zoomed */
  isZoomed: boolean;
  /** Attach to Recharts chart onMouseDown */
  onMouseDown: (e: { activeLabel?: string | number } | null) => void;
  /** Attach to Recharts chart onMouseMove */
  onMouseMove: (e: { activeLabel?: string | number } | null) => void;
  /** Attach to Recharts chart onMouseUp */
  onMouseUp: () => void;
  /** Reset zoom back to full range */
  resetZoom: () => void;
}

/**
 * Hook for drag-to-zoom on Recharts charts.
 *
 * Uses refs for in-progress drag state to avoid re-renders on every
 * mousemove event (Vercel rule: rerender-use-ref-transient-values).
 * Only commits a setState call on mouseUp when the drag is finalized.
 *
 * @param dataRange - Total [min, max] timestamp range of visible data.
 *   Used to calculate minimum drag threshold (5% of range).
 */
export function useChartZoom(dataRange: [number, number]): ChartZoomState {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);

  // Refs for transient drag values — no re-renders during drag
  const draggingRef = useRef(false);
  const refLeftRef = useRef<number | null>(null);
  const refRightRef = useRef<number | null>(null);

  // State copies for rendering the ReferenceArea overlay.
  // We update these only on mouseDown and mouseUp to minimize re-renders,
  // plus a single re-render-triggering state for the drag visual.
  const [isDragging, setIsDragging] = useState(false);
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);

  const onMouseDown = useCallback(
    (e: { activeLabel?: string | number } | null) => {
      if (!e?.activeLabel) return;
      const val = Number(e.activeLabel);
      if (Number.isNaN(val)) return;

      draggingRef.current = true;
      refLeftRef.current = val;
      refRightRef.current = val;

      setRefAreaLeft(val);
      setRefAreaRight(val);
      setIsDragging(true);
    },
    [],
  );

  const onMouseMove = useCallback(
    (e: { activeLabel?: string | number } | null) => {
      if (!draggingRef.current || !e?.activeLabel) return;
      const val = Number(e.activeLabel);
      if (Number.isNaN(val)) return;

      refRightRef.current = val;
      // Update render state for the reference area visual
      setRefAreaRight(val);
    },
    [],
  );

  const onMouseUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);

    const left = refLeftRef.current;
    const right = refRightRef.current;

    if (left == null || right == null) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    // Ensure left < right
    const lo = Math.min(left, right);
    const hi = Math.max(left, right);

    // Minimum drag threshold: 5% of the total data range
    const totalRange = dataRange[1] - dataRange[0];
    const minDrag = totalRange * 0.05;

    if (hi - lo < minDrag) {
      // Too small — treat as a tap, not a zoom
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    setZoomDomain([lo, hi]);
    setRefAreaLeft(null);
    setRefAreaRight(null);

    refLeftRef.current = null;
    refRightRef.current = null;
  }, [dataRange]);

  const resetZoom = useCallback(() => {
    setZoomDomain(null);
    setRefAreaLeft(null);
    setRefAreaRight(null);
    draggingRef.current = false;
    refLeftRef.current = null;
    refRightRef.current = null;
    setIsDragging(false);
  }, []);

  return {
    zoomDomain,
    isDragging,
    refAreaLeft,
    refAreaRight,
    isZoomed: zoomDomain !== null,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    resetZoom,
  };
}
