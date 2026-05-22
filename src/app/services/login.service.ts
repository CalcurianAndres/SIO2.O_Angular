import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/entities';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  public usuario!: Usuario;

  get token(): string {
    return localStorage.getItem('TOKEN_SESSION') || '';
  }

  get headers() {
    return {
      Authorization: this.token,
    };
  }

  get Correo_session(): string {
    return localStorage.getItem('SESSION_EMAIL') || '';
  }

  get Nombre_session(): string {
    return localStorage.getItem('SESSION_USER_NAME') || '';
  }

  Login(data: Partial<Usuario>, recuerdame: boolean) {
    const url = `${environment.apiUrl}/login`;
    if (recuerdame) {
      localStorage.setItem('SESSION_EMAIL', data.Correo || '');
    }
    return this.http.post(url, data);
  }

  validarToken(): Observable<boolean> {
    return this.http
      .get(`${environment.apiUrl}/renew`, {
        headers: this.headers,
      })
      .pipe(
        tap((resp: any) => {
          this.usuario = resp.usuario;
          localStorage.setItem('TOKEN_SESSION', resp.token);
          if (localStorage.getItem('SESSION_EMAIL')) {
            localStorage.setItem('SESSION_USER_NAME', this.usuario?.Nombre || '');
          }
        }),
        map(() => true),
        catchError(() => of(false)),
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

  registrar(data: Partial<Usuario>) {
    const url = `${environment.apiUrl}/usuario`;
    return this.http.post(url, data);
  }

  buscarUsuario() {
    const url = `${environment.apiUrl}/usuario`;
    return this.http.get(url);
  }

  editarUsuario(data: Partial<Usuario>) {
    const url = `${environment.apiUrl}/usuario`;
    return this.http.put(url, data);
  }

  eliminarUsuario(id: string) {
    const url = `${environment.apiUrl}/usuario/${id}`;
    return this.http.delete(url);
  }
}
