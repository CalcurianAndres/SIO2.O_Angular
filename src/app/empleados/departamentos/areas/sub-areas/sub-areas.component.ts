import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sub-areas',
  standalone: false,templateUrl: './sub-areas.component.html',
  styleUrls: ['./sub-areas.component.scss']
})
export class SubAreasComponent {
  constructor(public api:DepartamentosService){

  }
  @Input() Areas:any;
  @Input() Madre:any;
  @Input() Areas_Creadas:any;
  @Input() subunidad:any
  @Input() cargo_:any
  @Output() onCloseModal = new EventEmitter();
  @Output() Update = new EventEmitter();

  agregarSubArea(){

    this.cargo_.departamento  = this.Areas_Creadas[0].departamento;
    this.cargo_.sup = this.subunidad;
    this.api.NuevoSubunidad(this.cargo_)
    // this.Areas_Creadas.push({
    //   nombre:this.cargo_.nombre,
    //   departamento:this.Areas_Creadas[0].departamento,
    //   sup:this.subunidad
    // })

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
      this.cargo_ = {
        nombre:'',
        departamento:'',
        sup:''
      }
      this.onCloseModal.emit()
      this.Update.emit(this.Areas_Creadas[0].departamento);

    }, 500);
    
  }

 }
