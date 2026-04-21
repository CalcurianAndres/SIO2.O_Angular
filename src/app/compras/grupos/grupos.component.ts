import { Component, OnInit } from '@angular/core';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-grupos',
  standalone: false,templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss']
})
export class GruposComponent implements OnInit {
  nombre = "";
  parcial = "false";
  icono = "";
  nuevo:boolean = false;
  editar:boolean = false;
  material:boolean = false;
  nuevo_material:boolean = false;
  cargando:boolean = false;
  data:any = [];
  lineas:number = 0;
  material_selected = []
  trato = false;
  otro = false;

  constructor(public api:GruposService,
              public materiales:MaterialesService){

  }

  ngOnInit(): void {

  }

  cargando_(){
    this.cargando = true;
    this.nuevo = false;
  }

  AgregarNuevo(){
    this.nuevo = true;
    this.trato = false;
    this.otro = false;
  }

  filas(){
    return Math.ceil(this.api.grupos.length / 5)
  }

  eliminarGrupo(id:any){
    Swal.fire({
      title:'¿Eliminar este grupo?',
      text:'El grupo se eliminará de manera permanente',
      icon:'question',
      showCancelButton:true,
      confirmButtonColor:'#48c78e',
      confirmButtonText:'Eliminar',
      cancelButtonText:'Cancelar',
      cancelButtonColor:'#f03a5f'
    }).then(resultado => {

      if(resultado.isConfirmed){

        this.cargando = true
        this.api.EliminarGrupo(id)
        setTimeout(() => {
          this.cargando = false;
          Swal.fire({
            title: this.api.mensaje.mensaje,
            icon: this.api.mensaje.icon,
            timer: 5000,
            showConfirmButton: false,
            timerProgressBar: true,
            toast: true,
            position: 'top-end'
          });
        }, 1000);

      }
    }).catch(err => {
      return err
    })
  }

  EditarGrupo(nombre:any, icono:any, parcial:any, id:any, trato, otro){
    this.data = {
      id,
      nombre,
      icono,
      parcial
    }

    this.trato = trato;
    this.otro = otro

    this.editar = true;
  }

  cerrarModal(){
    this.cargando = true
    this.nuevo = false;
    this.editar = false;
    
    setTimeout(() => {
      this.cargando = false;
      Swal.fire({
        title: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end'
      });
    }, 1000);
  }

  cerrarModal_(){
    this.nuevo = false;
    this.editar = false;
    this.nuevo_material = false;
  }

  NuevoMaterial(){
    this.nuevo_material = true;
  }

  cerrarNuevoMaterial(){
    this.nuevo_material = false;
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
      Swal.fire({
        title: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end'
      });
    }, 1000);
  }

  buscarMaterial(grupo:number){
    const id = this.api.grupos[grupo]._id
    this.material_selected = this.materiales.filtrarGrupos(id)
    this.material = true;
  }

  cerrarMateriales(){
    this.material = false;
  }

}
