import { Component } from '@angular/core';
import { FasesService } from 'src/app/services/fases.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fases',
  standalone: false,
  templateUrl: './fases.component.html',
  styleUrls: ['./fases.component.scss'],
})
export class FasesComponent {
  constructor(
    public api: FasesService,
    public maquinas: MaquinasService,
  ) {
    setTimeout(() => (this.cargando = false), 1200);
  }

  public data = { nombre: '', descripcion: '' };
  public informacion: any = '';
  public machines: any = '';

  public nueva: boolean = false;
  public editar: boolean = false;
  public info: boolean = false;
  public cargando: boolean = true;

  filas() {
    return Math.ceil(this.api.fases.length / 5);
  }

  seleccion(i: number) {
    this.info = true;
    this.informacion = this.api.fases[i];
    this.machines = this.maquinas.buscarMaquinaPorFases(this.api.fases[i]._id);
  }

  Editar(i: number) {
    this.data = this.api.fases[i];
    this.editar = true;
  }

  nueva_fase() {
    this.nueva = true;
  }

  cerrarSimple() {
    this.nueva = false;
    this.editar = false;
    this.data = { nombre: '', descripcion: '' };
  }

  cerrar() {
    this.nueva = false;
    this.editar = false;
    this.data = { nombre: '', descripcion: '' };
    setTimeout(() => {
      Swal.fire({
        icon: this.api.mensaje.icon,
        text: this.api.mensaje.mensaje,
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    }, 1000);
  }

  borrarFase(id: string) {
    Swal.fire({
      title: '¿Eliminar esta fase?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      denyButtonText: 'No Eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarFase(id);
        this.cerrar();
      }
    });
  }
}
