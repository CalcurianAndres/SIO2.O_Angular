import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DevolucionesService } from 'src/app/services/devoluciones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-conf-devoluciones',
  standalone: false,
  templateUrl: './conf-devoluciones.component.html',
  styleUrls: ['./conf-devoluciones.component.scss'],
})
export class ConfDevolucionesComponent {
  public api = inject(DevolucionesService);

  @Input() confirmacion: any;
  @Input() devolucion: any;
  @Output() onCloseModal = new EventEmitter();

  cerrar() {
    this.onCloseModal.emit();
  }

  confirmar() {
    this.api.guardarDevolucion(this.api.buscarDevolucionPorID(this.devolucion));
    setTimeout(() => {
      this.cerrar();
      Swal.fire({
        text: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        toast: true,
        position: 'top-end',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }, 1000);
  }
}
