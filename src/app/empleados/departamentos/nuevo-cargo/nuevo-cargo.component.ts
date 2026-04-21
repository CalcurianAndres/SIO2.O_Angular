import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-cargo',
  standalone: false,templateUrl: './nuevo-cargo.component.html',
  styleUrls: ['./nuevo-cargo.component.scss']
})
export class NuevoCargoComponent {

  constructor(public api:DepartamentosService){

  }

  @Input() cargo:any;
  @Input() departamentos:any;
  @Input() Cargos:any;
  @Input() cargo_:any;
  @Input() Departamento:any
  @Output() onCloseModal = new EventEmitter();
  @Output() Update = new EventEmitter();

  public cargosFiltrados:any = []

  guardar(){
    this.cargo_.departamento = this.Departamento;
    this.api.NuevoSubunidad(this.cargo_)
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
    this.Update.emit(this.Departamento);
    this.cargo_ = {
      nombre:'',
      departamento:'',
      sup:'#'
    }
    this.onCloseModal.emit();
    }, 500);
  }

  filtrarCargos(Departamento){
    this.cargosFiltrados = this.api.subunidad.filter(cargo => cargo.departamento === Departamento.value)
  }

}
