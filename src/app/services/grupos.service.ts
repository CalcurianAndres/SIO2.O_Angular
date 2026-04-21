import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Grupo, Mensaje } from '../compras/models/modelos-compra';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class GruposService {

  public grupos:Array<Grupo> = []
  public mensaje!:Mensaje;

  constructor(private socket:WebSocketService) {
    this.onGrupos();
   }
  

  GuardarGrupo(data:Grupo){
    this.socket.io.emit('CLIENTE:NuevoGrupo',data)
    // this.socket.io.emit('NuevoGrupo',{nombre,parcial:false,icono:'test'})
  }

  EliminarGrupo(id:String){
    this.socket.io.emit('CLIENTE:deleteGrupo', id)
  }

  EditarGrupo(data:Grupo){
    this.socket.io.emit('CLIENTE:EditarGrupo', data)
  }

  BuscarGrupoPorNombre(nombre:string){
    return this.grupos.find((x:any)=> x.nombre === nombre)
  }

  onGrupos(){
    // Escucha el evento 'SERVIDOR:enviarMensaje'
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.error(data.mensaje);
      this.mensaje = data
    });

    this.socket.io.emit('CLIENTE:buscarGrupos')

    this.socket.io.on('cargarGrupos', (grupo:Array<Grupo>) => {
      this.grupos = grupo
    })

    this.socket.io.on('SERVER:NuevoGrupo', (grupo:Grupo) =>{
      this.grupos.push(grupo)
    })
  }
}
