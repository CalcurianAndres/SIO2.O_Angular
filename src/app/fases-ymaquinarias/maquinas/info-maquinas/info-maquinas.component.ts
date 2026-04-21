import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-info-maquinas',
  standalone: false,templateUrl: './info-maquinas.component.html',
  styleUrls: ['./info-maquinas.component.scss']
})
export class InfoMaquinasComponent {

  @Input() info:any;
  @Input() informacion:any;
  @Output() onCloseModal = new EventEmitter();


  cerrar(){
    this.onCloseModal.emit();
  }

}
