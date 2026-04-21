import { Component, HostListener, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{


  constructor(public api:LoginService,
              public router:Router
  ){}

  ngOnInit(): void {
    this.session_email = this.api.Correo_session;
    this.session_name = this.api.Nombre_session;
    this.Correo = this.api.Correo_session;
  }


  public Correo = ''
  public Password = ''
  public session_email = ''
  public session_name = ''

  isOpened = false;

  login(){

    const checkbox = document.getElementById('recuerdame') as HTMLInputElement;
    console.log(this.Correo, '/', this.Password)

    if(!this.Correo || !this.Password){
      return
    }

    let data = {
      Correo:this.Correo,
      Password:this.Password
    }

    this.api.Login(data,checkbox.checked)
  .pipe(
    catchError((error) => {
      // Handle the error here
      console.error('Error occurred:', error);
      
      // You can return a user-friendly message or an empty observable
      // For example, returning an observable with an error message
      return of({ error: true, message: 'Correo o contraseña incorrecta' });
    })
  )
  .subscribe((resp: any) => {
    if (resp.error) {
      Swal.fire({
        icon: 'error',
        title: resp.message, // Use the error message returned from the catchError
        toast: true,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        position:'top-end'
      });
    } else {
      console.log(resp);
      localStorage.setItem('TOKEN_SESSION', resp.token);
      this.router.navigateByUrl('/compras')
      // Handle successful login response here
    }
  });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (window.scrollY > window.innerHeight / 3 && !this.isOpened) {
      this.isOpened = true;
      this.openModal();
    }
  }

  openModal(): void {
    const body:any = document.querySelector('body');
    const modal = document.querySelector('.modal');
    modal?.classList.add('is-open');
    body.style.overflow = 'hidden';
  }

  closeModal(): void {
    const body:any = document.querySelector('body');
    const modal = document.querySelector('.modal');
    modal?.classList.remove('is-open');
    body.style.overflow = 'initial';
    this.isOpened = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeModal();
  }

  borrar_sessiones(){
    this.Correo = '';
    this.session_email = ''
    this.session_name = ''
    this.api.borrar_Session();
  }


}
