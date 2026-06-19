import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root',
})
export class TrabajadoresService {
  public trabajador;
  public trabajadorTodos;
  public contrataciones;
  public mensaje!: Mensaje;
  private pendingTodos = false;

  constructor(private socket: WebSocketService) {
    this.BuscarTrabajador();
  }

  BuscarTrabajador() {
    this.socket.io.emit('CLIENTE:Trabajador');

    this.socket.io.on('SERVER:Trabajador', (data) => {
      if (this.pendingTodos) {
        this.trabajadorTodos = data;
        this.pendingTodos = false;
      } else {
        this.trabajador = data;
      }
    });

    this.socket.io.on('SERVER:Contrataciones', (data) => {
      this.contrataciones = data;
      console.log('contrataciones:', this.contrataciones);
    });

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data;
    });
  }

  BuscarTrabajadorTodos() {
    this.pendingTodos = true;
    this.socket.io.emit('CLIENTE:Trabajador', { incluirBorrados: true });
  }

  nuevoTrabajador(data: any) {
    this.socket.io.emit('CLIENTE:nuevoTrabajador', data);
  }

  eliminarTrabajador(data: any) {
    this.socket.io.emit('CLIENTE:EliminarTrabajador', data);
  }

  darDeBajaTrabajador(data: any) {
    this.socket.io.emit('CLIENTE:DarDeBajaTrabajador', data);
  }

  reactivarTrabajador(data: any) {
    this.socket.io.emit('CLIENTE:ReactivarTrabajador', data);
  }

  buscarHistorialTrabajador(trabajador_id) {
    if (!this.contrataciones) return [];
    return this.contrataciones.filter((x: any) => {
      const id = x.trabajador?._id || x.trabajador;
      return String(id) === String(trabajador_id);
    });
  }
}
