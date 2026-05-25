import { Component } from '@angular/core';
import { CategoriasService } from 'src/app/services/categorias.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  standalone: false,
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent {
  constructor(public api: CategoriasService) {
    setTimeout(() => (this.cargando = false), 1200);
  }

  public data = { nombre: '' };
  public nueva: boolean = false;
  public editar: boolean = false;
  public cargando: boolean = true;

  nuevaCategoria() {
    this.nueva = true;
  }

  cerrar() {
    this.nueva = false;
    this.editar = false;
    this.data = { nombre: '' };
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

  cerrarSimple() {
    this.nueva = false;
    this.editar = false;
    this.data = { nombre: '' };
  }

  filas() {
    return Math.ceil(this.api.categorias.length / 5);
  }

  editarInfo(categoria) {
    this.editar = true;
    this.data = categoria;
  }

  borrarCategoria(id: string) {
    Swal.fire({
      title: '¿Eliminar esta categoría?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      denyButtonText: 'No Eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.EliminarCategoria(id);
        this.cerrar();
      }
    });
  }
}
