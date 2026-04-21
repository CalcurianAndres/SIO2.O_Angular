import { Component, EventEmitter, Input, Output } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado',
  standalone: false,templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss']
})
export class ListadoComponent {
  @Input() listado!:boolean;
  @Input() lista:any;
  @Input() fabricacion!:string[];
  @Input() n!:number;
  @Output() onCerrarModal = new EventEmitter();

  currentDate = new Date();
  year = this.currentDate.getFullYear();
  month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
  day = String(this.currentDate.getDate()).padStart(2, '0');
  Hoy = `${this.year}-${this.month}-${this.day}`;

  cerrar(){
    this.onCerrarModal.emit();
  }

  verificarCodigoUnico(codigo, i): void {
    
    let existencia = this.lista.filter((x:any, n:number) => x.codigo === codigo.value && n != i)
    console.log(existencia)
    if(existencia.length > 0){
      Swal.fire({
        icon:'error',
        text:'El codigo debe ser único.',
        timer:5000,
        timerProgressBar:true,
        toast:true,
        position:'top-end',
        showConfirmButton:false
      })
      this.lista[i].codigo = ''
    }
  }  

}
