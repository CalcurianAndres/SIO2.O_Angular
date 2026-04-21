import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class BobinasService {
  
  public convertidora!:any;
  public conversiones!:any;
  public bobinas!:any;
  public mensaje!:Mensaje

  constructor(private socket:WebSocketService) { 

    this.buscarConvertidora();
  }


  buscarConvertidora(){
    this.socket.io.emit('CLIENTE:BuscarConvertidora')

    this.socket.io.on('SERVER:Convertidora', (data)=>{
      this.convertidora = data;
      console.log(this.convertidora)
    })

    this.socket.io.emit('CLIENTE:BuscarBobinas')

    this.socket.io.on('SERVER:Bobinas', (data)=>{
      this.bobinas = data;
    })

    this.socket.io.on('SERVER:Convertidora', (data)=>{
      this.convertidora = data;
    })

    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      this.mensaje = data
    });

    this.socket.io.emit('CLIENTE:BuscarBobinas')

    this.socket.io.on('SERVER:Bobinas', (data)=>{
      this.bobinas = data;
    })

    this.socket.io.emit('CLIENTE:BuscarConversion')

    this.socket.io.on('SERVER: conversiones', (data)=>{
      this.conversiones = data;
    })

  }

  guardarConvertidora(data:any){
    this.socket.io.emit('CLIENTE:NuevaConvertidora', data)
  }

  guardarBobina(data:any){
    this.socket.io.emit('CLIENTE:NuevaBobina', data)
  }

  bobinaPorConvertidora(conv:any){
    return this.bobinas.filter((b:any) => b.convertidora === conv)
  }

  guardarConversion(data:any){
    this.socket.io.emit('CLIENTE:NuevaConversion', data)
  }

  EditarBobinas(data:any){
    this.socket.io.emit('CLIENTE:EditarBobinas', data)
  }

  ObtenerLotes(convertidora: any, material: any, ancho: any) {
    const lotesFiltrados = this.bobinas
    .filter((b: any) =>
      b.convertidora === convertidora &&
      b.material._id === material &&
      b.ancho === Number(ancho)
    )
    .map((b: any) => b.lote);

  // Eliminar duplicados por el _id del lote
  const lotesUnicos = lotesFiltrados.filter(
    (lote: any, index: number, self: any[]) =>
      self.findIndex(l => l._id === lote._id) === index
  );

  return lotesUnicos;
  }



}
