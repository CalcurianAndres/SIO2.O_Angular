import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalConfig {
  id: string;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'confirm' | 'delete';
  size?: 'small' | 'medium' | 'large';
  data?: any;
}

export interface ModalResult {
  confirmed: boolean;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalSubject = new Subject<ModalConfig | null>();
  private resultSubject = new Subject<ModalResult>();

  modal$ = this.modalSubject.asObservable();
  result$ = this.resultSubject.asObservable();

  open(config: ModalConfig): Promise<ModalResult> {
    this.modalSubject.next(config);
    return new Promise((resolve) => {
      const sub = this.result$.subscribe((result) => {
        sub.unsubscribe();
        resolve(result);
      });
    });
  }

  close(result?: ModalResult) {
    this.modalSubject.next(null);
    this.resultSubject.next(result || { confirmed: false });
  }

  confirm(data?: any) {
    this.close({ confirmed: true, data });
  }

  dismiss() {
    this.close({ confirmed: false });
  }
}
