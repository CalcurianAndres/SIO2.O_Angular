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
  public mesActual;
  public yearActual;
  constructor(public api: OcompraService) {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Septiembre',
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
    this.yearActual = new Date().getFullYear();
  }

  public cliente = false; // Variable para controlar si se está buscando por cliente
  public fecha = true; // Variable para controlar si se está buscando por fecha
  public Info_clientes = [false, false]; // Array de booleanos para controlar la visualización de información adicional por cliente
  public ORDEN = [false, false];
  public nueva = false;
  public filtrado = false;
  public DesdeHasta = false;
  public PorClientes: any;
  public OC_NUMBER = false;
  public semaforo = ['rojo', 'amarillo', 'verde'];
  public Busqueda = false;
  public filtrados: any;
  searchTerm: string = '';
  public new_sub = false;

  derivadasVisibles: { [key: string]: boolean } = {};

  toggleDerivadas(ocIdx: number, prodIdx: number) {
    const key = `${ocIdx}-${prodIdx}`;
    this.derivadasVisibles[key] = !this.derivadasVisibles[key];
  }

  isDerivadaVisible(ocIdx: number, prodIdx: number): boolean {
    return !!this.derivadasVisibles[`${ocIdx}-${prodIdx}`];
  }

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
  GuardarNuevaDerivacion() {
    let x = this.orden_selected;
    let y = this.producto_selected;

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
  nueva_derivacion(producto: any, cliente: any, index_orden, index_producto) {
    this.producto_padre = producto.producto.identificacion.producto;
    this.maximo_oc = producto.cantidad;
    this.almacenes_selected = cliente.almacenes;
    this.new_sub = true;
    this.derivacion_nueva = {
      nro: null,
      cantidad: 0,
      solicitud: '',
      entrega: '',
    };
    this.orden_selected = index_orden;
    this.producto_selected = index_producto;
  }

  formatNumberWithDotSeparator(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  search() {
    this.filtrados = this.api.orden.filter((orden) =>
      orden.orden.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
    console.log(this.filtrados);
  }

  buscarPorFecha(desde, hasta) {
    this.filtrados = this.api.orden.filter((orden) => {
      // Convertir las fechas de los objetos OrdenCompra a objetos Date
      const fechaOrden = new Date(orden.recepcion);

      // Verificar si la fecha de la orden está dentro del rango especificado
      return fechaOrden >= new Date(desde) && fechaOrden <= new Date(hasta);
    });
  }

  mostrarFiltros() {
    if (!this.filtrado) {
      this.filtrado = true;
    } else {
      this.filtrado = false;
    }
  }

  BusquedaPorNumero() {
    this.OC_NUMBER = true;
    this.DesdeHasta = false;
    this.fecha = false;
    this.cliente = false;
    this.Busqueda = true;
    this.filtrados = [];
  }

  RealizarBusquedaFecha() {
    if (!this.DesdeHasta) {
      this.DesdeHasta = true;
    }
    this.fecha = false; // Ocultar la búsqueda por fecha
    this.cliente = false; // Mostrar la búsqueda por cliente
    this.Busqueda = true;
    this.Busqueda = true;
    this.OC_NUMBER = false;
    this.filtrados = [];
  }

  show_info_(n) {
    if (this.ORDEN[n]) {
      this.ORDEN[n] = false; // Si la información está mostrándose, ocultarla
    } else {
      this.ORDEN[n] = true; // Si la información está oculta, mostrarla
    }
  }

  // Función para buscar por cliente
  buscarporCliente() {
    this.PorClientes = this.api.separarPorCliente();
    this.fecha = false; // Ocultar la búsqueda por fecha
    this.cliente = true; // Mostrar la búsqueda por cliente
    this.Busqueda = false;
    this.DesdeHasta = true;
    this.OC_NUMBER = false;
  }

  buscarPorFecha_cliente(desde, hasta) {
    let OrdenesPorClientes = {};
    let filtracion = this.api.orden.filter((orden) => {
      // Convertir las fechas de los objetos OrdenCompra a objetos Date
      const fechaOrden = new Date(orden.recepcion);

      // Verificar si la fecha de la orden está dentro del rango especificado
      return fechaOrden >= new Date(desde) && fechaOrden <= new Date(hasta);
    });

    filtracion.forEach((orden) => {
      const { cliente } = orden;

      // Si el proveedor no existe en el objeto, lo creamos
      if (!OrdenesPorClientes[cliente.nombre]) {
        OrdenesPorClientes[cliente.nombre] = [];
      }

      // Agregamos el material al proveedor correspondiente
      OrdenesPorClientes[cliente.nombre].push(orden);
    });

    // Convertimos el objeto en un arreglo de proveedores
    this.PorClientes = Object.entries(OrdenesPorClientes);
  }

  // Función para buscar por fecha
  buscarporFecha() {
    this.fecha = true; // Mostrar la búsqueda por fecha
    this.cliente = false; // Ocultar la búsqueda por cliente
    this.DesdeHasta = false;
    this.OC_NUMBER = false;
    this.Busqueda = false;
  }

  // Función para mostrar información adicional por cliente
  show_info(n) {
    if (this.Info_clientes[n]) {
      this.Info_clientes[n] = false; // Si la información está mostrándose, ocultarla
    } else {
      this.Info_clientes[n] = true; // Si la información está oculta, mostrarla
    }
  }
}
