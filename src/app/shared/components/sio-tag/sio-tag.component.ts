import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sio-tag',
  standalone: false,
  templateUrl: './sio-tag.component.html',
  styleUrls: ['./sio-tag.component.scss'],
})
export class SioTagComponent {
  @Input() label: string = '';
  @Input() color: 'info' | 'success' | 'warning' | 'danger' | 'primary' = 'info';
  @Input() light: boolean = true;
  @Input() removable: boolean = false;
  @Input() icon: string = '';
  @Input() medium: boolean = true;
  @Output() onRemove = new EventEmitter<void>();

  get tagClasses(): string {
    let cls = 'tag';
    cls += ` is-${this.color}`;
    if (this.light) cls += ' is-light';
    if (this.medium) cls += ' is-medium';
    return cls;
  }

  remove() {
    this.onRemove.emit();
  }
}
