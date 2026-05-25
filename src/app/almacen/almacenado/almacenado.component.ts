import { Component, OnInit } from '@angular/core';
import { AlmacenService } from 'src/app/services/almacen.service';
import { GruposService } from 'src/app/services/grupos.service';

@Component({
  selector: 'app-almacenado',
  standalone: false,
  templateUrl: './almacenado.component.html',
  styleUrls: ['./almacenado.component.scss'],
})
export class AlmacenadoComponent implements OnInit {
  public searchTerm: string = '';
  public currentPage: number = 1;
  public pageSize: number = 10;
  public pageSizes: number[] = [10, 25, 50, 100];
  public cargando: boolean = true;

  public listado!: any;
  public Inventario: boolean = false;
  public Generales!: { [id: string]: number };
  public ByLotes!: { [id: string]: { [lote: string]: number } };
  public Materiales_totales!: any;

  constructor(
    public api: AlmacenService,
    public grupos: GruposService,
  ) {}

  ngOnInit() {
    setTimeout(() => {
      if (this.grupos.grupos?.length > 0 || this.api.Almacen?.length > 0) {
        this.cargando = false;
      }
    }, 600);
  }

  get kpiStockCritico(): number {
    if (!this.api.Almacen) return 0;
    return this.agruparStockPorMaterial().filter((s) => s.total > 0 && s.total < 1000).length;
  }

  get kpiCeroStock(): number {
    if (!this.api.Almacen) return 0;
    return this.agruparStockPorMaterial().filter((s) => s.total === 0).length;
  }

  get kpiObservacion(): number {
    return this.grupos.grupos?.filter((g) => g.parcial)?.length || 0;
  }

  private agruparStockPorMaterial(): { id: string; total: number }[] {
    const map = new Map<string, number>();
    for (const item of this.api.Almacen) {
      const id = item.material?._id;
      if (!id) continue;
      map.set(id, (map.get(id) || 0) + Number(item.neto));
    }
    return Array.from(map.entries()).map(([id, total]) => ({ id, total }));
  }

  get filteredGrupos(): any[] {
    const grupos = this.grupos.grupos || [];
    if (!this.searchTerm?.trim()) return grupos;
    const t = this.searchTerm.toLowerCase().trim();
    return grupos.filter((g) => g.nombre?.toLowerCase().includes(t));
  }

  get totalPages(): number {
    return Math.ceil(this.filteredGrupos.length / this.pageSize) || 1;
  }

  get paginatedGrupos(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredGrupos.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearch() {
    this.currentPage = 1;
  }

  changePageSize(event: any) {
    this.pageSize = Number(event.target.value);
    this.currentPage = 1;
  }

  getStockForGroup(grupoId: string): number {
    if (!this.api.Almacen) return 0;
    return this.api.Almacen.filter((item) => item.material?.grupo?._id === grupoId).reduce(
      (sum, item) => sum + Number(item.neto),
      0,
    );
  }

  getStockStatus(grupoId: string): { label: string; class: string } {
    const stock = this.getStockForGroup(grupoId);
    if (stock === 0) return { label: 'Sin stock', class: 'is-danger' };
    if (stock < 1000) return { label: 'Crítico', class: 'is-warning' };
    return { label: 'Normal', class: 'is-success' };
  }

  filas() {
    return Math.ceil(this.grupos.grupos.length / 3);
  }

  detallar = async (id: any) => {
    console.log(id);
    const sumByMaterialId: any = [];
    this.Inventario = true;
    this.listado = this.api.BuscarPorGrupo(id);
    this.sumarMateriales();
    this.Materiales_totales = agruparMaterialesPorNombreYId(this.listado);
    console.log(this.Materiales_totales);
    function agruparMaterialesPorNombreYId(materiales: any[]): any[] {
      const agrupacionPorNombre = new Map<string, any>();

      materiales.forEach((material) => {
        const materialNombre = material.material.nombre;
        const materialId = material.material._id;

        if (!agrupacionPorNombre.has(materialNombre)) {
          agrupacionPorNombre.set(materialNombre, {
            nombre: material.material.nombre,
            materialesPorId: new Map<string, any>(),
          });
        }

        const agrupadoPorNombre = agrupacionPorNombre.get(materialNombre);

        if (!agrupadoPorNombre.materialesPorId.has(materialId)) {
          agrupadoPorNombre.materialesPorId.set(materialId, {
            nombre: material.material.nombre,
            marca: material.material.fabricante.alias,
            unidad: material.unidad,
            netoTotal: 0,
            lotes: {},
          });
        }

        const materialAgrupado = agrupadoPorNombre.materialesPorId.get(materialId);
        materialAgrupado.netoTotal += Number(material.neto);

        if (!materialAgrupado.lotes[material.lote]) {
          materialAgrupado.lotes[material.lote] = [];
        }
        materialAgrupado.lotes[material.lote].push(material);
      });

      const resultado = Array.from(agrupacionPorNombre.values()).map((grupo) => {
        return {
          nombre: grupo.nombre,
          materialesPorId: Array.from(grupo.materialesPorId.values()),
        };
      });

      return resultado;
    }
  };

  sumarMateriales() {
    const sumByMaterialId: { [id: string]: number } = {};
    const sumByMaterialIdAndLote: { [id: string]: { [lote: string]: number } } = {};
    for (const material of this.listado) {
      const materialId = material.material._id.toString();
      const neto = Number(material.neto);
      const ancho = material.ancho.toString();
      const largo = material.largo.toString();
      const key = `${materialId}-${ancho}-${largo}`;

      if (!sumByMaterialId[key]) {
        sumByMaterialId[key] = 0;
      }
      sumByMaterialId[key] += neto;

      if (!sumByMaterialIdAndLote[key]) {
        sumByMaterialIdAndLote[key] = {};
      }
      if (!sumByMaterialIdAndLote[key][material.lote]) {
        sumByMaterialIdAndLote[key][material.lote] = 0;
      }
      sumByMaterialIdAndLote[key][material.lote] += neto;
    }
    this.Generales = sumByMaterialId;
    this.ByLotes = sumByMaterialIdAndLote;
  }
}
