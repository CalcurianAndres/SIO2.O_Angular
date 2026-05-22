import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tickets-r',
  templateUrl: './tickets-r.component.html',
  styleUrls: ['./tickets-r.component.scss'],
})
export class TicketsRComponent {
  constructor(
    public trabajadores: TrabajadoresService,
    public ordenes: OproduccionService,
  ) {}

  @Input() ver!: any;
  @Input() tickets: any;
  @Input() defectos: any;
  @Input() causas: any;
  @Input() orden: any;
  @Output() onCloseModal = new EventEmitter();

  public searchText;

  cerrar() {
    this.onCloseModal.emit();
  }

  buscarDefecto(tipo, defectos) {
    if (tipo === 'Menor') {
      return this.defectos.menores[Number(defectos)];
    } else if (tipo === 'Mayor') {
      return this.defectos.mayores[Number(defectos)];
    }
  }

  filteredEmployees() {
    if (!this.searchText) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText.toLowerCase());

      // const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);

      return searchMatch;
    });
  }

  GuardarYCerrar(ticket) {
    Swal.fire({
      icon: 'info',
      title: 'Confirmar datos introducidos',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Continuar',
      denyButtonText: `Cancelar`,
      confirmButtonColor: '#48c78e',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        ticket.cerrado = true;
        this.ordenes.nuevoTicketRojo(ticket);
      } else if (result.isDenied) {
        return;
      }
    });
  }
}
