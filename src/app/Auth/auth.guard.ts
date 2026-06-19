import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private api: LoginService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.api.validarToken().pipe(
      map((isAuth) => {
        return isAuth || this.router.createUrlTree(['/login']);
      }),
      tap((isAuth) => {
        if (!isAuth) {
          console.log('Access denied — Redirecting to /login');
        }
      }),
    );
  }
}
