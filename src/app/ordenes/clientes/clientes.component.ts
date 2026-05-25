import { Component } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-clientes',
  standalone: false,
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent {
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

  get totalPages(): number {
    return Math.ceil(this.filteredClientes.length / this.pageSize) || 1;
  }

  get paginatedClientes(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClientes.slice(start, start + this.pageSize);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  onSearch() {
    this.currentPage = 1;
    this.cliente_seleccionado = '';
    this.seleccion = [];
  }

  // --- Actions ---
  cerrar() {
    this.cliente = false;
  }

  GuardarCiente() {
    this.data = { nombre: '', rif: '', codigo: '', direccion: '', contactos: [], almacenes: [] };
    this.cliente = false;
    this.editar = false;
  }

  BuscarCliente(id, index) {
    this.cliente_seleccionado = this.api.buscarClientePorID(id);
    this.seleccion = [];
    this.seleccion[index] = true;
  }

  EditarCliente(cliente) {
    this.data = { ...cliente };
    this.data.contactos = cliente.contactos ? [...cliente.contactos] : [];
    this.data.almacenes = cliente.almacenes ? [...cliente.almacenes] : [];
    this.editar = true;
  }
}
