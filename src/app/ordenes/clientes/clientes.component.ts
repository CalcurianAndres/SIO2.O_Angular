import { Component, AfterViewInit } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';
import * as L from 'leaflet';

// Fix Leaflet default icon paths for Angular/webpack builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

@Component({
  selector: 'app-clientes',
  standalone: false,
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements AfterViewInit {
  constructor(public api: ClientesService) {}

  public cargando = false;
  public cliente = false;
  public editar = false;
  public cliente_seleccionado: any = '';
  public seleccion: any = [];
  public searchTerm: string = '';

  public data: any = {
    nombre: '',
    rif: '',
    codigo: '',
    direccion: '',
    contactos: [],
    almacenes: [],
  };

  // --- Pagination ---
  public currentPage: number = 1;
  public pageSize: number = 10;

  // --- Sorting ---
  public sortColumn: string = '';
  public sortDirection: 'asc' | 'desc' = 'asc';

  // --- Detail map ---
  private mapaDetalle: L.Map | null = null;
  private marcadoresDetalle: L.Marker[] = [];
  private mapaIniciado = false;

  get filteredClientes(): any[] {
    if (!this.api.clientes) return [];
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.api.clientes;
    return this.api.clientes.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(term) ||
        c.rif?.toLowerCase().includes(term) ||
        c.codigo?.toLowerCase().includes(term),
    );
  }

  get sortedClientes(): any[] {
    const list = [...this.filteredClientes];
    if (!this.sortColumn) return list;
    return list.sort((a: any, b: any) => {
      let cmp = 0;
      const col = this.sortColumn;
      if (col === 'nombre') cmp = a.nombre?.toLowerCase().localeCompare(b.nombre?.toLowerCase() || '');
      else if (col === 'rif') cmp = (a.rif || '').toLowerCase().localeCompare((b.rif || '').toLowerCase());
      else if (col === 'codigo') cmp = (a.codigo || '').localeCompare(b.codigo || '');
      else if (col === 'contactos') cmp = (a.contactos?.length || 0) - (b.contactos?.length || 0);
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.sortedClientes.length / this.pageSize) || 1;
  }

  get paginatedClientes(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedClientes.slice(start, start + this.pageSize);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  onSearch() {
    this.currentPage = 1;
    this.cliente_seleccionado = '';
    this.seleccion = [];
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

  // --- Actions ---
  cerrar() {
    this.cliente = false;
    this.editar = false;
  }

  GuardarCiente() {
    const id = this.cliente_seleccionado?._id;
    this.data = { nombre: '', rif: '', codigo: '', direccion: '', contactos: [], almacenes: [] };
    this.cliente = false;
    this.editar = false;
    if (id) {
      setTimeout(() => {
        this.cliente_seleccionado = this.api.buscarClientePorID(id);
        setTimeout(() => this.refrescarMapa(), 300);
      }, 500);
    }
  }

  BuscarCliente(id, index) {
    this.cliente_seleccionado = this.api.buscarClientePorID(id);
    this.seleccion = [];
    this.seleccion[index] = true;
    setTimeout(() => this.refrescarMapa(), 300);
  }

  EditarCliente(cliente) {
    this.data = { ...cliente };
    this.data.contactos = cliente.contactos ? [...cliente.contactos] : [];
    this.data.almacenes = cliente.almacenes ? [...cliente.almacenes] : [];
    this.editar = true;
  }

  ngAfterViewInit() {
    setTimeout(() => this.iniciarMapaDetalle(), 500);
  }

  get clienteTieneMapa(): boolean {
    return this.cliente_seleccionado?.almacenes?.some((a) => a.lat && a.lng) ?? false;
  }

  private refrescarMapa() {
    if (!this.mapaIniciado) {
      this.iniciarMapaDetalle();
      return;
    }
    this.actualizarMapa();
    setTimeout(() => this.mapaDetalle?.invalidateSize(), 150);
  }

  private iniciarMapaDetalle(retry = 0) {
    if (this.mapaIniciado) return;
    const el = document.getElementById('mapa-detalle-cliente');
    if (!el) return;
    if (el.clientWidth === 0 || el.clientHeight === 0) {
      if (retry < 15) setTimeout(() => this.iniciarMapaDetalle(retry + 1), 400);
      return;
    }

    this.mapaDetalle = L.map(el, {
      center: [10.4806, -66.9036],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(this.mapaDetalle);

    this.mapaIniciado = true;
    this.actualizarMapa();
    setTimeout(() => this.mapaDetalle?.invalidateSize(), 200);
  }

  private actualizarMapa() {
    if (!this.mapaDetalle) return;
    this.marcadoresDetalle.forEach((m) => m.remove());
    this.marcadoresDetalle = [];

    const almacenes = this.cliente_seleccionado?.almacenes?.filter((a) => a.lat && a.lng) || [];
    if (almacenes.length === 0) {
      this.mapaDetalle.setView([10.4806, -66.9036], 5);
      return;
    }

    almacenes.forEach((a) => {
      const m = L.marker([a.lat, a.lng])
        .addTo(this.mapaDetalle!)
        .bindPopup(`<b>${a.nombre}</b><br/>${a.lat}, ${a.lng}`);
      this.marcadoresDetalle.push(m);
    });

    if (almacenes.length > 1) {
      this.mapaDetalle.fitBounds(
        L.latLngBounds(almacenes.map((a) => [a.lat, a.lng])),
        { padding: [30, 30] },
      );
    } else {
      this.mapaDetalle.setView([almacenes[0].lat, almacenes[0].lng], 8);
    }
  }
}
