import { Component } from '@angular/core';
import { OproduccionService } from 'src/app/services/oproduccion.service';

@Component({
  selector: 'app-producto-terminado',
  templateUrl: './producto-terminado.component.html',
  styleUrls: ['./producto-terminado.component.scss']
})

export class ProductoTerminadoComponent {

  constructor(public api: OproduccionService) { }
  productos: Producto[] = [
    {
      nombre: 'Etiq. Mayonesa Mavesa',
      presentacion: '445g',
      unidades: 'Vidrio',
      ocs: [
        { id: '001', cantidad: 500000, preFacturada: true, facturada: true, seleccionada: false },
        { id: '002', cantidad: 500000, preFacturada: true, facturada: false, seleccionada: false }
      ]
    },
    {
      nombre: 'Etiq. Cerveza Regional',
      presentacion: '222mL',
      unidades: 'Lata',
      ocs: [
        { id: '003', cantidad: 200000, preFacturada: true, facturada: true, seleccionada: false }
      ]
    },
    {
      nombre: 'Est. Flips Chocolate',
      presentacion: '220g',
      unidades: 'Caja',
      ocs: [
        { id: '004', cantidad: 80000, preFacturada: false, facturada: false, seleccionada: false }
      ]
    }
  ];

  getTotal(producto: Producto): number {
    return producto.ocs.reduce((acc, oc) => acc + oc.cantidad, 0);
  }

  isEntregado(oc: OC): boolean {
    return oc.preFacturada && oc.facturada;
  }

  notificarDespacho(nombre: string) {
    alert(`Notificando despacho para: ${nombre}`);
  }
}

// product.model.ts
export interface OC {
  id: string;
  cantidad: number;
  preFacturada: boolean;
  facturada: boolean;
  seleccionada: boolean;
}

export interface Producto {
  nombre: string;
  presentacion: string;
  unidades: string;
  ocs: OC[];
}