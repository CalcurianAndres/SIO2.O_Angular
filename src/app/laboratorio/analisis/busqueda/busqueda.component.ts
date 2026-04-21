import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnalisisService } from 'src/app/services/analisis.service';

@Component({
  selector: 'app-busqueda',
  standalone: false,templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.scss']
})
export class BusquedaComponent {

  constructor(public analisis:AnalisisService){

  }

  @Input() busqueda:any;
  @Input() Resultadoas:any;
  @Input() parametro:any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onBuscarParametro = new EventEmitter();

  cerrar(){
    this.onCloseModal.emit();
  }

  buscarResultado(grupo, id_analisis){
    if(grupo === 'Tintas'){

    }
  }

  verInfo(recepcion:any, material:any, index_recepcion:number, index_material:number){
    const indice = recepcion.materiales.findIndex(arr => arr.some(item => item._id === material._id));

    this.parametro = [recepcion, recepcion.materiales[indice], index_recepcion, indice]
    this.onBuscarParametro.emit(this.parametro)
  }


}
