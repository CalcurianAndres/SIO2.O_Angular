import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: false,
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent {
  @Input() type: 'text' | 'card' | 'table' | 'circle' = 'text';
  @Input() rows = 3;
  @Input() width = '100%';
}
