import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  readonly VAPID_PUBLIC_KEY = 'BK8-LHGrNskUsUko51yuMVO5O0on6LDwZMRMTLBZfAAnLpp1JFNbN983I5cE7ZEF0Xffk0JpU3tGlJtjhzQ03PA'; // Clave pública generada

  constructor(private swPush: SwPush, private http: HttpClient) {}

  subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('assets/push-notifications-worker.js').then(registration => {
        registration.pushManager.subscribe({
          userVisibleOnly: true, // Asegura que las notificaciones sean visibles
          applicationServerKey: this.urlBase64ToUint8Array('BK8-LHGrNskUsUko51yuMVO5O0on6LDwZMRMTLBZfAAnLpp1JFNbN983I5cE7ZEF0Xffk0JpU3tGlJtjhzQ03PA')
        }).then(subscription => {
          // Envía la suscripción al backend para guardarla
          this.sendSubscriptionToBackend(subscription);
        }).catch(err => {
          console.error('Error al suscribir al push:', err);
        });
      });
    }
  }

  private sendSubscriptionToBackend(subscription: PushSubscription) {
    // Aquí envías la suscripción al backend
    fetch('https://192.168.0.22/api/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      console.log('Suscripción enviada al backend:', response);
    });
  }

  // Convierte la clave VAPID pública a un ArrayBuffer
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

}
