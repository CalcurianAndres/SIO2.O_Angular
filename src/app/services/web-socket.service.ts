import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import io from 'socket.io-client'



@Injectable({
  providedIn: 'root'
})

export class WebSocketService {

  io = io('https://192.168.0.22:443', {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: true
  })

  constructor() { }

}

