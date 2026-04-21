import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-departamento',
  standalone: false,templateUrl: './nuevo-departamento.component.html',
  styleUrls: ['./nuevo-departamento.component.scss']
})
export class NuevoDepartamentoComponent {

  constructor(public api:DepartamentosService){}

  @Input() nuevo:any
  @Input() unidades:any;
  @Input() unidad:any
  @Output() onCloseModal = new EventEmitter();



  cerrar_(){
    this.onCloseModal.emit();
  }

  guardar(){
    this.api.NuevoDepartamento(this.unidad)
    this.unidad = {
      nombre:'',
      superior:'',
      color:''
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
      this.cerrar_();
    }, 500);
  }
}
