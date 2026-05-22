import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastId = 0;
  toasts$ = new Subject<Toast>();

  show(message: string, type: Toast['type'] = 'info') {
    this.toasts$.next({ id: ++this.toastId, message, type });
  }

  success(message: string) {
    this.show(message, 'success');
  }
  error(message: string) {
    this.show(message, 'error');
  }
  warning(message: string) {
    this.show(message, 'warning');
  }
  info(message: string) {
    this.show(message, 'info');
  }
}
