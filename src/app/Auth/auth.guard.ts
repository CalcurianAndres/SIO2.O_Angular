import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private api: LoginService,
              private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    return this.api.validarToken().pipe(
      map(isAuth => {
        // if (isAuth && state.url === '/') {
        //   return this.router.createUrlTree(['/compras']); // Redirigir a '/compras' si el usuario está autenticado y ya está en '/'
        // }
        return isAuth || this.router.createUrlTree(['/']); // Si no está autenticado, redirigir a '/'
      }),
      tap(isAuth => {
        if (!isAuth) {
          console.log('Access denied - Redirecting to login');
        } else if (state.url === '/') {
          console.log('Authenticated user on "/" - Redirecting to /compras');
        }
      })
    );
  }
}