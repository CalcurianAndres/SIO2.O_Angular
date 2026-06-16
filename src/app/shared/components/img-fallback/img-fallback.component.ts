import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-img-fallback',
  standalone: false,
  templateUrl: './img-fallback.component.html',
  styleUrls: ['./img-fallback.component.scss'],
})
export class ImgFallbackComponent {
  @Input() src: string | undefined;
  @Input() tipo: 'empleado' | 'producto' | 'analisis' | 'plan' | undefined;
  @Input() filename: string | undefined;
  @Input() cssClass = '';
  @Input() width: string | undefined;
  @Input() height: string | undefined;
  @Input() fallbackIcon = 'fa-user';

  error = false;
  loading = true;

  get resolvedSrc(): string | undefined {
    if (this.src) return this.src;
    if (this.tipo && this.filename) {
      return `${environment.imgUrl}/imagen/${this.tipo}/${this.filename}`;
    }
    return undefined;
  }

  get hasNoPhoto(): boolean {
    return !this.filename && !this.src;
  }

  onLoad(): void {
    this.loading = false;
    this.error = false;
  }

  onError(): void {
    this.loading = false;
    this.error = true;
  }
}
