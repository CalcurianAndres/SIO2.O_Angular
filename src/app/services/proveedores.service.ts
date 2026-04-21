import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje, Proveedores } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {


  public proveedores:any = []
  public proveedor_selected!:any
  public mensaje!:Mensaje;
  constructor(public socket:WebSocketService) { 
    this.buscarProveedor()
  }


  buscarProveedor(){

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.error(data.mensaje);
      this.mensaje = data
    });

    this.socket.io.emit('CLIENTE:BuscarProveedores')

    this.socket.io.on('SERVER:proveedores', (proveedores:Array<Proveedores>) => {
      this.proveedores = proveedores
    })
  }

  nuevoProveedor(data:Proveedores){
    this.socket.io.emit('CLIENTE:NuevoProveedor', data)
  }

  editarProveedores(data:Proveedores){
    this.socket.io.emit('CLIENTE:EditarProveedor', data)
  }

  eliminarProveedor(id:string){
    this.socket.io.emit('CLIENTE:deleteProveedor', id)
  }

  seleccionarUnProveedor(nombre:any){
    console.log('Aqui tambien tamos')
    console.log(this.proveedores.filter((x:any) =>x.nombre === nombre))
    return this.proveedores.filter((x:any) =>x.nombre === nombre)
  }

}
