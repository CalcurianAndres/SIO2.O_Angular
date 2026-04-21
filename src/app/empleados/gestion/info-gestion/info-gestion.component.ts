import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-info-gestion',
  standalone: false,templateUrl: './info-gestion.component.html',
  styleUrls: ['./info-gestion.component.scss']
})
export class InfoGestionComponent {

  @Input() info:any;
  @Input() cargo:any;
  @Output() onCloseModal = new EventEmitter();

  cerrar(){
    this.onCloseModal.emit();
  }
}
