import { Injectable } from '@angular/core';
import type { TimelineContext } from '../timeline/timeline-context';
import { diffDays, startOfDay } from '../timeline/timeline-math';

export interface WorkOrderLike {
  id: string;
  workCenterId: string;
  start: Date; // inclusive
  end: Date;   // exclusive
}

export interface WorkOrderLayout {
  id: string;
  workCenterId: string;

  leftPx: number;
  widthPx: number;

  clippedStart: Date;
  clippedEnd: Date;
  isClipped: boolean;
}

@Injectable({ providedIn: 'root' })
export class TimelineLayoutService {
  /**
   * Convert work orders into renderable rectangles for the current visible window.
   * - Clipping: orders are clipped to [visibleStart, visibleEnd)
   * - Excludes orders that do not intersect the visible window
   * - Uses day-index math (DST-safe)
   * - Rounds at boundaries, width = right - left (no drift)
   */
  layout(ctx: TimelineContext, orders: WorkOrderLike[]): WorkOrderLayout[] {
    const visibleStart = ctx.visibleStart;
    const visibleEnd = ctx.visibleEnd;
    const pxPerDay = ctx.pxPerDay;

    const layouts: WorkOrderLayout[] = [];

    for (const o of orders) {
      const start = startOfDay(o.start);
      const end = startOfDay(o.end);

      // Reject invalid before any math (prevents negative widths)
      if (end <= start) continue;

      // Intersection test for [start, end) with [visibleStart, visibleEnd)
      // If end <= visibleStart OR start >= visibleEnd => no overlap => don't render
      if (end <= visibleStart || start >= visibleEnd) continue;

      const clippedStart = start < visibleStart ? visibleStart : start;
      const clippedEnd = end > visibleEnd ? visibleEnd : end;

      // Defensive: after clipping, if empty interval, skip
      if (clippedEnd <= clippedStart) continue;

      const isClipped = clippedStart !== start || clippedEnd !== end;

      // O(1) pixel math using DST-safe diffDays
      const left = Math.round(diffDays(visibleStart, clippedStart) * pxPerDay);
      const right = Math.round(diffDays(visibleStart, clippedEnd) * pxPerDay);

      const width = Math.max(0, right - left);
      if (width === 0) continue;

      layouts.push({
        id: o.id,
        workCenterId: o.workCenterId,
        leftPx: left,
        widthPx: width,
        clippedStart,
        clippedEnd,
        isClipped,
      });
    }

    return layouts;
  }
}