import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecepcionService } from 'src/app/services/recepcion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-conformidad',
  standalone: false,templateUrl: './nueva-conformidad.component.html',
  styleUrls: ['./nueva-conformidad.component.scss']
})
export class NuevaConformidadComponent {
  
  constructor(public recepcion:RecepcionService
  ){}
  
  
  @Input() nuevaConformidad:any;
  @Input() noConformidad:any;
  @Output() onCloseModal = new EventEmitter();


  public recepcion_selected;
  public material_selected;
  public observacion;


  Guardar(){
    let data = {
      observacion:this.noConformidad.observacion,
      recepcion:this.recepcion.recepciones[this.recepcion_selected],
      index_producto:this.noConformidad.index_producto,
      status:this.noConformidad.status,
    }

    this.recepcion.GuardarReclamos(data)
    setTimeout(() => {
      Swal.fire({
        title:'Se generó nueva <No conformidad>',
        icon:'success',
        showConfirmButton:false,
        timer:5000,
        toast:true,
        position:'top-end',
        timerProgressBar:true,
      })

      this.onCloseModal.emit();
    }, 1000);
  }



}
