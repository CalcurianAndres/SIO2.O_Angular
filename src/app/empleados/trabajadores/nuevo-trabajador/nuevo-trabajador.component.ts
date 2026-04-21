import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CargosService } from 'src/app/services/cargos.service';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-trabajador',
  standalone: false,templateUrl: './nuevo-trabajador.component.html',
  styleUrls: ['./nuevo-trabajador.component.scss']
})
export class NuevoTrabajadorComponent implements OnInit{

  constructor(private http: HttpClient,
              public departamentos:DepartamentosService,
              public cargos:CargosService,
              public api:TrabajadoresService,
              public imagenes:SubirArchivosService
  ){}


  @Input() nuevo_trabajador:any;
  @Input() trabajador:any;
  @Input() referencias:any;
  @Input() carga:any;
  @Input() emergencias:any;
  @Input() cursos_realizados:any;
  @Input() softwares:any
  @Output() onCloseModal = new EventEmitter();


  public idiomas:any = []
  public trabajoAnterior:any = []

  public CI = 'V-'
  public estados:any = []
  public Municipio;
  public Parroquia;

  public estado=''
  public municipio=''
  public parroquia=''
  public progressValue = 0;

  cards = [
    {title: 'Datos Personales', content: 'Contenido 1'},
    {title: 'Referencias personales', content: 'Contenido 1'},
    {title: 'Cargas Familiares', content: 'Contenido 1'},
    {title: 'Instrucción académica', content: 'Contenido 1'},
    {title: 'Función en la empresa', content: 'Contenido 1'},
    // Agrega más tarjetas según sea necesario
  ];
  currentIndex = 0;

  public REFERENCIA = {
    nombre:'',
    direccion:'',
    telefono:'',
    ocupacion:''
  }

  public CARGA_FAMILIAR = {
    parentesco:'',
    nombre:'',
    fecha:''
  }

  public EMERGENCIA = {
    parentesco:'',
    nombre:'',
    direccion:'',
    telefono:''
  }

  public CURSO = {
    nombre:'',
    periodo:''
  }

  public IDIOMA = {
    idioma:'',
    nivel:''
  }

  public SOFTWARE = ''

  public TRABAJOS_ANTERIORES = {
    empresa:'',
    periodo:'',
    cargo:'',
    remuneracion:'',
    motivo:''
  }

  ngOnInit(): void {
    this.http.get('http://api.geonames.org/childrenJSON?geonameId=3625428&username=poligrafica').subscribe((response: any) => {
      this.estados = response.geonames;
      });
    }
  cerrar(){
    this.onCloseModal.emit();
  }

  formatCedula(event: any) {
    const regex = /^[VE]-?\d{0,8}$/; // Expresión regular actualizada
    const newValue = event.target.value.toUpperCase();
  
    if (!regex.test(newValue)) {
      this.CI = newValue.substring(0, newValue.length - 1);
    } else {
      // Agregar guiones automáticamente
      let formattedValue = newValue.replace(/(\d{0})(\d{8})/, '$1-$2');
      this.trabajador.datos_personales.cedula = this.CI;
      this.CI = formattedValue; // Establecer el valor formateado n el campo de input
    }
  }

  BuscarMunicipio(e){
    let dividir = e.value.split('-')
    this.trabajador.datos_personales.estado = dividir[1]
    this.http.get(`http://api.geonames.org/childrenJSON?geonameId=${dividir[0]}&username=poligrafica`).subscribe((response: any) => {
      this.Municipio = response.geonames;
      });
  }

  BuscarParroquia(e){
    let dividir = e.value.split('-')
    this.trabajador.datos_personales.municipio = dividir[1]
    this.http.get(`http://api.geonames.org/childrenJSON?geonameId=${dividir[0]}&username=poligrafica`).subscribe((response: any) => {
      this.Parroquia = response.geonames;
    });

  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
    }
  }

  addReferencia(){
    this.referencias.push(this.REFERENCIA);
    this.REFERENCIA = {
      nombre:'',
      direccion:'',
      telefono:'',
      ocupacion:''
    }

  }

  addCarga(){
    this.carga.push(this.CARGA_FAMILIAR)
    this.CARGA_FAMILIAR = {
      parentesco:'',
      nombre:'',
      fecha:''
    }
  }

  addEmergencia(){
    this.emergencias.push(this.EMERGENCIA)
    this.EMERGENCIA = {
      parentesco:'',
      nombre:'',
      direccion:'',
      telefono:''
    }
  }

  addCurso(){
    this.cursos_realizados.push(this.CURSO)
    this.CURSO = {
      nombre:'',
      periodo:''
    }
  }

  addIdioma(){
    this.idiomas.push(this.IDIOMA)
    this.IDIOMA = {
      idioma:'',
      nivel:''
    }
  }

  addSoftware(){
    this.softwares.push(this.SOFTWARE)
    this.SOFTWARE = ''
  }

  addTrabajoAnterior(){
    this.trabajoAnterior.push(this.TRABAJOS_ANTERIORES)
    this.TRABAJOS_ANTERIORES = {
      empresa:'',
      periodo:'',
      cargo:'',
      remuneracion:'',
      motivo:''
    }
  }

  guardar_trabajo(){
    this.trabajador.informacion_adicional.referencias = this.referencias;
    this.trabajador.informacion_adicional.carga_familiar = this.carga;
    this.trabajador.informacion_adicional.emergencia = this.emergencias;
    this.trabajador.instruccion_academica.cursos = this.cursos_realizados;
    this.trabajador.instruccion_academica.idiomas.idiomas = this.idiomas;
    this.trabajador.manejo_herramientas.otros = this.softwares
    this.trabajador.manejo_herramientas.referencias = this.trabajoAnterior
    this.api.nuevoTrabajador(this.trabajador)
    setTimeout(() => {
      this.trabajador = {
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
          celular:''
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
      this.referencias = []
      this.carga = []
      this.emergencias = []
      this.cursos_realizados = []
      this.idiomas = []
      this.softwares = []
      this.trabajoAnterior = []
      Swal.fire({
        text:this.api.mensaje.mensaje,
        icon:this.api.mensaje.icon,
        position:'top-end',
        timerProgressBar:true,
        showConfirmButton:false,
        toast:true,
        timer:5000
      })
      this.cerrar()
    }, 500);
  }


  
  // Función para actualizar el objeto 'softwares' cuando cambia un checkbox
  updateSoftwares() {
  // Obtener referencias a los elementos del DOM
  let wordCheckbox:any = document.getElementById('wordCheckbox');
  let excelCheckbox:any = document.getElementById('excelCheckbox');
  let powerPointCheckbox:any = document.getElementById('powerPointCheckbox');
  let acrobatCheckbox:any = document.getElementById('acrobatCheckbox');

    this.trabajador.manejo_herramientas.softwares.word = wordCheckbox.checked;
    this.trabajador.manejo_herramientas.softwares.excel = excelCheckbox.checked;
    this.trabajador.manejo_herramientas.softwares.power_point = powerPointCheckbox.checked;
    this.trabajador.manejo_herramientas.softwares.acrobat = acrobatCheckbox.checked;
}

showProgress(x,y){
  let max = 0
  switch(this.currentIndex) {
    case 0:{
      max = 20
      break;
    }
    case 1:{
      max = 40
      break;
    }
    case 2:{
      max = 60
      break;
    }
    case 3:{
      max = 80
      break;
    }
    case 4:{
      max = 100
      break;
    }
  }
  const interval = setInterval(() => {
    if (this.progressValue < max) {
      this.progressValue++;
    } else {
      this.progressValue--;
    }
  }, 500);
}


onFileSelected(event) {
  const file = event.target.files[0];
  if (file) {
    this.imagenes.actualizarFoto(file, 'empleado', 'EMPLEADOS')
    .then(img =>{
      this.trabajador.datos_personales.foto = img;
    })
    const reader = new FileReader();
    reader.onload = function(e:any) {
      const imgElement:any = document.querySelector('.image-hover-wrapper img');
      imgElement.src = e.target.result;
    }
    reader.readAsDataURL(file);
  }
}

public subAreas:any = []

buscarSubArea(e){
  this.subAreas = this.departamentos.buscarSubUnidad(e.value);
}


}
