import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root',
})
export class SolicitudesService {
  constructor(public socket: WebSocketService) {
    this.BuscarSolicitud();
  }

  public solicitudes!: any;
  public mensaje!: Mensaje;

  BuscarSolicitud() {
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data;
    });

    this.socket.io.emit('CLIENTE:BuscarRequisicion');

    this.socket.io.on('SERVER:Requisicion', (solicitudes) => {
      this.solicitudes = solicitudes;
      console.log(this.solicitudes);
    });
  }

  NuevaSolicitud(data) {
    this.socket.io.emit('CLIENTE:NuevaRequisicion', data);
  }

  CancelarSolicitud(id) {
    this.socket.io.emit('CLIENTE:CancelarRequisicion', id);
  }

  AprobarSolicitud(id) {
    this.socket.io.emit('CLIENTE:AprobarRequisicion', id);
  }

  LiberarSolicitud(id) {
    this.socket.io.emit('CLIENTE:EtiquetarRequisicion', id);
  }

  buscarSolicitudPorID(id) {
    if (this.solicitudes) {
      return this.solicitudes.find((s: any) => s._id == id);
    }
  }
}
