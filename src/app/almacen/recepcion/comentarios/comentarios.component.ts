import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { RecepcionService } from 'src/app/services/recepcion.service';

@Component({
  selector: 'app-comentarios',
  standalone: false,templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.scss']
})
export class ComentariosComponent {

  constructor(public api:RecepcionService, 
              public login:LoginService
  ){
    this.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}` 
  }

  @Input() comentarios:any;
  @Input() recepcion_id:any;
  @Output() onCloseModal = new EventEmitter();
  public usuario = ''


  messages = [
    { name: 'Usuario 1', date: new Date(), text: 'Hola, ¿cómo estás?', isMine: false },
    { name: 'Yo', date: new Date(), text: 'Estoy bien, gracias.', isMine: true },
    { name: 'Usuario 1', date: new Date(), text: 'Qué bueno. ¿Qué has estado haciendo?', isMine: false },
  ];

  newMessage: string = '';

  sendMessage() {
    let data = {
      usuario:`${this.login.usuario.Nombre} ${this.login.usuario.Apellido}` ,
      mensaje:this.newMessage,
      recepcion:this.recepcion_id
    }
    this.api.guardarComentarios(data)
    if (this.newMessage.trim()) {
      this.messages.push({
        name: 'Yo',
        date: new Date(),
        text: this.newMessage,
        isMine: true
      });
      this.newMessage = '';
    }
  }

  cerrar(){
    this.onCloseModal.emit();
  }

  verificarUsuario(usuario){
    if(usuario == this.usuario){
      return true;
    }else{
      return false;
    }
  }
}
