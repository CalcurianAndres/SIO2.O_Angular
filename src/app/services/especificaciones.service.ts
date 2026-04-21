import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class EspecificacionesService {

  especificaciones!: any
  especificaciones_!: any
  mensaje!:Mensaje
  constructor(private socket: WebSocketService) {
    this.buscarEspecificacion();
  }



  buscarEspecificacion() {
    this.socket.io.on('SERVER:Especificaciones', async (especificaciones) => {
      this.especificaciones = especificaciones;
    })

    this.socket.io.on('SERVER:Especificaciones_', async (especificaciones_) => {
      this.especificaciones = especificaciones_;
    })

    this.socket.io.emit('CLIENTE:BuscarEspecificaciones');

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });
  }

  buscarEspecificacion_(id){
    return this.especificaciones_.find(x=> x._id === id)
  }
  GuardarEspecificacion(data: any) {
    this.socket.io.emit('CLIENTE:nuevaEspecificacion', data)
  }

  GuardarEspecificacion2(data: any) {
    this.socket.io.emit('CLIENTE:nuevaEspecificacion2', data)
  }


  EditarESpecificacion(data: any) {
    this.socket.io.emit('CLIENTE:EdicionEspecificacion', data)
  }
}
