import { Injectable } from '@angular/core';
import { Mensaje } from '../compras/models/modelos-compra';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class OcompraService {

  constructor(public socket:WebSocketService) {
    this.onOrdenCompra();
   }

  public orden!:any
  public mensaje!:Mensaje

  onOrdenCompra(){
    this.socket.io.emit('CLIENTE:BuscarOrdenesCompra')
  
    this.socket.io.on('SERVER:OrdenesCompra', (data)=>{
      this.orden = data;
    })

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });
  }

  guardarOrden(data){
    this.socket.io.emit('CLIENTE:NuevaOrdenCompra', data)
  }

  BuscarPorProducto(producto_ID: any) {
    return this.orden.filter(o =>
      o.pedido.some(p => p.producto._id === producto_ID)
    );
  }

  separarPorCliente<T>():[string, []] | any{
    const OrdenesPorClientes = {};
    // Recorremos el arreglo original
      this.orden.forEach((orden) => {
        const { cliente } = orden;

        // Si el proveedor no existe en el objeto, lo creamos
        if (!OrdenesPorClientes[cliente.nombre]) {
          OrdenesPorClientes[cliente.nombre] = [];
        }

        // Agregamos el material al proveedor correspondiente
        OrdenesPorClientes[cliente.nombre].push(orden);
      });

      // Convertimos el objeto en un arreglo de proveedores
      const arregloCategorizado:any = Object.entries(OrdenesPorClientes);
      return arregloCategorizado;
  }

  buscarPorCliente(clienteID){
    return this.orden.filter((x:any)=> x.cliente._id === clienteID)
  }




}
