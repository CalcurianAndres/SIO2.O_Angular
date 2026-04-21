import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EtiquetasService {

  constructor(private http:HttpClient,
    private router:Router) { }


    ImprimirEtiqueta(data){
      const url = `https://192.168.0.22/api/etiqueta-preparacion`
      return this.http.post(url,data)
    }
}
