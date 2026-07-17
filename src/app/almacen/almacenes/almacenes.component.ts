import { Component, OnInit } from '@angular/core';
import { AlmacenService } from 'src/app/services/almacen.service';
import Swal from 'sweetalert2';

const ALMACEN_PRINCIPAL_ID = '__principal__';

@Component({
  selector: 'app-almacenes',
  standalone: false,
  templateUrl: './almacenes.component.html',
  styleUrls: ['./almacenes.component.scss'],
})
export class AlmacenesComponent implements OnInit {
  public nuevoNombre: string = '';
  public nuevaDescripcion: string = '';
  public editandoId: string | null = null;
  public editandoNombre: string = '';
  public editandoDescripcion: string = '';
  public cargando: boolean = true;

  public expandedSecciones: { [key: string]: boolean } = {};
  public nuevaSeccionNombre: string = '';
  public editandoSeccionId: string | null = null;
  public editandoSeccionNombre: string = '';
  public seccionModalAlmacenId: string | null = null;

  public readonly almacenPrincipalId = ALMACEN_PRINCIPAL_ID;

  constructor(public api: AlmacenService) {}

  ngOnInit() {
    this.api.BuscarAlmacenesExt();
    setTimeout(() => {
      if (this.api.almacenes?.length >= 0) {
        this.cargando = false;
      }
    }, 600);
  }

  get almacenesList() {
    return this.api.almacenes || [];
  }

  seccionesOf(almacenId: string) {
    if (almacenId === ALMACEN_PRINCIPAL_ID) {
      return (this.api.secciones || []).filter((s: any) => !s.almacen_id);
    }
    return (this.api.secciones || []).filter((s: any) => s.almacen_id === almacenId);
  }

  toggleSecciones(almacenId: string) {
    this.expandedSecciones[almacenId] = !this.expandedSecciones[almacenId];
  }

  agregarSeccion(almacenId: string) {
    if (!this.nuevaSeccionNombre.trim()) return;
    const payload: any = { nombre: this.nuevaSeccionNombre.trim() };
    if (almacenId !== ALMACEN_PRINCIPAL_ID) {
      payload.almacen_id = almacenId;
    }
    this.api.GuardarSeccion(payload);
    this.nuevaSeccionNombre = '';
  }

  iniciarEdicionSeccion(seccion: any) {
    this.editandoSeccionId = seccion._id;
    this.editandoSeccionNombre = seccion.nombre;
  }

  cancelarEdicionSeccion() {
    this.editandoSeccionId = null;
    this.editandoSeccionNombre = '';
  }

  guardarEdicionSeccion(seccion: any) {
    if (!this.editandoSeccionNombre.trim()) return;
    seccion.nombre = this.editandoSeccionNombre.trim();
    this.api.GuardarSeccion(seccion);
    this.cancelarEdicionSeccion();
  }

  eliminarSeccion(seccion: any) {
    if (seccion.por_defecto) {
      Swal.fire({
        title: 'No se puede eliminar',
        text: 'Esta sección es la predeterminada',
        icon: 'warning',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    Swal.fire({
      title: '¿Eliminar sección?',
      text: `Se eliminará "${seccion.nombre}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f14668',
    }).then((r) => {
      if (r.isConfirmed) {
        this.api.EliminarSeccion(seccion);
      }
    });
  }

  agregar() {
    if (!this.nuevoNombre.trim()) return;
    this.api.GuardarAlmacenExt({ nombre: this.nuevoNombre.trim(), descripcion: this.nuevaDescripcion.trim() });
    this.nuevoNombre = '';
    this.nuevaDescripcion = '';
  }

  iniciarEdicion(almacen: any) {
    this.editandoId = almacen._id;
    this.editandoNombre = almacen.nombre;
    this.editandoDescripcion = almacen.descripcion || '';
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.editandoNombre = '';
    this.editandoDescripcion = '';
  }

  guardarEdicion(almacen: any) {
    if (!this.editandoNombre.trim()) return;
    almacen.nombre = this.editandoNombre.trim();
    almacen.descripcion = this.editandoDescripcion.trim();
    this.api.GuardarAlmacenExt(almacen);
    this.cancelarEdicion();
  }

  eliminar(almacen: any) {
    if (almacen.por_defecto) {
      Swal.fire({
        title: 'No se puede eliminar',
        text: 'Este almacén es el predeterminado',
        icon: 'warning',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    Swal.fire({
      title: '¿Eliminar almacén?',
      text: `Se eliminará "${almacen.nombre}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f14668',
    }).then((r) => {
      if (r.isConfirmed) {
        this.api.EliminarAlmacenExt(almacen._id);
      }
    });
  }
}
