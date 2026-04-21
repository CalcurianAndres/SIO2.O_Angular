import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-condicion',
  standalone: false,templateUrl: './condicion.component.html',
  styleUrls: ['./condicion.component.scss']
})
export class CondicionComponent {

  @Input() condicion!:boolean;
  @Input() recepcion!:any;
  @Input() condicion__:any;
  @Input() n!:number;
  @Input() grupo:any;
  @Input() trato:any
  @Output() onCloseModal = new EventEmitter();

  cerrar(){
   this.onCloseModal.emit();
  }
}
