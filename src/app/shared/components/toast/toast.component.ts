import { Component, OnInit } from '@angular/core';
import { Toast, ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  toasts: (Toast & { removing?: boolean })[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe((toast) => {
      this.toasts.push(toast);
      setTimeout(() => this.remove(toast.id), 3500);
    });
  }

  remove(id: number) {
    const t = this.toasts.find((t) => t.id === id);
    if (t) t.removing = true;
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 300);
  }
}
