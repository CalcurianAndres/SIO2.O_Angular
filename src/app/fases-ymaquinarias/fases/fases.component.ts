import { Component } from '@angular/core';
import { FasesService } from 'src/app/services/fases.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fases',
  standalone: false,templateUrl: './fases.component.html',
  styleUrls: ['./fases.component.scss']
})
export class FasesComponent {

  constructor(public api:FasesService,
              public maquinas:MaquinasService){}

  public data = {
    nombre:'',
    descripcion:''
  }
  public informacion:any = ''
  public machines:any = ''

  public nueva:boolean = false
  public editar:boolean = false
  public info:boolean = false

  nueva_fase(){
    this.nueva = true;
  }

  filas(){
    return Math.ceil(this.api.fases.length / 5)
  }

  cerrarSimple(){
    this.nueva = false;
    this.editar = false;
    this.data = {
      nombre:'',
      descripcion:''
    }
  }

  cerrar(){
    this.nueva = false;
    this.editar = false;
    this.data = {
      nombre:'',
      descripcion:''
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

  editarFase(fase){
    this.data = fase;
    this.editar = true;
  }


  verInfo(data){
    this.info = true;
    this.informacion = data;
    this.machines = this.maquinas.buscarMaquinaPorFases(data._id);
  }

  eliminarMaquina(i){
    // console.log(i)
    Swal.fire({
      title: "¿Quieres eliminar esta fase?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonColor:'#48c78e',
      confirmButtonText: "Eliminar",
      denyButtonText: `No Eliminar`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.api.eliminarFase(i._id);
        this.cerrar();
      }
    });
  }


}
