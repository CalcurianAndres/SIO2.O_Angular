import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import * as moment from 'moment';

import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import pdfFonts from '../../../../assets/fonts/custom';
import { DevolucionesService } from 'src/app/services/devoluciones.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-informacion',
  standalone: false,
  templateUrl: './informacion.component.html',
  styleUrls: ['./informacion.component.scss'],
})
export class InformacionComponent {
  @Input() informacion: any;
  @Input() orden: any;
  @Input() info: any;
  @Output() onCloseModal = new EventEmitter();

  public asignaciones = [];
  public devoluciones = [];
  public asignacionesYDevoluciones: any;

  constructor(
    private oProduccionService: OproduccionService,
    private devolucionesService: DevolucionesService,
    private sanitizer: DomSanitizer,
    public usuario: LoginService,
  ) {}

  pdfSrc: SafeResourceUrl | null = null;
  modalVisible = false;

  async generatePdf(devolucion) {
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

    async function loadImageAsBase64(imagePath: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        fetch(imagePath)
          .then((response) => response.blob())
          .then((blob) => {
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result as string);
          })
          .catch((error) => reject(error));
      });
    }

    // Precargar la imagen en base64
    const base64Image = await loadImageAsBase64('../../assets/poli_cintillo.png');

    const pdf = new PdfMakeWrapper();

    // Configuración de metadatos
    pdf.info({
      title: 'AL-DEV-001', // Título del documento
      author: 'Poligrafica de Venezuela',
      subject: '67e2b1a475a1fd4fe9393386',
      keywords: 'PDF, Reporte, Ventas',
    });

    // Define el header para que se repita en cada página
    pdf.add(
      new Table([
        [
          new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 3, 0, 0]).build())
            .alignment('center')
            .rowSpan(4).end,
          new Cell(
            new Txt(`
                SOLICITUD DE MATERIAL`).bold().end,
          )
            .alignment('center')
            .fontSize(11)
            .rowSpan(4).end,
          new Cell(new Txt('Código: FPR-008').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Fecha de Revision: 12/03/2025').end).fillColor('#dedede').fontSize(5).alignment('center')
            .end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['25%', '50%', '25%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('SUB UNIDAD:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('ASIG. ASOCIADA:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('Nº:').fontSize(5.7).end).border([true, true, true, false]).end,
        ],
        [
          new Cell(new Txt(`PRODUCCIÓN`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`AL-ASG-25-001`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
            .end,
          new Cell(new Txt(`AL-DEV-${devolucion.numero}`).alignment('center').fontSize(18).bold().end)
            .margin([0, -3, 0, -3])
            .border([true, false, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['50%', '20%', '30%']).end,
    );

    function formatearFecha(createdAt: Date | string): string {
      const fecha = new Date(createdAt);
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
      const anio = fecha.getFullYear();

      return `${dia}/${mes}/${anio}`;
    }

    pdf.add(
      new Table([
        [
          new Cell(new Txt('Nº OP:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('PRODUCTO:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(`${devolucion.op.numero_op}`).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(`${devolucion.op.producto[0].identificacion.producto}`).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(`${formatearFecha(devolucion.createdAt)}`).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['10%', '60%', '30%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('DESCRIPCIÓN DE LA DEVOLUCIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['100%']).end,
    );

    let materiales: any = [];

    console.log(devolucion.material);
    for (let i = 0; i < devolucion.material.length; i++) {
      let l = devolucion.material.length - 1;

      materiales.push([
        new Cell(new Txt(devolucion.material[i].material.material.nombre).fontSize(9).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt('Vitamax').fontSize(9).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt(devolucion.material[i].material.codigo).fontSize(9).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt(devolucion.material[i].material.lote).fontSize(9).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [false, false, true, false] : [false, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt(devolucion.material[i].cantidad).fontSize(9).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
      ]);
    }

    pdf.add(
      new Table([
        [
          new Cell(new Txt('MATERIAL:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('MARCA:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('CÓDIGO:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('LOTE:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('CANTIDAD ASIGNADA:').fontSize(5.7).end).border([true, true, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['43%', '12%', '15%', '16%', '14%']).end,
    );

    pdf.add(
      new Table(materiales)
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['43%', '12%', '15%', '16%', '14%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('MOTIVO').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
          new Cell(new Txt('DEVUELTO POR').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
          new Cell(new Txt('RECIBIDO POR').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('USUARIO:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('USUARIO:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(devolucion.observacion).fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('Freddy Burgos').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, false])
            .end,
          new Cell(new Txt('Yraida Baptista').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, false])
            .end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA - HORA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA - HORA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, true]).end,
          new Cell(new Txt('18/03/2025 - 10:56 am').fontSize(9).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('18/03/2025 - 10:56 am').fontSize(9).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['60%', '20%', '20%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).end,
          new Cell(new Txt('VERIFICACIÓN FÍSICA').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .colSpan(2)
            .fillColor('#a5acb2').end,
          new Cell(new Txt('').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
        [
          new Cell(new Txt('').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).end,
          new Cell(new Txt('DEVUELTO POR').alignment('center').fontSize(7).end)
            .fillColor('#F2F2F2')
            .border([true, false, true, false]).end,
          new Cell(new Txt('RECIBIDO POR').alignment('center').fontSize(7).end)
            .fillColor('#F2F2F2')
            .border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([false, false, false, false]).end,
          new Cell(
            new Txt(`NOMBRE:
              
              `).fontSize(5.7).end,
          ).border([true, false, true, false]).end,
          new Cell(
            new Txt(`NOMBRE:
              
              `).fontSize(5.7).end,
          ).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([false, false, false, false]).end,
          new Cell(new Txt('FIRMA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('FIRMA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([false, false, false, false]).end,
          new Cell(
            new Txt(`
              
              `).fontSize(11).end,
          )
            .margin([0, -3, 0, 0])
            .border([true, false, true, false]).end,
          new Cell(
            new Txt(`
              
              `).fontSize(11).end,
          )
            .margin([0, -3, 0, 0])
            .border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([false, false, false, false]).end,
          new Cell(
            new Txt(`FECHA:            /               /

              
              HORA:`).fontSize(5.7).end,
          ).border([true, false, true, true]).end,
          new Cell(
            new Txt(`FECHA:            /               /

              
              HORA:`).fontSize(5.7).end,
          ).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['60%', '20%', '20%']).end,
    );

    function getFormattedDate() {
      const now = new Date();
      const date = now.toLocaleDateString('es-ES');
      const time = now.toLocaleTimeString('es-ES', { hour12: false });
      return `${date} ${time}`;
    }
    pdf.add(new Txt(' ').fontSize(10).end);
    pdf.add(
      new Txt('"Si usted está consultando una versión de este documento, asegúrese que sea la vigente."')
        .fontSize(6.5)
        .alignment('center').end,
    );

    // 📌 Footer fijo en la parte inferior de la hoja

    pdf.footer((currentPage, pageCount) => {
      return new Table([
        [
          new Cell(new Txt(`ID: 67e2b1a475a1fd4fe9393386`).fontSize(6).end).border([false]).end,
          new Cell(
            new Txt(
              `Impreso por: ${this.usuario.usuario.Nombre} ${this.usuario.usuario.Apellido} - ${getFormattedDate()}`,
            )
              .fontSize(6)
              .alignment('right').end,
          ).border([false]).end,
        ],
      ])
        .widths(['50%', '50%'])
        .margin([40, 0, 40, 0]).end;
    });

    // Obtener el PDF como Blob de forma asíncrona
    pdf.create().getBlob((pdfBlob: Blob) => {
      const objectUrl = URL.createObjectURL(pdfBlob);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl); // 🔥 Evita el error NG0904
      this.modalVisible = true;
    });
  }

  async generarSolicitud(solicitud) {
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

    // Configuración de metadatos
    pdf.info({
      title: 'AL-DEV-001', // Título del documento
      author: 'Poligrafica de Venezuela',
      subject: '67e2b1a475a1fd4fe9393386',
      keywords: 'PDF, Reporte, Ventas',
    });

    pdf.add(
      new Table([
        [
          new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 3, 0, 0]).build())
            .alignment('center')
            .rowSpan(4).end,
          new Cell(
            new Txt(`
                SOLICITUD DE MATERIAL`).bold().end,
          )
            .alignment('center')
            .fontSize(11)
            .rowSpan(4).end,
          new Cell(new Txt('Código: FPR-008').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Fecha de Revision: 12/03/2025').end).fillColor('#dedede').fontSize(5).alignment('center')
            .end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['25%', '50%', '25%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('SUB UNIDAD:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('Nº:').fontSize(5.7).end).border([true, true, true, false]).end,
        ],
        [
          new Cell(new Txt(`PRODUCCIÓN`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`AL-SOL-${solicitud.numero}`).alignment('center').fontSize(18).bold().end)
            .margin([0, -3, 0, -3])
            .border([true, false, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['70.5%', '29.5%']).end,
    );

    function formatearFecha(createdAt: Date | string): string {
      const fecha = new Date(createdAt);
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
      const anio = fecha.getFullYear();

      return `${dia}/${mes}/${anio}`;
    }

    pdf.add(
      new Table([
        [
          new Cell(new Txt('Nº OP:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('PRODUCTO:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(`${solicitud.op.numero_op}`).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(`${solicitud.op.producto[0].identificacion.producto}`).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(`${formatearFecha(solicitud.createdAt)}`).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['10%', '60%', '30%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('DESCRIPCIÓN DE LA SOLICITUD').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['100%']).end,
    );

    let materiales: any = [];
    console.log(solicitud.materiales);
    for (let i = 0; i < solicitud.materiales.length; i++) {
      let l = solicitud.materiales.length - 1;

      materiales.push([
        new Cell(new Txt(solicitud.materiales[i].material.nombre).fontSize(9).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt('Vitamax').fontSize(9).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt(solicitud.materiales[i].cantidad).fontSize(9).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
      ]);
    }

    pdf.add(
      new Table([
        [
          new Cell(new Txt('MATERIAL:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('MARCA:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('CANTIDAD ASIGNADA:').fontSize(5.7).end).border([true, true, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['70%', '15%', '15%']).end,
    );

    pdf.add(
      new Table(materiales)
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['70%', '15%', '15%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('MOTIVO').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
          new Cell(new Txt('SOLICITADO POR').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
          new Cell(new Txt('RECIBIDO POR').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('USUARIO:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('USUARIO:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(solicitud.motivo).fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('Freddy Burgos').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, false])
            .end,
          new Cell(new Txt('Yraida Baptista').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, false])
            .end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA - HORA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA - HORA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, true]).end,
          new Cell(new Txt('18/03/2025 - 10:56 am').fontSize(9).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('18/03/2025 - 10:56 am').fontSize(9).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['60%', '20%', '20%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    function getFormattedDate() {
      const now = new Date();
      const date = now.toLocaleDateString('es-ES');
      const time = now.toLocaleTimeString('es-ES', { hour12: false });
      return `${date} ${time}`;
    }
    pdf.add(new Txt(' ').fontSize(10).end);
    pdf.add(
      new Txt('"Si usted está consultando una versión de este documento, asegúrese que sea la vigente."')
        .fontSize(6.5)
        .alignment('center').end,
    );

    // 📌 Footer fijo en la parte inferior de la hoja

    pdf.footer((currentPage, pageCount) => {
      return new Table([
        [
          new Cell(new Txt(`ID: 67e2b1a475a1fd4fe9393386`).fontSize(6).end).border([false]).end,
          new Cell(
            new Txt(
              `Impreso por: ${this.usuario.usuario.Nombre} ${this.usuario.usuario.Apellido} - ${getFormattedDate()} - ${currentPage}/${pageCount}`,
            )
              .fontSize(6)
              .alignment('right').end,
          ).border([false]).end,
        ],
      ])
        .widths(['50%', '50%'])
        .margin([40, 0, 40, 0]).end;
    });

    // Obtener el PDF como Blob de forma asíncrona
    pdf.create().getBlob((pdfBlob: Blob) => {
      const objectUrl = URL.createObjectURL(pdfBlob);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl); // 🔥 Evita el error NG0904
      this.modalVisible = true;
    });
  }

  async generarAsignacion(asignacion) {
    let img = await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 3, 0, 0]).build();

    console.log(asignacion);

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

    pdf.pageMargins([39, 180, 39, 285]);

    // Configuración de metadatos
    pdf.info({
      title: 'AL-DEV-001', // Título del documento
      author: 'Poligrafica de Venezuela',
      subject: '67e2b1a475a1fd4fe9393386',
      keywords: 'PDF, Reporte, Ventas',
    });

    function formatearFecha(createdAt: Date | string): string {
      const fecha = new Date(createdAt);
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
      const anio = fecha.getFullYear();

      return `${dia}/${mes}/${anio}`;
    }

    pdf.header((currentPage, pageCount) => {
      return {
        margin: [39, 0, 39, 20], // <-- margen interno del header, lo que evita el "aplastado"
        stack: [
          new Txt(`
            `)
            .bold()
            .fontSize(9)
            .margin([0, 0, 0, 5])
            .alignment('left').end,

          new Table([
            [
              new Cell(img).alignment('center').rowSpan(4).end,
              new Cell(
                new Txt(`
                ASIGNACIÓN DE MATERIAL`).bold().end,
              )
                .alignment('center')
                .fontSize(11)
                .rowSpan(4).end,
              new Cell(new Txt('Código: FPR-008').end).fillColor('#dedede').fontSize(5).alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('Fecha de Revisión: 12/03/2025').end)
                .fillColor('#dedede')
                .fontSize(5)
                .alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt(`Página: ${currentPage} de ${pageCount}`).end)
                .fillColor('#dedede')
                .fontSize(5)
                .alignment('center').end,
            ],
          ])
            .layout({
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#555',
              vLineColor: () => '#555',
            })
            .widths(['25%', '50%', '25%']).end,

          new Txt(`
              `)
            .bold()
            .fontSize(9)
            .margin([0, 0, 0, 5])
            .alignment('left').end,

          new Table([
            [
              new Cell(new Txt('SUB UNIDAD:').fontSize(5.7).end).border([true, true, true, false]).end,
              new Cell(new Txt('SOLIC. ASOCIADA:').fontSize(5.7).end).border([true, true, true, false]).end,
              new Cell(new Txt('Nº:').fontSize(5.7).end).border([true, true, true, false]).end,
            ],
            [
              new Cell(new Txt(`PRODUCCIÓN`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
                .end,
              new Cell(new Txt(`AL-SOL-${asignacion.solicitud}`).fontSize(11).end)
                .margin([0, -3, 0, 0])
                .border([true, false, true, true]).end,
              new Cell(new Txt(`AL-ASG-${asignacion.numero}`).alignment('center').fontSize(18).bold().end)
                .margin([0, -3, 0, -3])
                .border([true, false, true, false]).end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            })
            .widths(['50%', '20%', '30%']).end,

          new Table([
            [
              new Cell(new Txt('Nº OP:').fontSize(5.7).end).border([true, false, true, false]).end,
              new Cell(new Txt('PRODUCTO:').fontSize(5.7).end).border([true, false, true, false]).end,
              new Cell(new Txt('FECHA:').fontSize(5.7).end).border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt(`${asignacion.op.numero_op}`).fontSize(11).end)
                .margin([0, -3, 0, 0])
                .border([true, false, true, true]).end,
              new Cell(new Txt(`${asignacion.op.producto[0].identificacion.producto}`).fontSize(11).end)
                .margin([0, -3, 0, 0])
                .border([true, false, true, true]).end,
              new Cell(new Txt(`${formatearFecha(asignacion.createdAt)}`).fontSize(11).end)
                .margin([0, -3, 0, 0])
                .border([true, false, true, true]).end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            })
            .widths(['10%', '60%', '30%']).end,

          new Txt(` `).fontSize(9).end,

          new Table([
            [
              new Cell(
                new Txt('DESCRIPCIÓN DE LA DEVOLUCIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end,
              )
                .border([false])
                .fillColor('#a5acb2').end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            })
            .widths(['100%']).end,
        ],
      };
    });

    let materiales: any = [];
    for (let i = 0; i < asignacion.material.length; i++) {
      let l = 24;

      if (i === asignacion.material.length - 1) {
        l = asignacion.material.length - 1;
      }

      materiales.push([
        new Cell(new Txt(asignacion.material[i].material.material.nombre).fontSize(13).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt('Vitamax').fontSize(13).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt(asignacion.material[i].material.codigo).fontSize(13).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt(asignacion.material[i].material.lote).fontSize(13).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [false, false, true, false] : [false, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt(asignacion.material[i].cantidad).fontSize(13).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
      ]);
    }

    pdf.add(
      new Table([
        [
          new Cell(new Txt('MATERIAL:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('MARCA:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('CÓDIGO:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('LOTE:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('CANTIDAD ASIGNADA:').fontSize(5.7).end).border([true, true, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['43%', '12%', '15%', '16%', '14%']).end,
    );

    pdf.add(
      new Table(materiales)
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['43%', '12%', '15%', '16%', '14%']).end,
    );

    // 📌 Footer fijo en la parte inferior de la hoja

    pdf.footer((currentPage, pageCount) => {
      return [
        new Table([
          [
            new Cell(new Txt('').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).end,
            new Cell(new Txt('ASIGNADO POR').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
              .border([false])
              .fillColor('#a5acb2').end,
            new Cell(new Txt('RECIBIDO POR').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
              .border([false])
              .fillColor('#a5acb2').end,
          ],
          [
            new Cell(new Txt('').fontSize(11).end).border([false]).end,
            new Cell(new Txt('USUARIO:').fontSize(5.7).end).border([true, false, true, false]).end,
            new Cell(new Txt('USUARIO:').fontSize(5.7).end).border([true, false, true, false]).end,
          ],
          [
            new Cell(new Txt('').fontSize(11).end).border([false]).end,
            new Cell(new Txt('Yraida Baptista').fontSize(11).end)
              .margin([0, -3, 0, 0])
              .border([true, false, true, false]).end,
            new Cell(new Txt('Freddy Burgos').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, false])
              .end,
          ],
          [
            new Cell(new Txt('').fontSize(11).end).border([false]).end,
            new Cell(new Txt('FECHA - HORA:').fontSize(5.7).end).border([true, false, true, false]).end,
            new Cell(new Txt('FECHA - HORA:').fontSize(5.7).end).border([true, false, true, false]).end,
          ],
          [
            new Cell(new Txt('').fontSize(11).end).border([false]).end,
            new Cell(new Txt('18/03/2025 - 10:56 am').fontSize(9).end)
              .margin([0, -3, 0, 0])
              .border([true, false, true, true]).end,
            new Cell(new Txt('18/03/2025 - 10:56 am').fontSize(9).end)
              .margin([0, -3, 0, 0])
              .border([true, false, true, true]).end,
          ],
        ])
          .layout({
            hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
            vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
            hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          })
          .margin([39, 0, 39, 0])
          .widths(['60%', '20%', '20%']).end,
        new Txt(' ').fontSize(10).end,
        new Stack([
          new Table([
            [
              new Cell(new Txt('').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).end,
              new Cell(new Txt('VERIFICACIÓN FÍSICA').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
                .colSpan(2)
                .fillColor('#a5acb2').end,
              new Cell(new Txt('').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
                .border([false])
                .fillColor('#a5acb2').end,
            ],
            [
              new Cell(new Txt('').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).end,
              new Cell(new Txt('ASIGNADO POR').alignment('center').fontSize(7).end)
                .fillColor('#F2F2F2')
                .border([true, false, true, false]).end,
              new Cell(new Txt('RECIBIDO POR').alignment('center').fontSize(7).end)
                .fillColor('#F2F2F2')
                .border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt('').fontSize(11).end).border([false, false, false, false]).end,
              new Cell(
                new Txt(`NOMBRE:
                
                `).fontSize(5.7).end,
              ).border([true, false, true, false]).end,
              new Cell(
                new Txt(`NOMBRE:
                
                `).fontSize(5.7).end,
              ).border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt('').fontSize(11).end).border([false, false, false, false]).end,
              new Cell(new Txt('FIRMA:').fontSize(5.7).end).border([true, false, true, false]).end,
              new Cell(new Txt('FIRMA:').fontSize(5.7).end).border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt('').fontSize(11).end).border([false, false, false, false]).end,
              new Cell(
                new Txt(`
                
                `).fontSize(11).end,
              )
                .margin([0, -3, 0, 0])
                .border([true, false, true, false]).end,
              new Cell(
                new Txt(`
                
                `).fontSize(11).end,
              )
                .margin([0, -3, 0, 0])
                .border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt('').fontSize(11).end).border([false, false, false, false]).end,
              new Cell(
                new Txt(`FECHA:            /               /
  
                
                HORA:`).fontSize(5.7).end,
              ).border([true, false, true, true]).end,
              new Cell(
                new Txt(`FECHA:            /               /
  
                
                HORA:`).fontSize(5.7).end,
              ).border([true, false, true, true]).end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            })
            .dontBreakRows(true)
            .margin([39, 0, 39, 0])
            .widths(['60%', '20%', '20%']).end,
        ]).end,

        new Txt(' ').fontSize(10).end,

        new Txt('"Si usted está consultando una versión de este documento, asegúrese que sea la vigente."')
          .fontSize(6.5)
          .alignment('center').end,
        new Table([
          [
            new Cell(new Txt(`ID: 67e2b1a475a1fd4fe9393386`).fontSize(6).end).border([false]).end,
            new Cell(
              new Txt(`Impreso por: ${this.usuario.usuario.Nombre} ${this.usuario.usuario.Apellido} - `)
                .fontSize(6)
                .alignment('right').end,
            ).border([false]).end,
          ],
        ])
          .widths(['50%', '50%'])
          .margin([40, 0, 40, 0]).end,
      ];
    });

    function getFormattedDate_() {
      const now = new Date();
      const date = now.toLocaleDateString('es-ES');
      const time = now.toLocaleTimeString('es-ES', { hour12: false });
      return `${date} ${time}`;
    }

    // Obtener el PDF como Blob de forma asíncrona
    pdf.create().getBlob((pdfBlob: Blob) => {
      const objectUrl = URL.createObjectURL(pdfBlob);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl); // 🔥 Evita el error NG0904
      this.modalVisible = true;
    });
  }

  cerrar_modal() {
    this.modalVisible = false;
    this.pdfSrc = null; // Limpiar el PDF al cerrar el modal
  }

  ngOnInit() {}

  descargarOrden = async (orden) => {
    // Configuring custom fonts
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

    // Array de pasos (steps) que puede variar en cantidad
    let steps: any = [];

    for (let i = 0; i < orden.fases.length; i++) {
      steps.push({
        title: orden.fases[i].maquina.nombre,
        subtitle: orden.fases[i].nombre,
        date: moment(orden.fases[i].fases[0].fecha).format('DD/MM/YYYY'),
      });
    }

    const stepsCount = steps.length;
    const columnWidth = 514 / steps.length; // ancho fijo de cada columna
    const tableWidth = stepsCount * columnWidth;
    const circleRadius = 10; // radio del círculo
    const circleCenterY = 20; // posición vertical en el canvas

    // Fila superior: textos (título y subtítulo) centrados en cada celda
    const topRow = steps.map((step) => ({
      text: `${step.title}\n${step.subtitle}`,
      alignment: 'center',
      fontSize: 8,
      margin: [0, 3, 0, 0],
    }));

    // Fila inferior: fechas centradas en cada celda
    const bottomRow = steps.map((step) => ({
      text: step.date,
      alignment: 'center',
      fontSize: 6,
      margin: [0, 3, 0, 0],
    }));

    // Fila central: un canvas que abarca todas las columnas
    // Se calcula la posición de cada círculo en base a la columna en la que debe estar
    const canvasItems: any[] = [];
    for (let i = 0; i < stepsCount; i++) {
      // Posición X: centro exacto de la columna (i * columnWidth + half column)
      const centerX = i * columnWidth + columnWidth / 2;
      // Dibujar el círculo
      canvasItems.push({
        type: 'ellipse',
        x: centerX,
        y: circleCenterY,
        color: 'white',
        lineColor: '#c5c5c5',
        lineWidth: 2,
        r1: circleRadius,
        r2: circleRadius,
      });
      // Si no es el último, dibujar la línea de conexión al siguiente círculo
      if (i < stepsCount - 1) {
        const nextCenterX = (i + 1) * columnWidth + columnWidth / 2;
        canvasItems.push({
          type: 'line',
          x1: centerX + circleRadius, // borde derecho del círculo actual
          y1: circleCenterY,
          x2: nextCenterX - circleRadius, // borde izquierdo del siguiente círculo
          y2: circleCenterY,
          lineWidth: 5,
          lineColor: '#c5c5c5',
        });
      }
    }

    // La fila del canvas se arma con una celda que hace colSpan de todas las columnas
    // y se completan las celdas restantes con objetos vacíos para que la fila tenga el mismo número de celdas
    const canvasRow = [
      {
        canvas: canvasItems,
        width: tableWidth,
        height: 60,
        colSpan: stepsCount,
      },
      ...Array(stepsCount - 1).fill({}),
    ];

    const pdf = new PdfMakeWrapper();

    // pdf.watermark( new Txt('watermark with Txt object').color('blue').end );

    pdf.add(
      new Table([
        [
          new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 5, 0, -10]).build())
            .alignment('center')
            .rowSpan(4).end,
          new Cell(
            new Txt(`
                  ORDEN DE PRODUCCIÓN
                  `).bold().end,
          )
            .alignment('center')
            .fontSize(11)
            .rowSpan(4).end,
          new Cell(new Txt('Código: FPR-008').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Fecha de Revision: 12/03/2025').end).fillColor('#dedede').fontSize(5).alignment('center')
            .end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['25%', '50%', '25%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('INFORMACIÓN DEL PRODUCTO').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('ORDEN DE PRODUCCIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
        [
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(
            new Txt([
              { text: 'N', fontSize: 5.7 },
              { text: 'º', font: 'Roboto', fontSize: 5.7 },
            ]).end,
          ).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(orden.producto[0].identificacion.producto).fontSize(11).end)
            .margin([0, -3, 0, -3])
            .border([true, false, true, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt(orden.numero_op).alignment('center').fontSize(22).bold().end)
            .margin([0, -15, 0, -3])
            .border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['69%', '1%', '30%']).end,
    );

    let emision = moment(orden.createdAt).format('DD/MM/YYYY');
    pdf.add(
      new Table([
        [
          new Cell(new Txt('CÓDIGO DE ESPECIFICACIÓN:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('CÓDIGO DE PRODUCTO CLIENTE:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('FECHA DE EMISIÓN').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(
            new Txt(
              `E-${orden.producto[0].identificacion.cliente.codigo}-${orden.producto[0].identificacion.codigo}-${orden.producto[0].identificacion.version}`,
            ).fontSize(11).end,
          )
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(orden.producto[0].identificacion.codigo_cliente).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt(`${emision}`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['30%', '38.5%', '1%', '30.6%']).end,
    );
    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, false, false, false]).end]]).widths(['100%'])
        .end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('INFORMACIÓN DEL CLIENTE').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );

    let fecha_oc = moment(orden.solicitud).format('DD/MM/YYYY');

    pdf.add(
      new Table([
        [
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(
            new Txt([
              { text: 'N', fontSize: 5.7 },
              { text: 'º', font: 'Roboto', fontSize: 5.7 },
              { text: ' ORDEN DE COMPRA', fontSize: 5.7 },
            ]).end,
          ).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA DE OC:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(orden.producto[0].identificacion.cliente.nombre).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(orden.oc.orden).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
            .end,
          new Cell(new Txt(fecha_oc).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['50%', '25%', '25%']).end,
    );

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, false, false, false]).end]]).widths(['100%'])
        .end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('CANTIDADES Y ENTREGAS').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(new Txt('CANTIDAD SOLICITADA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA SOLICITADA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('LUGAR DE ENTREGA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['30%', '30%', '40%']).end,
    );

    // Filtramos los pedidos que correspondan al producto de la orden
    const pedidosFiltrados = orden.oc.pedido.filter((pedido) => pedido.producto === orden.producto[0]._id);

    // Iteramos sobre los pedidos filtrados para formatear la fecha y la cantidad
    pedidosFiltrados.forEach((pedido) => {
      // Formateamos la fecha
      pedido.solicitud = moment(pedido.solicitud).format('DD/MM/YYYY');
      // Formateamos la cantidad: separador de miles '.' y decimales ','
      // Usamos toLocaleString con la configuración de 'es-ES'
      pedido.cantidadFormateada = Number(pedido.cantidad).toLocaleString('es-ES');
    });

    //   // Creamos las filas de la tabla con los datos formateados
    //   const filasTabla:ICell =
    //     new Cell(new Stack([pedidosFiltrados.cantidadFormateada]).fontSize(11).end)
    //       .margin([0, -3, 0, 0])
    //       .border([true, false, true, true])
    //       .end,
    //     new Cell(new Stack([pedidosFiltrados.solicitud]).fontSize(11).end)
    //       .margin([0, -3, 0, 0])
    //       .border([true, false, true, true])
    //       .end,
    //     // Aquí puedes mantener o modificar el valor del lugar, por ejemplo:
    //     new Cell(new Stack(['Planta San Joaquin']).fontSize(11).end)
    //       .margin([0, -3, 0, 0])
    //       .border([true, false, true, true])
    //       .end
    // ;

    let total = pedidosFiltrados.reduce((acumulador, pedido) => acumulador + Number(pedido.cantidad), 0);
    total = Number(total).toLocaleString('es-ES');

    let celdas: any = [];
    for (let i = 0; i < pedidosFiltrados.length; i++) {
      let l = pedidosFiltrados.length - 1;

      celdas.push([
        new Cell(new Txt(pedidosFiltrados[i].cantidadFormateada).fontSize(11).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt(pedidosFiltrados[i].solicitud).fontSize(11).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [false, false, true, false] : [false, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt('Planta San Joaquin').fontSize(11).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
      ]);
    }
    pdf.add(
      new Table(celdas)
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['30%', '30%', '40%']).end,
    );

    // Agregamos la tabla al PDF
    // pdf.add(
    //   new Table(filasTabla)
    //     .layout({
    //       hLineWidth: (rowIndex, node, columnIndex) => 0.5,
    //       vLineWidth: (rowIndex, node, columnIndex) => 0.5,
    //       hLineColor: (rowIndex, node, columnIndex) => '#555',
    //       vLineColor: (rowIndex, node, columnIndex) => '#555'
    //     })
    //     .widths(['30%', '30%', '40%'])
    //     .heights(38)
    //     .end
    // );

    pdf.add(
      new Table([
        [new Cell(new Txt('TOTAL:').fontSize(5.7).end).border([true, false, true, false]).end],
        [new Cell(new Txt(total).bold().fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['28.9%']).end,
    );

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, false, false, false]).end]]).widths(['100%'])
        .end,
    );

    pdf.add(
      new Table([
        [
          new Cell(
            new Txt('SUSTRATO / MONTAJE / IMPRESIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end,
          )
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );

    console.log(orden.sustrato.sustrato.nombre);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(
            new Txt([
              { text: 'GRAMAJE(g/m', fontSize: 5.7 },
              { text: '²', font: 'Roboto', fontSize: 5.7 },
              { text: ')', fontSize: 5.7 },
            ]).end,
          ).border([true, false, true, false]).end,
          new Cell(new Txt('CALIBRE(µm):').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('TAMAÑO DEL PLIEGO (cm):').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(orden.sustrato.sustrato.nombre).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(orden.sustrato.sustrato.gramaje).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(orden.sustrato.sustrato.calibre).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('73 x 103').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['55%', '15%', '15%', '15%']).end,
    );

    let asignadas = orden.hojas + orden.demasia;
    let demasia_percent: any = (orden.demasia * 100) / asignadas;

    asignadas = Number(asignadas).toLocaleString('es-ES');
    let demasia = Number(orden.demasia).toFixed(2);
    demasia = Number(demasia).toLocaleString('es-ES');
    let pa_imprimir = Number(orden.hojas).toLocaleString('es-ES');

    demasia_percent = Number(demasia_percent.toFixed(2)).toLocaleString('es-ES');

    pdf.add(
      new Table([
        [
          new Cell(new Txt('TAMAÑO A IMPRIMIR (cm):').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('DIRECCIÓN DE FIBRA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(
            new Txt([
              { text: 'N', fontSize: 5.7 },
              { text: 'º', font: 'Roboto', fontSize: 5.7 },
              { text: ' EJEMPLARES', fontSize: 5.7 },
            ]).end,
          ).border([true, false, true, false]).end,
          new Cell(new Txt('HOJAS A ASIGNAR:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('HOJAS DE DEMASÍA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('HOJAS A IMPRIMIR:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('72 x 102').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt('102').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(orden.ejemplares).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
            .end,
          new Cell(new Txt(asignadas).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`${demasia}(${demasia_percent}%)`).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(pa_imprimir).bold().fontSize(14).end).margin([0, -6, 0, 0]).border([true, false, true, true])
            .end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['16.8%', '16%', '16%', '20%', '15.7%', '15.6%']).end,
    );

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, false, false, false]).end]]).widths(['100%'])
        .end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('COLORES / TINTAS / BARNIZ').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('SEC:').fontSize(5.7).end).border([true, false, false, false]).end,
          new Cell(new Txt('COLORES:').fontSize(5.7).end).border([false, false, true, false]).end,
          new Cell(new Txt('CÓDIGO DE PELICULAS:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('TINTA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('CANTIDAD (Kg):').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['3%', '22%', '20%', '45%', '10%']).end,
    );

    let data: any = [];

    for (let i = 0; i < orden.producto[0].impresion.secuencia[0].length; i++) {
      console.log(orden.tinta[i].tinta);

      data.push({
        seq: i + 1,
        color: orden.producto[0].impresion.secuencia[0][i],
        tinta: `${orden.tinta[i].tinta.nombre} (${orden.tinta[i].tinta.fabricante.alias})`,
        cantidad: Number(orden.tinta[i].cantidad).toLocaleString('es-ES'),
      });
    }

    for (let i = 0; i < data.length; i++) {
      pdf.add(
        new Table([
          [
            new Cell(new Txt(data[i].seq).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([true, false, false, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
            new Cell(new Txt(data[i].color).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([false, false, true, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
            new Cell(new Txt(data.peliculas).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([true, false, true, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
            new Cell(new Txt(data[i].tinta).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([true, false, true, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
            new Cell(new Txt(data[i].cantidad).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([true, false, true, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
          ],
        ])
          .layout({
            hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
            vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
            hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          })
          .widths(['3%', '22%', '20%', '45%', '10%']).end,
      );
    }

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, true, false, false]).end]])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['100%']).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(
            new Table([
              [
                new Cell(new Txt('BARNICES / PEGAMENTO').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
                  .border([false])
                  .fillColor('#a5acb2').end,
              ],
            ]).widths(['100%']).end,
          ).end,
          new Cell(
            new Table([
              [
                new Cell(new Txt('EMBALAJE').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
                  .border([false])
                  .fillColor('#a5acb2').end,
              ],
            ]).widths(['100%']).end,
          ).end,
        ],
        [
          new Cell(
            new Table([
              [
                new Cell(new Txt('BARNIZ ACUOSO / UV / ESPECIAL:').fontSize(5.7).end).border([true, false, true, false])
                  .end,
              ],
              [
                new Cell(new Txt(orden.barniz.barniz.nombre).fontSize(11).end)
                  .margin([0, -3, 0, 0])
                  .border([true, false, true, true]).end,
              ],
              [new Cell(new Txt('PEGAMENTO:').fontSize(5.7).end).border([true, false, true, false]).end],
              [
                new Cell(new Txt(orden.pega.pega.nombre).fontSize(11).end)
                  .margin([0, -3, 0, 0])
                  .border([true, false, true, true]).end,
              ],
            ])
              .margin([0, -4])
              .layout({
                hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              })
              .widths(['100%']).end,
          ).end,
          new Cell(
            new Table([
              [
                new Cell(new Txt('CÓDIGO DE CAJA:').fontSize(5.7).end).border([true, false, true, false]).end,
                new Cell(new Txt('CANT. NECESARIA:').fontSize(5.7).end).border([true, false, true, false]).end,
                new Cell(new Txt('UNID. POR CAJA:').fontSize(5.7).end).border([true, false, true, false]).end,
                new Cell(new Txt('CINTA EMB. (m):').fontSize(5.7).end).border([true, false, true, false]).end,
              ],
              [
                new Cell(
                  new Txt([
                    { text: 'Caja N', fontSize: 11 },
                    { text: 'º', font: 'Roboto', fontSize: 11 },
                    { text: ' 11', fontSize: 11 },
                  ]).end,
                )
                  .margin([0, -3, 0, 0])
                  .border([true, false, true, true]).end,
                new Cell(new Txt('154').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
                new Cell(new Txt('136.000').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
                  .end,
                new Cell(new Txt('1.560,25').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
                  .end,
              ],
            ])
              .layout({
                hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              })
              .widths(['25%', '25%', '25%', '25%']).end,
          )
            .margin([0, -4])
            .border([false]).end,
        ],
      ])
        .layout('noBorders')
        .widths(['50%', '50%']).end,
    );

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(3).end).border([false, false, false, false]).end]])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['100%']).end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('PLANIFICACIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );

    // Se arma la tabla con 3 filas: superior, canvas y fechas.
    // Se define un layout personalizado sin padding para evitar desajustes.
    pdf.add({
      table: {
        widths: Array(stepsCount).fill(columnWidth),
        body: [topRow, canvasRow, bottomRow],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
    });

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(3).end).border([false, false, false, false]).end]])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['100%']).end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('OBSERVACIONES').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
          new Cell(new Txt(' ').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).end,
          new Cell(new Txt('ELABORADO POR').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('Andrés Calcurian:').fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('FIRMA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt(' ').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('FECHA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, true]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('18/03/2025').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['69%', '1%', '30%']).end,
    );

    // pdf.add(
    //   new Table([
    //     [
    //       new Cell(new Txt('POST-IMPRESIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end,
    //       new Cell(new Txt('').end).border([false]).end,
    //       new Cell(new Txt('BARNICES / PEGAMENTO').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end
    //     ],
    //   ]).widths(['54%','1%','45%']).end
    // )

    // pdf.add(
    //   new Table([
    //     [
    //       new Cell(new Txt('FASE:').fontSize(5.7).end).border([true,false,true,false]).end,
    //       new Cell(new Txt('MÁQUINA:').fontSize(5.7).end).border([true,false,true,false]).end,
    //       new Cell(new Txt('').fontSize(5.7).end).border([false]).end,
    //       new Cell(new Txt('BARNIZ ACUOSO / UV / ESPECIAL:').fontSize(5.7).end).border([true,false,true,false]).end,
    //     ],
    //   ]).widths(['26.5%','26.5%','1.3%','45.7%']).end
    // )
    // pdf.add(
    //   new Table([
    //     [
    //       new Cell(new Txt('FASE:').fontSize(11).end).border([true,false,true,false]).end,
    //       new Cell(new Txt('MÁQUINA:').fontSize(11).end).border([true,false,true,false]).end,
    //       new Cell(new Txt('').fontSize(11).end).border([false]).end,
    //       new Cell(new Txt('BARNIZ ACUOSO / UV / ESPECIAL:').fontSize(11).end).border([true,false,true,false]).end,
    //     ],
    //   ]).widths(['26.5%','26.5%','1.3%','45.7%']).end
    // )

    pdf.create().download();
  };

  // Método para cerrar el modal
  cerrar() {
    this.onCloseModal.emit();
  }
}
