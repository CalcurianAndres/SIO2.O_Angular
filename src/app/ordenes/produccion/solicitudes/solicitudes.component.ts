import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss'],
})
export class SolicitudesComponent implements OnInit {
  @Input() solicitudes!: any;
  @Input() orden!: any;
  @Input() orden_solicitud!: any;
  @Output() onCloseModal = new EventEmitter();

  // public requisicion = Inject(SolicitudesService)

  constructor(public solicitud: SolicitudesService) {}

  public loading = false;

  cerrar() {
    this.onCloseModal.emit();
  }

  motivos: string[] = [
    'Fallas asociadas al sustrato',
    'Fallas asociadas a la tinta',
    'Inconsistencias en el inventario físico',
    'Fallas asociadas al operador de impresión',
    'Fallas asociadas al operador de corte',
    'Fallas asociadas al operador de troquelado',
    'Fallas asociadas al operador de Pegado',
    'Fallas del proceso de impresión',
    'Fallas del proceso de pegado',
    'Fallas operativa de maquina',
    'Fallas en el sistema',
    'Error de estimación de material',
    'Remplazo por devolución',
  ];

  ngOnInit() {}

  generarSolicitud() {
    const data: any = {
      materiales: [],
      motivo: this.orden_solicitud.motivo,
      op: this.orden._id,
      tag: '',
    };

    // Agregas solo lo que tenga cantidad mayor a 0
    if (this.orden_solicitud.sustrato.cantidad > 0) {
      data.materiales.push({
        material: this.orden_solicitud.sustrato.id,
        cantidad: this.orden_solicitud.sustrato.cantidad,
      });
    }

    this.orden_solicitud.tintas.forEach((tinta) => {
      if (tinta.cantidad > 0) {
        data.materiales.push({ material: tinta.id, cantidad: tinta.cantidad });
      }
    });

    if (this.orden_solicitud.barniz.cantidad > 0) {
      data.materiales.push({
        material: this.orden_solicitud.barniz.id,
        cantidad: this.orden_solicitud.barniz.cantidad,
      });
    }

    if (this.orden_solicitud.pega.cantidad > 0) {
      data.materiales.push({ material: this.orden_solicitud.pega.id, cantidad: this.orden_solicitud.pega.cantidad });
    }

    // console.log(data); // Aquí tienes listo el objeto para enviarlo al backend

    this.solicitud.NuevaSolicitud(data);
    this.cerrar();
    Swal.fire({
      text: 'Nueva Solcitud de material generada',
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
  }
}
