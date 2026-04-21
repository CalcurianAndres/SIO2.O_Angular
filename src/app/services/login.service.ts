import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient,
    private router: Router
  ) { }

  public usuario;

  get token(): string {
    return localStorage.getItem('TOKEN_SESSION') || '';
  }

  get headers() {
    return {
      'Authorization': this.token
    }
  }

  get Correo_session(): string {
    return localStorage.getItem('SESSION_EMAIL') || '';
  }

  get Nombre_session(): string {
    return localStorage.getItem('SESSION_USER_NAME') || '';
  }

  Login(data, recuerdame) {
    const url = `https://192.168.0.22/api/login`
    if (recuerdame) {
      localStorage.setItem('SESSION_EMAIL', data.Correo);
    }
    return this.http.post(url, data)
  }

  validarToken(): Observable<boolean> {
    return this.http.get(`https://192.168.0.22/api/renew`, {
      headers: this.headers
    }).pipe(
      tap((resp: any) => {
        this.usuario = resp.usuario;
        localStorage.setItem('TOKEN_SESSION', resp.token);

        // Verificar si existe la sesión local 'SESSION_EMAIL'
        if (localStorage.getItem('SESSION_EMAIL')) {
          // Almacenar el nombre del usuario en otra sesión
          localStorage.setItem('SESSION_USER_NAME', this.usuario.Nombre);
        }

        // localStorage.setItem('menu', JSON.stringify( resp.menu) );
      }),
      map(resp => true),
      catchError(error => of(false))
    );
  }


  logout() {
    localStorage.removeItem('TOKEN_SESSION');
    this.router.navigateByUrl('login');
  }

  borrar_Session() {
    localStorage.removeItem('SESSION_EMAIL');
    localStorage.removeItem('SESSION_USER_NAME');
  }

  registrar(data) {
    const url = `https://192.168.0.22/api/usuario`
    return this.http.post(url, data)
  }

  buscarUsuario() {
    const url = `https://192.168.0.22/api/usuario`
    return this.http.get(url)
  }

  editarUsuario(data) {
    const url = `https://192.168.0.22/api/usuario`
    return this.http.put(url, data)
  }

  eliminarUsuario(id) {
    const url = `https://192.168.0.22/api/usuario/${id}`
    return this.http.delete(url)
  }




}
