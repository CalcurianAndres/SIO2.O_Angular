import { Component } from '@angular/core';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { Proveedores } from '../models/modelos-compra';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores',
  standalone: false,
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss'],
})
export class ProveedoresComponent {
  public nuevo: boolean = false;
  public editar: boolean = false;
  public cargando: boolean = true;
  public detalle: boolean = false;
  public proveedor_selected!: Proveedores;

  constructor(public api: ProveedoresService) {
    setTimeout(() => (this.cargando = false), 1200);
  }

  cerrar() {
    this.nuevo = false;
    this.editar = false;
    this.cargando = true;

    setTimeout(() => {
      this.cargando = false;
      Swal.fire({
        title: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        timer: 5000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    }, 1000);
  }

  cerrar_() {
    this.nuevo = false;
    this.editar = false;
  }

  VerProveedor(i: number) {
    this.proveedor_selected = this.api.proveedores[i];
    this.detalle = true;
  }

  EditarProveedor(i: number) {
    this.editar = true;
    this.proveedor_selected = this.api.proveedores[i];
  }

  borrarFabricante(id: string) {
    Swal.fire({
      title: '¿Eliminar este proveedor?',
      text: 'El proveedor se eliminará de manera permanente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#f03a5f',
    })
      .then((resultado) => {
        if (resultado.isConfirmed) {
          this.api.eliminarProveedor(id);
          this.cargando = true;
          setTimeout(() => {
            this.cargando = false;
            Swal.fire({
              title: this.api.mensaje.mensaje,
              icon: this.api.mensaje.icon,
              timer: 5000,
              timerProgressBar: true,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
            });
          }, 1000);
        }
      })
      .catch((err) => {
        return err;
      });
  }
}
