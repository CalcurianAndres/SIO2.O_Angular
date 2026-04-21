import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-cliente',
  standalone: false,templateUrl: './new-cliente.component.html',
  styleUrls: ['./new-cliente.component.scss']
})
export class NewClienteComponent {
  constructor(public api:ClientesService){

  }

  @Input() data:any;
  @Input() cliente:any;
  @Input() editar:any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onGuardarCliente = new EventEmitter();


  public cliente_temporal:any = {
    nombre:'',
    titulo:'',
    cargo:'',
    correo:''
  }

  public Almacene_temporal:any = {
    nombre:''
  }

  cerrar(){
    this.onCloseModal.emit();
  }

  addGuion(){
      if (this.data.rif.length === 1) {
        this.data.rif = this.data.rif + '-';
      } 
    }

  aceptarCliente(){
    this.data.contactos.push(this.cliente_temporal)
    this.cliente_temporal = {
      nombre:'',
      titulo:'',
      cargo:'',
      correo:''
    }  
  }

  aceptarAlmacen(){
    this.data.almacenes.push(this.Almacene_temporal)
    this.Almacene_temporal = {
      nombre:''
    }
  }

  guardar(){
    this.api.GuardarCliente(this.data)
    this.onGuardarCliente.emit();
    setTimeout(() => {
      Swal.fire({
        icon:this.api.mensaje.icon,
        text:this.api.mensaje.mensaje,
        timer:1500,
        timerProgressBar:true,
        toast:true,
        position:'top-end',
        showConfirmButton:false
      })
    }, 1000);
  }
  
  editarCliente(){
    this.api.EditarClientes(this.data)
    this.onGuardarCliente.emit();
    setTimeout(() => {
      Swal.fire({
        icon:this.api.mensaje.icon,
        text:this.api.mensaje.mensaje,
        timer:1500,
        timerProgressBar:true,
        toast:true,
        position:'top-end',
        showConfirmButton:false
      })
    }, 1000);
  }
}
