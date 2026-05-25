import { Component, OnInit } from '@angular/core';
import { OproduccionService } from 'src/app/services/oproduccion.service';

@Component({
  selector: 'app-producto-terminado',
  templateUrl: './producto-terminado.component.html',
  styleUrls: ['./producto-terminado.component.scss'],
})
export class ProductoTerminadoComponent implements OnInit {
  constructor(public api: OproduccionService) {}

  cargando = true;
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  pageSizes = [10, 25, 50, 100];
  expandedIndex: number | null = null;

  ngOnInit() {
    setTimeout(() => {
      this.cargando = false;
    }, 600);
  }

  get items() {
    return this.api.producto_terminado_agrupado || [];
  }

  get kpiTotalProductos() {
    return this.items.length;
  }

  get kpiTotalUnidades() {
    return this.items.reduce((sum: number, item: any) => sum + (item.cantidadTotal || 0), 0);
  }

  get kpiTotalOPs() {
    return this.items.reduce((sum: number, item: any) => sum + (item.totalOPs || 0), 0);
  }

  get filteredItems(): any[] {
    if (!this.searchTerm.trim()) return this.items;
    const term = this.searchTerm.toLowerCase();
    return this.items.filter((item: any) => item.nombre?.toLowerCase().includes(term));
  }

  get totalPages() {
    return Math.ceil(this.filteredItems.length / this.pageSize) || 1;
  }

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch() {
    this.currentPage = 1;
  }

  changePageSize(event: any) {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleExpand(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  notificarDespacho(nombre: string) {
    alert(`Notificando despacho para: ${nombre}`);
  }
}
