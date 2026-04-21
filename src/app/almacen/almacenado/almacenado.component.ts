import { Component } from '@angular/core';
import { AlmacenService } from 'src/app/services/almacen.service';
import { GruposService } from 'src/app/services/grupos.service';

@Component({
  selector: 'app-almacenado',
  standalone: false,templateUrl: './almacenado.component.html',
  styleUrls: ['./almacenado.component.scss']
})
export class AlmacenadoComponent {


  listado!:any;
  Inventario:boolean = false;
  Generales!:{ [id: string]: number };
  ByLotes!:{ [id: string]: { [lote: string]: number } }
  Materiales_totales!: any;
  constructor(public api:AlmacenService,
              public grupos:GruposService){}



    filas(){
      return Math.ceil(this.grupos.grupos.length / 3)
    }

    detallar = async(id:any)=>{
      console.log(id)
      const sumByMaterialId:any = []
      this.Inventario = true;
      this.listado = this.api.BuscarPorGrupo(id);
      this.sumarMateriales();
      this.Materiales_totales = agruparMaterialesPorNombreYId(this.listado)
      console.log(this.Materiales_totales)
      function agruparMaterialesPorNombreYId(materiales: any[]): any[] {
        const agrupacionPorNombre = new Map<string, any>();
      
        materiales.forEach(material => {
          const materialNombre = material.material.nombre;
          const materialId = material.material._id;
      
          // Si el nombre del material no existe en el mapa, lo creamos
          if (!agrupacionPorNombre.has(materialNombre)) {
            agrupacionPorNombre.set(materialNombre, {
              nombre: material.material.nombre,
              materialesPorId: new Map<string, any>() // Aquí se almacenan los materiales agrupados por ID
            });
          }
      
          // Obtener la referencia del material agrupado por nombre
          const agrupadoPorNombre = agrupacionPorNombre.get(materialNombre);
      
          // Si el material con el ID específico no existe en el mapa, lo creamos
          if (!agrupadoPorNombre.materialesPorId.has(materialId)) {
            agrupadoPorNombre.materialesPorId.set(materialId, {
              nombre: material.material.nombre,
              marca: material.material.fabricante.alias,
              unidad: material.unidad,
              netoTotal: 0,
              lotes: {}
            });
          }
      
          // Obtener la referencia del material agrupado por ID
          const materialAgrupado = agrupadoPorNombre.materialesPorId.get(materialId);
          materialAgrupado.netoTotal += Number(material.neto);
      
          // Agrupar por lote
          if (!materialAgrupado.lotes[material.lote]) {
            materialAgrupado.lotes[material.lote] = [];
          }
          materialAgrupado.lotes[material.lote].push(material);
        });
      
        // Convertir el mapa de agrupacionPorNombre a un array para usarlo en la vista
        const resultado = Array.from(agrupacionPorNombre.values()).map(grupo => {
          return {
            nombre: grupo.nombre,
            materialesPorId: Array.from(grupo.materialesPorId.values()) // Convertimos el Map de IDs a un array
          };
        });
      
        return resultado;
      }

    }

    sumarMateriales() {
      const sumByMaterialId: { [id: string]: number } = {};
      const sumByMaterialIdAndLote: { [id: string]: { [lote: string]: number } } = {};
      for (const material of this.listado) {
        const materialId = material.material._id.toString(); // Convertir el ID a cadena
        const neto = Number(material.neto); // Convertir a número
        const ancho = material.ancho.toString(); // Convertir el ancho a cadena
        const largo = material.largo.toString(); // Convertir el largo a cadena
        const key = `${materialId}-${ancho}-${largo}`; // Crear una clave única para el material
    
        if (!sumByMaterialId[key]) {
          sumByMaterialId[key] = 0;
        }
        sumByMaterialId[key] += neto;
    
        if (!sumByMaterialIdAndLote[key]) {
          sumByMaterialIdAndLote[key] = {};
        }
        if (!sumByMaterialIdAndLote[key][material.lote]) {
          sumByMaterialIdAndLote[key][material.lote] = 0;
        }
        sumByMaterialIdAndLote[key][material.lote] += neto;
      }
      this.Generales = sumByMaterialId;
      this.ByLotes = sumByMaterialIdAndLote;
    }
}
