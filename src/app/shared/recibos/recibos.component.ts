import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfMakeWrapper, Table, Txt, Columns, Canvas, Line, ITable } from 'pdfmake-wrapper';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuración de fuentes
PdfMakeWrapper.setFonts(pdfFonts);

interface LogisticaTarea {
  fecha: string;
  descripcion: string;
  horas: number;
}

@Component({
  selector: 'app-recibos',
  templateUrl: './recibos.component.html',
  styleUrls: ['./recibos.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RecibosComponent {
  hoy = new Date().toLocaleDateString('es-VE');

  constructor() {
    const guardado = localStorage.getItem('mis_tareas');
    if (guardado) {
      this.tareas = JSON.parse(guardado);
    }
  }

  // Datos basados en tu actividad de marzo 2026 para el sistema PULSO / SIO
  tareas: any[] = JSON.parse(
    localStorage.getItem('_mis_trabajos_') ||
      JSON.stringify([
        { fecha: '05/05/2026', horas: 8, descripcion: 'Despacho de material' },
        { fecha: '08/05/2026', horas: 8, descripcion: 'Certificado de calidad' },
      ]),
  );

  nuevaTarea = { fecha: '', horas: 8, descripcion: '' };
  tarifaHora = 8; // Costo acordado

  agregarTarea() {
    if (this.nuevaTarea.fecha && this.nuevaTarea.descripcion) {
      // 1. Capturamos la fecha del input (normalmente viene YYYY-MM-DD)
      const partes = this.nuevaTarea.fecha.split('-'); // [yyyy, mm, dd]

      // 2. Si la fecha viene en formato ISO (del input date), la reordenamos
      if (partes.length === 3) {
        this.nuevaTarea.fecha = `${partes[2]}/${partes[1]}/${partes[0]}`;
      }

      // 3. Ahora sí, agregamos al array con el formato dd/mm/yyyy
      this.tareas.push({ ...this.nuevaTarea });

      // 4. Guardamos en el localStorage
      this.sincronizar();

      // Limpiamos el formulario (reseteamos a horas 8 por defecto)
      this.nuevaTarea = { fecha: '', horas: 8, descripcion: '' };
    }
  }

  // Esta función es la que escribe en el "disco" del navegador
  private sincronizar() {
    localStorage.setItem('_mis_trabajos_', JSON.stringify(this.tareas));
  }

  eliminarTarea(index: number) {
    // 1. Lo borras del array en memoria
    this.tareas.splice(index, 1);

    this.sincronizar();
  }

  calcularTotalHoras(): number {
    return this.tareas.reduce((sum, item) => sum + item.horas, 0);
  }

  async generarPDF() {
    const pdf = new PdfMakeWrapper();
    const totalHoras = this.calcularTotalHoras();
    const montoTotal = totalHoras * this.tarifaHora;
    const fechaEmision = new Date().toLocaleDateString('es-VE');

    pdf.pageSize('A4');
    pdf.pageMargins([40, 40, 40, 40]);

    // Encabezado con fecha de hoy
    pdf.add(
      new Columns([
        new Txt('RECIBO DE SERVICIO').fontSize(18).bold().color('#2d3436').end,
        new Txt([new Txt('FECHA DE EMISIÓN: ').bold().end, fechaEmision]).alignment('right').end,
      ]).end,
    );

    pdf.add(new Canvas([new Line([0, 5], [520, 5]).lineColor('#0984e3').lineWidth(1).end]).end);
    pdf.add(pdf.ln(2));

    // --- INFORMACIÓN DE LAS PARTES ---
    pdf.add(
      new Columns([
        [
          new Txt('CLIENTE').bold().color('#0984e3').end,
          new Txt('Poligráfica Industrial, C. A').bold().end,
          'Rif: J-00036615-2',
          'Calle Pantín, Edif. Poligráfica Industrial',
          'Chacao, Miranda.',
          'Tel: 212-2652072',
        ],
        [
          new Txt('PRESTADOR DE SERVICIO').bold().alignment('right').color('#0984e3').end,
          new Txt('Andrés Calcurian').bold().alignment('right').end,
          new Txt('V-25235074-4').alignment('right').end,
          new Txt('Desarrollador de Software').alignment('right').end,
          new Txt('Caracas, Venezuela').alignment('right').end,
        ],
      ]).end,
    );

    pdf.add(pdf.ln(2));

    pdf.add(new Txt('CONCEPTO GENERAL').bold().margin([0, 0, 0, 5]).end);
    pdf.add(
      new Txt(
        'Desarrollo de Sistema Integral Operativo (SIO), incluyendo Backend, Frontend, estructuración de Base de Datos y soporte técnico.',
      )
        .italics()
        .color('#636e72').end,
    );
    // Aclaratoria de Costo por Hora
    pdf.add(
      new Txt([
        new Txt('Nota técnica: ').bold().end,
        `El costo por hora de desarrollo ha sido establecido por mutuo acuerdo en `,
        new Txt(`${this.tarifaHora}$ USD.`).bold().end,
      ])
        .fontSize(9)
        .margin([0, 0, 0, 10]).end,
    );

    // Tabla de actividades [cite: 3]
    pdf.add(this.crearTablaActividades(this.tareas));

    pdf.add(pdf.ln(1));

    // Totales y Pago [cite: 4, 5, 6]
    pdf.add(
      new Columns([
        [
          new Txt('DATOS DE TRANSFERENCIA').bold().fontSize(9).margin([0, 10, 0, 5]).end,
          'Banco Banesco',
          '0134-0350-31-35-01048319',
          'Andrés Armando Calcurian M.',
        ],
        [
          new Table([
            ['Subtotal', { text: `$${montoTotal.toFixed(2)}`, alignment: 'right' }],
            ['IVA (0%)', { text: '$0.00', alignment: 'right' }],
            [new Txt('TOTAL A PAGAR').bold().end, new Txt(`$${montoTotal.toFixed(2)}`).bold().alignment('right').end],
          ])
            .widths(['*', '*'])
            .layout('lightHorizontalLines').end,
        ],
      ]).end,
    );

    pdf.create().open();
  }

  crearTablaActividades(datos: any[]): ITable {
    return new Table([
      [
        new Txt('FECHA').bold().color('white').end,
        new Txt('DESCRIPCIÓN').bold().color('white').end,
        new Txt('HRS').bold().alignment('center').color('white').end,
      ],
      ...datos.map((item) => [item.fecha, item.descripcion, { text: item.horas.toString(), alignment: 'center' }]),
    ])
      .widths([70, '*', 40])
      .layout({
        fillColor: (rowIndex?: number) => {
          if (rowIndex === 0) return '#0984e3';
          return rowIndex !== undefined && rowIndex % 2 === 0 ? '#f5f6fa' : '';
        },
      }).end;
  }
}
