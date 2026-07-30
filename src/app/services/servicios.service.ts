import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Servicio, Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  public servicios: Array<Servicio> = [];
  public mensaje!: Mensaje;

  constructor(private socket: WebSocketService) {
    this.buscarServicios();
  }

  buscarServicios() {
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data;
    });

    this.socket.io.emit('CLIENTE:BuscarServicios');

    this.socket.io.on('SERVER:Servicios', (servicios: Array<Servicio>) => {
      this.servicios = servicios;
    });
  }

  agregarServicio(data: Servicio) {
    this.socket.io.emit('CLIENTE:NuevoServicio', data);
  }

  editarServicio(data: Servicio) {
    this.socket.io.emit('CLIENTE:EditarServicio', data);
  }

  eliminarServicio(id: string) {
    this.socket.io.emit('CLIENTE:deleteServicio', id);
  }
}
