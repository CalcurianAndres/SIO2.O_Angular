import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EtiquetasService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ImprimirEtiqueta(data) {
    const url = `${environment.apiUrl}/etiqueta-preparacion`;
    return this.http.post(url, data);
  }
}
