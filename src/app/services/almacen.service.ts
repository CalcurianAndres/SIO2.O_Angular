import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {

  Almacen:any;
  Registro:any;
  constructor(private socket:WebSocketService) {
    this.BuscarAlmacen();
   }


  BuscarAlmacen() {
    this.socket.io.on('SERVER:almacen', async (Almacen) => {
      this.Almacen = Almacen;
    })

    this.socket.io.emit('CLIENTE:BuscarLogs')
    this.socket.io.emit('CLIENTE:BuscarAlmacen');

    this.socket.io.on('SERVER:registros', async (registro)=>{
      this.Registro = registro
    })
  }

  GuardarAlmacen(data:any){
    this.socket.io.emit('CLIENTE:NuevoAlmacen', data)
  }

  BuscarPorGrupo(grupo:string){
    console.log(grupo)
    return this.Almacen.filter((x:any)=> x.material.grupo._id === grupo)
  }

  buscarPorLote(lote:any){
    return this.Almacen.some((x) => x.lote === lote);
  }

  buscarPorID(id:any){
    return this.Almacen.filter((x) => x.material._id === id)
  }


  BuscarCantidadEnAlmacen(material: string) {
    const totalNeto = this.Almacen
      .filter(item => item.material._id === material) // Filtrar los materiales que coinciden con el _id
      .reduce((sum, item) => sum + Number(item.neto), 0); // Sumar los valores de neto
    
    return totalNeto; // Retorna el total sumado
  }

  BuscarEnvasesCapacidadyCantidad() {
    // Filtrar los envases en el almacén
    const envases = this.Almacen.filter(x => x.material.grupo.nombre === 'Envases');
  
    // Crear un mapa de capacidades y sus cantidades
    const capacidadesMap = new Map<number, number>();
  
    envases.forEach(envase => {
      const capacidad = Number(envase.material.capacidad); // Asumiendo que cada envase tiene una propiedad 'capacidad'
      if (capacidadesMap.has(capacidad)) {
        // Incrementar el conteo si ya existe la capacidad
        capacidadesMap.set(capacidad, capacidadesMap.get(capacidad)! + 1);
      } else {
        // Añadir nueva capacidad al mapa
        capacidadesMap.set(capacidad, 1);
      }
    });
    // Convertir el mapa a un array para facilitar el uso
    const capacidades = Array.from(capacidadesMap.entries()).map(([capacidad, cantidad]) => ({
      capacidad,
      cantidad,
    }));
    return capacidades; // Devuelve un array con objetos de capacidad y cantidad
  }

  AsignacionDeMaterial(data, asignacion){
    this.socket.io.emit('CLIENTE:Asignacion', data, asignacion)
  }
}
