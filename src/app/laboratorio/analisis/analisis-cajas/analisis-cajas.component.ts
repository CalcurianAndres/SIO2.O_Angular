import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { AlmacenService } from 'src/app/services/almacen.service';
import { AnalisisService } from 'src/app/services/analisis.service';
import { LoginService } from 'src/app/services/login.service';
import { RecepcionService } from 'src/app/services/recepcion.service';

@Component({
  selector: 'app-analisis-cajas',
  standalone: false,templateUrl: './analisis-cajas.component.html',
  styleUrls: ['./analisis-cajas.component.scss']
})
export class AnalisisCajasComponent {

  constructor(public api:AnalisisService,
              public login:LoginService,
              public almacen:AlmacenService,
              public recepcion:RecepcionService
  ){}

  @Input() caja!:boolean;
  @Input() Recepcion:any;
  @Input() Materiales:any;
  @Input() analisis:any;
  @Input() Index:any;
  @Output() onCloseModal = new EventEmitter()
  @Output() onCloseMensaje = new EventEmitter()
  
  interna = true;
  externa = false;
  espesor = false;

  Largo = true;
  Ancho = false;
  Alto = false;

  cerrar(){
    this.onCloseModal.emit();
  }

  change(n: string): void {
    switch(n) {
      case 'a':
        this.interna = true;
        this.externa = false;
        this.espesor = false;
        break;
      case 'b':
        this.interna = false;
        this.externa = true;
        this.espesor = false;
        break;
      case 'c':
        this.interna = false;
        this.externa = false;
        this.espesor = true;
        break;
      default:
        // Handle default case if needed
        break;
    }
}

change2(n: string): void {
  switch(n) {
    case 'a':
      this.Largo = true;
      this.Ancho = false;
      this.Alto = false;
      break;
    case 'b':
      this.Largo = false;
      this.Ancho = true;
      this.Alto = false;
      break;
    case 'c':
      this.Largo = false;
      this.Ancho = false;
      this.Alto = true;
      break;
    default:
      // Handle default case if needed
      break;
  }
}

guardar(){
  this.analisis.resultado.guardado.fecha = moment().format('DD/MM/YYYY')
  this.analisis.resultado.guardado.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;
    this.api.EnviarAnalisisCajas(this.analisis, this.Recepcion, this.Index);
    this.onCloseMensaje.emit();
}

desviacionEstandar(array, promedio) {
  let suma = 0;
  for (let i = 0; i < array.length; i++) {
    suma += Math.pow(array[i] - promedio, 2);
  }
  return Math.sqrt(suma / (array.length - 1));
}

interna_larga(){
    this.analisis.longitud_interna.largo.max = Number(Math.max.apply(Math, this.analisis.longitud_interna.largo.largo).toFixed(2));
    this.analisis.longitud_interna.largo.min = Number(Math.min.apply(Math, this.analisis.longitud_interna.largo.largo).toFixed(2));
  
    const sum = this.analisis.longitud_interna.largo.largo.reduce((a, b) => a + b, 0);
    console.log(sum)
    const average = sum / this.analisis.longitud_interna.largo.largo.length;
    this.analisis.longitud_interna.largo.promedio =   Number(average.toFixed(2));
    this.analisis.longitud_interna.largo.desviacion = Number(this.desviacionEstandar(this.analisis.longitud_interna.largo.largo, this.analisis.longitud_interna.largo.promedio).toFixed(2))

    if(this.analisis.longitud_interna.largo.desviacion < 1){
      let str = this.analisis.longitud_interna.largo.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if(decimales){
        for(let i=0;i<decimales.length;i++){
          if(decimales[i] != '0'){
            this.analisis.longitud_interna.largo.decimales = Number(i)
            this.analisis.longitud_interna.largo.decimales = this.analisis.longitud_interna.largo.decimales + 1;
            i = 100;
          }
        }
      }else{
        this.analisis.longitud_interna.largo.decimales = 2;
      }
    }

}

interna_ancha(){
  this.analisis.longitud_interna.ancho.max = Number(Math.max.apply(Math, this.analisis.longitud_interna.ancho.ancho).toFixed(2));
  this.analisis.longitud_interna.ancho.min = Number(Math.min.apply(Math, this.analisis.longitud_interna.ancho.ancho).toFixed(2));

  const sum = this.analisis.longitud_interna.ancho.ancho.reduce((a, b) => a + b, 0);
  console.log(sum)
  const average = sum / this.analisis.longitud_interna.ancho.ancho.length;
  this.analisis.longitud_interna.ancho.promedio =   Number(average.toFixed(2));
  this.analisis.longitud_interna.ancho.desviacion = Number(this.desviacionEstandar(this.analisis.longitud_interna.ancho.ancho, this.analisis.longitud_interna.ancho.promedio).toFixed(2))

  if(this.analisis.longitud_interna.ancho.desviacion < 1){
    let str = this.analisis.longitud_interna.ancho.desviacion.toString()
    let split = str.split('.')
    let decimales = split[1]

    if(decimales){
      for(let i=0;i<decimales.length;i++){
        if(decimales[i] != '0'){
          this.analisis.longitud_interna.ancho.decimales = Number(i)
          this.analisis.longitud_interna.ancho.decimales = this.analisis.longitud_interna.ancho.decimales + 1;
          i = 100;
        }
      }
    }else{
      this.analisis.longitud_interna.ancho.decimales = 2;
    }
  }

}

interna_alta(){
  this.analisis.longitud_interna.alto.max = Number(Math.max.apply(Math, this.analisis.longitud_interna.alto.alto).toFixed(2));
  this.analisis.longitud_interna.alto.min = Number(Math.min.apply(Math, this.analisis.longitud_interna.alto.alto).toFixed(2));

  const sum = this.analisis.longitud_interna.alto.alto.reduce((a, b) => a + b, 0);
  console.log(sum)
  const average = sum / this.analisis.longitud_interna.alto.alto.length;
  this.analisis.longitud_interna.alto.promedio =   Number(average.toFixed(2));
  this.analisis.longitud_interna.alto.desviacion = Number(this.desviacionEstandar(this.analisis.longitud_interna.alto.alto, this.analisis.longitud_interna.alto.promedio).toFixed(2))

  if(this.analisis.longitud_interna.alto.desviacion < 1){
    let str = this.analisis.longitud_interna.alto.desviacion.toString()
    let split = str.split('.')
    let decimales = split[1]

    if(decimales){
      for(let i=0;i<decimales.length;i++){
        if(decimales[i] != '0'){
          this.analisis.longitud_interna.alto.decimales = Number(i)
          this.analisis.longitud_interna.alto.decimales = this.analisis.longitud_interna.alto.decimales + 1;
          i = 100;
        }
      }
    }else{
      this.analisis.longitud_interna.alto.decimales = 2;
    }
  }

}


externa_larga(){
  this.analisis.longitud_externa.largo.max = Number(Math.max.apply(Math, this.analisis.longitud_externa.largo.largo).toFixed(2));
  this.analisis.longitud_externa.largo.min = Number(Math.min.apply(Math, this.analisis.longitud_externa.largo.largo).toFixed(2));

  const sum = this.analisis.longitud_externa.largo.largo.reduce((a, b) => a + b, 0);
  console.log(sum)
  const average = sum / this.analisis.longitud_externa.largo.largo.length;
  this.analisis.longitud_externa.largo.promedio =   Number(average.toFixed(2));
  this.analisis.longitud_externa.largo.desviacion = Number(this.desviacionEstandar(this.analisis.longitud_externa.largo.largo, this.analisis.longitud_externa.largo.promedio).toFixed(2))

  if(this.analisis.longitud_externa.largo.desviacion < 1){
    let str = this.analisis.longitud_externa.largo.desviacion.toString()
    let split = str.split('.')
    let decimales = split[1]

    if(decimales){
      for(let i=0;i<decimales.length;i++){
        if(decimales[i] != '0'){
          this.analisis.longitud_externa.largo.decimales = Number(i)
          this.analisis.longitud_externa.largo.decimales = this.analisis.longitud_externa.largo.decimales + 1;
          i = 100;
        }
      }
    }else{
      this.analisis.longitud_externa.largo.decimales = 2;
    }
  }

}

externa_ancha(){
this.analisis.longitud_externa.ancho.max = Number(Math.max.apply(Math, this.analisis.longitud_externa.ancho.ancho).toFixed(2));
this.analisis.longitud_externa.ancho.min = Number(Math.min.apply(Math, this.analisis.longitud_externa.ancho.ancho).toFixed(2));

const sum = this.analisis.longitud_externa.ancho.ancho.reduce((a, b) => a + b, 0);
console.log(sum)
const average = sum / this.analisis.longitud_externa.ancho.ancho.length;
this.analisis.longitud_externa.ancho.promedio =   Number(average.toFixed(2));
this.analisis.longitud_externa.ancho.desviacion = Number(this.desviacionEstandar(this.analisis.longitud_externa.ancho.ancho, this.analisis.longitud_externa.ancho.promedio).toFixed(2))

if(this.analisis.longitud_externa.ancho.desviacion < 1){
  let str = this.analisis.longitud_externa.ancho.desviacion.toString()
  let split = str.split('.')
  let decimales = split[1]

  if(decimales){
    for(let i=0;i<decimales.length;i++){
      if(decimales[i] != '0'){
        this.analisis.longitud_externa.ancho.decimales = Number(i)
        this.analisis.longitud_externa.ancho.decimales = this.analisis.longitud_externa.ancho.decimales + 1;
        i = 100;
      }
    }
  }else{
    this.analisis.longitud_externa.ancho.decimales = 2;
  }
}

}

externa_alta(){
this.analisis.longitud_externa.alto.max = Number(Math.max.apply(Math, this.analisis.longitud_externa.alto.alto).toFixed(2));
this.analisis.longitud_externa.alto.min = Number(Math.min.apply(Math, this.analisis.longitud_externa.alto.alto).toFixed(2));

const sum = this.analisis.longitud_externa.alto.alto.reduce((a, b) => a + b, 0);
console.log(sum)
const average = sum / this.analisis.longitud_externa.alto.alto.length;
this.analisis.longitud_externa.alto.promedio =   Number(average.toFixed(2));
this.analisis.longitud_externa.alto.desviacion = Number(this.desviacionEstandar(this.analisis.longitud_externa.alto.alto, this.analisis.longitud_externa.alto.promedio).toFixed(2))

if(this.analisis.longitud_externa.alto.desviacion < 1){
  let str = this.analisis.longitud_externa.alto.desviacion.toString()
  let split = str.split('.')
  let decimales = split[1]

  if(decimales){
    for(let i=0;i<decimales.length;i++){
      if(decimales[i] != '0'){
        this.analisis.longitud_externa.alto.decimales = Number(i)
        this.analisis.longitud_externa.alto.decimales = this.analisis.longitud_externa.alto.decimales + 1;
        i = 100;
      }
    }
  }else{
    this.analisis.longitud_externa.alto.decimales = 2;
  }
}

}

externa_espesor(){
  this.analisis.espesor.max = Number(Math.max.apply(Math, this.analisis.espesor.espesor).toFixed(2));
  this.analisis.espesor.min = Number(Math.min.apply(Math, this.analisis.espesor.espesor).toFixed(2));
  
  const sum = this.analisis.espesor.espesor.reduce((a, b) => a + b, 0);
  const average = sum / this.analisis.espesor.espesor.length;
  this.analisis.espesor.promedio =   Number(average.toFixed(2));
  this.analisis.espesor.desviacion = Number(this.desviacionEstandar(this.analisis.espesor.espesor, this.analisis.espesor.promedio).toFixed(2))
  
  if(this.analisis.espesor.desviacion < 1){
    let str = this.analisis.espesor.desviacion.toString()
    let split = str.split('.')
    let decimales = split[1]
  
    if(decimales){
      for(let i=0;i<decimales.length;i++){
        if(decimales[i] != '0'){
          this.analisis.espesor.decimales = Number(i)
          this.analisis.espesor.decimales = this.analisis.espesor.decimales + 1;
          i = 100;
        }
      }
    }else{
      this.analisis.espesor.decimales = 2;
    }
  }
  
  }

  AnalisisCompletado(){

    this.analisis.resultado.validado.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;
    this.analisis.resultado.validado.fecha = moment().format('DD/MM/YYYY');

    let analisis = this.analisis
    let Material = this.Materiales[0]
    let recepcion = this.Recepcion

    console.log(Material)
    // console.log(recepcion)

    // Encontrar el número máximo de decimales
const maxDecimals = Math.max(...analisis.longitud_interna.largo.largo.map(num => {
  const decimals = num.toString().split('.')[1];
  return decimals ? decimals.length : 0;
}));

// Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
let _analisis_longitud_interna_largo_largo = analisis.longitud_interna.largo.largo.map(num => 
  num.toFixed(maxDecimals).replace('.', ',')
);

// Encontrar el número máximo de decimales
const maxDecimals1 = Math.max(...analisis.longitud_interna.ancho.ancho.map(num => {
  const decimals = num.toString().split('.')[1];
  return decimals ? decimals.length : 0;
}));

// Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
let _analisis_longitud_interna_ancho_ancho = analisis.longitud_interna.ancho.ancho.map(num => 
  num.toFixed(maxDecimals1).replace('.', ',')
);

// Encontrar el número máximo de decimales
const maxDecimals2 = Math.max(...analisis.longitud_interna.alto.alto.map(num => {
  const decimals = num.toString().split('.')[1];
  return decimals ? decimals.length : 0;
}));

// Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
let _analisis_longitud_interna_alto_alto = analisis.longitud_interna.alto.alto.map(num => 
  num.toFixed(maxDecimals2).replace('.', ',')
);

// Encontrar el número máximo de decimales
const maxDecimals3 = Math.max(...analisis.longitud_externa.largo.largo.map(num => {
  const decimals = num.toString().split('.')[1];
  return decimals ? decimals.length : 0;
}));

// Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
let _analisis_longitud_externa_largo_largo = analisis.longitud_externa.largo.largo.map(num => 
  num.toFixed(maxDecimals3).replace('.', ',')
);

// Encontrar el número máximo de decimales
const maxDecimals4 = Math.max(...analisis.longitud_externa.alto.alto.map(num => {
  const decimals = num.toString().split('.')[1];
  return decimals ? decimals.length : 0;
}));

// Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
let _analisis_longitud_externa_alto_alto = analisis.longitud_externa.alto.alto.map(num => 
  num.toFixed(maxDecimals4).replace('.', ',')
);

// Encontrar el número máximo de decimales
const maxDecimals5 = Math.max(...analisis.longitud_externa.ancho.ancho.map(num => {
  const decimals = num.toString().split('.')[1];
  return decimals ? decimals.length : 0;
}));

// Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
let _analisis_longitud_externa_ancho_ancho = analisis.longitud_externa.ancho.ancho.map(num => 
  num.toFixed(maxDecimals5).replace('.', ',')
);

// Encontrar el número máximo de decimales
const maxDecimals6 = Math.max(...analisis.espesor.espesor.map(num => {
  const decimals = num.toString().split('.')[1];
  return decimals ? decimals.length : 0;
}));

// Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
let _analisis_espesor_espesor = analisis.espesor.espesor.map(num => 
  num.toFixed(maxDecimals6).replace('.', ',')
);


    let li_largo:any = []
    let li_ancho:any = []
    let li_alto:any = []
    let le_largo:any = []
    let le_ancho:any = []
    let le_alto:any = []
    let espesor:any = []

    let li_largo_esp:any = []
    let li_ancho_esp:any = []
    let li_alto_esp:any = []
    let le_largo_esp:any = []
    let le_ancho_esp:any = []
    let le_alto_esp:any = []
    let espesor_esp:any = []

    let fabricacion = recepcion.f_fabricacion ? recepcion.f_fabricacion : 'N/A'

    li_largo_esp[0] = Material.material.especificacion2.especificacion.li_largo_min ? Material.material.especificacion2.especificacion.li_largo_min : 'N/A';
    li_largo_esp[1] = Material.material.especificacion2.especificacion.li_largo_nom ? Material.material.especificacion2.especificacion.li_largo_nom : 'N/A';
    li_largo_esp[2] = Material.material.especificacion2.especificacion.li_largo_max ? Material.material.especificacion2.especificacion.li_largo_max : 'N/A';

    li_ancho_esp[0] = Material.material.especificacion2.especificacion.li_ancho_min ? Material.material.especificacion2.especificacion.li_ancho_min : 'N/A';
    li_ancho_esp[1] = Material.material.especificacion2.especificacion.li_ancho_nom ? Material.material.especificacion2.especificacion.li_ancho_nom : 'N/A';
    li_ancho_esp[2] = Material.material.especificacion2.especificacion.li_ancho_max ? Material.material.especificacion2.especificacion.li_ancho_max : 'N/A';

    li_alto_esp[0] = Material.material.especificacion2.especificacion.li_alto_min ? Material.material.especificacion2.especificacion.li_alto_min : 'N/A';
    li_alto_esp[1] = Material.material.especificacion2.especificacion.li_alto_nom ? Material.material.especificacion2.especificacion.li_alto_nom : 'N/A';
    li_alto_esp[2] = Material.material.especificacion2.especificacion.li_alto_max ? Material.material.especificacion2.especificacion.li_alto_max : 'N/A';


    le_largo_esp[0] = Material.material.especificacion2.especificacion.le_largo_min ? Material.material.especificacion2.especificacion.le_largo_min : 'N/A';
    le_largo_esp[1] = Material.material.especificacion2.especificacion.le_largo_nom ? Material.material.especificacion2.especificacion.le_largo_nom : 'N/A';
    le_largo_esp[2] = Material.material.especificacion2.especificacion.le_largo_max ? Material.material.especificacion2.especificacion.le_largo_max : 'N/A';

    le_ancho_esp[0] = Material.material.especificacion2.especificacion.le_ancho_min ? Material.material.especificacion2.especificacion.le_ancho_min : 'N/A';
    le_ancho_esp[1] = Material.material.especificacion2.especificacion.le_ancho_nom ? Material.material.especificacion2.especificacion.le_ancho_nom : 'N/A';
    le_ancho_esp[2] = Material.material.especificacion2.especificacion.le_ancho_max ? Material.material.especificacion2.especificacion.le_ancho_max : 'N/A';

    le_alto_esp[0] = Material.material.especificacion2.especificacion.le_alto_min ? Material.material.especificacion2.especificacion.le_alto_min : 'N/A';
    le_alto_esp[1] = Material.material.especificacion2.especificacion.le_alto_nom ? Material.material.especificacion2.especificacion.le_alto_nom : 'N/A';
    le_alto_esp[2] = Material.material.especificacion2.especificacion.le_alto_max ? Material.material.especificacion2.especificacion.le_alto_max : 'N/A';

    espesor_esp[0] = Material.material.especificacion2.especificacion.espesor_min ? Material.material.especificacion2.especificacion.espesor_min : 'N/A';
    espesor_esp[1] = Material.material.especificacion2.especificacion.espesor_nom ? Material.material.especificacion2.especificacion.espesor_nom : 'N/A';
    espesor_esp[2] = Material.material.especificacion2.especificacion.espesor_max ? Material.material.especificacion2.especificacion.espesor_max : 'N/A';

    let muestras:number[] = [];

    for (let i = 1; i <= analisis.muestras; i++) {
    muestras.push(i);
    }

    li_largo[0] = analisis.longitud_interna.largo.desviacion.toFixed(analisis.longitud_interna.largo.decimales)
    li_largo[1] = analisis.longitud_interna.largo.min
    li_largo[2] = analisis.longitud_interna.largo.max

    li_ancho[0] = analisis.longitud_interna.ancho.desviacion.toFixed(analisis.longitud_interna.ancho.decimales)
    li_ancho[1] = analisis.longitud_interna.ancho.min
    li_ancho[2] = analisis.longitud_interna.ancho.max

    li_alto[0] = analisis.longitud_interna.alto.desviacion.toFixed(analisis.longitud_interna.alto.decimales)
    li_alto[1] = analisis.longitud_interna.alto.min
    li_alto[2] = analisis.longitud_interna.alto.max

    le_largo[0] = analisis.longitud_externa.largo.desviacion.toFixed(analisis.longitud_externa.largo.decimales)
    le_largo[1] = analisis.longitud_externa.largo.min
    le_largo[2] = analisis.longitud_externa.largo.max

    le_ancho[0] = analisis.longitud_externa.ancho.desviacion.toFixed(analisis.longitud_externa.ancho.decimales)
    le_ancho[1] = analisis.longitud_externa.ancho.min
    le_ancho[2] = analisis.longitud_externa.ancho.max

    le_alto[0] = analisis.longitud_externa.alto.desviacion.toFixed(analisis.longitud_externa.alto.decimales)
    le_alto[1] = analisis.longitud_externa.alto.min
    le_alto[2] = analisis.longitud_externa.alto.max
    
    espesor[0] = analisis.espesor.desviacion.toFixed(analisis.espesor.decimales)
    espesor[1] = analisis.espesor.min
    espesor[2] = analisis.espesor.max

    let operaciones = ['S','MÍN','MÁX']
    let operaciones2 = ['MÍN','NOM','MÁX']

    let hoy = moment().format('dd/mm/yyyy')
    async function GenerarCertificado(){
    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);
    pdf.pageOrientation('portrait');
    pdf.pageSize('A4');


    pdf.add(
      new Table([
        [
          new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 5]).build()).alignment('center').rowSpan(4).end,
          new Cell(new Txt(`
          FORMATO DE ANÁLISIS DE CAJAS DE CARTÓN CORRUGADAS
          `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
          new Cell(new Txt('Código: FLC-003').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Fecha de Revision: 18/08/2022').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
      ]).widths(['25%','50%','25%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt('').end).border([false]).fontSize(1).end
        ]
      ]).widths(['100%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt('INFORMACIÓN').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end
        ]
      ]).widths(['100%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt('DESCRIPCIÓN').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt(Material.material.nombre).end).colSpan(3).fontSize(7).end,
          new Cell(new Txt('').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt('').end).fontSize(7).end,
          new Cell(new Txt('LOTE').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt(Material.lote).end).fontSize(7).end,
        ],
        [
          new Cell(new Txt('PROVEEDOR').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt(recepcion.proveedor.nombre).end).colSpan(3).fontSize(7).end,
          new Cell(new Txt('').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt('').end).fontSize(7).end,
          new Cell(new Txt('FABRICACIÓN').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt(fabricacion).end).fontSize(7).end,
        ],
        [
          new Cell(new Txt('TIPO DE CARTÓN').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt(Material.material.serie).end).fontSize(7).end,
          new Cell(new Txt('PRESENTACIÓN').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt(`${Material.presentacion} ${Material.neto}${Material.unidad}`).end).fontSize(7).end,
          new Cell(new Txt('CANTIDAD').end).fontSize(7).fillColor('#c8c8c8').end,
          new Cell(new Txt(Material.oc.pedido[0].cantidad).end).fontSize(7).end,
        ]
      ]).widths(['16%','10%','16%','26%','16%','16%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt(' ').end).border([false]).fontSize(1).end
        ]
      ]).widths(['100%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt('CARACTERÍSTICAS Y PROPIEDADES').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end
        ]
      ]).widths(['100%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt('Muestra').end).fillColor('#9b9b9b').margin([0,5.5]).rowSpan(2).colSpan(2).fontSize(7).alignment('center').end,
          new Cell(new Txt('Muestra').end).fillColor('#9b9b9b').rowSpan(2).fontSize(7).alignment('center').end,
          new Cell(new Txt('LONGITUD INTERNA (cm)').end).fillColor('#9b9b9b').colSpan(3).fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
          new Cell(new Txt('LONGITUD EXTERNA (cm)').end).fillColor('#9b9b9b').colSpan(3).fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
          new Cell(new Txt('ESPESOR (mm)').end).fillColor('#9b9b9b').margin([0,5.5]).rowSpan(2).fontSize(7).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fillColor('#9b9b9b').rowSpan(2).fontSize(7).alignment('center').end,
          new Cell(new Txt('Largo').end).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Txt('Ancho').end).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Txt('Alto').end).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Txt('Largo').end).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Txt('Ancho').end).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Txt('Alto').end).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
        ],
        [
          new Cell(new Stack(muestras).end).colSpan(2).fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_longitud_interna_largo_largo).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_longitud_interna_ancho_ancho).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_longitud_interna_alto_alto).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_longitud_externa_largo_largo).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_longitud_externa_ancho_ancho).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_longitud_externa_alto_alto).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_espesor_espesor).end).fontSize(7).alignment('center').end,
        ],
        [
          // new Cell(new Txt('X').bold().end).fillColor('#9b9b9b').colSpan(2).border([true,false]).fontSize(7).alignment('center').end,
          new Cell(await new Img('../../assets/promedio.gif').width(4).build()).alignment('center').fillColor('#9b9b9b').colSpan(2).border([true,false]).end,

          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
          new Cell(new Txt(analisis.longitud_interna.largo.promedio.toFixed(analisis.longitud_interna.largo.decimales)).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(analisis.longitud_interna.ancho.promedio.toFixed(analisis.longitud_interna.ancho.decimales)).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(analisis.longitud_interna.alto.promedio.toFixed(analisis.longitud_interna.alto.decimales)).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(analisis.longitud_externa.largo.promedio.toFixed(analisis.longitud_externa.largo.decimales)).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(analisis.longitud_externa.ancho.promedio.toFixed(analisis.longitud_externa.ancho.decimales)).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(analisis.longitud_externa.alto.promedio.toFixed(analisis.longitud_externa.alto.decimales)).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(analisis.espesor.promedio.toFixed(analisis.espesor.decimales)).bold().end).fillColor('#9b9b9b').border([true,false,true,false]).fontSize(7).alignment('center').end,
        ],
        [
          new Cell(new Stack(operaciones).end).border([true,false]).colSpan(2).fontSize(7).fillColor('#9b9b9b').alignment('center').end,
          new Cell(new Txt('').end).fontSize(7).fillColor('#c8c8c8').alignment('center').end,
          new Cell(new Stack(li_largo).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(li_ancho).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(li_alto).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(le_largo).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(le_ancho).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(le_alto).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(espesor).end).border([true,false,true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
        ],
        [
          new Cell(new Txt('ESP.').end).margin([0,6]).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Stack(operaciones2).end).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Stack(li_largo_esp).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(li_ancho_esp).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(li_alto_esp).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(le_largo_esp).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(le_ancho_esp).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(le_alto_esp).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(espesor_esp).end).fontSize(7).alignment('center').end,
        ]

      ]).widths(['6.25%','6.25%','12.5%','12.5%','12.5%','12.5%','12.5%','12.5%','12.5%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt('').end).border([false]).fontSize(1).end
        ]
      ]).widths(['100%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt('OBSERVACIÓN').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end,
          new Cell(new Txt('').end).border([false]).fontSize(1).end,
          new Cell(new Txt('RESULTADO').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end
        ],
        [
          new Cell(new Txt(analisis.resultado.observacion).fontSize(8).end).rowSpan(2).end,
          new Cell(new Txt('').end).border([false]).fontSize(1).end,
          new Cell(new Txt(analisis.resultado.resultado).fontSize(10).bold().end).border([false]).alignment('center').end
        ],
        [
          new Cell(new Txt('').fontSize(8).end).rowSpan(2).end,
          new Cell(new Txt('').end).border([false]).fontSize(1).end,
          new Cell(new Table([
            [
              new Cell(new Txt('Realizado por:').fontSize(8).alignment('center').end).colSpan(2).fillColor('#000000').color('#FFFFFF').end,
              new Cell(new Txt('Realizado por:').fontSize(8).alignment('center').end).fillColor('#000000').color('#FFFFFF').end,
              new Cell(new Txt('').fontSize(1).alignment('center').end).border([false]).fillColor('#FFFFFF').end,
              new Cell(new Txt('Validado por:').fontSize(8).alignment('center').end).colSpan(2).fillColor('#0000000').color('#FFFFFF').end,
              new Cell(new Txt('Validado por:').fontSize(8).alignment('center').end).fillColor('#000000').color('#FFFFFF').end
            ],
            [
              new Cell(new Txt('Firma:').fontSize(7).alignment('center').end).end,
              new Cell(new Txt(analisis.resultado.guardado.usuario).fontSize(7).alignment('center').end).end,
              new Cell(new Txt('').fontSize(7).alignment('center').end).border([false]).fillColor('#FFFFFF').end,
              new Cell(new Txt('Firma:').fontSize(7).alignment('center').end).end,
              new Cell(new Txt(analisis.resultado.validado.usuario).fontSize(7).alignment('center').end).end,
            ],
            [
              new Cell(new Txt('Fecha:').fontSize(7).alignment('center').end).end,
              new Cell(new Txt(analisis.resultado.guardado.fecha).fontSize(7).alignment('center').end).end,
              new Cell(new Txt('').fontSize(7).alignment('center').end).border([false]).fillColor('#FFFFFF').end,
              new Cell(new Txt('Fecha:').fontSize(7).alignment('center').end).end,
              new Cell(new Txt(analisis.resultado.validado.fecha).fontSize(7).alignment('center').end).end,
            ]
          ]).widths(['10.5%','38%','1%','10.5%','38%']).end
        ).alignment('center').border([false]).end
        ]
      ]).widths(['49.9%','0.1%','49.9%']).end
    )


    pdf.create().download(`test`)
  }
  GenerarCertificado()
  this.api.EnviarAnalisisCajas(this.analisis, this.Recepcion, this.Index);
  setTimeout(() => {

    if(this.analisis.resultado.resultado === 'APROBADO'){
      async function EnviarAlmacen(materiales, recepcion, almacen) {
        let materiales_ = materiales;
        for (let material of materiales_) {
          material.oc = material.oc._id;
          material.material = material.material._id;
          material.recepcion = recepcion._id; // Asegúrate de que `recepcion` está accesible en este contexto
        }
        almacen.GuardarAlmacen(materiales); // Guarda los materiales en el almacé
      }
      recepcion.resultados[this.Index] = 'Aprobado';
      this.recepcion.GuardarRecepcion(recepcion)
      EnviarAlmacen(this.Materiales, recepcion, this.almacen);
    }else{
      recepcion.resultados[this.Index] = 'Rechazado';
      recepcion.observacion[this.Index] = this.analisis.resultado.observacion;
      this.recepcion.GuardarRecepcion(recepcion)
    }
  }, 2000);
  this.onCloseMensaje.emit();
  }

}