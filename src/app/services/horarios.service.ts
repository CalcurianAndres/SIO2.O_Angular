import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Mensaje } from '../compras/models/modelos-compra';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  public horarios:any;
  public calendario:any = [];
  public mensaje!:Mensaje;

  constructor(private socket:WebSocketService) {
    this.onHorarios()
  }

  onHorarios(){
    this.socket.io.emit('CLIENTE:BuscarHorarios')
    this.socket.io.emit('CLIENTE:emitirCalendarios')
    
    // Escucha el evento 'SERVIDOR:enviarMensaje'
    this.socket.io.on('SERVIDOR:enviaMensaje', (data) => {
      console.error(data.mensaje);
      this.mensaje = data
    });


    this.socket.io.on('SERVER:Horarios', (data) =>{
      this.horarios = data;
      console.log(this.horarios)
    })

    this.socket.io.on('SERVIDOR:EmitirCalendarios', (data) => {
      this.calendario = data;
      console.log(this.calendario)
    })
  }


  guardarHorarios(data){
    this.socket.io.emit('CLIENTE:NuevoHorario', data)
  }

  eliminarHorario(data){
    this.socket.io.emit('CLIENTE:EliminarHorario', data)
  }

  actualizarDia(data){
    this.socket.io.emit('CLIENTE:ActualizarDia', data)
  }

  guardarCalendario(data){
    console.log('llamado')
    this.socket.io.emit('CLIENTE:AgregarDiaNoLaboral',data)
  }

}
