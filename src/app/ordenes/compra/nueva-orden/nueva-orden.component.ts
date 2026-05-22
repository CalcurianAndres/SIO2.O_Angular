import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';
import { OcompraService } from 'src/app/services/ocompra.service';
import { ProductosService } from 'src/app/services/productos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-orden',
  standalone: false,
  templateUrl: './nueva-orden.component.html',
  styleUrls: ['./nueva-orden.component.scss'],
})
export class NuevaOrdenComponent {
  constructor(
    public clientes: ClientesService,
    public producto: ProductosService,
    public api: OcompraService,
  ) {}

  @Input() nueva: any;
  @Input() orden: any;
  @Output() onCloseModal = new EventEmitter();

  today: Date = new Date();
  public producto_selected: any = '';
  public producto_selected_: any = '';
  public cantidad_selected: any = '';
  public cantidad_selected_: any = '';
  public fecha_selected: any = '';
  public entrega: any = '';

  SeleccionarProducto(e) {
    this.producto_selected = this.producto.FiltrarPorCliente(this.orden.cliente)[e.value];
  }

  addProducto() {
    console.log(this.producto_selected);

    let data = {
      nombre: this.producto_selected.identificacion.producto,
      producto: this.producto_selected._id,
      cantidad: this.cantidad_selected_,
      solicitud: this.fecha_selected,
      entrega: this.entrega,
    };

    this.orden.pedido.push(data);

    this.producto_selected = '';
    this.producto_selected_ = '';
    this.cantidad_selected = '';
    this.cantidad_selected_ = '';
    this.fecha_selected = '';
    this.entrega = '';
  }

  formatear(e) {
    let format = e.value.replace(/\D/g, ''); // Eliminar caracteres no numéricos;
    this.cantidad_selected_ = format;
    format = format.replace(/\D/g, '');
    format = format.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    this.cantidad_selected = format;
  }

  formatNumberWithDotSeparator(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  Reset(e) {
    this.orden = {
      cliente: '',
      orden: '',
      fecha: '',
      recepcion: '',
      pedido: [],
    };

    this.orden.cliente = e.value;
  }

  Guardar() {
    this.api.guardarOrden(this.orden);
    this.orden = {
      cliente: '',
      orden: '',
      fecha: '',
      recepcion: '',
      pedido: [],
    };
    setTimeout(() => {
      Swal.fire({
        text: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        toast: true,
        position: 'top-end',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      this.onCloseModal.emit();
    }, 1000);
  }
}
