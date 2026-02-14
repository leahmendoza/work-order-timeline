export type Timescale = 'day' | 'week' | 'month';

export interface TimelineColumn {
  /** Inclusive start */
  start: Date;

  /** Exclusive end */
  end: Date;

  /** Header label */
  label: string;

  /** Width in pixels */
  widthPx: number;
}

export interface TimelineContext {
  timescale: Timescale;

  /** Inclusive */
  visibleStart: Date;

  /** Exclusive */
  visibleEnd: Date;

  /** Base unit for positioning */
  pxPerDay: number;

  /** Prebuilt header columns */
  columns: TimelineColumn[];

  /** Total scrollable width */
  totalWidthPx: number;
}