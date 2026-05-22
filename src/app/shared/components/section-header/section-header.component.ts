import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: false,
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss']
})
export class SectionHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = 'fa-cog';
  @Input() color: 'red' | 'green' | 'purple' | 'blue' | 'custom' = 'red';
  @Input() gradient = '';
}
