import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-edicion-recepcion',
  standalone: false,templateUrl: './edicion-recepcion.component.html',
  styleUrls: ['./edicion-recepcion.component.scss']
})
export class EdicionRecepcionComponent {
  @Input() edicion!:any
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
