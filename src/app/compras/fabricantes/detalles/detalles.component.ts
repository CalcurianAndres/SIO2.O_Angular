import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Fabricante, Fabricante_populated } from '../../models/modelos-compra';

@Component({
  selector: 'app-detalles',
  standalone: false,templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.scss']
})
export class DetallesComponent {
  @Input() detalle!:boolean;
  @Input() fabricante!:Fabricante_populated;
  @Output() onClickClose = new EventEmitter();


  cerrar(){
    this.onClickClose.emit()
  }

}
