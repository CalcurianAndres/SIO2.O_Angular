import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PdfMakeWrapper, Txt, Columns, Table, Canvas, Cell, Img } from 'pdfmake-wrapper';
import { HttpClient } from '@angular/common/http';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfFonts from '../../../assets/fonts/custom';

@Component({
  selector: 'app-etiquetas-lab',
  templateUrl: './etiquetas.component.html',
  styleUrls: ['./etiquetas.component.scss'],
})
export class EtiquetasComponent {
  constructor(private http: HttpClient) {}

  @Input() mostrar = false;
  @Input() recepcion: any;
  @Input() informacion: any;

  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }

  getBase64Image(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  }

  scaleText(
    text: string,
    baseFontSize = 12,
    maxChars = 40,
    minFontSize = 6,
    baseMargin: [number, number] = [0, 3],
    minMarginY = 3,
  ): { fontSize: number; margin: [number, number] } {
    if (!text || text.length <= maxChars) {
      return {
        fontSize: baseFontSize,
        margin: baseMargin,
      };
    }

    const factor = maxChars / text.length;

    const fontSize = Math.max(baseFontSize * factor, minFontSize);
    const marginY = Math.max(baseMargin[1] * factor, minMarginY) * 2;

    return {
      fontSize,
      margin: [baseMargin[0], marginY],
    };
  }

  descargarPDF = async () => {
    PdfMakeWrapper.setFonts(pdfFonts, {
      Gilroy: {
        normal: 'Gilroy-Light.otf',
        bold: 'Gilroy-ExtraBold.otf',
        italics: 'Gilroy-ExtraBold.otf',
        bolditalics: 'Gilroy-ExtraBold.otf',
      },
      Roboto: {
        normal: 'Roboto-Light.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-Italic.ttf',
      },
    });

    PdfMakeWrapper.useFont('Gilroy');

    const pdf = new PdfMakeWrapper();
    /**
     * Definir tamaño personalizado: [ancho, alto]
     * Si tus medidas son 75mm x 10mm:
     * Convertimos mm a puntos (1mm = 2.83465pt)
     */
    pdf.pageSize({
      width: 100 * 2.83465, // ~212.6 pt
      height: 75 * 2.83465, // ~28.3 pt
    });

    // Establecer orientación horizontal
    pdf.pageOrientation('landscape');

    // Quitar márgenes si la hoja es tan pequeña (opcional)
    pdf.pageMargins([2, 2, 2, 2]);

    const logo = await this.getBase64Image('../../../assets/poli_cintillo.png');

    let nombreMaterial = this.informacion[0].material.nombre;
    let NumLetra = 10;
    let margenes: number | [number, number] | [number, number, number, number] = [0, 4.5, 0, 0];

    if (this.informacion[0].material.gramaje) {
      nombreMaterial = `${this.informacion[0].material.nombre} ${this.informacion[0].material.serie} ${this.informacion[0].material.gramaje}g/m2 ${this.informacion[0].material.gramaje}pt (${this.informacion[0].material.origen})`;
      NumLetra = 6;
      margenes = [0, 6, 0, 0];
    }

    const scaled = this.scaleText(nombreMaterial, 10, 38, 1, [0, 3]);

    // CINTILLO
    pdf.add(
      new Table([
        [
          {
            text: 'ESTATUS DEL MATERIAL',
            bold: true,
            color: 'white',
            alignment: 'center',
            fontSize: 18,
            margin: [0, 1],
            fillColor: 'black',
          },
        ],
      ])
        .widths(['*'])
        .layout('noBorders').end,
    );

    // OBSERVACIÓN
    pdf.add(
      new Table([
        [
          new Cell(await new Img('../../../assets/poli_cintillo_negro.png').width(60).build()).alignment('right').end,
          new Cell(new Txt('|').fontSize(20).end).end,
          new Cell(new Txt('OBSERVACIÓN').margin([0, 1]).bold().fontSize(20).end).alignment('left').end,
        ],
      ])
        .widths(['39.5%', '1%', '59.5%'])
        .layout('noBorders')
        .alignment('center')
        .layout({
          hLineWidth: () => 0.25,
          vLineWidth: () => 0,
          hLineColor: () => 'black',
        }).end,
      // new Columns([
      //   {
      //     image: logo,
      //     width: 80
      //   },
      //   {
      //     canvas: [
      //       {
      //         type: 'line',
      //         x1: 0,
      //         y1: 0,
      //         x2: 0,
      //         y2: 40,
      //         lineWidth: 1,
      //         lineColor: '#ccc'
      //       }
      //     ],
      //     width: 2
      //   },
      //   {
      //     text: 'OBSERVACIÓN',
      //     bold: true,
      //     fontSize: 20,
      //     alignment: 'center'
      //   }
      // ]).columnGap(5).end
    );

    // ANALISTA
    // pdf.add(
    //   new Columns([
    //     { text: 'ANALISTA:', bold: true },
    //     { text: 'Nombre Apellido' },
    //     { text: 'FECHA:', bold: true },
    //     { text: '03/01/2026' }
    //   ]).columnGap(10).alignment('center').end
    // );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('ANALISTA:').margin([3, 3, 0, 6]).bold().end).fontSize(10).end,
          new Cell(new Txt('').end).fontSize(0).end,
          new Cell(new Txt('FECHA:').margin([0, 3, 0, 6]).bold().end).fontSize(10).end,
          new Cell(new Txt('').end).fontSize(0).end,
        ],
      ])
        .widths(['20%', '30%', '20%', '30%'])
        .layout('noBorders').end,
    );
    // pdf.add('\n')
    // INFORMACIÓN
    pdf.add(
      new Table([
        [
          new Cell(new Txt('DESCRIPCIÓN:').margin([0, 3]).bold().end).fontSize(10).end,
          new Cell(new Txt(nombreMaterial).margin(scaled.margin).end).fontSize(scaled.fontSize).end,
        ],
      ])
        .widths(['27%', '73%'])
        .layout({
          hLineWidth: () => 0.25,
          vLineWidth: () => 0,
          hLineColor: () => 'black',
        }).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(new Txt('PROVEEDOR:').margin([0, 3]).bold().end).fontSize(10).end,
          new Cell(new Txt(this.recepcion.proveedor.nombre).margin([0, 3]).end).fontSize(10).end,
        ],
      ])
        .widths(['25%', '75%'])
        .layout({
          hLineWidth: () => 0.25,
          vLineWidth: () => 0,
          hLineColor: () => 'black',
        }).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(new Txt('FECHA DE RECEPCIÓN:').margin([0, 3]).bold().end).fontSize(10).end,
          new Cell(new Txt(this.formatFecha(this.recepcion.recepcion)).margin([0, 3]).end).fontSize(10).end,
        ],
      ])
        .widths(['45%', '55%'])
        .layout({
          hLineWidth: () => 0.25,
          vLineWidth: () => 0,
          hLineColor: () => 'black',
        }).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(new Txt('FECHA DE FABRICACIÓN:').margin([0, 3]).bold().end).fontSize(10).end,
          new Cell(new Txt(this.formatFecha(this.recepcion.materiales[0][0].fabricacion)).margin([0, 3]).end).fontSize(
            10,
          ).end,
        ],
      ])
        .widths(['47%', '53%'])
        .layout({
          hLineWidth: () => 0.25,
          vLineWidth: () => 0,
          hLineColor: () => 'black',
        }).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(new Txt('LOTE:').bold().margin([0, 8]).end).fontSize(10).end,
          new Cell(new Txt(this.recepcion.materiales[0][0].lote).bold().end).fontSize(19).end,
        ],
      ])
        .widths(['10%', '90%'])
        .layout({
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          hLineColor: () => 'black',
        }).end,
    );
    // pdf.add(
    //   new Table([
    //     ['DESCRIPCIÓN:', this.informacion[0].material.nombre],
    //     ['PROVEEDOR:', this.recepcion.proveedor.nombre],
    //     ['FECHA DE RECEPCIÓN:', this.formatFecha(this.recepcion.recepcion)],
    //     ['FECHA DE FABRICACIÓN:', this.formatFecha(this.recepcion.materiales[0][0].fabricacion)],
    //     [
    //       'LOTE:',
    //       {
    //         text: this.recepcion.materiales[0][0].lote,
    //         bold: true,
    //         fontSize: 18
    //       }
    //     ]
    //   ])
    //     .widths(['40%', '60%'])
    //     .layout({
    //       hLineWidth: () => 0.5,
    //       vLineWidth: () => 0,
    //       hLineColor: () => 'black'
    //     })
    //     .end
    // );

    // pdf.create().download('etiqueta_material.pdf');
    const pdfDoc = pdf.create();

    pdfDoc.getBase64((base64: string) => {
      this.http
        .post('https:192.168.0.22/api/print', {
          pdfBase64: base64,
          printer: '\\\\192.168.0.39\\IMPRESORA SIO',
          copies: 1,
        })
        .subscribe({
          next: () => console.log('Enviado a imprimir'),
          error: (err) => console.error(err),
        });
    });
  };

  descargarPDFLab = async () => {
    PdfMakeWrapper.setFonts(pdfFonts, {
      Gilroy: {
        normal: 'Gilroy-Light.otf',
        bold: 'Gilroy-ExtraBold.otf',
        italics: 'Gilroy-ExtraBold.otf',
        bolditalics: 'Gilroy-ExtraBold.otf',
      },
      Roboto: {
        normal: 'Roboto-Light.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-Italic.ttf',
      },
    });

    PdfMakeWrapper.useFont('Gilroy');

    const pdf = new PdfMakeWrapper();
    /**
     * Definir tamaño personalizado: [ancho, alto]
     * Si tus medidas son 75mm x 10mm:
     * Convertimos mm a puntos (1mm = 2.83465pt)
     */
    pdf.pageSize({
      width: 100 * 2.83465, // ~212.6 pt
      height: 2 * 28.3465,
    });

    // Establecer orientación horizontal
    pdf.pageOrientation('landscape');

    // Quitar márgenes si la hoja es tan pequeña (opcional)
    pdf.pageMargins([8, 2, 2, 2]);

    pdf.add({
      text: 'Rusbeli Velazquez',
      fontSize: 10,
      bold: true,
      absolutePosition: {
        x: 2.2 * 28.3465 - 1, // left
        y: 1.5 * 28.3465 - 1, // top
      },
    });

    pdf.add({
      text: '03/01/2026',
      fontSize: 10,
      bold: true,
      absolutePosition: {
        x: 7.4 * 28.3465 - 1, // left
        y: 1.5 * 28.3465 - 1, // top
      },
    });

    // pdf.create().download('etiqueta_material.pdf');
    const pdfDoc = pdf.create();

    pdfDoc.getBase64((base64: string) => {
      this.http
        .post('https:192.168.0.22/api/print', {
          pdfBase64: base64,
          printer: '\\\\pol-ind-017\\Etiquetas',
          copies: 1,
        })
        .subscribe({
          next: () => console.log('Enviado a imprimir'),
          error: (err) => console.error(err),
        });
    });
  };

  formatFecha(fecha: any) {
    const d = new Date(fecha);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  }
}
