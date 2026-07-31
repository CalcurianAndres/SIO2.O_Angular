import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BobinasService } from 'src/app/services/bobinas.service';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-descuento-rapido',
  standalone: false,
  templateUrl: './descuento-rapido.component.html',
  styleUrls: ['./descuento-rapido.component.scss'],
})
export class DescuentoRapidoComponent {
  @Input() mostrar = false;
  @Input() bobina: any = null;
  @Output() onCloseModal = new EventEmitter();
  @Output() onDescuento = new EventEmitter();

  public hojas: number = 0;
  public conversionSeleccionada: any = null;
  public pesoCalculado: number = 0;

  constructor(
    public api: BobinasService,
    private login: LoginService,
  ) {}

  // ── Conversiones relacionadas con la bobina ──

  get conversionesRelacionadas(): any[] {
    if (!this.bobina || !this.api.conversiones) return [];
    return this.api.conversiones.filter(
      (c: any) => c.lote === this.bobina.lote && String(c.material?._id || c.material) === String(this.bobina.material?._id || this.bobina.material),
    );
  }

  // ── Datos de la conversión seleccionada ──

  get gramaje(): number {
    return this.bobina?.material?.gramaje || 0;
  }

  get largo(): number {
    return Number(this.conversionSeleccionada?.largo || 0);
  }

  get ancho(): number {
    return Number(this.conversionSeleccionada?.ancho || this.bobina?.ancho || 0);
  }

  get hojasConversion(): number {
    return Number(this.conversionSeleccionada?.cantidad || 0);
  }

  // ── Hojas ya consumidas en esta conversión ──

  get hojasYaConsumidas(): number {
    if (!this.conversionSeleccionada || !this.api.bobinas) return 0;
    return this.api.bobinas
      .filter((b: any) => b.lote === this.conversionSeleccionada.lote && Number(b.hojas_consumidas) > 0)
      .reduce((sum: number, b: any) => sum + Number(b.hojas_consumidas), 0);
  }

  get hojasRestantes(): number {
    return this.hojasConversion - this.hojasYaConsumidas;
  }

  get totalHojasTrasDescuento(): number {
    return this.hojasYaConsumidas + this.hojas;
  }

  get excedeConversion(): boolean {
    return this.totalHojasTrasDescuento > this.hojasConversion;
  }

  get quedanHojasSinUsar(): boolean {
    return this.hojas > 0 && this.totalHojasTrasDescuento < this.hojasConversion;
  }

  // ── Histórico de descuentos para la conversión seleccionada ──

  get historialConversion(): any[] {
    if (!this.bobina?.historial_descuentos || !this.conversionSeleccionada) return [];
    return this.bobina.historial_descuentos
      .filter((h: any) => h.conversion === this.conversionSeleccionada._id)
      .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  get pesoRestanteBobina(): number {
    return Math.max(0, Number(this.bobina?.neto || 0) - this.pesoCalculado);
  }

  // ── Cálculo de peso ──

  calcularPeso() {
    if (!this.hojas || !this.gramaje || !this.largo || !this.ancho) {
      this.pesoCalculado = 0;
      return;
    }
    const superficieHoja = (this.largo / 100) * (this.ancho / 100);
    const pesoPorHoja = superficieHoja * this.gramaje;
    const pesoGramos = this.hojas * pesoPorHoja;
    this.pesoCalculado = Math.round((pesoGramos / 1_000_000) * 10000) / 10000;
  }

  // ── Stock por conversión ──

  restantesConversion(c: any): number {
    if (!this.api.bobinas) return Number(c.cantidad);
    const consumidas = this.api.bobinas
      .filter((b: any) => b.lote === c.lote && Number(b.hojas_consumidas) > 0)
      .reduce((sum: number, b: any) => sum + Number(b.hojas_consumidas), 0);
    return Math.max(0, Number(c.cantidad) - consumidas);
  }

  seleccionarConversion(event: any) {
    const idx = event.target.value;
    this.conversionSeleccionada = this.conversionesRelacionadas[idx] || null;
    if (this.conversionSeleccionada) {
      const restantes = this.hojasRestantes;
      this.hojas = restantes > 0 ? restantes : 0;
    }
    this.calcularPeso();
  }

  cerrar() {
    this.mostrar = false;
    this.hojas = 0;
    this.pesoCalculado = 0;
    this.conversionSeleccionada = null;
    this.onCloseModal.emit();
  }

  async descontar() {
    if (!this.bobina || this.pesoCalculado <= 0) return;

    // Validación: excede el peso actual de la bobina
    if (this.pesoCalculado > Number(this.bobina.neto)) {
      Swal.fire({
        text: 'El descuento excede el peso actual de la bobina',
        icon: 'warning',
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
      return;
    }

    // Advertencia: excede la conversión
    if (this.excedeConversion) {
      const result = await Swal.fire({
        title: 'Excede el stock de la conversión',
        html: `Esta conversión tiene <b>${this.hojasConversion}</b> hojas.<br/>Ya se consumieron <b>${this.hojasYaConsumidas}</b> y está intentando descontar <b>${this.hojas}</b>.<br/>Total: <b>${this.totalHojasTrasDescuento}</b> hojas.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#48c78e',
        confirmButtonText: 'Continuar de todos modos',
        cancelButtonText: 'Cancelar',
      });
      if (!result.isConfirmed) return;
    }

    // Advertencia: quedan hojas sin usar
    if (this.quedanHojasSinUsar) {
      const result = await Swal.fire({
        title: '¿Quedan hojas sin usar?',
        html: `Se descontarán <b>${this.hojas}</b> hojas de <b>${this.hojasConversion}</b>.<br/>Quedarán <b>${this.hojasConversion - this.totalHojasTrasDescuento}</b> hojas sin usar en esta conversión.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#48c78e',
        confirmButtonText: 'Continuar de todos modos',
        cancelButtonText: 'Cancelar',
      });
      if (!result.isConfirmed) return;
    }

    // Construir entry del histórico
    const historialEntry = {
      fecha: new Date(),
      hojas: this.hojas,
      peso: this.pesoCalculado,
      usuario: this.login.usuario?.Nombre || 'Sistema',
      conversion: this.conversionSeleccionada?._id || null,
    };

    // Aplicar descuento
    const netoActual = Number(this.bobina.neto);
    const nuevoNeto = Math.round((netoActual - this.pesoCalculado) * 10000) / 10000;

    const datos = [{
      _id: this.bobina._id,
      neto: nuevoNeto,
      hojas_consumidas: (Number(this.bobina.hojas_consumidas) || 0) + this.hojas,
      historial_entry: historialEntry,
    }];
    this.api.EditarBobinas(datos);
    this.onDescuento.emit();

    Swal.fire({
      text: `Descuento de ${this.pesoCalculado} t (${this.hojas} hojas) aplicado`,
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
    });

    this.cerrar();
  }
}
