import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-areas',
  standalone: false,templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.scss']
})
export class AreasComponent {

  constructor(public api:DepartamentosService){}


  @Input() Areas:any;
  @Input() Areas_creadas;
  @Output() onCloseModal = new EventEmitter();
  @Output() onNuevaSubUnidad = new EventEmitter();
  @Output() Update = new EventEmitter();
  @Output() onEditarSubUnidad = new EventEmitter();
  @Output() onEditarSubSubUnidad = new EventEmitter();

  public subareas = false;
  public subunidad = ''
  public cargo_:any = {
    nombre:'',
    departamento:'',
    sup:''
  }


  obtenerSubcargos(superior: string, departamento:string): any {
    return this.Areas_creadas.filter(cargo => cargo.sup === superior && cargo.departamento === departamento);
  }

  upgrade(update){
    this.Update.emit(update)
  }

  EditarSubUnidad(area){
    this.onEditarSubUnidad.emit(area)
  }

  EditarSubSubUnidad(subarea, area){
    this.cargo_ = subarea;
    this.subareas = true; 
    this.Areas = false;
    this.subunidad = area.nombre
  }

  EliminarSubSubUnidad(subarea){
    Swal.fire({
      icon:'question',
      title:'¿Eliminar subunidad?',
      text:'¿Estas seguro que quieres eliminar esta subunidad?. El mismo no podra ser recuperdo luego.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Eliminar",
      denyButtonText: `No eliminar`,
      confirmButtonColor:'#f03a5f',
      denyButtonColor:'#48c78e'
    }).then((result) => {
      if(result.isConfirmed){
        this.api.EliminarSubUnidad(subarea)
        setTimeout(() => {
          this.Update.emit(subarea.departamento)
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
          text:'La subunidad aun se conserva',
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

}
