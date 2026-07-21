import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root',
})
export class BobinasService {
  public convertidora!: any;
  public conversiones!: any;
  public bobinas!: any;
  public mensaje!: Mensaje;
  public conversionGuardada: any = null;

  constructor(private socket: WebSocketService) {
    this.buscarDatos();
  }

  buscarDatos() {
    this.socket.io.emit('CLIENTE:BuscarConvertidora');
    this.socket.io.on('SERVER:Convertidora', (data) => {
      this.convertidora = data;
    });

    this.socket.io.emit('CLIENTE:BuscarBobinas');
    this.socket.io.on('SERVER:Bobinas', (data) => {
      this.bobinas = data;
    });

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data;
    });

    this.socket.io.emit('CLIENTE:BuscarConversion');
    this.socket.io.on('SERVER: conversiones', (data) => {
      this.conversiones = data;
    });

    this.socket.io.on('SERVIDOR:ConversionGuardada', (data) => {
      this.conversionGuardada = data;
    });
  }

  guardarConvertidora(data: any) {
    this.socket.io.emit('CLIENTE:NuevaConvertidora', data);
  }

  eliminarConvertidora(data: any) {
    this.socket.io.emit('CLIENTE:EliminarConvertidora', data);
  }

  guardarBobina(data: any) {
    this.socket.io.emit('CLIENTE:NuevaBobina', data);
  }

  guardarConversion(data: any) {
    this.socket.io.emit('CLIENTE:NuevaConversion', data);
  }

  EditarBobinas(data: any) {
    this.socket.io.emit('CLIENTE:EditarBobinas', data);
  }

  ObtenerLotes(almacenId: any, material: any, ancho: any) {
    const lotesFiltrados = this.bobinas
      .filter((b: any) => {
        const bAlmacenId = b.almacen_id?._id || b.almacen_id;
        return String(bAlmacenId || null) === String(almacenId || null)
          && b.material._id === material
          && b.ancho === Number(ancho);
      })
      .map((b: any) => b.lote);

    const lotesUnicos = [...new Set(lotesFiltrados)];
    return lotesUnicos;
  }
}
