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
  public searchTerm: string = '';

  constructor(public api: ProveedoresService) {
    setTimeout(() => (this.cargando = false), 1200);
  }

  get filteredProveedores(): any[] {
    if (!this.searchTerm) return this.api.proveedores;
    const term = this.searchTerm.toLowerCase();
    return this.api.proveedores.filter(
      (p: any) =>
        p.nombre?.toLowerCase().includes(term) ||
        p.rif?.toLowerCase().includes(term) ||
        p.pais?.toLowerCase().includes(term),
    );
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

  VerProveedor(prov: any) {
    this.proveedor_selected = prov;
    this.detalle = true;
  }

  EditarProveedor(prov: any) {
    this.editar = true;
    this.proveedor_selected = prov;
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
