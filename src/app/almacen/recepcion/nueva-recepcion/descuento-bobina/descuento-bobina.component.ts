import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BobinasService } from 'src/app/services/bobinas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-descuento-bobina',
  templateUrl: './descuento-bobina.component.html',
  styleUrls: ['./descuento-bobina.component.scss']
})
export class DescuentoBobinaComponent {


  descuentos: number[] = [];
  public descuento_total = 0
  public hojas_deberia = 0

  @Input() descuento:any;
  @Input() Lote:any
  @Input() conversion:any
  @Input() entregada:any
  @Output() onCloseModal = new EventEmitter()
  @Output() onGuardarRecepcion = new EventEmitter()

  constructor(
    public api:BobinasService
  ){

  }



  cerrar(){
    this.onCloseModal.emit();
  }

  bobinasPorLote(){
    return this.api.bobinas.filter((b:any)=> b.lote === this.Lote && Number(b.neto) > 0)
  }

 actualizarDescuentoTotal() {
  this.descuento_total = this.descuentos.reduce((total, val) => {
    const num = parseFloat(val as any);
    return total + (isNaN(num) ? 0 : num);
  }, 0);

  // Llamar a calcularPeso después de actualizar el total
  this.calcularPeso();
}

shownInfo(){
  console.log(this.entregada)
}

calcularPeso() {
  const conversion = this.api.conversiones[this.conversion];

  if (!conversion || !this.bobinasPorLote()[0]?.material) {
    console.warn('Datos insuficientes para calcular peso');
    return;
  }

  const { largo, ancho } = conversion; // en cm
  const gramaje = this.bobinasPorLote()[0].material.gramaje; // en g/m²
  const pesoToneladas = this.descuento_total;
  const pesoGramos = pesoToneladas * 1_000_000; // 1 tonelada = 1,000,000 gramos

  // Superficie de una hoja en m² (cm² a m²)
  const superficieHoja = (largo / 100) * (ancho / 100); // m²

  // Peso de una hoja individual en gramos
  const pesoPorHoja = superficieHoja * gramaje;

  // Total de hojas
  const totalHojas = pesoGramos / pesoPorHoja;

  this.hojas_deberia = totalHojas;

  console.log({
    largo,
    ancho,
    gramaje,
    pesoToneladas,
    pesoGramos,
    pesoPorHoja,
    tipo:this.bobinasPorLote()[0].material.grupo,
    totalHojas: Math.floor(totalHojas),
  });
}


  descontarBobinas() {
   const bobinasActualizadas = this.bobinasPorLote().map((bobina: any, i: number) => {
    const descuento = this.descuentos[i] || 0;
    return {
      _id: bobina._id, // MongoDB necesita el _id para actualizar
      neto: bobina.neto - descuento
    };
  });

  this.api.EditarBobinas(bobinasActualizadas)
  this.onGuardarRecepcion.emit();
  
  // Opcional: limpiar descuentos después de descontar
  this.descuentos = [];
  this.cerrar();
  setTimeout(() => {
    Swal.fire({
      text:this.api.mensaje.mensaje,
      icon:this.api.mensaje.icon,
      timer:5000,
      toast:true,
      position:'top-end',
      showConfirmButton:false,
      timerProgressBar:true
    })
  }, 1000);
}

}
