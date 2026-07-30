import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sio-icon',
  standalone: false,
  templateUrl: './sio-icon.component.html',
  styleUrls: ['./sio-icon.component.scss'],
})
export class SioIconComponent {
  @Input() name: string = 'fa-cog';
  @Input() color: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'muted' = 'blue';
  @Input() size: 'small' | 'normal' | 'large' = 'normal';
}
