import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './app-modal.component.html',
  styleUrls: ['./app-modal.component.scss']
})
export class AppModalComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() longClass = '';
  @Output() onClose = new EventEmitter<void>();

  close() {
    this.onClose.emit();
  }
}
