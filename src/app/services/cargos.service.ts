import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class CargosService {

  public cargos!:any;
  public mensaje!:Mensaje
  constructor(private socket:WebSocketService) { 
    this.buscarCargos()
  }

  buscarCargos(){
    this.socket.io.emit('CLIENTE:Cargos')

    this.socket.io.on('SERVER:Cargos', (data)=>{
      this.cargos = data;
      console.log(this.cargos)
    })

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });
  }

  NuevoCargo(data){
    this.socket.io.emit('CLIENTE:NuevoCargo', data);
  }

  eliminarCargo(data){
    this.socket.io.emit('CLIENTE:EliminarCargo', data);
  }

}
