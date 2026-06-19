import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TasaResponse {
  tasa: number | null;
  fuente: 'api' | 'manual' | null;
  fecha: Date | null;
  manual: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TasasService {
  private tasaActual = new BehaviorSubject<TasaResponse | null>(null);
  public tasaActual$: Observable<TasaResponse | null> = this.tasaActual.asObservable();

  constructor(private socket: WebSocketService) {
    this.escucharTasaActual();
  }

  private escucharTasaActual(): void {
    this.socket.io.on('SERVER:TasaActual', (data: TasaResponse) => {
      this.tasaActual.next(data);
    });
  }

  obtenerTasaActual(): void {
    this.socket.io.emit('CLIENTE:TasaActual');
  }

  guardarTasa(tasa: number): void {
    this.socket.io.emit('CLIENTE:guardarTasa', { tasa });
  }

  getTasaActual(): TasaResponse | null {
    return this.tasaActual.value;
  }
}
