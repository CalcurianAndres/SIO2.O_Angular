import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { TasasService } from '../../../services/tasas.service';

@Component({
  selector: 'app-historial-empleado',
  standalone: false,
  templateUrl: './historial-empleado.component.html',
  styleUrls: ['./historial-empleado.component.scss'],
})
export class HistorialEmpleadoComponent implements OnChanges, OnDestroy {
  @Input() historial: any;
  @Input() info_trabajador: any;
  @Output() onCloseModal = new EventEmitter();

  tasaActual: number | null = null;
  tasaInput: number | null = null;
  tasaRequiereManual: boolean = false;
  private tasaSub: Subscription | null = null;

  constructor(public tasas: TasasService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['historial'] && changes['historial'].currentValue === true) {
      this.tasas.obtenerTasaActual();
      this.tasaSub = this.tasas.tasaActual$.subscribe((tasa) => {
        this.tasaActual = tasa?.tasa ?? null;
        this.tasaRequiereManual = tasa?.manual ?? true;
        if (this.tasaActual && !this.tasaInput) {
          this.tasaInput = this.tasaActual;
        }
      });
    }

    if (changes['historial'] && changes['historial'].currentValue === false && this.tasaSub) {
      this.tasaSub.unsubscribe();
      this.tasaSub = null;
    }
  }

  ngOnDestroy(): void {
    this.tasaSub?.unsubscribe();
  }

  guardarTasaManual(): void {
    if (this.tasaInput && this.tasaInput > 0) {
      this.tasas.guardarTasa(this.tasaInput);
      this.tasaActual = this.tasaInput;
      this.tasaRequiereManual = false;
    }
  }

  calcularUSDHoy(sueldo: any): number {
    const tasa = this.tasaActual || 0;
    const s = parseFloat(String(sueldo).replace(/[^0-9.]/g, '')) || 0;
    if (!tasa || tasa <= 0 || !s || s <= 0) return 0;
    return s / tasa;
  }

  calcularDevaluacion(sueldo: any, tasaRegistro: any): number {
    const s = parseFloat(String(sueldo).replace(/[^0-9.]/g, '')) || 0;
    const tr = parseFloat(String(tasaRegistro).replace(/[^0-9.]/g, '')) || 0;
    if (!s || !tr || tr <= 0) return 0;
    const usdHistorico = s / tr;
    const usdHoy = this.calcularUSDHoy(sueldo);
    if (!usdHistorico || !usdHoy) return 0;
    return ((usdHistorico - usdHoy) / usdHistorico) * 100;
  }

  cerrar() {
    this.onCloseModal.emit();
  }
}
