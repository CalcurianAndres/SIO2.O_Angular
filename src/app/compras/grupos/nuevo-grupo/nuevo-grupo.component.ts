import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-nuevo-grupo',
  standalone: false,
  templateUrl: './nuevo-grupo.component.html',
  styleUrls: ['./nuevo-grupo.component.scss'],
})
export class NuevoGrupoComponent implements OnChanges {
  @Input() api: any;
  @Input() nuevo: any;
  @Input() editar: any;
  @Input() data: any;
  @Input() cargando!: boolean;
  @Input() trato: any;
  @Input() otro: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();

  nombre = '';
  parcial = false;
  guardando = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['nuevo']?.currentValue || changes['editar']?.currentValue) {
      this.guardando = false;
    }
  }

  nuevoGrupo() {
    this.guardando = true;
    const data = {
      nombre: this.nombre,
      parcial: this.parcial,
      icono: 'fa-cube',
      trato: this.trato,
      otro: this.otro,
    };
    this.api.GuardarGrupo(data);
    this.nombre = '';
    this.parcial = false;
    this.trato = false;
    this.otro = false;
    this.onCloseModal.emit();
  }

  cerrar() {
    this.nombre = '';
    this.parcial = false;
    this.onCloseModal.emit();
  }

  cerrar_() {
    this.nombre = '';
    this.parcial = false;
    this.onCloseModal_.emit();
  }

  verTrato(e: any) {
    this.trato = e.checked;
  }

  verOtro(e: any) {
    this.otro = e.checked;
  }

  EditarGrupo() {
    this.guardando = true;
    this.data.otro = this.otro;
    this.data.trato = this.trato;
    this.api.EditarGrupo(this.data);
    this.onCloseModal.emit();
  }
}
