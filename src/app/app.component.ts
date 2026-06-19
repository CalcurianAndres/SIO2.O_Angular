import { Component, OnInit } from '@angular/core';
import { ChildrenOutletContexts, Router } from '@angular/router';
import { routeAnimations } from './shared/animations';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeAnimations],
})
export class AppComponent implements OnInit {
  title = 'Sio_FE';

  constructor(
    private contexts: ChildrenOutletContexts,
    private api: LoginService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('TOKEN_SESSION');
    if (token) {
      this.api.validarToken().subscribe((isValid) => {
        if (isValid) {
          const url = this.router.url;
          if (url === '/' || url === '/login') {
            console.log('Sesión activa — redirigiendo al dashboard');
            this.router.navigateByUrl('/dashboard');
          }
        }
      });
    }
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
