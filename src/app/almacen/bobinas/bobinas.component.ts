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

  public descuentoRapido = false;
  public bobinaSeleccionada: any = null;

  public historialModal = false;
  public conversionHistorial: any = null;

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
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
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

  abrirDescuento(bobina: any) {
    this.bobinaSeleccionada = bobina;
    this.descuentoRapido = true;
  }

  cerrarDescuento() {
    this.descuentoRapido = false;
    this.bobinaSeleccionada = null;
  }

  marcarConversionLista(conv: any) {
    Swal.fire({
      title: '¿Marcar conversión como lista?',
      text: `Conversión ${conv.conversion} — Lote ${conv.lote}`,
      showDenyButton: true,
      confirmButtonColor: '#48c78e',
      confirmButtonText: 'Sí, marcar',
      denyButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.editarConversion({ _id: conv._id, status: 'Lista' });
        setTimeout(() => {
          Swal.fire({ text: 'Conversión marcada como lista', icon: 'success', timer: 2000, showConfirmButton: false });
        }, 500);
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // Histórico de descuentos por conversión
  // ══════════════════════════════════════════════════════

  abrirHistorial(conv: any) {
    this.conversionHistorial = conv;
    this.historialModal = true;
  }

  cerrarHistorial() {
    this.historialModal = false;
    this.conversionHistorial = null;
  }

  get historialConversion(): any[] {
    if (!this.conversionHistorial || !this.api.bobinas) return [];
    const convId = this.conversionHistorial._id;
    const entradas: any[] = [];
    for (const b of this.api.bobinas) {
      if (!b.historial_descuentos) continue;
      for (const h of b.historial_descuentos) {
        if (h.conversion === convId) {
          entradas.push({ ...h, bobinaCodigo: b.codigo, bobinaLote: b.lote });
        }
      }
    }
    return entradas.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  get historialResumen(): { hojasConsumidas: number; pesoDescontado: number; hojasRestantes: number } {
    if (!this.conversionHistorial) return { hojasConsumidas: 0, pesoDescontado: 0, hojasRestantes: 0 };
    const hojasConsumidas = this.historialConversion.reduce((sum: number, h: any) => sum + Number(h.hojas || 0), 0);
    const pesoDescontado = this.historialConversion.reduce((sum: number, h: any) => sum + Number(h.peso || 0), 0);
    const totalConversion = Number(this.conversionHistorial.cantidad || 0);
    return {
      hojasConsumidas,
      pesoDescontado: Math.round(pesoDescontado * 10000) / 10000,
      hojasRestantes: Math.max(0, totalConversion - hojasConsumidas),
    };
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
}
