import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sio-stat',
  standalone: false,
  templateUrl: './sio-stat.component.html',
  styleUrls: ['./sio-stat.component.scss'],
})
export class SioStatComponent {
  @Input() value: string | number = 0;
  @Input() label: string = '';
  @Input() icon: string = 'fa-chart-line';
  @Input() color: 'green' | 'blue' | 'red' | 'orange' | 'purple' = 'blue';
  @Input() detail: string = '';
}
