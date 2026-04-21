import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HorariosService } from 'src/app/services/horarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-horario',
  standalone: false,templateUrl: './nuevo-horario.component.html',
  styleUrls: ['./nuevo-horario.component.scss']
})
export class NuevoHorarioComponent {

  constructor(public api:HorariosService){

  }

  @Input() nuevo:any;
  @Input() Horario:any
  @Output() onCloseModel = new EventEmitter();


  cerrar(){
    this.onCloseModel.emit()
  }

  nuevoHorario(){
    this.api.guardarHorarios(this.Horario);
    setTimeout(() => {
      Swal.fire({
        text:this.api.mensaje.mensaje,
        icon:this.api.mensaje.icon,
        timer:5000,
        showConfirmButton:false,
        toast:true,
        position:'top-end',
        timerProgressBar:true
      })

      this.cerrar()
    }, 1000);
  }

}
