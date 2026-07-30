import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ServiciosService } from 'src/app/services/servicios.service';

@Component({
  selector: 'app-nuevo-servicio',
  standalone: false,
  templateUrl: './nuevo-servicio.component.html',
  styleUrls: ['./nuevo-servicio.component.scss'],
})
export class NuevoServicioComponent implements OnChanges {
  @Input() nuevo!: boolean;
  @Input() editar!: boolean;
  @Input() data: any;
  @Input() cargando!: boolean;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();

  public nombre: string = '';
  public guardando: boolean = false;

  get formValido(): boolean {
    if (this.guardando) return false;
    if (this.nuevo) {
      return !!this.nombre;
    } else {
      return !!this.data?.nombre;
    }
  }

  constructor(public api: ServiciosService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nuevo']?.currentValue) {
      this.guardando = false;
      this.nombre = '';
    }
    if (changes['editar']?.currentValue) {
      this.guardando = false;
    }
  }

  cerrar() {
    this.nombre = '';
    this.onCloseModal.emit();
  }

  cerrar_() {
    this.nombre = '';
    this.onCloseModal_.emit();
  }

  GuardarServicio() {
    this.guardando = true;
    this.api.agregarServicio({ nombre: this.nombre });
    this.cerrar();
  }

  EditarServicio() {
    this.guardando = true;
    this.api.editarServicio(this.data);
    this.cerrar();
  }
}
