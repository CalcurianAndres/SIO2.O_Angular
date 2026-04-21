import { Component } from '@angular/core';
import { CategoriasService } from 'src/app/services/categorias.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  standalone: false,templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent {

  constructor(public api:CategoriasService){

  }

  public data = {
    nombre:''
  }
  public nueva:boolean = false;
  public editar:boolean = false;

  nuevaCategoria(){
    this.nueva = true;
  }


  cerrar(){
    this.nueva = false;
    this.editar = false;
    this.data = {
      nombre:''
    }
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

  filas(){
    return Math.ceil(this.api.categorias.length / 3)
  }

  verInfo(categoria){

  }

  editarInfo(categoria){
    this.editar = true;
    this.data = categoria
  }

  eliminarCategori(categoria){
    this.api.EliminarCategoria(categoria._id)
    this.cerrar()
  }

}
