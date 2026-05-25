import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-cliente',
  standalone: false,
  templateUrl: './new-cliente.component.html',
  styleUrls: ['./new-cliente.component.scss'],
})
export class NewClienteComponent {
  constructor(public api: ClientesService) {}

  @Input() data: any;
  @Input() cliente: any;
  @Input() editar: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onGuardarCliente = new EventEmitter();

  public guardando = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cliente']?.currentValue === true || changes['editar']?.currentValue === true) {
      this.guardando = false;
    }
  }

  public cliente_temporal: any = { nombre: '', titulo: '', cargo: '', correo: '', telefono: '' };
  public Almacene_temporal: any = { nombre: '' };

  cerrar() {
    if (this.guardando) return;
    this.onCloseModal.emit();
  }

  addGuion() {
    if (this.data.rif?.length === 1) {
      this.data.rif = this.data.rif + '-';
    }
  }

  aceptarCliente() {
    if (!this.cliente_temporal.nombre?.trim()) return;
    this.data.contactos.push({ ...this.cliente_temporal });
    this.cliente_temporal = { nombre: '', titulo: 'Sr.', cargo: '', correo: '', telefono: '' };
  }

  aceptarAlmacen() {
    if (!this.Almacene_temporal.nombre?.trim()) return;
    this.data.almacenes.push({ ...this.Almacene_temporal });
    this.Almacene_temporal = { nombre: '' };
  }

  confirmarEliminarContacto(index: number) {
    const contacto = this.data.contactos[index];
    Swal.fire({
      title: '¿Eliminar contacto?',
      text: `${contacto.titulo || ''} ${contacto.nombre || ''}`.trim() || 'Este contacto',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((r) => {
      if (r.isConfirmed) {
        this.data.contactos.splice(index, 1);
        Swal.fire({
          toast: true,
          timer: 2000,
          icon: 'success',
          text: 'Contacto eliminado',
          showConfirmButton: false,
          position: 'top-end',
        });
      }
    });
  }

  confirmarEliminarAlmacen(index: number) {
    const almacen = this.data.almacenes[index];
    Swal.fire({
      title: '¿Eliminar almacén?',
      text: almacen?.nombre || 'Este almacén',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((r) => {
      if (r.isConfirmed) {
        this.data.almacenes.splice(index, 1);
        Swal.fire({
          toast: true,
          timer: 2000,
          icon: 'success',
          text: 'Almacén eliminado',
          showConfirmButton: false,
          position: 'top-end',
        });
      }
    });
  }

  guardar() {
    this.guardando = true;
    this.api.GuardarCliente(this.data);
    this.onGuardarCliente.emit();
    setTimeout(() => {
      this.guardando = false;
      Swal.fire({
        icon: this.api.mensaje.icon,
        text: this.api.mensaje.mensaje,
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    }, 1000);
  }

  editarCliente() {
    this.guardando = true;
    this.api.EditarClientes(this.data);
    this.onGuardarCliente.emit();
    setTimeout(() => {
      this.guardando = false;
      Swal.fire({
        icon: this.api.mensaje.icon,
        text: this.api.mensaje.mensaje,
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    }, 1000);
  }
}
