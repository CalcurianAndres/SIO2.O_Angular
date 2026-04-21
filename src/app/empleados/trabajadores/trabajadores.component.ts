import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-trabajadores',
  standalone: false,templateUrl: './trabajadores.component.html',
  styleUrls: ['./trabajadores.component.scss']
})
export class TrabajadoresComponent implements OnInit{
  public randomUsers;
  constructor(private http: HttpClient,
              public trabajadores:TrabajadoresService
  ){}
  
  
  ngOnInit(): void {
    }
      
  public nuevo_trabajador = false;

  public colores = [
    '#30cf60',
    '#375bea',
    '#ac2abe'
  ]

  public color_generos = [
    '#ff78b5',
    '#78a1ff'
  ]

  public informacion = false;
  public _informacion_:any;
  public referencias:any = []
  public carga:any = []
  public emergencias:any = []
  public cursos_realizados:any = []
  public softwares:any = []

  public trabajador = {
    datos_personales:{
      apellidos:'',
      nombres:'',
      cedula:'',
      fecha_nac:'',
      altura:'',
      peso:'',
      sexo:'',
      nacimiento:'',
      nacionalidad:'',
      estado_civil:'',
      licencia:'',
      grado:'',
      rif:'',
      email:'',
      estado:'',
      municipio:'',
      parroquia:'',
      sector:'',
      domicilio:'',
      telefono:'',
      celular:'',
      foto:''
    },
    informacion_adicional:{
      referencias:[],
      carga_familiar:[],
      emergencia:[],
    },
    instruccion_academica:{
      grado:{
        instruccion:'',
        ano:'',
        titulo:''
      },
      cursos:[],
      idiomas:{
        idiomas:[]
      }
    },
      manejo_herramientas:{
        computadora:false,
        softwares:{
          word:false,
          excel:false,
          power_point:false,
          acrobat:false
        },
        otros:[],
        referencias:[]
      },
      contratacion:{
        fecha:'',
        departamento:'',
        cargo:'',
        de:'',
        sueldo:''
      }
  }

  getRandomLetter(): string {
    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet[randomIndex];
  }

  getRandomColor(): string {
    return this.colores[Math.floor(Math.random() * 3)];
  }

  getGender(): string {
    return this.color_generos[Math.floor(Math.random()* 2)];
  }

  // eliminarTrabajador(trabajador:any){
  //   this.trabajadores.eliminarTrabajador(trabajador)
  //   setTimeout(() => {
  //     Swal.fire({
  //       text:this.trabajadores.mensaje.mensaje,
  //       icon:this.trabajadores.mensaje.icon,
  //       position:'top-end',
  //       timerProgressBar:true,
  //       showConfirmButton:false,
  //       toast:true,
  //       timer:5000
  //     })
  //   }, 500);
  // }

  EDITAR_EMPLEADO(cargos){
    this.trabajador = cargos; 
    this.nuevo_trabajador = true
    this.referencias = this.trabajador.informacion_adicional.referencias;
    this.carga = this.trabajador.informacion_adicional.carga_familiar;
    this.emergencias = this.trabajador.informacion_adicional.emergencia;
    this.cursos_realizados = this.trabajador.instruccion_academica.cursos;
    this.softwares = this.trabajador.manejo_herramientas.softwares;
  }

  eliminarTrabajador(trabajador:any){
    Swal.fire({
      icon:'question',
      title:'¿Eliminar trabajador?',
      text:'¿Estas seguro que quieres eliminar este trabajador?. El mismo no podra ser recuperdo luego.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Eliminar",
      denyButtonText: `No eliminar`,
      confirmButtonColor:'#f03a5f',
      denyButtonColor:'#48c78e'
    }).then((result) => {
      if(result.isConfirmed){
        this.trabajadores.eliminarTrabajador(trabajador)
        setTimeout(() => {
          Swal.fire({
            text:this.trabajadores.mensaje.mensaje,
            icon:this.trabajadores.mensaje.icon,
            position:'top-end',
            timerProgressBar:true,
            showConfirmButton:false,
            toast:true,
            timer:5000
          })
        }, 500);
      } else if(result.isDenied){
        Swal.fire({
          text:'El trabajador aun se conserva',
          icon:'success',
          position:'top-end',
          timerProgressBar:true,
          showConfirmButton:false,
          toast:true,
          timer:5000
        })
      }
    });
    }

}
