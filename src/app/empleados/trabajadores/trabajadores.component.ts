import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trabajadores',
  standalone: false,
  templateUrl: './trabajadores.component.html',
  styleUrls: ['./trabajadores.component.scss'],
})
export class TrabajadoresComponent implements OnInit {
  apiUrl = environment.apiUrl;
  public randomUsers;
  constructor(
    private http: HttpClient,
    public trabajadores: TrabajadoresService,
  ) {}

  ngOnInit(): void {}

  public filterMode: 'activos' | 'todos' = 'activos';

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

  get listaTrabajadores() {
    if (this.filterMode === 'todos') {
      return (this.trabajadores.trabajadorTodos || []).filter((t: any) => t.borrado === true);
    }
    const todos = this.trabajadores.trabajadorTodos;
    if (todos && todos.length > 0) {
      return todos.filter((t: any) => !t.borrado);
    }
    return this.trabajadores.trabajador || [];
  }

  get sortedListaTrabajadores(): any[] {
    const list = this.listaTrabajadores || [];
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
        case 'departamento':
          valA = a.contratacion?.de?.nombre || a.contratacion?.departamento?.nombre || '';
          valB = b.contratacion?.de?.nombre || b.contratacion?.departamento?.nombre || '';
          break;
        case 'cargo':
          valA = a.contratacion?.cargo?.nombre || '';
          valB = b.contratacion?.cargo?.nombre || '';
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

  setFilterMode(mode: 'activos' | 'todos') {
    this.filterMode = mode;
    if (mode === 'todos') {
      this.trabajadores.BuscarTrabajadorTodos();
    }
  }

  public modalCrear = false;
  public modalEditar = false;
  public empleadoAEditar: any = null;

  public colores = ['#30cf60', '#375bea', '#ac2abe'];

  public color_generos = ['#ff78b5', '#78a1ff'];

  public informacion = false;
  public _informacion_: any;

  getRandomLetter(): string {
    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet[randomIndex];
  }

  getRandomColor(): string {
    return this.colores[Math.floor(Math.random() * 3)];
  }

  getGender(): string {
    return this.color_generos[Math.floor(Math.random() * 2)];
  }

  /**
   * Abre el modal de CREAR empleado.
   * El componente CrearTrabajadorComponent es totalmente independiente:
   * no recibe inputs y siempre nace con estado vacío.
   */
  abrirModalCrear() {
    this.cerrarCualquierModal();
    this.modalCrear = true;
  }

  /**
   * Abre el modal de EDITAR empleado.
   * Se pasa el empleado por input. El componente EditarTrabajadorComponent
   * es totalmente independiente de CrearTrabajadorComponent.
   */
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

  eliminarTrabajador(trabajador: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Eliminar trabajador?',
      text: '¿Estas seguro que quieres eliminar este trabajador?. El mismo no podra ser recuperdo luego.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Eliminar',
      denyButtonText: `No eliminar`,
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
