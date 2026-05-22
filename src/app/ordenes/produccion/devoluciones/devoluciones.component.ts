import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DevolucionesService } from 'src/app/services/devoluciones.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devoluciones',
  standalone: false,
  templateUrl: './devoluciones.component.html',
  styleUrls: ['./devoluciones.component.scss'],
})
export class DevolucionesComponent {
  @Input() devolucion: any;
  @Input() op: any;
  @Output() onCloseModal = new EventEmitter();

  public observaciones = '';

  // public api_devoluciones = inject(DevolucionesService)

  constructor(
    public api: OproduccionService,
    public api_devoluciones: DevolucionesService,
  ) {}

  cerrar() {
    this.onCloseModal.emit();
  }

  valoresAsignados: { [codigo: string]: { cantidad: number; asignacion: string } } = {};
  errors: boolean[] = [];

  actualizarValor(codigo: string, asignacion: string, index: number, cantidad: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = Number(input.value);

    // Validación de cantidad
    this.errors[index] = valor > cantidad;

    if (valor > 0) {
      this.valoresAsignados[codigo] = { cantidad: valor, asignacion };
    } else {
      delete this.valoresAsignados[codigo]; // Si es 0, lo eliminamos
    }

    console.log(this.valoresAsignados);
  }

  enviar() {
    let Materiales = Object.entries(this.valoresAsignados).map(([codigo, { cantidad, asignacion }]) => ({
      material: codigo,
      cantidad: cantidad,
      asignacion: asignacion,
    }));

    let data = {
      op: this.op._id,
      observaciones: this.observaciones,
      material: Materiales,
    };

    this.api_devoluciones.guardarDevolucion(data);
    this.observaciones = '';
    this.valoresAsignados = {};
    this.onCloseModal.emit();

    setTimeout(() => {
      Swal.fire({
        text: this.api_devoluciones.mensaje.mensaje,
        icon: this.api_devoluciones.mensaje.icon,
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
    }, 1000);
  }

  ExistenErrores() {
    return this.errors.includes(true);
  }

  Nro = [0, 0, 0, 0, 0, 0, 0, 0, 0];
}
