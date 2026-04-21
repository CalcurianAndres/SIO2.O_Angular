import { Injectable, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Fabricante, Fabricante_populated, Grupo, Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class FabricantesService{

  public grupos:any = []
  public fabricantes:Array<Fabricante> = []
  public mensaje!:Mensaje;

  constructor(private socket:WebSocketService) { 
    this.buscarGrupos()
    
  }

  buscarGrupos(){
    // Escucha el evento 'SERVIDOR:enviarMensaje'
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.error(data.mensaje);
      this.mensaje = data
    });

    this.socket.io.emit('CLIENTE:buscarGrupos')

    this.socket.io.on('cargarGrupos', (grupo) => {
      this.grupos = grupo
    })


    this.socket.io.emit('CLIENTE:BuscarFabricante')

    this.socket.io.on('SERVER:Fabricantes', (fabricantes:Array<Fabricante>)=>{
      this.fabricantes = fabricantes
    })
    // console.log(this.grupos) 
  }

  agregarFabricante(data:Fabricante){
    this.socket.io.emit('CLIENTE:NuevoFabricante', data)
  }

  editarFabricante(data:Fabricante_populated){
    console.log(data)
    this.socket.io.emit('CLIENTE:EditarFabricante', data)
  }

  eliminarFabricante(id:string){
    this.socket.io.emit('CLIENTE:deleteFabricante', id)
  }

  buscarFabricanteDe(idGrupo:string){

    return this.fabricantes.filter(fabricante => 
      fabricante.grupo.some((g:any) => g._id === idGrupo))
  }
  /**
  La función  buscarFabricantesPorId  recibe un parámetro  id  de tipo string y devuelve
   un array de objetos de fabricantes que coinciden con el valor del  _id  proporcionado. 
  **/
  buscarFabricantesPorId(id:string):Fabricante[]{

    return this.fabricantes.filter(fabricante => id.includes(fabricante._id))
  }


}
