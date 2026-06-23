import { Component } from '@angular/core';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-organigrama-empleados',
  standalone: false,
  templateUrl: './organigrama-empleados.component.html',
  styleUrls: ['./organigrama-empleados.component.scss'],
})
export class OrganigramaEmpleadosComponent {
  apiUrl = environment.apiUrl;

  constructor(
    public api: DepartamentosService,
    public trabajadores: TrabajadoresService,
  ) {}

  searchTerm = '';
  expandedDepId: string | null = null;
  filterMode: 'activos' | 'baja' = 'activos';

  sortBy = 'nombre';
  sortDirection: 'asc' | 'desc' = 'asc';

  toggleSort(field: string) {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedBajaEmpleados(): any[] {
    const list = this.listaTrabajadores;
    return [...list].sort((a, b) => {
      let valA: any, valB: any;
      switch (this.sortBy) {
        case 'nombre':
          valA = `${a.datos_personales?.nombres} ${a.datos_personales?.apellidos}`.toLowerCase();
          valB = `${b.datos_personales?.nombres} ${b.datos_personales?.apellidos}`.toLowerCase();
          break;
        case 'cedula':
          valA = a.datos_personales?.cedula || '';
          valB = b.datos_personales?.cedula || '';
          break;
        case 'cargo':
          valA = a.contratacion?.cargo?.nombre || '';
          valB = b.contratacion?.cargo?.nombre || '';
          break;
        case 'departamento':
          valA = a.contratacion?.departamento?.nombre || '';
          valB = b.contratacion?.departamento?.nombre || '';
          break;
        case 'fecha':
          valA = a.fechaBaja ? new Date(a.fechaBaja).getTime() : 0;
          valB = b.fechaBaja ? new Date(b.fechaBaja).getTime() : 0;
          break;
        default:
          valA = valB = '';
      }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  formatFechaBaja(fecha: any): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fas fa-sort';
    return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  public modalCrear = false;
  public modalEditar = false;
  public empleadoAEditar: any = null;

  abrirModalCrear() {
    this.cerrarCualquierModal();
    this.modalCrear = true;
  }

  abrirModalEditar(empleado: any) {
    this.cerrarCualquierModal();
    this.empleadoAEditar = JSON.parse(JSON.stringify(empleado));
    this.modalEditar = true;
  }

  cerrarModalCrear() {
    this.modalCrear = false;
  }

  cerrarModalEditar() {
    this.modalEditar = false;
    this.empleadoAEditar = null;
  }

  private cerrarCualquierModal() {
    this.modalCrear = false;
    this.modalEditar = false;
    this.empleadoAEditar = null;
  }

  informacion = false;
  _informacion_: any;

  get departamentos(): any[] {
    const deps = this.api.departamentos || [];
    if (!this.searchTerm) return deps;
    const term = this.searchTerm.toLowerCase();
    return deps.filter(
      (d: any) =>
        d.nombre.toLowerCase().includes(term) ||
        this.obtenerEmpleadosDelDepartamento(d).some((e: any) =>
          (e.datos_personales?.nombres + ' ' + e.datos_personales?.apellidos).toLowerCase().includes(term),
        ),
    );
  }

  toggleExpand(dep: any) {
    if (this.expandedDepId === dep._id) {
      this.expandedDepId = null;
    } else {
      this.expandedDepId = dep._id;
    }
  }

  get listaTrabajadores(): any[] {
    if (this.filterMode === 'baja') {
      return (this.trabajadores.trabajadorTodos || []).filter((t: any) => t.borrado === true);
    }
    // Activos: usar trabajadorTodos si está cargado, si no fallback a trabajador
    const todos = this.trabajadores.trabajadorTodos;
    if (todos && todos.length > 0) {
      return todos.filter((t: any) => !t.borrado);
    }
    return this.trabajadores.trabajador || [];
  }

  obtenerEmpleadosDelDepartamento(dep: any): any[] {
    return this.listaTrabajadores.filter((t: any) => t.contratacion?.departamento?.nombre === dep.nombre);
  }

  obtenerAreas(dep: any): any[] {
    return (this.api.subunidad || []).filter((s: any) => s.departamento === dep.nombre && s.sup === '#');
  }

  empleadosDirectos(dep: any): any[] {
    const allAreaNombres = new Set(
      (this.api.subunidad || []).filter((s: any) => s.departamento === dep.nombre).map((s: any) => s.nombre),
    );
    return this.obtenerEmpleadosDelDepartamento(dep).filter(
      (t: any) => !allAreaNombres.has(t.contratacion?.de?.nombre),
    );
  }

  empleadosDelArea(area: any, dep: any): any[] {
    const subNombres = new Set(
      (this.api.subunidad || [])
        .filter((s: any) => s.departamento === dep.nombre && s.sup === area.nombre)
        .map((s: any) => s.nombre),
    );
    subNombres.add(area.nombre);
    return this.obtenerEmpleadosDelDepartamento(dep).filter(
      (t: any) => t.contratacion?.de?.nombre === area.nombre || subNombres.has(t.contratacion?.de?.nombre),
    );
  }

  empleadosSuelto(area: any, dep: any): any[] {
    const subNombres = new Set(
      (this.api.subunidad || [])
        .filter((s: any) => s.departamento === dep.nombre && s.sup === area.nombre)
        .map((s: any) => s.nombre),
    );
    return this.obtenerEmpleadosDelDepartamento(dep).filter(
      (t: any) => t.contratacion?.de?.nombre === area.nombre && !subNombres.has(t.contratacion?.de?.nombre),
    );
  }

  setFilterMode(mode: 'activos' | 'baja') {
    this.filterMode = mode;
    if (mode === 'baja') {
      this.trabajadores.BuscarTrabajadorTodos();
    }
  }

  darDeBajaTrabajador(trabajador: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Dar de baja al trabajador?',
      text: 'El trabajador aparecerá en la sección "De baja" y podrá ser reactivado posteriormente.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Dar de baja',
      denyButtonText: 'Cancelar',
      confirmButtonColor: '#f03a5f',
      denyButtonColor: '#48c78e',
    }).then((result) => {
      if (result.isConfirmed) {
        this.trabajadores.darDeBajaTrabajador(trabajador);
        setTimeout(() => {
          Swal.fire({
            text: this.trabajadores.mensaje.mensaje,
            icon: this.trabajadores.mensaje.icon,
            position: 'top-end',
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            timer: 5000,
          });
        }, 500);
      }
    });
  }

  reactivarTrabajador(trabajador: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Reactivar al trabajador?',
      text: 'El trabajador volverá a aparecer en la sección de activos.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Reactivar',
      denyButtonText: 'Cancelar',
      confirmButtonColor: '#48c78e',
      denyButtonColor: '#f03a5f',
    }).then((result) => {
      if (result.isConfirmed) {
        this.trabajadores.reactivarTrabajador(trabajador);
        setTimeout(() => {
          Swal.fire({
            text: this.trabajadores.mensaje.mensaje,
            icon: this.trabajadores.mensaje.icon,
            position: 'top-end',
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            timer: 5000,
          });
        }, 500);
      }
    });
  }

  eliminarTrabajador(trabajador: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Eliminar trabajador?',
      text: '¿Estas seguro que quieres eliminar este trabajador?. El mismo no podra ser recuperdo luego.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Eliminar',
      denyButtonText: 'No eliminar',
      confirmButtonColor: '#f03a5f',
      denyButtonColor: '#48c78e',
    }).then((result) => {
      if (result.isConfirmed) {
        this.trabajadores.eliminarTrabajador(trabajador);
        setTimeout(() => {
          Swal.fire({
            text: this.trabajadores.mensaje.mensaje,
            icon: this.trabajadores.mensaje.icon,
            position: 'top-end',
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            timer: 5000,
          });
        }, 500);
      } else if (result.isDenied) {
        Swal.fire({
          text: 'El trabajador aun se conserva',
          icon: 'success',
          position: 'top-end',
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          timer: 5000,
        });
      }
    });
  }
}
