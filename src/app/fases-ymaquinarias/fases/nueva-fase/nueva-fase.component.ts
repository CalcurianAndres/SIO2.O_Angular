import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FasesService } from 'src/app/services/fases.service';

@Component({
  selector: 'app-nueva-fase',
  standalone: false,
  templateUrl: './nueva-fase.component.html',
  styleUrls: ['./nueva-fase.component.scss'],
})
export class NuevaFaseComponent implements OnChanges {
  constructor(private api: FasesService) {}

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

  guardarFase() {
    this.guardando = true;
    this.api.GuardarFase(this.data);
    this.onFinalizarProceso.emit();
  }

  editarFase() {
    this.guardando = true;
    this.api.EditarFase(this.data);
    this.onFinalizarProceso.emit();
  }
}
