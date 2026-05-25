import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FasesService } from 'src/app/services/fases.service';
import { MaquinasService } from 'src/app/services/maquinas.service';

@Component({
  selector: 'app-nueva-maquina',
  standalone: false,
  templateUrl: './nueva-maquina.component.html',
  styleUrls: ['./nueva-maquina.component.scss'],
})
export class NuevaMaquinaComponent implements OnChanges {
  constructor(
    public fases: FasesService,
    public api: MaquinasService,
  ) {}

  @Input() nueva: any;
  @Input() editar: any;
  @Input() data: any;
  @Input() fasesQueTrabaja: any = [];
  @Output() onCloseModal = new EventEmitter();
  @Output() onFinalizarTarea = new EventEmitter();

  public guardando: boolean = false;
  public faseSeleccionadaActual: any = '';
  public PinzasSeleccionadas: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nueva']?.currentValue === true || changes['editar']?.currentValue === true) {
      this.guardando = false;
    }
  }

  cerrar() {
    this.onCloseModal.emit();
  }

  addFase() {
    const fase = this.faseSeleccionadaActual;
    const existe = this.fasesQueTrabaja.find((x) => x.nombre === fase.nombre);
    if (!existe) {
      this.fasesQueTrabaja.push(fase);
      this.data.fases.push(fase._id);
    }
  }

  deleteFase(fase) {
    const existe = this.fasesQueTrabaja.findIndex((x) => x.nombre === fase.nombre);
    if (existe >= 0) {
      this.fasesQueTrabaja.splice(existe, 1);
      const index = this.data.fases.findIndex((x) => x === fase._id);
      this.data.fases.splice(index, 1);
    }
  }

  faseSeleccionada(e) {
    if (e.value != '#') {
      this.faseSeleccionadaActual = this.fases.fases[e.value];
    }
  }

  addPinza() {
    const pinza = this.PinzasSeleccionadas;
    const existe = this.data.pinzas.find((x) => x === pinza);
    if (!existe && pinza.trim()) {
      this.data.pinzas.push(pinza);
      this.PinzasSeleccionadas = '';
    }
  }

  deletePinza(n) {
    this.data.pinzas.splice(n, 1);
  }

  guardarMaquina() {
    this.guardando = true;
    this.api.guardarMaquinas(this.data);
    this.onFinalizarTarea.emit();
  }

  editarMaquina() {
    this.guardando = true;
    this.api.EditarMaquina(this.data);
    this.onFinalizarTarea.emit();
  }
}
