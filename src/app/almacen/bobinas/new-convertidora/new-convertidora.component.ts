import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BobinasService } from 'src/app/services/bobinas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-convertidora',
  templateUrl: './new-convertidora.component.html',
  styleUrls: ['./new-convertidora.component.scss']
})
export class NewConvertidoraComponent {

  constructor( public api:BobinasService){

  }

  public data = {nombre:''}


  @Input() nueva;
  @Output() onCloseModal = new EventEmitter();


  cerrar(){
    this.onCloseModal.emit();
  }

  guardarData(){
    this.api.guardarConvertidora(this.data)
    setTimeout(() => {
        Swal.fire({
          title:this.api.mensaje.mensaje,
          icon:this.api.mensaje.icon,
          showConfirmButton:false,
          toast:true,
          position:'top-end',
          timer:5000,
          timerProgressBar:true
        })
        this.onCloseModal.emit()
    }, 1000);
  }



}
