import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-nueva-categoria',
  standalone: false,
  templateUrl: './nueva-categoria.component.html',
  styleUrls: ['./nueva-categoria.component.scss'],
})
export class NuevaCategoriaComponent implements OnChanges {
  constructor(private api: CategoriasService) {}

  @Input() nueva: any;
  @Input() editar: any;
  @Input() data: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onFinalizarProceso = new EventEmitter();

  public guardando: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nueva']?.currentValue === true || changes['editar']?.currentValue === true) {
      this.guardando = false;
    }
  }

  cerrar() {
    this.onCloseModal.emit();
  }

  guardar() {
    this.guardando = true;
    this.api.GuardarCategoria(this.data);
    this.onFinalizarProceso.emit();
  }

  editar_categoria() {
    this.guardando = true;
    this.api.EditarCategoria(this.data);
    this.onFinalizarProceso.emit();
  }
}
