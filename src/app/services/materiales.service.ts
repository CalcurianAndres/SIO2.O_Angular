import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Materiales, Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {


  public materiales!: any
  public mensaje!: Mensaje;
  public asignaciones!: any;
  constructor(public socket: WebSocketService) {
    this.buscarMaterial();
  }

  nuevoMaterial(data: any) {
    this.socket.io.emit('CLIENTE:NuevoMaterial', data)
  }

  buscarMaterial() {
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });

    this.socket.io.emit('CLIENTE:BuscarMaterial')

    this.socket.io.on('SERVER:Materiales', (materiales) => {
      this.materiales = materiales;
    })
  }

  buscarAsignacion(orden) {
    this.socket.io.emit('SERVER:asignacion', orden)
  }

  buscarSoloSustrato() {
    return this.materiales.filter((mat: any) => mat.grupo.trato === true)
  }

  buscarMaterialPorId(id) {
    return this.materiales.find((mat: any) => mat._id === id)
  }

  filtrarGrupos(id: any) {
    return this.materiales.filter((x: any) => x.grupo._id === id)
  }

  guardarMaterial(data: any) {
    this.socket.io.emit('CLIENTE:GuardarMaterial', data);
  }

  EliminarMaterial(id: any) {
    this.socket.io.emit('CLIENTE:elminarMaterial', id)
  }

  filtrarPorFabricante(id_fabricante) {
    return this.materiales.filter((x: any) => x.fabricante._id === id_fabricante)
  }

  filtrarPorGrupos(ids: string[]): any[] {
    return this.materiales.filter((x: any) => ids.some((groupId: string) => groupId.includes(x.grupo._id)));
  }

  filtrarPorMateriales(materiales_id: string[]): any[] {
    return this.materiales.filter((x: any) => materiales_id.some((grupoIds: string) => grupoIds.includes(x._id)));
  }


  notificarMaterial(id: string) {
    this.socket.io.emit('CLIENTE:NotificarNuevoMaterial', id);
  }

  filtrarPorGrupoSinEspecificacion(id: string): Materiales[] {
    return this.materiales.filter((material: any) =>
      material.grupo._id === id && (!material.especificacion && !material.especificacion2)
    );
  }

  filtrarPorGrupoConEspecificacion(id: any): Materiales[] {
    return this.materiales.filter((material: any) =>
      material.grupo._id === id && (material.especificacion || material.especificacion2)
    );
  }


  buscarCajasYmetros(nombre) {
    nombre = nombre.replace(/\s*\([^)]*\)/g, '')
    let caja = this.materiales.find(m => m.nombre.includes(nombre));
    return caja;
  }

  /**
 * Busca elementos según la capacidad especificada.
 * 
 * @param {number} capacidad - La capacidad que se utilizará para filtrar los elementos.
 * 
 * @example
 * // Ejemplo de uso:
 * const resultado = BuscarPorCapacidad(10);
 * console.log(resultado);
 * 
 * @returns {Array|Object} - Devuelve el envase que tenga la misma capacidad que le pasas como parametro
 */
  BuscarPorCapacidad(capacidad: number) {

    // Filtrar los envases en el almacén
    const envases = this.materiales.filter(x => x.grupo.nombre === 'Envases');

    console.log(envases)

    return envases.find((x) => x.capacidad == capacidad)



  }






  PantonesSolo() {

    const materialesFiltrados: any = [];
    const codigosEncontrados: string[] = [];
    this.materiales.forEach(material => {
      if (material.grupo.nombre === 'Tintas' && material.color === 'P' && !codigosEncontrados.includes(material.codigo)) {
        materialesFiltrados.push(material);
        codigosEncontrados.push(material.codigo);
      }
    });

    return materialesFiltrados
  }

}