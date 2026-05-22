import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-conf-solicitud',
  templateUrl: './conf-solicitud.component.html',
  styleUrls: ['./conf-solicitud.component.scss'],
})
export class ConfSolicitudComponent {
  @Input() solicitud;
  @Input() id_solicitud;
  @Output() onCloseModal = new EventEmitter();

  constructor(public api: SolicitudesService) {}

  cerrar() {
    this.onCloseModal.emit();
  }

  AprobarSolicitud() {
    this.api.AprobarSolicitud(this.id_solicitud);
    this.cerrar();
    setTimeout(() => {
      Swal.fire({
        text: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        timer: 5000,
        timerProgressBar: true,
      });
    }, 1000);
  }
}
