import { Component } from '@angular/core';
import { MaquinasService } from 'src/app/services/maquinas.service';
import { FasesService } from 'src/app/services/fases.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-maquinas',
  standalone: false,
  templateUrl: './maquinas.component.html',
  styleUrls: ['./maquinas.component.scss'],
})
export class MaquinasComponent {
  constructor(
    public api: MaquinasService,
    public fases: FasesService,
  ) {
    setTimeout(() => (this.cargando = false), 1200);
  }

  public nueva: boolean = false;
  public info: boolean = false;
  public editar: boolean = false;
  public selectedFases: any = [];
  public cargando: boolean = true;

  public data = {
    nombre: '',
    serial: '',
    marca: '',
    fases: [],
    trabajo: 0,
    pinzas: [],
    colores: 0,
    modelo: '',
    ano: '',
  };

  filas() {
    return Math.ceil(this.api.maquinas.length / 5);
  }

  seleccion(i: number) {
    this.info = true;
    this.data = this.api.maquinas[i];
  }

  Editar(i: number) {
    this.editar = true;
    this.data = this.api.maquinas[i];
    const ids: any = [];
    this.selectedFases = this.data.fases;
    for (let i = 0; i < this.selectedFases.length; i++) {
      ids.push(this.selectedFases[i]._id);
      if (i === this.selectedFases.length - 1) {
        this.data.fases = ids;
      }
    }
  }

  nuevaMaquina() {
    this.nueva = true;
  }

  cerradoSencillo() {
    this.info = false;
    this.data = {
      nombre: '',
      serial: '',
      marca: '',
      fases: [],
      pinzas: [],
      trabajo: 0,
      colores: 0,
      modelo: '',
      ano: '',
    };
    this.selectedFases = [];
  }

  cerrar() {
    this.nueva = false;
    this.editar = false;
    this.data = {
      nombre: '',
      serial: '',
      marca: '',
      fases: [],
      pinzas: [],
      trabajo: 0,
      colores: 0,
      modelo: '',
      ano: '',
    };
    this.selectedFases = [];
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

  borrarMaquina(id: string) {
    Swal.fire({
      title: '¿Eliminar esta máquina?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      denyButtonText: 'No Eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarMaquina(id);
        this.cerrar();
      }
    });
  }

  cerrarSencilla() {
    this.nueva = false;
    this.editar = false;
  }
}
