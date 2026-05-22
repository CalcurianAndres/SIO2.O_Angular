import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root',
})
export class DevolucionesService {
  public devoluciones: any = [];
  public mensaje!: Mensaje;

  constructor(private socket: WebSocketService) {
    this.buscarDevoluciones();
  }

  buscarDevoluciones() {
    this.socket.io.emit('CLIENTE:Devoluciones');

    this.socket.io.on('SERVER:devoluciones', (data) => {
      this.devoluciones = data;
      console.warn(data);
    });

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data;
    });
  }

  guardarDevolucion(data) {
    this.socket.io.emit('CLIENTE:NuevaDevolucion', data);
  }

  buscarDevolucionPorID(devolucionID) {
    return this.devoluciones.find((d) => d._id === devolucionID);
  }
}
