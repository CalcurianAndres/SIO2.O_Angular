import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FasesService } from 'src/app/services/fases.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-maquina',
  standalone: false,templateUrl: './nueva-maquina.component.html',
  styleUrls: ['./nueva-maquina.component.scss']
})
export class NuevaMaquinaComponent {

  constructor(public fases:FasesService,
              public api:MaquinasService){

  }

  @Input() nueva:any;
  @Input() editar:any;
  @Input() data:any;
  @Input() fasesQueTrabaja:any = [];
  @Output() onCloseModal = new EventEmitter();
  @Output() onFinalizarTarea = new EventEmitter();

  public faseSeleccionadaActual:any = '';
  public PinzasSeleccionadas:any = '';


  addPinza(){
    let pinza = this.PinzasSeleccionadas;

    let existe = this.data.pinzas.find(x => x === pinza);

    if(!existe){
      this.data.pinzas.push(pinza)
      this.PinzasSeleccionadas = ''
    }
  }


  cerrar(){
    this.onCloseModal.emit();
  }

  addFase(){
    let fase = this.faseSeleccionadaActual

    let existe = this.fasesQueTrabaja.find(x  => x.nombre === fase.nombre)

    if(!existe){
      console.log(fase)
      console.log(this.fasesQueTrabaja)
      this.fasesQueTrabaja.push(fase)
      console.log(this.fasesQueTrabaja)
      this.data.fases.push(fase._id)
    }
  }

  deleteSelected(fase){
    let existe = this.fasesQueTrabaja.findIndex(x => x.nombre === fase.nombre)
    if(existe >= 0){
      console.log(existe)
      this.fasesQueTrabaja.splice(existe, 1)
      let index = this.data.fases.findIndex(x => x === fase._id)
      this.data.fases.splice(index, 1)
    }
  }

  guardarMaquina(){
    this.api.guardarMaquinas(this.data);
    this.onFinalizarTarea.emit();
  }

  faseSeleccionada(e){
    if(e.value != '#'){
      this.faseSeleccionadaActual = this.fases.fases[e.value]
    }
  }

  editarMaquina(){
    this.api.EditarMaquina(this.data);
    this.onFinalizarTarea.emit()
  }

  deletePinza(n){
    this.data.pinzas.splice(n, 1)
  }

}
