import { Injectable } from '@angular/core';
import { Mensaje } from '../compras/models/modelos-compra';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  public mensaje!:Mensaje;
  public categorias:any = [];

  constructor(private socket:WebSocketService) {
    this.onCategorias();
  }

  buscarCategoria(id){
    return this.categorias.find((cat:any) => cat._id === id)
  }

  GuardarCategoria(data:any){
    this.socket.io.emit('CLIENTE:nuevaCategoria',data);
    // this.socket.io.emit('NuevoGrupo',{nombre,parcial:false,icono:'test'})
  }

  EliminarCategoria(id){
    this.socket.io.emit('CLIENTE:deleteCategoria', id);
  }

  EditarCategoria(data:any){
    this.socket.io.emit('CLIENTE:EditCategoria', data);
  }

  onCategorias(){
    this.socket.io.emit('CLIENTE:buscarCategoria')
  
    this.socket.io.on('SERVER:categoria', (data)=>{
      this.categorias = data;
      console.log(this.categorias)
    })
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.error(data.mensaje);
      this.mensaje = data
    });

  }

}
