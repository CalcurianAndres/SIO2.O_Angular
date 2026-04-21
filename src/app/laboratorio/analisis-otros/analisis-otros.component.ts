import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { AlmacenService } from 'src/app/services/almacen.service';
import { AnalisisService } from 'src/app/services/analisis.service';
import { LoginService } from 'src/app/services/login.service';
import { RecepcionService } from 'src/app/services/recepcion.service';

@Component({
  selector: 'app-analisis-otros',
  standalone: false,templateUrl: './analisis-otros.component.html',
  styleUrls: ['./analisis-otros.component.scss']
})
export class AnalisisOtrosComponent {

  constructor(public api:AnalisisService,
              public login:LoginService,
              public almacen:AlmacenService,
              public recepcion:RecepcionService
  ){}
  
 @Input() otro:any;
 @Input() Materiales:any;
 @Input() Recepcion:any;
 @Input() analisis:any;
 @Input() Index:any;
 @Output() onCloseModal = new EventEmitter();
 @Output() onCloseMensaje = new EventEmitter();


 getThirdKeyValue(): { key: string, value: any } {
  if (
    this.Materiales &&
    this.Materiales[0] &&
    this.Materiales[0].material &&
    this.Materiales[0].material.especificacion2 &&
    this.Materiales[0].material.especificacion2.especificacion
  ) {
    const keys = Object.keys(this.Materiales[0].material.especificacion2.especificacion);
    
    // Filtrar las claves excluyendo las que no te interesan
    const filteredKeys = keys.filter(key => 
      !['_id', 'apariencia', 'ph_m', 'ph_M'].includes(key)
    );

    // Si hay suficientes claves después del filtrado, buscar la tercera
    if (filteredKeys.length >= 3) {
      const thirdKey = filteredKeys[2];
      const thirdValue = this.Materiales[0].material.especificacion2.especificacion[thirdKey];
      return { key: thirdKey, value: thirdValue };
    } else if (filteredKeys.length > 0) {
      // Si no hay suficientes, devolver la última clave disponible
      const lastKey = filteredKeys[filteredKeys.length - 1];
      const lastValue = this.Materiales[0].material.especificacion2.especificacion[lastKey];
      return { key: lastKey, value: lastValue };
    }
  }

  // Retornar null si no se encuentra ninguna clave diferente
  return { key: '', value: '' };
}

cerrar(){
  this.onCloseModal.emit();
}

guardar(resultado?:string){
  this.analisis.resultado.guardado.fecha = moment().format('DD/MM/YYYY')
  if(resultado){
    this.analisis.resultado.resultado = resultado
    this.analisis.resultado.guardado.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`
  }
  this.api.EnviarAnalisisOtros(this.analisis, this.Recepcion, this.Index);
  this.onCloseMensaje.emit();
}


AnalisisCompletado(){
  
  let hoy = moment().format('DD/MM/YYYY')
  this.analisis.resultado.validado.fecha = hoy;
  this.analisis.resultado.validado.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`

  let analisis = this.analisis
    let Material = this.Materiales[0]
    let recepcion = this.Recepcion

    let key = this.getThirdKeyValue().key
    let value = this.getThirdKeyValue().value

    let fecha_recepcion = moment(recepcion.recepcion).format('DD/MM/YYYY')

    console.log(analisis.apariencia)
    let apariencia = 'NO CUMPLE';
    if(analisis.apariencia){
      apariencia = 'CUMPLE';
    }

    let resultString = ''
    // Crear un objeto para almacenar los materiales agrupados por presentación y neto
    const agrupados = recepcion.materiales[0].reduce((acc, material) => {
      const key = `${material.presentacion}-${material.neto}-${material.unidad}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [key, cantidad] of Object.entries(agrupados)) {
      const [presentacion, neto, unidad] = key.split('-');
      resultString += `${cantidad} ${presentacion}(s) de ${neto}${unidad} `;
    }

    let mat = recepcion.materiales[0]
    let netos = 0
    for(let i=0;i<mat.length;i++){
      console.log(mat[i])
      netos = netos + Number(mat[i].neto)
    }
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
          FORMATO DE ANÁLISIS DE INSUMOS/OTROS
          `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
          new Cell(new Txt('Código: FLC-002').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Fecha de Revision: 01/08/2022').end).fillColor('#dedede').fontSize(5).alignment('center').end,
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
          new Cell(new Txt('INFORMACIÓN DEL INSUMO/OTRO').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end
        ]
      ]).widths(['100%']).end
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
          new Cell(new Txt('PRODUCTO').end).color('#ffffff').fillColor('#3b3b3b').alignment('center').fontSize(9).end,
          new Cell(new Txt(Material.material.nombre).end).alignment('center').fontSize(9).end, 
        ],
        [
          new Cell(new Txt('PROVEEDOR').end).color('#ffffff').fillColor('#3b3b3b').alignment('center').fontSize(9).end,
          new Cell(new Txt(recepcion.proveedor.nombre).end).alignment('center').fontSize(9).end, 
        ],
        [
          new Cell(new Txt('PRESENTACIÓN').end).color('#ffffff').fillColor('#3b3b3b').alignment('center').fontSize(9).end,
          new Cell(new Txt(resultString).end).alignment('center').fontSize(9).end, 
        ],
        [
          new Cell(new Txt(`CANTIDAD`).end).color('#ffffff').fillColor('#3b3b3b').alignment('center').fontSize(9).end,
          new Cell(new Txt(netos.toString()).end).alignment('center').fontSize(9).end, 
        ],
        [
          new Cell(new Txt('FECHA DE FABRICACIÓN').end).color('#ffffff').fillColor('#3b3b3b').alignment('center').fontSize(9).end,
          new Cell(new Txt('N/D').end).alignment('center').fontSize(9).end, 
        ],
        [
          new Cell(new Txt('FECHA DE VENCIMIENTO').end).color('#ffffff').fillColor('#3b3b3b').alignment('center').fontSize(9).end,
          new Cell(new Txt('N/D').end).alignment('center').fontSize(9).end, 
        ],
        [
          new Cell(new Txt('FECHA DE RECEPCIÓN').end).color('#ffffff').fillColor('#3b3b3b').alignment('center').fontSize(9).end,
          new Cell(new Txt(fecha_recepcion).end).alignment('center').fontSize(9).end, 
        ],
        [
          new Cell(new Txt('Nº DE LOTE').end).color('#ffffff').fillColor('#3b3b3b').alignment('center').fontSize(9).end,
          new Cell(new Txt(Material.lote).end).alignment('center').fontSize(9).end, 
        ],
      ]).widths(['30%','70%']).end
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
          new Cell(new Txt('PROPIEDADES Y CARACTERÍSTICAS EVALUADAS').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end
        ]
      ]).widths(['100%']).end
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
          new Cell(new Txt('ANÁLISIS CUALITATIVO').bold().end).border([false]).fontSize(8).color('#ffffff').fillColor('#8b8b8b').decorationColor('#ffffff').alignment('center').end
        ]
      ]).widths(['100%']).end
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
          new Cell(new Txt('APARIENCIA').alignment('center').end).fillColor('#c4c4c4').fontSize(8).end,
          new Cell(new Txt(Material.material.especificacion2.especificacion.apariencia).end).fontSize(8).end,
          new Cell(new Txt(apariencia).alignment('center').end).fontSize(8).end,
        ]
      ]).widths(['15%','70%','15%']).end
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
          new Cell(new Txt('ANÁLISIS CUANTITATIVO').bold().end).border([false]).fontSize(8).color('#ffffff').fillColor('#8b8b8b').decorationColor('#ffffff').alignment('center').end
        ]
      ]).widths(['100%']).end
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
          new Cell(new Txt('pH').end).alignment('center').margin([0,5]).fillColor('#c4c4c4').rowSpan(2).fontSize(8).end,
          new Cell(new Txt('ESPECIFICACIÓN').end).alignment('center').fillColor('#c4c4c4').fontSize(8).end,
          new Cell(new Txt('RESULTADO').end).alignment('center').fillColor('#c4c4c4').fontSize(8).end,
        ],
        [
          new Cell(new Txt('').end).alignment('center').fontSize(8).end,
          new Cell(new Txt(`${Material.material.especificacion2.especificacion.ph_m} - ${Material.material.especificacion2.especificacion.ph_M}`).end).alignment('center').fontSize(8).end,
          new Cell(new Txt(analisis.ph).end).alignment('center').fontSize(8).end,
        ],
      ]).widths(['15%','35%','50%']).end
    )

    pdf.add(
      new Table([
        [
          new Cell(new Txt('').end).border([false]).fontSize(1).end
        ]
      ]).widths(['100%']).end
    )

    if(key.length > 0){

      pdf.add(
        new Table([
          [
            new Cell(new Txt('PRUEBAS O ENSAYOS ADICIONALES').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end
          ]
        ]).widths(['100%']).end
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
            new Cell(new Txt(key).end).alignment('center').margin([0,5]).fillColor('#c4c4c4').rowSpan(2).fontSize(8).end,
            new Cell(new Txt('ESPECIFICACIÓN').end).alignment('center').fillColor('#c4c4c4').fontSize(8).end,
            new Cell(new Txt('RESULTADO').end).alignment('center').fillColor('#c4c4c4').fontSize(8).end,
          ],
          [
            new Cell(new Txt('').end).alignment('center').fontSize(8).end,
            new Cell(new Txt(value).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(analisis.otro).end).alignment('center').fontSize(8).end,
          ],
        ]).widths(['15%','35%','50%']).end
      )
    }


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
  this.api.EnviarAnalisisOtros(this.analisis, this.Recepcion, this.Index);
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