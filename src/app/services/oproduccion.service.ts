import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class OproduccionService {

  public orden!: any
  public asignaciones!: any
  public gestiones!: any;
  public ticket_amarillo!: any
  public ticket_rojo!: any
  public producto_terminado!: any
  public producto_terminado_agrupado!: any;
  public mensaje!: Mensaje

  constructor(public socket: WebSocketService) {
    this.onOrdenPoligrafica()
  }


  onOrdenPoligrafica() {

    this.socket.io.emit('CLIENTE:BuscarOrdenProduccion');

    this.socket.io.emit('CLIENTE:Asignaciones')

    this.socket.io.on('SERVER:OrdenProduccion', (data) => {
      this.orden = data;
    })

    this.socket.io.on('SERVER:Asignaciones', (data) => {
      this.asignaciones = data
    })

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.warn(data)
      this.mensaje = data
    });

    this.socket.io.emit('Cliente:Gestiones');
    this.socket.io.emit('CLIENTE:buscarProductoTerminado');

    this.socket.io.on('SERVER:Gestiones', (data) => {
      this.gestiones = data
    })

    this.socket.io.emit('CLIENTE:TicketAmarillo')

    this.socket.io.emit('CLIENTE:TicketRojo')

    this.socket.io.on('SERVER:TicketAmarillo', (data) => {
      this.ticket_amarillo = data;
    })

    this.socket.io.on('SERVER:TicketRojo', (data) => {
      this.ticket_rojo = data;
    })

    this.socket.io.on('SERVIDOR:enviarProductoTerminado', (data) => {
      this.producto_terminado = data
    })

    this.socket.io.on('SERVIDOR:enviarProductoTerminadoAgrupado', (data) => {
      this.producto_terminado_agrupado = data
    })


  }

  buscarTicketRojoPorOrden(op) {
    return this.ticket_rojo.filter(tr => tr.op._id === op)
  }

  buscarTicketRojoPorCerrar(op) {
    let tickets = this.buscarTicketRojoPorOrden(op)
    return tickets.filter(t => !t.cerrado === false)
  }

  buscarTicketAmarilloPorOrden(op) {
    return this.ticket_amarillo.filter(ta => ta.op._id === op)
  }

  buscarAsignacionPorOrden(op: any) {
    return this.asignaciones.filter(a => a.op._id === op._id)
  }

  guardarOrdenProduccion(data, requisicion) {
    this.socket.io.emit('CLIENTE:NuevaOrdenProduccion', data, requisicion)
  }

  OrdenesPorAsignar() {
    if (this.orden) {
      return this.orden.filter(orden =>
        orden.status === 'Por asignar'
      )
    }
  }

  EditarOrden(data) {
    this.socket.io.emit('CLIENTE:ActualizarOrdenProduccion', data)
  }

  EditarOrden_(data) {
    this.socket.io.emit('CLIENTE:ActualizarOrdenProduccion_', data)
  }


  NuevaGestion(data) {
    this.socket.io.emit('CLIENTE:NuevaGestion', data)
  }

  GestionesDeFase(orden: any, fase: any) {
    return this.gestiones.filter(g => g.orden._id === orden._id && g.fase === fase)
  }


  nuevoTicketAmarillo(data) {
    this.socket.io.emit('CLIENTE:NuevoTicketAmarillo', data)
  }

  nuevoTicketRojo(data) {
    this.socket.io.emit('CLIENTE:NuevoTicketRojo', data)
  }

  etiquetarProducto(data) {
    this.socket.io.emit('CLIENTE:NuevoProductoTerminado', data)
  }

}
