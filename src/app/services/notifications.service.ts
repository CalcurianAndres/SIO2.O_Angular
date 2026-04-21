import { Injectable, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService{



  public notificaciones:any = [];
  private notificacionesCargadas = false; // Para detectar la primera carga
  
  constructor(public socket:WebSocketService,
              public login:LoginService
  ) {
    this.socket.io.emit("CLIENTE:SolicitarNotificaciones", this.login.usuario._id);

    this.socket.io.on("SERVER:Notificaciones", (nuevasNotificaciones: any[]) => {
        let nuevasRecibidas = 0;

        nuevasNotificaciones.forEach((nueva) => {
            // Si la notificación no está en la lista actual, agrégala
            if (!this.notificaciones.some(n => n._id === nueva._id)) {
                this.notificaciones.push(nueva);
                nuevasRecibidas++; // Contamos cuántas realmente son nuevas
            }
        });

        // Si NO es la primera carga y llegaron nuevas, suena
        if (this.notificacionesCargadas && nuevasRecibidas > 0) {
            this.reproducirSonido();
        }

        // Después de la primera carga, establecemos la variable en true
        this.notificacionesCargadas = true;
    });
   
  }


  reproducirSonido() {
    const audio = new Audio('../assets/sounds/notification.mp3');
    audio.play().catch(error => console.log("Error reproduciendo sonido:", error));
  }

  nuevaNotificacion(){
    let notificacion = {
      titulo:'Titulo de la notificacion',
      mensaje:'Esto es una notificacion de prueba'
    }
    this.socket.io.emit('CLIENTE:GuardarNotificacion', notificacion)
  }


  VerNotificacion(notificacionId: string) {
    // Encuentra la notificación y agrégale la clase CSS de salida
    let notificacionIndex = this.notificaciones.findIndex(n => n._id === notificacionId);

    if (notificacionIndex !== -1) {
        // Agregar la clase para animar la salida
        this.notificaciones[notificacionIndex].removing = true;

        // Esperar a que la animación termine antes de eliminarla del array
        setTimeout(() => {
            this.notificaciones.splice(notificacionIndex, 1);
        }, 500); // Debe coincidir con el tiempo de la animación CSS (0.5s)
    }

    // Emitir el evento al backend
    this.socket.io.emit('CLIENTE:NotificacionVista', { userId: this.login.usuario._id, notificacionId });
}
}
