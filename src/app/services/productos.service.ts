import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  public mensaje!:Mensaje;
  public producto:any = [];
  public historial:any = []
  public lastOne:any = []

  constructor(public socket:WebSocketService) { 
    this.onProductos()
  }

  onProductos(){
    this.socket.io.emit('CLIENTE:buscarProducto')
  
    this.socket.io.on('SERVER:producto', (data)=>{
      this.producto = data;
      console.log(this.producto)
    })

    this.socket.io.on('SERVER:historial',(data)=>{
      this.historial = data
      console.log(this.historial)
    })

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.error(data.mensaje);
      this.mensaje = data
    });
    this.socket.io.on('SERVIDOR:diferente', (data)=>{
      this.lastOne = data
    })
  }

  GuardarProducto(data:any){
    this.socket.io.emit('CLIENTE:nuevoProducto',data)
    // this.socket.io.emit('NuevoGrupo',{nombre,parcial:false,icono:'test'})
  }

  FiltrarPorCliente(cliente){
    console.log(this.producto.filter((x:any)=> x.identificacion.cliente._id === cliente))
    return this.producto.filter((x:any)=> x.identificacion.cliente._id === cliente)
  }

  buscarPorClientes(cliente){
    return this.producto.filter(x=> {
      console.log(x.identificacion.cliente._id === cliente)
      return x.identificacion.cliente._id === cliente
    })
  }

  buscarHistorialPorProducto(producto){
    return this.historial.filter((historial)=> historial.producto === producto)
  }
}
