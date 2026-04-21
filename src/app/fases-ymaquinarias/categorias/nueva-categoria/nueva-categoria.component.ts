import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-nueva-categoria',
  standalone: false,templateUrl: './nueva-categoria.component.html',
  styleUrls: ['./nueva-categoria.component.scss']
})
export class NuevaCategoriaComponent {

  constructor(private api:CategoriasService){

  }

  @Input() nueva:any;
  @Input() editar:any;
  @Input() data:any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onFinalizarProceso = new EventEmitter();

  cerrar(){
    this.onCloseModal.emit()
  }

  guardar(){
    this.api.GuardarCategoria(this.data);
    this.onFinalizarProceso.emit();
  }
  
  editar_categoria(){
    this.api.EditarCategoria(this.data);
    this.onFinalizarProceso.emit();
  }

}
