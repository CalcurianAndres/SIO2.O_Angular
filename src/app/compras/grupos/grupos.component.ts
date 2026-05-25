import { Component } from '@angular/core';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-grupos',
  standalone: false,
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss'],
})
export class GruposComponent {
  nuevo: boolean = false;
  editar: boolean = false;
  material: boolean = false;
  nuevo_material: boolean = false;
  cargando: boolean = false;
  data: any = [];
  material_selected = [];
  trato = false;
  otro = false;
  selectedGrupo: any = null;

  constructor(
    public api: GruposService,
    public materiales: MaterialesService,
  ) {}

  AgregarNuevo() {
    this.nuevo = true;
    this.trato = false;
    this.otro = false;
  }

  eliminarGrupo(id: any) {
    Swal.fire({
      title: '¿Eliminar este grupo?',
      text: 'El grupo se eliminará de manera permanente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#f03a5f',
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.cargando = true;
        this.api.EliminarGrupo(id);
        setTimeout(() => {
          this.cargando = false;
          Swal.fire({
            title: this.api.mensaje.mensaje,
            icon: this.api.mensaje.icon,
            timer: 5000,
            showConfirmButton: false,
            timerProgressBar: true,
            toast: true,
            position: 'top-end',
          });
        }, 1000);
      }
    });
  }

  EditarGrupo(grupo: any) {
    this.data = {
      id: grupo._id,
      nombre: grupo.nombre,
      icono: grupo.icono,
      parcial: grupo.parcial,
    };
    this.trato = grupo.trato;
    this.otro = grupo.otro;
    this.editar = true;
  }

  cerrarModal() {
    this.cargando = true;
    this.nuevo = false;
    this.editar = false;
    setTimeout(() => {
      this.cargando = false;
      Swal.fire({
        title: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }

  cerrarModal_() {
    this.nuevo = false;
    this.editar = false;
    this.nuevo_material = false;
  }

  buscarMaterial(grupo: any) {
    this.selectedGrupo = grupo;
    this.material_selected = this.materiales.filtrarGrupos(grupo._id);
    this.material = true;
  }

  NuevoMaterial() {
    this.nuevo_material = true;
  }

  cerrarNuevoMaterial() {
    this.nuevo_material = false;
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
      Swal.fire({
        title: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }

  cerrarMateriales() {
    this.material = false;
  }
}
