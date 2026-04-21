import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { AlmacenService } from 'src/app/services/almacen.service';
import { AnalisisService } from 'src/app/services/analisis.service';
import { LoginService } from 'src/app/services/login.service';
import { RecepcionService } from 'src/app/services/recepcion.service';

@Component({
  selector: 'app-analisis-pads',
  standalone: false,templateUrl: './analisis-pads.component.html',
  styleUrls: ['./analisis-pads.component.scss']
})
export class AnalisisPadsComponent {

  constructor(public api:AnalisisService,
              public login:LoginService,
              public almacen:AlmacenService,
              public recepcion:RecepcionService
  ){}

  @Input() pads:any;
  @Input() Materiales:any;
  @Input() Recepcion:any;
  @Input() analisis:any;
  @Input() Index:any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseMensaje = new EventEmitter();

  public muestras = 10;

  desviacionEstandar(array, promedio) {
    let suma = 0;
    for (let i = 0; i < array.length; i++) {
      suma += Math.pow(array[i] - promedio, 2);
    }
    return Math.sqrt(suma / (array.length - 1));
  }


  largo(){
    console.log(this.analisis)
    this.analisis.largo.max = Number(Math.max.apply(Math, this.analisis.largo.largo).toFixed(2));
    this.analisis.largo.min = Number(Math.min.apply(Math, this.analisis.largo.largo).toFixed(2));
  
    const sum = this.analisis.largo.largo.reduce((a, b) => a + b, 0);
    console.log(sum)
    const average = sum / this.analisis.largo.largo.length;
    this.analisis.largo.promedio =   Number(average.toFixed(2));
    this.analisis.largo.desviacion = Number(this.desviacionEstandar(this.analisis.largo.largo, this.analisis.largo.promedio).toFixed(2))
  
    if(this.analisis.largo.desviacion < 1){
      let str = this.analisis.largo.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]
  
      if(decimales){
        for(let i=0;i<decimales.length;i++){
          if(decimales[i] != '0'){
            this.analisis.largo.decimales = Number(i)
            this.analisis.largo.decimales = this.analisis.largo.decimales + 1;
            i = 100;
          }
        }
      }else{
        this.analisis.largo.decimales = 2;
      }
    }
  
  }

  ancho(){
    this.analisis.ancho.max = Number(Math.max.apply(Math, this.analisis.ancho.ancho).toFixed(2));
    this.analisis.ancho.min = Number(Math.min.apply(Math, this.analisis.ancho.ancho).toFixed(2));
  
    const sum = this.analisis.ancho.ancho.reduce((a, b) => a + b, 0);
    console.log(sum)
    const average = sum / this.analisis.ancho.ancho.length;
    this.analisis.ancho.promedio =   Number(average.toFixed(2));
    this.analisis.ancho.desviacion = Number(this.desviacionEstandar(this.analisis.ancho.ancho, this.analisis.ancho.promedio).toFixed(2))
  
    if(this.analisis.ancho.desviacion < 1){
      let str = this.analisis.ancho.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]
  
      if(decimales){
        for(let i=0;i<decimales.length;i++){
          if(decimales[i] != '0'){
            this.analisis.ancho.decimales = Number(i)
            this.analisis.ancho.decimales = this.analisis.ancho.decimales + 1;
            i = 100;
          }
        }
      }else{
        this.analisis.ancho.decimales = 2;
      }
    }
  
  }

  signado(){
    this.analisis.signado.max = Number(Math.max.apply(Math, this.analisis.signado.signado).toFixed(2));
    this.analisis.signado.min = Number(Math.min.apply(Math, this.analisis.signado.signado).toFixed(2));
  
    const sum = this.analisis.signado.signado.reduce((a, b) => a + b, 0);
    console.log(sum)
    const average = sum / this.analisis.signado.signado.length;
    this.analisis.signado.promedio =   Number(average.toFixed(2));
    this.analisis.signado.desviacion = Number(this.desviacionEstandar(this.analisis.signado.signado, this.analisis.signado.promedio).toFixed(2))
  
    if(this.analisis.signado.desviacion < 1){
      let str = this.analisis.signado.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]
  
      if(decimales){
        for(let i=0;i<decimales.length;i++){
          if(decimales[i] != '0'){
            this.analisis.signado.decimales = Number(i)
            this.analisis.signado.decimales = this.analisis.signado.decimales + 1;
            i = 100;
          }
        }
      }else{
        this.analisis.signado.decimales = 2;
      }
    }
  
  }

  espesor(){
    this.analisis.espesor.max = Number(Math.max.apply(Math, this.analisis.espesor.espesor).toFixed(2));
    this.analisis.espesor.min = Number(Math.min.apply(Math, this.analisis.espesor.espesor).toFixed(2));
  
    const sum = this.analisis.espesor.espesor.reduce((a, b) => a + b, 0);
    console.log(sum)
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

// Función genérica para realizar los cálculos de ancho y signado
calcularMedidas(tipo: string, medidas: number[], analisis: any) {
  // Calcular el máximo y mínimo
  analisis[tipo].max = Number(Math.max.apply(Math, medidas).toFixed(2));
  analisis[tipo].min = Number(Math.min.apply(Math, medidas).toFixed(2));

  // Calcular la suma, promedio y desviación estándar
  const sum = medidas.reduce((a, b) => a + b, 0);
  const average = sum / medidas.length;
  analisis[tipo].promedio = Number(average.toFixed(2));
  analisis[tipo].desviacion = Number(this.desviacionEstandar(medidas, average).toFixed(2));

  // Calcular el número de decimales si la desviación es menor que 1
  if (analisis[tipo].desviacion < 1) {
      let str = analisis[tipo].desviacion.toString();
      let split = str.split('.');
      let decimales = split[1];
      if (decimales) {
          for (let i = 0; i < decimales.length; i++) {
              if (decimales[i] !== '0') {
                  analisis[tipo].decimales = Number(i) + 1;
                  break;
              }
          }
      } else {
          analisis[tipo].decimales = 2;
      }
  }
}

// Llamar a la función genérica para calcular las medidas de ancho
// ancho() {
//   this.calcularMedidas('ancho', this.analisis.ancho.ancho, this.analisis);
// }

// // Llamar a la función genérica para calcular las medidas de signado
// signado() {
//   this.calcularMedidas('signado', this.analisis.signado.signado, this.analisis);
// }

  cerrar(){
    this.onCloseModal.emit();
  }

  guardar(){
    this.analisis.resultado.guardado.fecha = moment().format('DD/MM/YYYY');
    this.analisis.resultado.guardado.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;
      this.api.EnviarAnalisisPads(this.analisis, this.Recepcion, this.Index);
      this.onCloseMensaje.emit();
  }

  AnalisisCompletado = async ()=>{

    
    let analisis = this.analisis
    let Material = this.Materiales[0]
    let recepcion = this.Recepcion
    let muestras:number[] = [];

    for (let i = 1; i <= analisis.muestras; i++) {
      muestras.push(i);
    }

    // Encontrar el número máximo de decimales
    const maxDecimals = Math.max(...analisis.largo.largo.map(num => {
      const decimals = num.toString().split('.')[1];
      return decimals ? decimals.length : 0;
    }));

    // Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
    let _analisis_largo_largo = analisis.largo.largo.map(num => 
      num.toFixed(maxDecimals).replace('.', ',')
    );

    // Llenar con "N/D" si está vacío
    _analisis_largo_largo = llenarConND(_analisis_largo_largo, analisis.muestras);

    // Encontrar el número máximo de decimales
    const maxDecimals2 = Math.max(...analisis.ancho.ancho.map(num => {
      const decimals = num.toString().split('.')[1];
      return decimals ? decimals.length : 0;
    }));

    // Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
    let _analisis_ancho_ancho = analisis.ancho.ancho.map(num => 
      num.toFixed(maxDecimals2).replace('.', ',')
    );

    // Llenar con "N/D" si está vacío
    _analisis_ancho_ancho = llenarConND(_analisis_ancho_ancho, analisis.muestras);

    // Encontrar el número máximo de decimales
    const maxDecimals3 = Math.max(...analisis.signado.signado.map(num => {
      const decimals = num.toString().split('.')[1];
      return decimals ? decimals.length : 0;
    }));

    // Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
    let _analisis_signado_signado = analisis.signado.signado.map(num => 
      num.toFixed(maxDecimals3).replace('.', ',')
    );

    // Llenar con "N/D" si está vacío
    _analisis_signado_signado = llenarConND(_analisis_signado_signado, analisis.muestras);

    // Encontrar el número máximo de decimales
    const maxDecimals4 = Math.max(...analisis.espesor.espesor.map(num => {
      const decimals = num.toString().split('.')[1];
      return decimals ? decimals.length : 0;
    }));

    // Rellenar con ceros los números para que todos tengan el mismo número de decimales y cambiar puntos por comas
    let _analisis_espesor_espesor = analisis.espesor.espesor.map(num => 
      num.toFixed(maxDecimals4).replace('.', ',')
    );

    // Llenar con "N/D" si está vacío
    _analisis_espesor_espesor = llenarConND(_analisis_espesor_espesor, analisis.muestras);

    let promedio_largo = analisis.largo.promedio.toFixed(analisis.largo.decimales).replace('.', ',')
    let promedio_ancho = analisis.ancho.promedio.toFixed(analisis.ancho.decimales).replace('.', ',')
    let promedio_signado = analisis.signado.promedio.toFixed(analisis.signado.decimales).replace('.', ',')
    let promedio_espesor = analisis.espesor.promedio.toFixed(analisis.espesor.decimales).replace('.', ',')

    promedio_largo = llenarConND2(promedio_largo, 1)
    promedio_ancho = llenarConND2(promedio_ancho, 1)
    promedio_signado = llenarConND2(promedio_signado, 1)
    promedio_espesor = llenarConND2(promedio_espesor, 1)


    function llenarConND2(number:any, cantidad: number) {
      if (Number(number) <= 0) {
        return 'N/D';
      }
      return number;
    }

    function llenarConND(array: any[], cantidad: number) {
      if (array.length === 0) {
        return Array(cantidad).fill('N/D');
      }
      return array;
    }
    
    let largo_analisis: any[] = [];
    largo_analisis[0] = analisis.largo.desviacion.toFixed(analisis.largo.decimales).replace('.', ',');
    largo_analisis[1] = analisis.largo.min.toFixed(2).replace('.', ',');
    largo_analisis[2] = analisis.largo.max.toFixed(2).replace('.', ',');
    // Llenar con "N/D" si está vacío
    largo_analisis[0] = llenarConND2(largo_analisis[0], analisis.muestras);
    largo_analisis[1] = llenarConND2(largo_analisis[1], analisis.muestras);
    largo_analisis[2] = llenarConND2(largo_analisis[2], analisis.muestras);
    
    let ancho_analisis: any[] = [];
    ancho_analisis[0] = analisis.ancho.desviacion.toFixed(analisis.ancho.decimales).replace('.', ',');
    ancho_analisis[1] = analisis.ancho.min.toFixed(2).replace('.', ',');
    ancho_analisis[2] = analisis.ancho.max.toFixed(2).replace('.', ',');

    ancho_analisis[0] = llenarConND2(ancho_analisis[0], analisis.muestras);
    ancho_analisis[1] = llenarConND2(ancho_analisis[1], analisis.muestras);
    ancho_analisis[2] = llenarConND2(ancho_analisis[2], analisis.muestras);
    
    let signado_analisis: any[] = [];
    signado_analisis[0] = analisis.signado.desviacion.toFixed(analisis.signado.decimales).replace('.', ',');
    signado_analisis[1] = analisis.signado.min.toFixed(2).replace('.', ',');
    signado_analisis[2] = analisis.signado.max.toFixed(2).replace('.', ',');

    signado_analisis[0] = llenarConND2(signado_analisis[0], analisis.muestras);
    signado_analisis[1] = llenarConND2(signado_analisis[1], analisis.muestras);
    signado_analisis[2] = llenarConND2(signado_analisis[2], analisis.muestras);
    
    let espesor_analisis: any[] = [];
    espesor_analisis[0] = analisis.espesor.desviacion.toFixed(analisis.espesor.decimales).replace('.', ',');
    espesor_analisis[1] = analisis.espesor.min.toFixed(2).replace('.', ',');
    espesor_analisis[2] = analisis.espesor.max.toFixed(2).replace('.', ',');

    espesor_analisis[0] = llenarConND2(espesor_analisis[0], analisis.muestras);
    espesor_analisis[1] = llenarConND2(espesor_analisis[1], analisis.muestras);
    espesor_analisis[2] = llenarConND2(espesor_analisis[2], analisis.muestras);

    let especificacion_largo: any = [
      Material.material.especificacion2.especificacion.largo_min || 'N/D',
      Material.material.especificacion2.especificacion.largo_nom || 'N/D',
      Material.material.especificacion2.especificacion.largo_max || 'N/D'
    ];

    especificacion_largo[0] = llenarConND2(especificacion_largo[0],1)
    especificacion_largo[1] = llenarConND2(especificacion_largo[1],1)
    especificacion_largo[2] = llenarConND2(especificacion_largo[2],1)
    
    let especificacion_ancho: any = [
      Material.material.especificacion2.especificacion.ancho_min || 'N/D',
      Material.material.especificacion2.especificacion.ancho_nom || 'N/D',
      Material.material.especificacion2.especificacion.ancho_max || 'N/D'
    ];
    especificacion_ancho[0] = llenarConND2(especificacion_ancho[0],1)
    especificacion_ancho[1] = llenarConND2(especificacion_ancho[1],1)
    especificacion_ancho[2] = llenarConND2(especificacion_ancho[2],1)
    
    let especificacion_signado: any = [
      Material.material.especificacion2.especificacion.signado_min || 'N/D',
      Material.material.especificacion2.especificacion.signado_nom || 'N/D',
      Material.material.especificacion2.especificacion.signado_max || 'N/D'
    ];
    especificacion_signado[0] = llenarConND2(especificacion_signado[0],1)
    especificacion_signado[1] = llenarConND2(especificacion_signado[1],1)
    especificacion_signado[2] = llenarConND2(especificacion_signado[2],1)
    
    let especificacion_espesor: any = [
      Material.material.especificacion2.especificacion.espesor_min || 'N/D',
      Material.material.especificacion2.especificacion.espesor_nom || 'N/D',
      Material.material.especificacion2.especificacion.espesor_max || 'N/D'
    ];
    especificacion_espesor[0] = llenarConND2(especificacion_espesor[0],1)
    especificacion_espesor[1] = llenarConND2(especificacion_espesor[1],1)
    especificacion_espesor[2] = llenarConND2(especificacion_espesor[2],1)

    let fabricacion = recepcion.f_fabricacion ? recepcion.f_fabricacion : 'N/A'


    let operaciones = ['S','MÍN','MÁX']
    let operaciones2 = ['MÍN','STD','MÁX']

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
          FORMATO DE ANÁLISIS DE PADS DE CARTÓN CORRUGADAS
          `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
          new Cell(new Txt('Código: FLC-014').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Fecha de Revision: 09/06/2023').end).fillColor('#dedede').fontSize(5).alignment('center').end,
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
          new Cell(new Txt('Muestra (cm)').end).fillColor('#9b9b9b').colSpan(2).fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Txt('Largo (cm)').end).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Txt('Ancho (cm)').end).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Txt('Distancia Signado (cm)').end).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Txt('Espesor (mm)').end).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
        ],
        [
          new Cell(new Stack(muestras).end).colSpan(2).fontSize(7).alignment('center').end,
          new Cell(new Txt('').end).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_largo_largo).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_ancho_ancho).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_signado_signado).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(_analisis_espesor_espesor).end).fontSize(7).alignment('center').end,
        ],
        [
          // new Cell(new Txt('X').bold().end).fillColor('#9b9b9b').colSpan(2).border([true,false]).fontSize(7).alignment('center').end,
          new Cell(await new Img('../../assets/promedio.gif').width(4).build()).alignment('center').fillColor('#9b9b9b').colSpan(2).border([true,false]).end,
          new Cell(new Txt('').end).fontSize(7).alignment('center').end,
          new Cell(new Txt(promedio_largo).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(promedio_ancho).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(promedio_signado).bold().end).fillColor('#9b9b9b').border([true,false,false,false]).fontSize(7).alignment('center').end,
          new Cell(new Txt(promedio_espesor).bold().end).fillColor('#9b9b9b').border([true,false,true,false]).fontSize(7).alignment('center').end,
        ],
        [
          new Cell(new Stack(operaciones).end).border([true,false]).colSpan(2).fontSize(7).fillColor('#9b9b9b').alignment('center').end,
          new Cell(new Txt('').end).fontSize(7).fillColor('#c8c8c8').alignment('center').end,
          new Cell(new Stack(largo_analisis).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(ancho_analisis).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(signado_analisis).end).border([true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
          new Cell(new Stack(espesor_analisis).end).border([true,false,true,false]).fillColor('#c8c8c8').fontSize(7).alignment('center').end,
        ],
        [
          new Cell(new Txt('ESP.').end).margin([0,6]).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Stack(operaciones2).end).fillColor('#9b9b9b').fontSize(7).alignment('center').end,
          new Cell(new Stack(especificacion_largo).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(especificacion_ancho).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(especificacion_signado).end).fontSize(7).alignment('center').end,
          new Cell(new Stack(especificacion_espesor).end).fontSize(7).alignment('center').end,
        ]
      ]).widths(['10%','10%','20%','20%','20%','20%']).end
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

  await GenerarCertificado()
  this.analisis.resultado.validado.fecha = moment().format('DD/MM/YYYY');
  this.analisis.resultado.validado.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;
  this.api.EnviarAnalisisPads(this.analisis, this.Recepcion, this.Index)

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
