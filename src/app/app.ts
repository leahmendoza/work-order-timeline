import { Component } from '@angular/core';
import { TimelinePageComponent } from './features/timeline/timeline-page/timeline-page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TimelinePageComponent],
  templateUrl: './app.html',
})
export class App {}
