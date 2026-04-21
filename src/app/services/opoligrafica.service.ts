import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class OpoligraficaService {

  constructor(public socket:WebSocketService) { 
    this.onOrdenPoligrafica()
  }

  public orden!:any
  public mensaje!:Mensaje
  public ordenesMesActual:number = 0;
  public ordenesAnoActual:number = 0;

  onOrdenPoligrafica(){
    this.socket.io.emit('CLIENTE:BuscarOrdenesPoligrafica')
  
    this.socket.io.on('SERVER:OrdenesPoligrafica', (data) => {
      this.orden = data;
    
      // Obtener la fecha actual
      const fechaActual = new Date();
    
      // Restablecer contadores
      this.ordenesMesActual = 0;
      this.ordenesAnoActual = 0;
    
      // Recorrer todas las órdenes y contar las que están en el mes y en el año actual
      this.orden.forEach((orden) => {
        const fechaOrden = new Date(orden.createdAt);
    
        // Verificar si la orden pertenece al año actual
        if (fechaOrden.getFullYear() === fechaActual.getFullYear()) {
          this.ordenesAnoActual++;
          
          // Verificar si la orden pertenece también al mes actual
          if (fechaOrden.getMonth() === fechaActual.getMonth()) {
            this.ordenesMesActual++;
          }
        }
      });
    });

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });
  }

  filtrarPorProveedor(proveedorID){
    return this.orden.filter((x:any)=> x.proveedor._id === proveedorID)
  }

  nuevaOrden(data){
    this.socket.io.emit('CLIENTE:NuevaOrdenPoligrafica', data)
  }

  separarPorProveedor(){
    const materialesPorProveedor = {};
    // Recorremos el arreglo original
      this.orden.forEach((material) => {
        const { proveedor } = material;

        // Si el proveedor no existe en el objeto, lo creamos
        if (!materialesPorProveedor[proveedor.nombre]) {
          materialesPorProveedor[proveedor.nombre] = [];
        }

        // Agregamos el material al proveedor correspondiente
        materialesPorProveedor[proveedor.nombre].push(material);
      });

      // Convertimos el objeto en un arreglo de proveedores
      const arregloCategorizado = Object.entries(materialesPorProveedor);

      return arregloCategorizado;
  }


}
