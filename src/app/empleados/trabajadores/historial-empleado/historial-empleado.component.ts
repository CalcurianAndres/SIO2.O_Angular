import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-historial-empleado',
  standalone: false,templateUrl: './historial-empleado.component.html',
  styleUrls: ['./historial-empleado.component.scss']
})
export class HistorialEmpleadoComponent {

  @Input() historial:any;
  @Input() info_trabajador:any;
  @Output() onCloseModal = new EventEmitter();
  

  cerrar(){
    this.onCloseModal.emit();
  }

}
