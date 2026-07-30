import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sio-button',
  standalone: false,
  templateUrl: './sio-button.component.html',
  styleUrls: ['./sio-button.component.scss'],
})
export class SioButtonComponent {
  @Input() variant: 'primary' | 'success' | 'info' | 'danger' | 'warning' | 'link' = 'info';
  @Input() size: 'small' | 'normal' | 'large' = 'normal';
  @Input() icon: string = '';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() fullwidth: boolean = false;
  @Input() outlined: boolean = false;
  @Output() onClick = new EventEmitter<void>();

  get buttonClasses(): string {
    let cls = 'button';
    cls += ` is-${this.variant}`;
    if (this.size !== 'normal') cls += ` is-${this.size}`;
    if (this.fullwidth) cls += ' is-fullwidth';
    if (this.outlined) cls += ' is-outlined';
    return cls;
  }

  click() {
    if (!this.disabled && !this.loading) {
      this.onClick.emit();
    }
  }
}
