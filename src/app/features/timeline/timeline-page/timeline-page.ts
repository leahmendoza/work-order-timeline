import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  signal,
} from '@angular/core';

import { TimelineGridService } from '../../../core/services/timeline-grid.service';
import type { Timescale } from '../../../core/timeline/timeline-context';
import { pixelFromDate } from '../../../core/timeline/timeline-math';

@Component({
  selector: 'app-timeline-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-page.html',
  styleUrls: ['./timeline-page.scss'],
})
export class TimelinePageComponent implements AfterViewInit {
  // Zoom level
  readonly timescale = signal<Timescale>('day');

  // Timeline context (range + columns + px scale)
  readonly grid = computed(() => this.gridService.build(this.timescale()));

  // Dummy rows for layout (replace when real work centers/orders are wired)
  readonly rows = Array.from({ length: 12 });

  // Today indicator X offset (px from visibleStart)
  readonly todayOffsetPx = computed(() =>
    pixelFromDate(this.grid().visibleStart, this.grid().pxPerDay, new Date())
  );

  // Scroll container reference
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLDivElement>;

  constructor(private readonly gridService: TimelineGridService) {}

  ngAfterViewInit(): void {
    this.centerToday();
  }

  onTimescaleChange(value: string): void {
    this.timescale.set(value as Timescale);

    // Re-center after zoom change (wait for DOM to update)
    setTimeout(() => this.centerToday(), 0);
  }

  private centerToday(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const offset = this.todayOffsetPx();
    container.scrollLeft = Math.max(0, offset - container.clientWidth / 2);
  }

  readonly workCenters = Array.from({ length: 12 }).map((_, i) => ({
    id: `WC-${i + 1}`,
    name: `Work Center ${i + 1}`,
  }));
  
}