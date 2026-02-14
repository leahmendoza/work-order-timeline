import { Injectable } from '@angular/core';
import type { Timescale, TimelineColumn, TimelineContext } from '../timeline/timeline-context';
import {
  addDays,
  addMonthsFromMonthStart,
  clampDate,
  diffDays,
  startOfDay,
  startOfMonth,
  startOfWeekMonday,
} from '../timeline/timeline-math';

@Injectable({ providedIn: 'root' })
export class TimelineGridService {
  /**
   * Build a deterministic visible window centered around "today".
   * - day:   +/- 2 weeks (29 days total)
   * - week:  +/- 2 months (aligned to Monday)
   * - month: +/- 6 months (aligned to month start)
   */
  build(timescale: Timescale, now: Date = new Date()): TimelineContext {
    const today = startOfDay(now);

    const pxPerDay = this.pxPerDayFor(timescale);
    const { visibleStart, visibleEnd } = this.visibleRangeFor(timescale, today);

    const columns = this.columnsFor(timescale, visibleStart, visibleEnd, pxPerDay);

    const totalWidthPx = diffDays(visibleStart, visibleEnd) * pxPerDay;

    return {
      timescale,
      visibleStart,
      visibleEnd,
      pxPerDay,
      columns,
      totalWidthPx,
    };
  }

  // -----------------------------
  // Scale + visible range
  // -----------------------------

  private pxPerDayFor(timescale: Timescale): number {
    // Defaults; tune later to match the design precisely.
    switch (timescale) {
      case 'day':
        return 48;
      case 'week':
        return 18;
      case 'month':
        return 8;
    }
  }

  private visibleRangeFor(timescale: Timescale, today: Date): { visibleStart: Date; visibleEnd: Date } {
    switch (timescale) {
      case 'day': {
        const visibleStart = addDays(today, -14);
        const visibleEnd = addDays(today, 15); // exclusive
        return { visibleStart, visibleEnd };
      }

      case 'week': {
        // +/- 2 months, aligned to Monday
        const startAnchor = startOfWeekMonday(addMonthsFromMonthStart(startOfMonth(today), -2));
        const endAnchor = startOfWeekMonday(addMonthsFromMonthStart(startOfMonth(today), 2));

        // Add 1 week so we don't end exactly on the anchor week (exclusive end)
        const visibleStart = startAnchor;
        const visibleEnd = addDays(endAnchor, 7);
        return { visibleStart, visibleEnd };
      }

      case 'month': {
        // +/- 6 months, aligned to month boundaries
        const startAnchor = startOfMonth(addMonthsFromMonthStart(startOfMonth(today), -6));
        const endAnchor = startOfMonth(addMonthsFromMonthStart(startOfMonth(today), 6));

        // Add 1 month so end is exclusive beyond last header month
        const visibleStart = startAnchor;
        const visibleEnd = addMonthsFromMonthStart(endAnchor, 1);
        return { visibleStart, visibleEnd };
      }
    }
  }

  // -----------------------------
  // Columns
  // -----------------------------

  private columnsFor(
    timescale: Timescale,
    visibleStart: Date,
    visibleEnd: Date,
    pxPerDay: number
  ): TimelineColumn[] {
    switch (timescale) {
      case 'day':
        return this.buildDayColumns(visibleStart, visibleEnd, pxPerDay);
      case 'week':
        return this.buildWeekColumns(visibleStart, visibleEnd, pxPerDay);
      case 'month':
        return this.buildMonthColumns(visibleStart, visibleEnd, pxPerDay);
    }
  }

  private buildDayColumns(visibleStart: Date, visibleEnd: Date, pxPerDay: number): TimelineColumn[] {
    const cols: TimelineColumn[] = [];
    for (let d = visibleStart; d < visibleEnd; d = addDays(d, 1)) {
      const start = d;
      const end = addDays(start, 1);
      cols.push({
        start,
        end,
        label: this.formatDay(start),
        widthPx: pxPerDay,
      });
    }
    return cols;
  }

  private buildWeekColumns(visibleStart: Date, visibleEnd: Date, pxPerDay: number): TimelineColumn[] {
    const cols: TimelineColumn[] = [];
    for (let w = startOfWeekMonday(visibleStart); w < visibleEnd; w = addDays(w, 7)) {
      const start = w;
      const end = addDays(start, 7);
      cols.push({
        start,
        end,
        label: this.formatWeek(start),
        widthPx: 7 * pxPerDay,
      });
    }
    return cols;
  }

  private buildMonthColumns(visibleStart: Date, visibleEnd: Date, pxPerDay: number): TimelineColumn[] {
    const cols: TimelineColumn[] = [];
    for (let m = startOfMonth(visibleStart); m < visibleEnd; m = addMonthsFromMonthStart(m, 1)) {
      const start = m;
      const end = addMonthsFromMonthStart(start, 1);
      const days = diffDays(start, end);

      cols.push({
        start,
        end,
        label: this.formatMonth(start),
        widthPx: days * pxPerDay, // Option B: proportional to days
      });
    }
    return cols;
  }

  // -----------------------------
  // Labels (UI-only)
  // -----------------------------

  private formatDay(d: Date): string {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  private formatWeek(start: Date): string {
    return `Week of ${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }

  private formatMonth(start: Date): string {
    return start.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }
}