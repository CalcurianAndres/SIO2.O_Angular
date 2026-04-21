import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class TrabajadoresService {

  public trabajador;
  public contrataciones;
  public mensaje!:Mensaje

  constructor(private socket:WebSocketService) { 
    this.BuscarTrabajador();
  }

  BuscarTrabajador(){
    this.socket.io.emit('CLIENTE:Trabajador');
    
    this.socket.io.on('SERVER:Trabajador', (data)=>{
      this.trabajador = data;
    })

    this.socket.io.on('SERVER:Contrataciones', (data)=>{
      this.contrataciones = data;
      console.log('contrataciones:', this.contrataciones)
    })

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });
  }

  nuevoTrabajador(data:any){
    this.socket.io.emit('CLIENTE:nuevoTrabajador', data)
  }

  eliminarTrabajador(data:any){
    this.socket.io.emit('CLIENTE:EliminarTrabajador', data)
  }

  buscarHistorialTrabajador(trabajador_id){
    return this.contrataciones.filter((x:any)=> x.trabajador === trabajador_id)
  }

}
