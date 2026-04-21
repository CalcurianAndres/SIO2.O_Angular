import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cambio-contrasena',
  standalone: false,templateUrl: './cambio-contrasena.component.html',
  styleUrls: ['./cambio-contrasena.component.scss']
})
export class CambioContrasenaComponent implements OnInit{

  constructor(public login:LoginService){}

  ngOnInit(): void {
    this.usuario = this.login.usuario;
  }

  @Input() reset:any;
  @Output() OnCloseModal = new EventEmitter();

  public usuario;

  cerrar(){
    console.log('cerrar')
    this.OnCloseModal.emit();
  }

  resetPassword(pass1, pass2){
    
    if(!pass1.value || !pass2.value){
      return
    }

    if(pass1.value != pass2.value){
      Swal.fire({
        title:'Las contraseñas no coinciden',
        icon:'error',
        toast:true,
        timer:5000,
        timerProgressBar:true,
        showConfirmButton:false,
        position:'top-end'
      })
    }else{

      this.usuario.Password = pass1.value;
      this.login.editarUsuario(this.usuario)
            .subscribe((resp:any)=>{
              Swal.fire({
                title:'Se cambió la contraseña',
                icon:'success',
                toast:true,
                timer:5000,
                timerProgressBar:true,
                showConfirmButton:false,
                position:'top-end'
              })
              this.OnCloseModal.emit();
            })


    }
  }



}
