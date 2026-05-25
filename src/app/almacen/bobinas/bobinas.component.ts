import { Component } from '@angular/core';
import { BobinasService } from 'src/app/services/bobinas.service';

@Component({
  selector: 'app-bobinas',
  templateUrl: './bobinas.component.html',
  styleUrls: ['./bobinas.component.scss'],
})
export class BobinasComponent {
  public clicked: any = [];
  public convertidora = false;
  public bobina = false;
  public filterMode: string = 'home';
  public filterConvertidora = '';
  public desde = '';
  public hasta = '';
  public pageSize = 25;
  public currentPage = 1;
  public Math: any = Math;

  constructor(public api: BobinasService) {}

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
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
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
}
