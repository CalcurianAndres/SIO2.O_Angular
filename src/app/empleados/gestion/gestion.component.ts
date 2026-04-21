import { Component } from '@angular/core';
import { CargosService } from 'src/app/services/cargos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion',
  standalone: false,templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.scss']
})
export class GestionComponent {

  constructor(public api:CargosService){

  }

  public cargo = {
    nombre:'',
    funcion:''
  }

  nueva = false;
  info = false;

  Cargos:any = []

  editar(cargo){
    this.cargo = cargo;
    this.nueva = true;
  }

  EliminarCargo(cargo){
    Swal.fire({
      icon:'question',
      title:'¿Eliminar cargo?',
      text:'¿Estas seguro que quieres eliminar este cargo?. El mismo no podra ser recuperdo luego.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Eliminar",
      denyButtonText: `No eliminar`,
      confirmButtonColor:'#f03a5f',
      denyButtonColor:'#48c78e'
    }).then((result) => {
      if(result.isConfirmed){
        this.api.eliminarCargo(cargo)
        setTimeout(() => {
          Swal.fire({
            text:this.api.mensaje.mensaje,
            icon:this.api.mensaje.icon,
            position:'top-end',
            timerProgressBar:true,
            showConfirmButton:false,
            toast:true,
            timer:5000
          })
        }, 500);
      } else if(result.isDenied){
        Swal.fire({
          text:'El cargo aun se conserva',
          icon:'success',
          position:'top-end',
          timerProgressBar:true,
          showConfirmButton:false,
          toast:true,
          timer:5000
        })
      }
    });
  }

  showInfo(cargo){
    this.cargo = cargo;
    this.info = true;
  }

}
