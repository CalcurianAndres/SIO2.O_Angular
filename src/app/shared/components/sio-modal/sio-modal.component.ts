import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sio-modal',
  standalone: false,
  templateUrl: './sio-modal.component.html',
  styleUrls: ['./sio-modal.component.scss'],
})
export class SioModalComponent {
  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() icon: string = 'fa-cog';
  @Input() size: 'normal' | 'wide' | 'full' = 'normal';
  @Output() onClose = new EventEmitter<void>();

  close() {
    this.onClose.emit();
  }
}
