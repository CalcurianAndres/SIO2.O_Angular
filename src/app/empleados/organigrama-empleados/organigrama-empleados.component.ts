import { Component } from '@angular/core';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-organigrama-empleados',
  standalone: false,
  templateUrl: './organigrama-empleados.component.html',
  styleUrls: ['./organigrama-empleados.component.scss'],
})
export class OrganigramaEmpleadosComponent {
  apiUrl = environment.apiUrl;
  imgUrl = environment.imgUrl;

  constructor(
    public api: DepartamentosService,
    public trabajadores: TrabajadoresService,
  ) {}

  searchTerm = '';
  expandedDepId: string | null = null;

  nuevo_trabajador = false;
  informacion = false;
  _informacion_: any;
  referencias: any = [];
  carga: any = [];
  emergencias: any = [];
  cursos_realizados: any = [];
  softwares: any = [];

  public trabajador = {
    datos_personales: {
      apellidos: '', nombres: '', cedula: '', fecha_nac: '', altura: '', peso: '',
      sexo: '', nacimiento: '', nacionalidad: '', estado_civil: '', licencia: '',
      grado: '', rif: '', email: '', estado: '', municipio: '', parroquia: '',
      sector: '', domicilio: '', telefono: '', celular: '', foto: '',
    },
    informacion_adicional: { referencias: [], carga_familiar: [], emergencia: [] },
    instruccion_academica: { grado: { instruccion: '', ano: '', titulo: '' }, cursos: [], idiomas: { idiomas: [] } },
    manejo_herramientas: { computadora: false, softwares: { word: false, excel: false, power_point: false, acrobat: false }, otros: [], referencias: [] },
    contratacion: { fecha: '', departamento: '', cargo: '', de: '', sueldo: '' },
  };

  get departamentos(): any[] {
    let deps = this.api.departamentos || [];
    if (!this.searchTerm) return deps;
    const term = this.searchTerm.toLowerCase();
    return deps.filter((d: any) =>
      d.nombre.toLowerCase().includes(term) ||
      this.obtenerEmpleadosDelDepartamento(d).some((e: any) =>
        (e.datos_personales?.nombres + ' ' + e.datos_personales?.apellidos).toLowerCase().includes(term)
      )
    );
  }

  toggleExpand(dep: any) {
    if (this.expandedDepId === dep._id) {
      this.expandedDepId = null;
    } else {
      this.expandedDepId = dep._id;
    }
  }

  obtenerEmpleadosDelDepartamento(dep: any): any[] {
    return (this.trabajadores.trabajador || []).filter(
      (t: any) => t.contratacion?.departamento?.nombre === dep.nombre
    );
  }

  obtenerAreas(dep: any): any[] {
    return (this.api.subunidad || []).filter(
      (s: any) => s.departamento === dep.nombre && s.sup === '#'
    );
  }

  empleadosDirectos(dep: any): any[] {
    const areaNombres = new Set(this.obtenerAreas(dep).map((a: any) => a.nombre));
    return this.obtenerEmpleadosDelDepartamento(dep).filter(
      (t: any) => !areaNombres.has(t.contratacion?.de?.nombre)
    );
  }

  empleadosDelArea(area: any, dep: any): any[] {
    const subNombres = new Set(
      (this.api.subunidad || [])
        .filter((s: any) => s.departamento === dep.nombre && s.sup === area.nombre)
        .map((s: any) => s.nombre)
    );
    subNombres.add(area.nombre);
    return this.obtenerEmpleadosDelDepartamento(dep).filter(
      (t: any) => t.contratacion?.de?.nombre === area.nombre ||
        subNombres.has(t.contratacion?.de?.nombre)
    );
  }

  empleadosSuelto(area: any, dep: any): any[] {
    const subNombres = new Set(
      (this.api.subunidad || [])
        .filter((s: any) => s.departamento === dep.nombre && s.sup === area.nombre)
        .map((s: any) => s.nombre)
    );
    return this.obtenerEmpleadosDelDepartamento(dep).filter(
      (t: any) => t.contratacion?.de?.nombre === area.nombre &&
        !subNombres.has(t.contratacion?.de?.nombre)
    );
  }

  EDITAR_EMPLEADO(cargos: any) {
    this.trabajador = cargos;
    this.nuevo_trabajador = true;
    this.referencias = this.trabajador.informacion_adicional.referencias;
    this.carga = this.trabajador.informacion_adicional.carga_familiar;
    this.emergencias = this.trabajador.informacion_adicional.emergencia;
    this.cursos_realizados = this.trabajador.instruccion_academica.cursos;
    this.softwares = this.trabajador.manejo_herramientas.softwares;
  }

  eliminarTrabajador(trabajador: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Eliminar trabajador?',
      text: '¿Estas seguro que quieres eliminar este trabajador?. El mismo no podra ser recuperdo luego.',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Eliminar',
      denyButtonText: 'No eliminar',
      confirmButtonColor: '#f03a5f',
      denyButtonColor: '#48c78e',
    }).then((result) => {
      if (result.isConfirmed) {
        this.trabajadores.eliminarTrabajador(trabajador);
        setTimeout(() => {
          Swal.fire({
            text: this.trabajadores.mensaje.mensaje,
            icon: this.trabajadores.mensaje.icon,
            position: 'top-end',
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            timer: 5000,
          });
        }, 500);
      } else if (result.isDenied) {
        Swal.fire({
          text: 'El trabajador aun se conserva',
          icon: 'success',
          position: 'top-end',
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          timer: 5000,
        });
      }
    });
  }
}
