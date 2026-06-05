import { Component } from '@angular/core';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fabricantes-proveedores',
  standalone: false,
  templateUrl: './fabricantes-proveedores.component.html',
  styleUrls: ['./fabricantes-proveedores.component.scss'],
})
export class FabricantesProveedoresComponent {
  fabSearchTerm: string = '';
  provSearchTerm: string = '';

  fabPageSize: number = 10;
  fabCurrentPage: number = 1;
  fabSortColumn: string = '';
  fabSortDirection: 'asc' | 'desc' = 'asc';

  provPageSize: number = 10;
  provCurrentPage: number = 1;
  provSortColumn: string = '';
  provSortDirection: 'asc' | 'desc' = 'asc';

  pageSizes: number[] = [10, 25, 50, 100];

  fabDetalle: boolean = false;
  fabSelected: any = null;

  provDetalle: boolean = false;
  provSelected: any = null;

  nuevoFab: boolean = false;
  editarFab: boolean = false;
  fabData: any = null;
  cargandoFab: boolean = false;

  nuevoProv: boolean = false;
  editarProv: boolean = false;
  provData: any = null;
  cargandoProv: boolean = false;

  constructor(
    public fabricantesApi: FabricantesService,
    public proveedoresApi: ProveedoresService,
  ) {}

  // ── Fabricantes ──

  get filteredFabricantes(): any[] {
    if (!this.fabSearchTerm) return this.fabricantesApi.fabricantes;
    const term = this.fabSearchTerm.toLowerCase();
    return this.fabricantesApi.fabricantes.filter(
      (f: any) => f.nombre.toLowerCase().includes(term) || (f.alias && f.alias.toLowerCase().includes(term)),
    );
  }

  get sortedFabricantes(): any[] {
    const list = [...this.filteredFabricantes];
    if (!this.fabSortColumn) return list;
    return list.sort((a: any, b: any) => {
      let cmp = 0;
      const col = this.fabSortColumn;
      if (col === 'nombre') cmp = a.nombre?.toLowerCase().localeCompare(b.nombre?.toLowerCase() || '');
      else if (col === 'alias') cmp = (a.alias || '').toLowerCase().localeCompare((b.alias || '').toLowerCase());
      else if (col === 'identificacion_fiscal')
        cmp = (a.identificacion_fiscal || '').localeCompare(b.identificacion_fiscal || '');
      else if (col === 'tipo') cmp = (a.proveedor ? 1 : 0) - (b.proveedor ? 1 : 0);
      return this.fabSortDirection === 'asc' ? cmp : -cmp;
    });
  }

  get fabTotalPages(): number {
    return Math.ceil((this.sortedFabricantes?.length || 0) / this.fabPageSize);
  }

  get paginatedFabricantes(): any[] {
    if (!this.sortedFabricantes) return [];
    const start = (this.fabCurrentPage - 1) * this.fabPageSize;
    return this.sortedFabricantes.slice(start, start + this.fabPageSize);
  }

  fabToggleSort(column: string) {
    if (this.fabSortColumn === column) {
      this.fabSortDirection = this.fabSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.fabSortColumn = column;
      this.fabSortDirection = 'asc';
    }
    this.fabCurrentPage = 1;
  }

  // ── Proveedores ──

  get filteredProveedores(): any[] {
    if (!this.provSearchTerm) return this.proveedoresApi.proveedores;
    const term = this.provSearchTerm.toLowerCase();
    return this.proveedoresApi.proveedores.filter(
      (p: any) =>
        p.nombre.toLowerCase().includes(term) ||
        (p.rif && p.rif.toLowerCase().includes(term)) ||
        (p.pais && p.pais.toLowerCase().includes(term)),
    );
  }

  get sortedProveedores(): any[] {
    const list = [...this.filteredProveedores];
    if (!this.provSortColumn) return list;
    return list.sort((a: any, b: any) => {
      let cmp = 0;
      const col = this.provSortColumn;
      if (col === 'nombre') cmp = a.nombre?.toLowerCase().localeCompare(b.nombre?.toLowerCase() || '');
      else if (col === 'rif') cmp = (a.rif || '').toLowerCase().localeCompare((b.rif || '').toLowerCase());
      else if (col === 'pais') cmp = (a.pais || '').localeCompare(b.pais || '');
      else if (col === 'contactos') cmp = (a.contactos?.length || 0) - (b.contactos?.length || 0);
      return this.provSortDirection === 'asc' ? cmp : -cmp;
    });
  }

  get provTotalPages(): number {
    return Math.ceil((this.sortedProveedores?.length || 0) / this.provPageSize);
  }

  get paginatedProveedores(): any[] {
    if (!this.sortedProveedores) return [];
    const start = (this.provCurrentPage - 1) * this.provPageSize;
    return this.sortedProveedores.slice(start, start + this.provPageSize);
  }

  provToggleSort(column: string) {
    if (this.provSortColumn === column) {
      this.provSortDirection = this.provSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.provSortColumn = column;
      this.provSortDirection = 'asc';
    }
    this.provCurrentPage = 1;
  }

  // ── Pagination ──

  fabGoToPage(page: number) {
    if (page >= 1 && page <= this.fabTotalPages) {
      this.fabCurrentPage = page;
    }
  }

  fabChangePageSize(event: any) {
    this.fabPageSize = Number(event.target.value);
    this.fabCurrentPage = 1;
  }

  provGoToPage(page: number) {
    if (page >= 1 && page <= this.provTotalPages) {
      this.provCurrentPage = page;
    }
  }

  provChangePageSize(event: any) {
    this.provPageSize = Number(event.target.value);
    this.provCurrentPage = 1;
  }

  // ── Modal actions ──

  verFabDetalle(fab: any) {
    this.fabSelected = fab;
    this.fabDetalle = true;
  }

  cerrarFabDetalle() {
    this.fabDetalle = false;
  }

  verProvDetalle(prov: any) {
    this.provSelected = prov;
    this.provDetalle = true;
  }

  cerrarProvDetalle() {
    this.provDetalle = false;
  }

  AgregarNuevoFabricante() {
    this.nuevoFab = true;
  }

  EditarFabricante(fab: any) {
    this.fabData = fab;
    this.editarFab = true;
  }

  cerrarFabModal() {
    this.nuevoFab = false;
    this.editarFab = false;
    this.cargandoFab = true;
    setTimeout(() => {
      this.cargandoFab = false;
      Swal.fire({
        title: this.fabricantesApi.mensaje?.mensaje || 'Fabricante guardado',
        icon: this.fabricantesApi.mensaje?.icon || 'success',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
    this.fabData = null;
  }

  cerrarFabModal_() {
    this.nuevoFab = false;
    this.editarFab = false;
  }

  AgregarNuevoProveedor() {
    this.nuevoProv = true;
  }

  EditarProveedor(prov: any) {
    this.editarProv = true;
    this.provData = prov;
  }

  cerrarProvModal() {
    this.nuevoProv = false;
    this.editarProv = false;
    this.cargandoProv = true;
    setTimeout(() => {
      this.cargandoProv = false;
      Swal.fire({
        title: this.proveedoresApi.mensaje?.mensaje || 'Proveedor guardado',
        icon: this.proveedoresApi.mensaje?.icon || 'success',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }

  cerrarProvModal_() {
    this.nuevoProv = false;
    this.editarProv = false;
  }

  eliminarFabricante(id: string) {
    Swal.fire({
      title: '¿Eliminar este Fabricante?',
      text: 'El fabricante se eliminará de manera permanente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#f03a5f',
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.fabricantesApi.eliminarFabricante(id);
        this.cargandoFab = true;
        setTimeout(() => {
          this.cargandoFab = false;
          Swal.fire({
            title: this.fabricantesApi.mensaje?.mensaje || 'Eliminado',
            icon: this.fabricantesApi.mensaje?.icon || 'success',
            timer: 5000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
          });
        }, 1000);
      }
    });
  }

  eliminarProveedor(id: string) {
    Swal.fire({
      title: '¿Eliminar este proveedor?',
      text: 'El proveedor se eliminará de manera permanente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#f03a5f',
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.proveedoresApi.eliminarProveedor(id);
        this.cargandoProv = true;
        setTimeout(() => {
          this.cargandoProv = false;
          Swal.fire({
            title: this.proveedoresApi.mensaje?.mensaje || 'Eliminado',
            icon: this.proveedoresApi.mensaje?.icon || 'success',
            timer: 5000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
          });
        }, 1000);
      }
    });
  }
}
