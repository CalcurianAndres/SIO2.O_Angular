import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: false,templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit{

  constructor(public trabajadores:TrabajadoresService,
              public login:LoginService,
  ){}

  ngOnInit(): void {
    this.login.buscarUsuario()
        .subscribe((resp:any)=>{
          this.usuarios = resp;
        })
  }


  public index_trabajador:any; 
  public Role:any
  public usuarios:any = []


  crearUsuario(){

    let nombre = this.trabajadores.trabajador[this.index_trabajador].datos_personales.nombres.split(' ');
    let apellido = this.trabajadores.trabajador[this.index_trabajador].datos_personales.apellidos.split(' ')
    let apellido_

    if(apellido.length >2){
      apellido_ = `${apellido[0]} ${apellido[1]}`
    }else{
      apellido_ = `${apellido[0]}`
    }

    let data = {
      Nombre:nombre[0],
      Apellido:apellido_,
      Correo:this.trabajadores.trabajador[this.index_trabajador].datos_personales.email,
      Password:'1234567',
      Role:this.Role
    }

    this.login.registrar(data)
        .subscribe((resp:any)=>{
          this.index_trabajador = undefined;
          this.Role = undefined;
          this.usuarios.push(data)
        })
  }

  cambiarRol(e, usuario){
    usuario.Role = e.value;
    this.login.editarUsuario(usuario)
      .subscribe((resp:any)=>{
        console.log(resp)
      })
  }

  resetPassword(usuario: any) {
    // Asigna directamente la nueva contraseña al objeto usuario
    usuario.Password = '1234567';
    
    console.log(usuario);

    // Llama al método para editar el usuario
    this.login.editarUsuario(usuario)
      .subscribe((resp: any) => {
        Swal.fire({
          title: "Se restauró la contraseña: utiliza 1234567!",
          icon: "success",
          showConfirmButton: false,
          toast: true,
          timer: 5000,
          timerProgressBar: true,
          position: 'top-end'
        });
    });
}


  eliminarUsuario(usuario, i){
    Swal.fire({
      title: "¿Estas seguro?",
      text: `Deseas eliminar al usuario ${usuario.Nombre} ${usuario.Apellido}, esto no lo podras revertir`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, borrar",
      cancelButtonText:'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.login.eliminarUsuario(usuario._id)
          .subscribe((resp:any)=>{
            this.usuarios.splice(i,1)
            Swal.fire({
              title: "Borrado!",
              icon: "success",
              showConfirmButton:false,
              toast:true,
              timer:5000,
              timerProgressBar:true,
              position:'top-end'
            });
          })
      }
    });

  }


}
