import { Component, OnInit } from '@angular/core';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-departamentos',
  standalone: false,templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.scss']
})
export class DepartamentosComponent implements OnInit{

  ngOnInit(): void {
    this.cargosPrincipales = this.Cargos.filter(cargo => cargo.superior === '#');
  }

  constructor(public api:DepartamentosService,
  ){
  }

  public unidad:any = {
    nombre:'',
    superior:'',
    color:''
  }


  cargosPrincipales:any = []
  Departamentos:any = [
    // 'Desarrollo'
  ]

  Cargos:any = []

  public Nuevo = false;
  public cargo = false;
  public area = false;

  publicAreas:any = []
  public DepartamentoAbierto= ''

  public cargo_ = {
    nombre:'',
    departamento:'',
    sup:'#'
  }

  buscarCargo(n:any){
    return this.Cargos.filter(x=> x.superior === n)
  }

  showAreas(dep:any){
    console.log(dep)
    this.publicAreas = this.filtrarDepartamento(dep.nombre)
    console.log(this.publicAreas)
    this.DepartamentoAbierto = dep.nombre;
    this.area = true;
  }

  obtenerSubcargos(superior: string, departamento:string): any {
    return this.Cargos.filter(cargo => cargo.sup === superior && cargo.departamento === departamento);
  }

  update(e){
    this.cargosPrincipales = this.api.subunidad.filter(cargo => cargo.sup === '#');
    this.publicAreas = this.filtrarDepartamento(e)
  }

  filtrarDepartamento(nombre:any){
    return this.api.subunidad.filter(cargo => cargo.departamento === nombre)
  }

  eliminarDepartamento(dep:any){
    Swal.fire({
      icon:'question',
      title:'¿Eliminar departamento?',
      text:'¿Estas seguro que quieres eliminar este departamento?. El mismo no podra ser recuperdo luego.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Eliminar",
      denyButtonText: `No eliminar`,
      confirmButtonColor:'#f03a5f',
      denyButtonColor:'#48c78e'
    }).then((result) => {
      if(result.isConfirmed){
        this.api.EliminarDepartamento(dep)
        setTimeout(() => {
          Swal.fire({
            text:this.api.mensaje.mensaje,
            icon:this.api.mensaje.icon,
            position:'top-end',
            timerProgressBar:true,
            showConfirmButton:false,
            toast:true,
            timer:5000
          })
        }, 500);
      } else if(result.isDenied){
        Swal.fire({
          text:'El departamento aun se conserva',
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

    EditarSubUnidad(e){
      this.cargo_ = e;
      this.area = false;
      this.cargo = true;
    }
    EditarSubSubUnidad(e){
      console.log('test');
      this.cargo_ = e;
      this.area = false;
      this.cargo = true;
    }

  }
