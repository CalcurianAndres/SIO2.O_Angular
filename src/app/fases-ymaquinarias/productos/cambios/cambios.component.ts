import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { CategoriasComponent } from '../../categorias/categorias.component';
import { CategoriasService } from 'src/app/services/categorias.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { MaquinasService } from 'src/app/services/maquinas.service';

@Component({
  selector: 'app-cambios',
  standalone: false,templateUrl: './cambios.component.html',
  styleUrls: ['./cambios.component.scss']
})
export class CambiosComponent {

  @Input() cambios:any;
  @Input() informacion:any;
  @Input() fechas_cambios:any;
  @Input() titulo:any;
  @Output() onCloseModal = new EventEmitter()

  constructor(public categoria:CategoriasService,
              public material:MaterialesService,
              public maquina:MaquinasService
  ){}
  


  cerrar(){
    this.onCloseModal.emit()
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  isJsonString(str: string, str2:string,key): any {
    try {
      JSON.parse(str);
      if(this.esObjectId(this.limpiarString(this.compararJsons(JSON.parse(str), JSON.parse(str2), key)))){
        let id = this.limpiarString(this.compararJsons(JSON.parse(str), JSON.parse(str2), key))
        id = id.replace(/ /g, '')
        return this.busqueda(key, id)
        // return this.busqueda(key, this.limpiarString(this.compararJsons(JSON.parse(str), JSON.parse(str2))) )
      }else{
        return this.compararJsons(JSON.parse(str), JSON.parse(str2), key)
      }
    } catch {
      if(this.esObjectId(str)){
        return `${this.busqueda(key, str)} => ${this.busqueda(key, str2)}`
      }else{
        return str;
      }
    }
  }

  esObjectId(id) {
    id = id.replace(/ /g, '');
    return /^[a-fA-F0-9]{24}$/.test(id);
  }

  busqueda(key, str) {
    console.log(str)
    const prefix = key.substring(0, 14);  // 'materia_prima_' tiene 14 caracteres
    switch (true) {
      case key === 'identificacion_categoria':
        return this.categoria.buscarCategoria(str).nombre;
  
      case prefix === 'materia_prima_':
        let material = this.material.buscarMaterialPorId(str)
        return `${material.nombre} (${material.fabricante.alias})`;
  
      default:
        return this.maquina.buscarMaquinaPorId(str).nombre
    }
  }
  
  
  
  
  compararJsons(json1: any, json2: any, key:any): string {
    let cambios: string[] = [];
    let categoria  = this.categoria
  let material_ = this.material
  let maquina = this.maquina

  function esObjectId(id) {
    id = id.replace(/ /g, '');
    return /^[a-fA-F0-9]{24}$/.test(id);
  }

  // Función de ejemplo "Busqueda"
  function Busqueda(key: any, str:any) {

    if(esObjectId(str)){
      const prefix = key.substring(0, 14);  // 'materia_prima_' tiene 14 caracteres
      switch (true) {
        case key === 'identificacion_categoria':
          return categoria.buscarCategoria(str).nombre;
    
        case prefix === 'materia_prima_':
          let material = material_.buscarMaterialPorId(str)
          return `${material.nombre} (${material.fabricante.alias})`;
    
        default:
          return maquina.buscarMaquinaPorId(str).nombre
      }
    }else{return str}
  }
  
    function comparar(obj1: any, obj2: any, path = '') {
      // Verifica si uno de los valores es nulo o indefinido
      if (obj1 === undefined || obj1 === null || obj2 === undefined || obj2 === null) {
        if (obj1 !== obj2) {
          cambios.push(`${path}: ${obj1} => ${obj2}`);
        }
        return;
      }
  
      // Si no son objetos o arrays, comparamos los valores directamente
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        if (obj1 !== obj2) {
          cambios.push(`${path}: ${obj1} => ${obj2}`);
        }
        return;
      }
  
      // Comparar si son arrays
      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
          cambios.push(`${path}Aprobados: (${obj1.length} => ${obj2.length})`);
        }
  
        // Solo comparar hasta el tamaño mínimo de los dos arrays
        const minLength = Math.min(obj1.length, obj2.length);
        for (let i = 0; i < minLength; i++) {
          comparar(obj1[i], obj2[i], `${path}[${i}]`);
        }
  
        // Si hay elementos adicionales en cualquiera de los arrays, los reportamos
        if (obj1.length > minLength) {
          for (let i = minLength; i < obj1.length; i++) {
            cambios.push(`${path}[${i}]: eliminado (${Busqueda(key, obj1[i])})`);
          }
        }
        if (obj2.length > minLength) {
          for (let i = minLength; i < obj2.length; i++) {
            cambios.push(`${path}[${i}]: añadido (${Busqueda(key, obj2[i])})`);
          }
        }
        return;
      }
  
      // Si ambos son objetos, comparamos cada propiedad
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]); // Unir todas las claves de ambos objetos
      allKeys.forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        if (!(key in obj2)) {
          cambios.push(`${fullPath}: eliminado (${Busqueda(key, obj1[key])})`);
        } else if (!(key in obj1)) {
          cambios.push(`${fullPath}: añadido (${Busqueda(key, obj2[key])})`);
        } else {
          comparar(obj1[key], obj2[key], fullPath);
        }
      });
    }
  
    comparar(json1, json2);
  
    return cambios.length ? cambios.join(', ') : 'No hay diferencias significativas';
  }

  limpiarString(str) {
    if(str === '[1]: [object Object]'){
      return 'This is just a test'
    }
    // Reemplaza los guiones bajos (_) por paréntesis ()
    str = str.replace(/_/g, ' ');
    
    // Elimina las secuencias [0], [1], [2], [3], etc.
    str = str.replace(/\[\d+\]:/g, '');

    // Elimina las secuencias [0], [1], [2], [3], etc.
    str = str.replace(/\[\d+\]/g, '');

    
    return str;
  }

  formatear_fecha(fecha){
  return moment(fecha).format('DD/MM/YYYY - hh:mm:ss a')
  }



  
  // transformStringsToJson(strings: string[]): any[] {
  //   return strings.map(str => {
  //     if (this.isJsonString(str)) {
  //       return JSON.parse(str);
  //     } else {
  //       return str; // Retorna el string original si no es JSON
  //     }
  //   });
  // }

}