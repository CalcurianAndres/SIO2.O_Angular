import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class FasesService {

  public mensaje!:Mensaje;
  public fases:any = [];

  constructor(private socket:WebSocketService) {
    this.onFases();
   }

  GuardarFase(data:any){
    this.socket.io.emit('CLIENTE:nuevaFase',data)
    // this.socket.io.emit('NuevoGrupo',{nombre,parcial:false,icono:'test'})
  }

  EditarFase(data:any){
    this.socket.io.emit('CLIENTE:EditFase', data);
  }

  eliminarFase(id){
    this.socket.io.emit('CLIENTE:deleteFase', id)
  }

  onFases(){
    this.socket.io.emit('CLIENTE:buscarFase')
  
    this.socket.io.on('SERVER:fase', (data)=>{
      this.fases = data;
      console.log(this.fases)
    })
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.error(data.mensaje);
      this.mensaje = data
    });

  }
}
