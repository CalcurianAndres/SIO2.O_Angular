import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CargosService } from 'src/app/services/cargos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-gestion',
  standalone: false,templateUrl: './nueva-gestion.component.html',
  styleUrls: ['./nueva-gestion.component.scss']
})
export class NuevaGestionComponent {

  constructor(public api:CargosService){

  }

  @Input() nuevo!:boolean;
  @Input() cargo:any;
  @Input() cargos:any;
  @Output() onCloseModarl = new EventEmitter();

  cerrar(){
    this.onCloseModarl.emit()
  }

  guardar(){
    this.api.NuevoCargo(this.cargo)
    this.cargo = {
      nombre:'',
      funcion:''
    }
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
      this.onCloseModarl.emit();
    }, 500);
  }

}
