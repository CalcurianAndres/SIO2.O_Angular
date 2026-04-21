import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { catchError, of } from 'rxjs';
import { AlmacenService } from 'src/app/services/almacen.service';
import { EtiquetasService } from 'src/app/services/etiquetas.service';
import { FormulasService } from 'src/app/services/formulas.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-color-mix',
  standalone: false,templateUrl: './color-mix.component.html',
  styleUrls: ['./color-mix.component.scss']
})
export class ColorMixComponent implements OnInit{

  constructor(public materiales:MaterialesService,
              public formulas:FormulasService,
              public almacen:AlmacenService,
              public api:SolicitudesService,
              public etiquetas:EtiquetasService
  ){}

  ngOnInit(): void {
    this.envasesInventario = this.almacen.BuscarEnvasesCapacidadyCantidad()
  }


  @Output() onCloseModal = new EventEmitter();

  public formulas_:any = []
  public _seBusco = false;
  public name = ''
  public formular:any = []
  public preparacion:any = ''
  public cantidad_a_preparar = 1;
  public envasesInventario:any;
  public available:boolean[] = []
  public envases_pesados = 0;
  public pesos_de_envase:any = [];
  public empleado = ''
  public material_id;


  MostrarInfo(pantone, name, id){
    this._seBusco = false
    this.name = name
    this.formulas_ = pantone
    this.formulas_ = this.formulas.BuscarFormulas(pantone)
    this.preparacion = pantone;
    this.material_id = id;
    setTimeout(() => {
      this._seBusco = true
    }, 1000);
  }


  home(){
    this.onCloseModal.emit();
  }

  
  
  seleccionarEnvases(kgPreparar: number): { capacidad: number, cantidad: number }[] { 
    
    const capacidadesDisponibles = [...this.envasesInventario]
    const sortedEnvases = capacidadesDisponibles.sort((a, b) => b.capacidad - a.capacidad); 
    let kgRestante = kgPreparar; 
    const envasesSeleccionados:any = []; 
      for (const envase of sortedEnvases) { 
        if (kgRestante <= 0) break; 
        const envasesNecesarios = Math.floor(kgRestante / envase.capacidad); 
        const envasesTomados = Math.min(envasesNecesarios, envase.cantidad); 
        if (envasesTomados > 0) { 
          
          // Verificar si ya existe un envase de la misma capacidad en el array seleccionado 
          const existente = envasesSeleccionados.find(e => e.capacidad === envase.capacidad); 
            if (existente) { 
              existente.cantidad += envasesTomados; 
            } else { 
              envasesSeleccionados.push({ capacidad: envase.capacidad, cantidad: envasesTomados });
            } 
            kgRestante -= envase.capacidad * envasesTomados;
           } 
          } 
          
          if (kgRestante > 0) { 
            for (const envase of sortedEnvases.reverse()) { 
              if (kgRestante <= 0) break; 
                if (envase.cantidad > 0 && envase.capacidad >= kgRestante) { 
                  envasesSeleccionados.push({ 
                    capacidad: envase.capacidad, cantidad: 1 }); 
                  
                kgRestante = 0; 
              } 
            } 
          } 
          
        return this.combinarEnvases(envasesSeleccionados); 
    }

    combinarEnvases = (envases) => { 
      const resultado:any = []; 
      const mapaEnvases = new Map(); 
        envases.forEach((envase) => { 
          if (mapaEnvases.has(envase.capacidad)) { 
              mapaEnvases.set(envase.capacidad, mapaEnvases.get(envase.capacidad) + envase.cantidad);
          } else { 
            mapaEnvases.set(envase.capacidad, envase.cantidad); 
          } 
        }); 
        mapaEnvases.forEach((cantidad, capacidad) => { 
          resultado.push({ capacidad, cantidad });
         });
         return resultado; 
      };

      activate(n: number, e:any): void {
        // Reinicia el estado de todos los checkboxes
        this.available = this.available.map(() => false);
        

        if(e.checked === true){
          // Activa solo el índice seleccionado
          this.available[n] = true;
        }
    }


    guardarSolicitud(i){
      
      let data:{ material: string; cantidad: number }[] = [];

      this.formulas_[i].formula.forEach((item: any) => {
        if (item.material && item.cantidad) {
          data.push({
            material: item.material._id,
            cantidad: Number((item.cantidad * this.cantidad_a_preparar).toFixed(2)),
          });
        }
    });

    this.seleccionarEnvases(this.cantidad_a_preparar).forEach((item: any) => {
      data.push({
        material: this.materiales.BuscarPorCapacidad(item.capacidad)._id,
        cantidad:item.cantidad
      })
    })
    
    this.api.NuevaSolicitud({cantidad:this.cantidad_a_preparar,material:this.material_id,tag:'Preparacion',materiales:data, motivo:`Preparación ${this.cantidad_a_preparar}kg de ${this.name}`})
    setTimeout(() => {
      this.onCloseModal.emit();
      Swal.fire({
        title:this.api.mensaje.mensaje,
        icon:this.api.mensaje.icon,
        toast:true,
        timer:5000,
        showConfirmButton:false,
        timerProgressBar:true,
        position:'top-end'
      })
    }, 500);
} 

EtiquetasPendiente(){
  return this.api.solicitudes.filter(s => s.tag === 'Preparacion' && s.status === 'Por Etiquetar')
}

Reformulacion(){
  return this.api.solicitudes.filter(s => s.tag === 'Preparacion' && s.status === 'Reformulacion')
}


ImprimirEtiquetas(i:number){

  let requi = this.EtiquetasPendiente()[i];

  let data:{nombre:string,preparacion:string,lote:string,empleado:string,pesos:string,formula:string[]} = {
    nombre:this.extraerDatos(requi.motivo).producto,
    preparacion:moment(requi.createdAt).format('DD/mm/yyyy'),
    lote:'PT-001-24',
    empleado:this.empleado,
    pesos:this.pesos_de_envase,
    formula:[]
  }


  console.log(requi.materiales)
  for(let i=0;i<requi.materiales.length;i++){
    if(requi.materiales[i].material.grupo === "66bf583c605b8ca0df5680d3"){
      data.formula[i] = `${requi.materiales[i].cantidad} Kg ${requi.materiales[i].material.nombre} ${requi.materiales[i].material.serie}`
  }

  for(let i=0;i<this.envases_pesados;i++){
    let almacen = {
      analisis:'',
      codigo:i+1,
      presentacion: 'Env. plástico',
      neto:this.pesos_de_envase[i],
      lote:'PT-001-24',
      unidad:'kg',
      fabricacion:'',
      ancho:'',
      largo:'',
      material:this.extraerDatos(requi.motivo).producto,
      oc:'N/A'
    }
  
    console.log(almacen)
  }
  
  }

  this.etiquetas.ImprimirEtiqueta(data)
  .pipe(
    catchError((error) => {
      // Handle the error here
      console.error('Error occurred:', error);
      
      // You can return a user-friendly message or an empty observable
      // For example, returning an observable with an error message
      return of({ error: true, message: 'No se pudo imprimir la etiqueta' });
    })
  )
  .subscribe((resp: any) => {
    if (resp.error) {
      Swal.fire({
        icon: 'error',
        title: resp.message, // Use the error message returned from the catchError
        toast: true,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        position:'top-end'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: resp.message, // Use the error message returned from the catchError
        toast: true,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        position:'top-end'
      });

      this.empleado = '';
      this.envases_pesados = 0;
      this.pesos_de_envase = [];
      this.EtiquetasPendiente()[i].status = 'listo';
      this.onCloseModal.emit()
      // this.router.navigateByUrl('/compras')
      // Handle successful login response here
    }
  });

}

extraerDatos(texto: string): any {
  // Expresión regular para capturar la cantidad en kg y el tipo de producto
  const patron = /Preparación (\d+)kg de (.+)/;

  // Ejecutar la expresión regular sobre el texto
  const resultado = patron.exec(texto);

  // Si se encontró una coincidencia, retornamos los datos
  if (resultado) {
      const cantidad = resultado[1];  // La cantidad en kg
      const producto = resultado[2];  // El tipo de producto
      return { cantidad: `${cantidad}kg`, producto };
  } else {
      // Si no se encontró ninguna coincidencia, retornamos null
      return {producto:'ERROR.'};
  }
}

formatearFecha(fecha: Date): string {
  const dia = fecha.getDate().toString().padStart(2, '0');  // Día con 2 dígitos
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');  // Mes con 2 dígitos (se suma 1 porque los meses empiezan desde 0)
  const anio = fecha.getFullYear();  // Año en 4 dígitos

  return `${dia}/${mes}/${anio}`;
}





}

    type Envase = { capacidad: any; cantidad: any };