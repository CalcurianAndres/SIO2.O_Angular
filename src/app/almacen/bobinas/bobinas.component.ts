import { Component } from '@angular/core';
import { BobinasService } from 'src/app/services/bobinas.service';
import { AlmacenService } from 'src/app/services/almacen.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bobinas',
  templateUrl: './bobinas.component.html',
  styleUrls: ['./bobinas.component.scss'],
})
export class BobinasComponent {
  public clicked: any = [];
  public bobina = false;
  public filterMode: string = 'home';
  public filterConvertidora = '';
  public desde = '';
  public hasta = '';
  public pageSize = 25;
  public currentPage = 1;
  public Math: any = Math;

  public activeTab: string = 'conversiones';

  public nuevaConvertidora = { nombre: '', rif: '', direccion: '', telefono: '', contacto: '' };
  public editingConvertidoraId: string | null = null;
  public editingConvertidora = { nombre: '', rif: '', direccion: '', telefono: '', contacto: '' };

  constructor(
    public api: BobinasService,
    public almacenSvc: AlmacenService,
  ) {}

  showInfo(i) {
    this.clicked[i] = !this.clicked[i];
  }

  setFilter(mode: string) {
    this.filterMode = mode;
    this.filterConvertidora = '';
    this.desde = '';
    this.hasta = '';
    this.currentPage = 1;
  }

  get conversionesFiltradas(): any[] {
    if (!this.api.conversiones) return [];
    let items = [...this.api.conversiones];
    if (this.filterMode === 'convertidora' && this.filterConvertidora) {
      items = items.filter((c) => c.convertidora === this.filterConvertidora);
    }
    if (this.filterMode === 'fecha' && this.desde && this.hasta) {
      const d = new Date(this.desde).getTime();
      const h = new Date(this.hasta).getTime();
      items = items.filter((c) => {
        const f = new Date(c.createdAt || c.fecha).getTime();
        return f >= d && f <= h;
      });
    }
    return items;
  }

  get paginatedConversiones(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.conversionesFiltradas.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.conversionesFiltradas.length / this.pageSize);
  }

  get kpiMes(): number {
    if (!this.api.conversiones) return 0;
    const ahora = new Date();
    return this.api.conversiones.filter((c: any) => {
      const f = new Date(c.createdAt || c.fecha);
      return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
    }).length;
  }

  get kpiAno(): number {
    if (!this.api.conversiones) return 0;
    const ahora = new Date();
    return this.api.conversiones.filter((c: any) => {
      const f = new Date(c.createdAt || c.fecha);
      return f.getFullYear() === ahora.getFullYear();
    }).length;
  }

  get kpiRendimiento(): string {
    if (!this.api.conversiones || this.kpiMes === 0) return '0';
    const ahora = new Date();
    const delMes = this.api.conversiones.filter((c: any) => {
      const f = new Date(c.createdAt || c.fecha);
      return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
    });
    const totalPeso = delMes.reduce((sum: number, c: any) => sum + Number(c.peso || 0), 0);
    return (totalPeso / delMes.length).toFixed(2);
  }

  get mesActual(): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return meses[new Date().getMonth()];
  }

  get yearActual(): number {
    return new Date().getFullYear();
  }

  pageChanged(page: number) {
    this.currentPage = page;
  }

  buscarPorFecha() {
    this.currentPage = 1;
  }

  // ══════════════════════════════════════════════════════
  // Agrupación de bobinas por almacén
  // ══════════════════════════════════════════════════════

  getBobinasPorAlmacen(almacenId: string | null): any[] {
    if (!this.api.bobinas) return [];
    return this.api.bobinas.filter((b: any) => {
      const id = b.almacen_id?._id || b.almacen_id;
      return String(id || null) === String(almacenId || null);
    });
  }

  get almacenesConBobinas(): any[] {
    if (!this.api.bobinas) return [];
    const externosConBobinas = (this.almacenSvc.almacenes || []).filter(
      (a: any) => this.getBobinasPorAlmacen(a._id).length > 0,
    );
    const principalTieneBobinas = this.getBobinasPorAlmacen(null).length > 0;
    return [
      ...(principalTieneBobinas ? [{ _id: null, nombre: 'Almacén principal', fijo: true }] : []),
      ...externosConBobinas,
    ];
  }

  // ══════════════════════════════════════════════════════
  // CRUD Convertidoras
  // ══════════════════════════════════════════════════════

  agregarConvertidora() {
    const nombre = this.nuevaConvertidora.nombre.trim();
    if (!nombre) return;
    this.api.guardarConvertidora({ ...this.nuevaConvertidora });
    this.nuevaConvertidora = { nombre: '', rif: '', direccion: '', telefono: '', contacto: '' };
    setTimeout(() => {
      Swal.fire({
        text: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }, 500);
  }

  iniciarEdicion(c: any) {
    this.editingConvertidoraId = c._id;
    this.editingConvertidora = {
      nombre: c.nombre,
      rif: c.rif || '',
      direccion: c.direccion || '',
      telefono: c.telefono || '',
      contacto: c.contacto || '',
    };
  }

  guardarEdicion(c: any) {
    const nombre = this.editingConvertidora.nombre.trim();
    if (!nombre) return;
    this.api.guardarConvertidora({ _id: c._id, ...this.editingConvertidora });
    this.cancelarEdicion();
    setTimeout(() => {
      Swal.fire({
        text: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }, 500);
  }

  cancelarEdicion() {
    this.editingConvertidoraId = null;
    this.editingConvertidora = { nombre: '', rif: '', direccion: '', telefono: '', contacto: '' };
  }

  eliminarConvertidora(c: any) {
    Swal.fire({
      title: `¿Eliminar "${c.nombre}"?`,
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--status-danger, #f14668)',
      cancelButtonColor: 'var(--text-muted, #7a7a7a)',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarConvertidora({ _id: c._id });
        setTimeout(() => {
          Swal.fire({
            text: this.api.mensaje.mensaje,
            icon: this.api.mensaje.icon,
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        }, 500);
      }
    });
  }
}
