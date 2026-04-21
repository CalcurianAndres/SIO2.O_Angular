import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-detalles-recepcion',
  standalone: false,templateUrl: './detalles-recepcion.component.html',
  styleUrls: ['./detalles-recepcion.component.scss']
})
export class DetallesRecepcionComponent {

  constructor(){
  }

  @Input() detalle!:any
  @Input() n!:any
  @Input() lista!:any
  @Output() onCloseModal = new EventEmitter();

  currentDate = new Date();
  year = this.currentDate.getFullYear();
  month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
  day = String(this.currentDate.getDate()).padStart(2, '0');
  Hoy = `${this.year}-${this.month}-${this.day}`;

  cerrar(){
    this.onCloseModal.emit();
  }
}
