import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecepcionService } from 'src/app/services/recepcion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-recepcion',
  standalone: false,
  templateUrl: './detalles-recepcion.component.html',
  styleUrls: ['./detalles-recepcion.component.scss'],
})
export class DetallesRecepcionComponent {
  constructor(public api: RecepcionService) {}

  @Input() detalle!: any;
  @Input() n!: any;
  @Input() lista!: any;
  @Input() recepcion!: any;
  @Output() onCloseModal = new EventEmitter();

  guardando = false;

  currentDate = new Date();
  year = this.currentDate.getFullYear();
  month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
  day = String(this.currentDate.getDate()).padStart(2, '0');
  Hoy = `${this.year}-${this.month}-${this.day}`;

  get esEditable(): boolean {
    return this.recepcion?.status === 'Por notificar';
  }

  cerrar() {
    this.onCloseModal.emit();
  }

  abrirDocumento(doc: string) {
    window.open(`api/imagen/recepcion/${doc}`, '_blank');
  }

  async guardar() {
    this.guardando = true;
    this.api.GuardarRecepcion(this.recepcion);
    setTimeout(() => {
      Swal.fire({
        text: this.api.mensaje?.mensaje || 'Recepción actualizada',
        icon: this.api.mensaje?.icon || 'success',
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
      this.guardando = false;
      this.onCloseModal.emit();
    }, 800);
  }
}
