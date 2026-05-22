import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import io from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  io = io(environment.wsUrl, {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: true,
  });

  constructor() {}
}
