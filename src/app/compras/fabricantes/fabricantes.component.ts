import { Component } from '@angular/core';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { Fabricante, Fabricante_populated } from '../models/modelos-compra';
import Swal from 'sweetalert2';
import { ProveedoresService } from 'src/app/services/proveedores.service';

@Component({
  selector: 'app-fabricantes',
  standalone: false,templateUrl: './fabricantes.component.html',
  styleUrls: ['./fabricantes.component.scss']
})
export class FabricantesComponent {
  constructor(public api:FabricantesService,
              public proveedores:ProveedoresService
  ){

  }

  public nuevo:boolean = false;
  public detalle:boolean = false;
  public editar:boolean = false;
  public selected!:any
  public data:any = [];
  public cargando:boolean = false;


  filas(){
    return Math.ceil((this.api.fabricantes.length + 1) / 5)
  }

  seleccion(i:number){
    this.selected = this.api.fabricantes[i]
    this.detalle = true;
  }

  Editar(i:number){
    this.data = this.api.fabricantes[i]
     this.editar = true;
     console.log(this.data)
  }

  cerrar(){
    this.editar = false;
    this.nuevo = false;
    this.cargando = true;
    
    setTimeout(() => {
      this.cargando = false;
      Swal.fire({
        title: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        timer: 5000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
    }, 1000);
    
  }

  cerrar__(){
    this.editar = false;
    this.nuevo = false;
    console.log('close 2')
  }

  borrarFabricante(id:string){
    Swal.fire({
      title:'¿Eliminar este Fabricante?',
      text:'El fabricante se eliminará de manera permanente',
      icon:'question',
      showCancelButton:true,
      confirmButtonColor:'#48c78e',
      confirmButtonText:'Eliminar',
      cancelButtonText:'Cancelar',
      cancelButtonColor:'#f03a5f'
    }).then(resultado => {
      if(resultado.isConfirmed){
        this.api.eliminarFabricante(id)
        this.cargando = true;
        setTimeout(() => {
          this.cargando = false;
          Swal.fire({
            title: this.api.mensaje.mensaje,
            icon: this.api.mensaje.icon,
            timer: 5000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });
        }, 1000);
      }
    }).catch(err => {
      return err
    })
  }
  
}
