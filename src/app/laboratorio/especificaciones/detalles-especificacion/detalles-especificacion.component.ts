import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-detalles-especificacion',
  standalone: false,templateUrl: './detalles-especificacion.component.html',
  styleUrls: ['./detalles-especificacion.component.scss']
})
export class DetallesEspecificacionComponent {

  @Input() Especificacion:any
  @Input() Detalle:any;
  @Output() onCloseModal = new EventEmitter()

  cerrar(){
    this.onCloseModal.emit();
    
  }

}
