import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-notifications',
  standalone:false,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit{
  
  @Input() visible = false;
  @Output() onCloseModal = new EventEmitter()

  public confirmacion:boolean = false;
  public solicitud:boolean = false;
  public devolucion = ''

  constructor(public api:NotificationsService){

  }

  ngOnInit(): void {
    
  }
  

  close() {
    this.onCloseModal.emit();
  }
}
