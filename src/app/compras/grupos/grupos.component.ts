import { Component } from '@angular/core';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { ProductosService } from 'src/app/services/productos.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-grupos',
  standalone: false,
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss'],
})
export class GruposComponent {
  activeTab: 'grupos' | 'servicios' = 'grupos';
  nuevo: boolean = false;
  editar: boolean = false;
  nuevo_servicio: boolean = false;
  editar_servicio: boolean = false;
  servicio_data: any = null;
  material: boolean = false;
  nuevo_material: boolean = false;
  editar_material: boolean = false;
  material_data: any = null;
  cargando: boolean = false;
  data: any = [];
  material_selected = [];
  trato = false;
  otro = false;
  selectedGrupo: any = null;

  searchTerm: string = '';
  servicioSearchTerm: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  pageSizes: number[] = [10, 25, 50, 100];
  sortColumn: string = 'nombre';
  sortDirection: 'asc' | 'desc' = 'asc';

  expandedGrupoId: string | null = null;

  expandedNameKey: string | null = null;
  expandedBrandKey: string | null = null;

  matSortColumn: string = 'nombre';
  matSortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    public api: GruposService,
    public materiales: MaterialesService,
    public productos: ProductosService,
    public servicios: ServiciosService,
  ) {}

  get filteredGrupos(): any[] {
    const list = this.api.grupos || [];
    if (!this.searchTerm) return list;
    const term = this.searchTerm.toLowerCase();
    return list.filter((g: any) => g.nombre.toLowerCase().includes(term));
  }

  get sortedGrupos(): any[] {
    const list = [...this.filteredGrupos];
    if (!this.sortColumn) return list;
    return list.sort((a: any, b: any) => {
      let cmp: number;
      if (this.sortColumn === 'nombre') {
        cmp = a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
      } else {
        cmp = (a.parcial ? 0 : 1) - (b.parcial ? 0 : 1);
      }
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  get totalPages(): number {
    return Math.ceil((this.sortedGrupos?.length || 0) / this.pageSize);
  }

  get paginatedGrupos(): any[] {
    if (!this.sortedGrupos) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedGrupos.slice(start, start + this.pageSize);
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageSize(event: any) {
    this.pageSize = Number(event.target.value);
    this.currentPage = 1;
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  toggleExpand(grupoId: string) {
    if (this.expandedGrupoId === grupoId) {
      this.expandedGrupoId = null;
      this.expandedNameKey = null;
      this.expandedBrandKey = null;
    } else {
      this.expandedGrupoId = grupoId;
      this.expandedNameKey = null;
      this.expandedBrandKey = null;
    }
  }

  getMaterialesDelGrupo(grupoId: string): any[] {
    return this.materiales.filtrarGrupos(grupoId) || [];
  }

  matToggleSort(column: string) {
    if (this.matSortColumn === column) {
      this.matSortDirection = this.matSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.matSortColumn = column;
      this.matSortDirection = 'asc';
    }
  }

  getNameGroups(grupoId: string): any[] {
    const all = this.getMaterialesDelGrupo(grupoId) || [];
    const grupo = this.api.grupos?.find((g: any) => g._id === grupoId);
    if (!grupo || all.length === 0) return [];

    const nameMap = new Map<string, any[]>();
    for (const mat of all) {
      const key = grupo.trato ? `${mat.nombre || ''}|${mat.gramaje || ''}|${mat.calibre || ''}` : `${mat.nombre || ''}`;
      if (!nameMap.has(key)) nameMap.set(key, []);
      nameMap.get(key)!.push(mat);
    }

    const groups: any[] = [];
    for (const [key, items] of nameMap) {
      const brandMap = new Map<string, any[]>();
      for (const item of items) {
        const alias = item.fabricante?.alias || item.fabricante?.nombre || 'Desconocido';
        if (!brandMap.has(alias)) brandMap.set(alias, []);
        brandMap.get(alias)!.push(item);
      }

      const brands: any[] = [];
      for (const [alias, brandItems] of brandMap) {
        brands.push({
          alias,
          count: brandItems.length,
          items: brandItems,
        });
      }

      groups.push({
        key,
        name: items[0].nombre,
        gramaje: items[0].gramaje,
        calibre: items[0].calibre,
        total: items.length,
        brands,
      });
    }

    return groups;
  }

  toggleName(nameKey: string) {
    if (this.expandedNameKey === nameKey) {
      this.expandedNameKey = null;
      this.expandedBrandKey = null;
    } else {
      this.expandedNameKey = nameKey;
      this.expandedBrandKey = null;
    }
  }

  toggleBrand(nameKey: string, alias: string) {
    const key = `${nameKey}|${alias}`;
    if (this.expandedBrandKey === key) {
      this.expandedBrandKey = null;
    } else {
      this.expandedBrandKey = key;
    }
  }

  getSortedItems(items: any[]): any[] {
    if (!items || !items.length) return [];
    const sorted = [...items];
    if (this.matSortColumn) {
      sorted.sort((a: any, b: any) => {
        let cmp = 0;
        if (this.matSortColumn === 'codigo') {
          cmp = (a.codigo || '').toLowerCase().localeCompare((b.codigo || '').toLowerCase());
        } else if (this.matSortColumn === 'serie') {
          cmp = (a.serie || '').toLowerCase().localeCompare((b.serie || '').toLowerCase());
        } else {
          cmp = (a.nombre || '').toLowerCase().localeCompare((b.nombre || '').toLowerCase());
        }
        return this.matSortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return sorted;
  }

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
    this.editar_material = false;
    this.material_data = null;
  }

  NuevoMaterial() {
    this.nuevo_material = true;
  }

  EditarMaterial(mat: any) {
    this.material_data = mat;
    this.editar_material = true;
  }

  cerrarNuevoMaterial() {
    this.nuevo_material = false;
    this.editar_material = false;
    this.material_data = null;
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
      if (this.selectedGrupo) {
        this.material_selected = this.materiales.filtrarGrupos(this.selectedGrupo._id);
      }
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

  eliminarMaterial(id: any) {
    Swal.fire({
      title: '¿Eliminar este material?',
      text: 'El material se eliminará de manera permanente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#f03a5f',
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.materiales.EliminarMaterial(id);
        setTimeout(() => {
          Swal.fire({
            title: this.materiales.mensaje.mensaje,
            icon: this.materiales.mensaje.icon,
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

  cerrarMateriales() {
    this.material = false;
  }

  // ==================
  // SERVICIOS methods
  // ==================

  get filteredServicios(): any[] {
    if (!this.servicioSearchTerm) return this.servicios.servicios;
    const term = this.servicioSearchTerm.toLowerCase();
    return this.servicios.servicios.filter((s: any) => s.nombre?.toLowerCase().includes(term));
  }

  EditarServicio(serv: any) {
    this.servicio_data = serv;
    this.editar_servicio = true;
  }

  cerrarServicio() {
    this.nuevo_servicio = false;
    this.editar_servicio = false;
    this.servicio_data = null;
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
      Swal.fire({
        title: this.servicios.mensaje.mensaje,
        icon: this.servicios.mensaje.icon,
        timer: 5000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    }, 1000);
  }

  cerrarServicio_() {
    this.nuevo_servicio = false;
    this.editar_servicio = false;
    this.servicio_data = null;
  }

  eliminarServicio(id: string) {
    Swal.fire({
      title: '¿Eliminar este servicio?',
      text: 'El servicio se eliminará de manera permanente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#f03a5f',
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.cargando = true;
        this.servicios.eliminarServicio(id);
        setTimeout(() => {
          this.cargando = false;
          Swal.fire({
            title: this.servicios.mensaje.mensaje,
            icon: this.servicios.mensaje.icon,
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
}
