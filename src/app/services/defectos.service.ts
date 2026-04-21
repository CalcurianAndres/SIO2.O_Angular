import { Injectable } from '@angular/core';
import { Mensaje } from '../compras/models/modelos-compra';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class DefectosService {

  public mensaje!:Mensaje;
  public defectos:any = [];

  constructor(private socket:WebSocketService) { 
    this.buscarDefectos();
  }

  buscarDefectos(){
    this.socket.io.emit('CLIENTE:BuscarDefecto')
  
    this.socket.io.on('SERVER:defecto', (data)=>{
      this.defectos = data;
    })
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });
  }


  guardarDefecto(data){
    this.socket.io.emit('CLIENTE:NuevoDefecto', data)
  }

  buscarPorClienteYCategoria(cliente:any, categoria:any){
    return this.defectos.find((defecto:any) => defecto.cliente._id === cliente && defecto.categoria._id === categoria)
  }

}
