import { Component } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-clientes',
  standalone: false,templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent {

  constructor(public api:ClientesService){}


  public cliente = false;
  public editar = false;
  public cliente_seleccionado:any = '';
  public seleccion:any = [];

  public data = {
    nombre:'',
    rif:'',
    codigo:'',
    direccion:'',
    contactos:[
    ],
    almacenes:[
    ]
  }

  cerrar(){
    this.cliente = false;
  }

  GuardarCiente(){
    this.data = {
      nombre:'',
      rif:'',
      codigo:'',
      direccion:'',
      contactos:[
      ],
      almacenes:[
      ]
    }

    this.cliente = false;
    this.editar = false;

  }

  BuscarCliente(id, index){
    this.cliente_seleccionado = this.api.buscarClientePorID(id);
    this.seleccion = [];
    this.seleccion[index] = true;
  }

  EditarCliente(cliente){
    this.data = cliente
    this.editar = true;
  }


}
