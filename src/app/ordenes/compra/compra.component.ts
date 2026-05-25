import { Component } from '@angular/core';
import { OcompraService } from 'src/app/services/ocompra.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compra',
  standalone: false,
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.scss'],
})
export class CompraComponent {
  public mesActual: string;
  public yearActual: number;
  constructor(public api: OcompraService) {
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
    const fechaActual = new Date();
    this.mesActual = meses[fechaActual.getMonth()];
    this.yearActual = fechaActual.getFullYear();
  }

  // --- Core UI state ---
  public cargando = false;
  public nueva = false;
  public new_sub = false;
  public filterMode: string = 'home';
  public ordenExpandida: boolean[] = [];
  public filtrados: any = [];
  public searchTerm: string = '';

  // --- Client grouping state ---
  public PorClientes: any;
  public Info_clientes: boolean[] = [];

  // --- Derivaciones state ---
  public derivadasVisibles: { [key: string]: boolean } = {};
  public orden = {
    cliente: '',
    orden: '',
    fecha: '',
    recepcion: '',
    pedido: [],
  };
  public producto_padre: any = '';
  public almacenes_selected: any = [];
  public derivacion_nueva = {
    nro: null,
    cantidad: 0,
    solicitud: '',
    entrega: '',
  };
  public orden_selected = 0;
  public producto_selected = 0;
  public maximo_oc = 0;

  // --- Pagination ---
  public currentPage: number = 1;
  public pageSize: number = 10;

  get totalPages(): number {
    const total = this.ordenesVisibles.length;
    return Math.ceil(total / this.pageSize) || 1;
  }
  get paginatedOrdenes(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.ordenesVisibles.slice(start, start + this.pageSize);
  }
  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  // --- Getters ---
  get ordenesCerradas(): number {
    return this.api.orden?.filter((o) => o.estado === 'cerrada').length || 0;
  }
  get ordenesMesActual(): number {
    if (!this.api.orden) return 0;
    const now = new Date();
    return this.api.orden.filter((o) => {
      const d = new Date(o.createdAt || o.fecha);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }
  get ordenesAnoActual(): number {
    if (!this.api.orden) return 0;
    const now = new Date();
    return this.api.orden.filter((o) => {
      const d = new Date(o.createdAt || o.fecha);
      return d.getFullYear() === now.getFullYear();
    }).length;
  }
  get clientesUnicas(): string[] {
    if (!this.api.orden) return [];
    return [...new Set(this.api.orden.map((o) => o.cliente?.nombre).filter(Boolean))] as string[];
  }
  get ordenesVisibles(): any[] {
    if (this.filtrados.length > 0) return this.filtrados;
    return this.api.orden || [];
  }

  // --- Filter ---
  setFilter(mode: string) {
    this.filterMode = mode;
    this.filtrados = [];
    this.searchTerm = '';
    this.currentPage = 1;
  }
  search() {
    const cleaned = this.searchTerm.replace(/-/g, '');
    this.filtrados = this.api.orden.filter((o) => o.orden.toLowerCase().includes(cleaned.toLowerCase()));
    this.currentPage = 1;
  }
  buscarPorFecha(desde: string, hasta: string) {
    this.filtrados = this.api.orden.filter((o) => {
      const fechaOrden = new Date(o.recepcion);
      return fechaOrden >= new Date(desde) && fechaOrden <= new Date(hasta);
    });
    this.currentPage = 1;
  }
  buscarPorFecha_cliente(desde: string, hasta: string) {
    const OrdenesPorClientes = {};
    const filtracion = this.api.orden.filter((o) => {
      const fechaOrden = new Date(o.recepcion);
      return fechaOrden >= new Date(desde) && fechaOrden <= new Date(hasta);
    });
    filtracion.forEach((o) => {
      const { cliente } = o;
      if (!OrdenesPorClientes[cliente.nombre]) {
        OrdenesPorClientes[cliente.nombre] = [];
      }
      OrdenesPorClientes[cliente.nombre].push(o);
    });
    this.PorClientes = Object.entries(OrdenesPorClientes);
    this.currentPage = 1;
  }
  buscarporCliente() {
    this.PorClientes = this.api.separarPorCliente();
    this.setFilter('client');
  }
  filtrarPorCliente(target: any) {
    const valor = target.value;
    if (!valor) {
      this.filtrados = [];
      return;
    }
    this.filtrados = this.api.orden.filter((o) => o.cliente?.nombre === valor);
    this.currentPage = 1;
  }

  // --- Toggle ---
  toggleOrder(n: number) {
    this.ordenExpandida[n] = !this.ordenExpandida[n];
  }
  show_info(n: number) {
    this.Info_clientes[n] = !this.Info_clientes[n];
  }

  // --- Derivaciones ---
  toggleDerivadas(ocIdx: number, prodIdx: number) {
    const key = `${ocIdx}-${prodIdx}`;
    this.derivadasVisibles[key] = !this.derivadasVisibles[key];
  }
  isDerivadaVisible(ocIdx: number, prodIdx: number): boolean {
    return !!this.derivadasVisibles[`${ocIdx}-${prodIdx}`];
  }
  nueva_derivacion(producto: any, cliente: any, index_orden: number, index_producto: number) {
    this.producto_padre = producto.producto.identificacion.producto;
    this.maximo_oc = producto.cantidad;
    this.almacenes_selected = cliente.almacenes;
    this.new_sub = true;
    this.derivacion_nueva = { nro: null, cantidad: 0, solicitud: '', entrega: '' };
    this.orden_selected = index_orden;
    this.producto_selected = index_producto;
  }
  GuardarNuevaDerivacion() {
    const x = this.orden_selected;
    const y = this.producto_selected;
    if (!this.api.orden[x].pedido[y].derivadas) {
      this.api.orden[x].pedido[y].derivadas = [];
    }
    this.api.orden[x].pedido[y].derivadas.push(this.derivacion_nueva);
    this.new_sub = false;
    this.api.guardarOrden(this.api.orden[x]);
    setTimeout(() => {
      Swal.fire({
        toast: true,
        timer: 5000,
        timerProgressBar: true,
        position: 'top-end',
        icon: this.api.mensaje.icon,
        text: this.api.mensaje.mensaje,
        showConfirmButton: false,
      });
    }, 1000);
  }

  // --- Helpers ---
  public semaforo = ['rojo', 'amarillo', 'verde'];

  formatNumberWithDotSeparator(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
