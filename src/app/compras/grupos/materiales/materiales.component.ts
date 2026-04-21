import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-materiales',
  standalone: false,templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss']
})
export class MaterialesComponent {
  @Input() material:any;
  @Input() material_selected:any
  @Output() onCloseModal = new EventEmitter();
  public Edicion:boolean[] = []
  public Pantone:boolean[] = []
  public fabricantes:any;
  public color:string = ''
  public ubicaciones:any


  constructor(public api:MaterialesService,
              public fabricante:FabricantesService){}

  cerrar(){
    this.onCloseModal.emit()
  }

  agregarOrigen(e:any, i:number){
    this.material_selected[i].origen = e.value;
  }

  EdiciondeColor(e:any,i:number){
    if(e.value === '#'){
      this.Pantone[i] = true;
    }
  }

  Pantone_(i:number){
    this.material_selected[i].color='A'
    this.Pantone[i]=false;
  }

  CambiarFabricante(e:any, i:number){
    this.material_selected[i].fabricante = this.fabricantes[e.value]
    this.ubicaciones = this.fabricantes[e.value].origenes
  }

  colores(color:string){

    switch(color){
      case "A":
        return 'Amarillo'
      break;
      case "C":
        return 'Cyan'
      break;
      case "M":
        return 'Magenta'
      break;
      case "K":
        return 'Negro'
      break;
      default:
        return null
      break;
  }

}

editar(i:number){
  this.Edicion[i] = true;
  this.fabricantes = this.fabricante.buscarFabricanteDe(this.material_selected[i].grupo)
}

confirmar(i:number){
  this.Edicion[i] = false;
  this.api.guardarMaterial(this.material_selected[i])
  setTimeout(()=>{
    Swal.fire({
      title: this.api.mensaje.mensaje,
      icon: this.api.mensaje.icon,
      timer: 5000,
      showConfirmButton: false,
      timerProgressBar: true,
      toast: true,
      position: 'top-end'
    });
  },1000)

}

EliminarMaterial(id:any,i:number){
  Swal.fire({
    title:'¿Eliminar este material?',
    text:'El material se eliminará de manera permanente',
    icon:'question',
    showCancelButton:true,
    confirmButtonColor:'#48c78e',
    confirmButtonText:'Eliminar',
    cancelButtonText:'Cancelar',
    cancelButtonColor:'#f03a5f'
  }).then(resultado => {

    if(resultado.isConfirmed){

      this.api.EliminarMaterial(id)
      this.material_selected.splice(i,1)
      setTimeout(() => {
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

}
