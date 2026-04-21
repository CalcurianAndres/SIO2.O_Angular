import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FasesService } from 'src/app/services/fases.service';

@Component({
  selector: 'app-nueva-fase',
  standalone: false,templateUrl: './nueva-fase.component.html',
  styleUrls: ['./nueva-fase.component.scss']
})
export class NuevaFaseComponent {

  constructor(private api:FasesService){

  }

  @Input() nueva:any;
  @Input() editar:any;
  @Input() data:any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onFinalizarProceso = new EventEmitter();

  cerrar(){
    this.onCloseModal.emit();
  }

  guardarFase(){
    this.api.GuardarFase(this.data);
    this.onFinalizarProceso.emit()
  }

  editarFase(){
    this.api.EditarFase(this.data);
    this.onFinalizarProceso.emit()
  }

}