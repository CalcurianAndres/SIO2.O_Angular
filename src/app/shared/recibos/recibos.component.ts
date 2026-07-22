import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfMakeWrapper, Table, Txt, Columns, Canvas, Line, ITable } from 'pdfmake-wrapper';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

PdfMakeWrapper.setFonts(pdfFonts);

const STORAGE_KEY = '_mis_trabajos_';

@Component({
  selector: 'app-recibos',
  templateUrl: './recibos.component.html',
  styleUrls: ['./recibos.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RecibosComponent {
  tareas: any[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ||
      JSON.stringify([
        { fecha: '25/05/2026', horas: 8, descripcion: 'Registro de productos en el sistema' },
        { fecha: '26/05/2026', horas: 8, descripcion: 'Organización del módulo de compras y proveedores' },
        { fecha: '29/05/2026', horas: 8, descripcion: 'Mejoras en tablas y orden de información del sistema' },
        { fecha: '05/06/2026', horas: 8, descripcion: 'Especificaciones, clientes, proveedores, países por API' },
        { fecha: '09/06/2026', horas: 8, descripcion: 'Diseño e implementación del formato de OCP' },
        { fecha: '10/06/2026', horas: 8, descripcion: 'Ajustes finales de diseño y totales en OCP' },
        { fecha: '12/06/2026', horas: 8, descripcion: 'Organigrama empleados, departamentos/cargos, +58, wizard' },
        { fecha: '16/06/2026', horas: 8, descripcion: 'Correcciones filtros, cierre tareas, manual de diseño' },
        { fecha: '17/06/2026', horas: 8, descripcion: 'Wizard empleados, calendario SEM, sistema Pantone' },
        { fecha: '19/06/2026', horas: 8, descripcion: 'Devaluación salarial, cascada unidad/subunidad, tasa del día' },
        { fecha: '23/06/2026', horas: 8, descripcion: 'Bug modal empleado + tasa BCV directa de API' },
        { fecha: '03/07/2026', horas: 8, descripcion: 'Formato numérico global, ordenamiento cargos, calendario' },
        { fecha: '07/07/2026', horas: 8, descripcion: 'Correcciones UI laboratorio + duplicidad NE SIO v1' },
        { fecha: '08/07/2026', horas: 8, descripcion: 'OCP rediseño + recepción: skip-lab, tabs almacenes, soft-delete' },
        { fecha: '09/07/2026', horas: 8, descripcion: 'Secciones del almacén principal sin crear documento nuevo' },
        { fecha: '14/07/2026', horas: 8, descripcion: 'Secciones del almacén principal + bobinas agrupadas por almacén' },
        { fecha: '16/07/2026', horas: 8, descripcion: 'Nuevo flujo de estados recepción (Verificado, revertir)' },
        { fecha: '17/07/2026', horas: 8, descripcion: 'Simplificar recibos, guardar detalles recepción, fix SweetAlert2' },
        { fecha: '21/07/2026', horas: 8, descripcion: 'Reestructura del módulo de conversiones y convertidoras' },
      ]),
  );

  nuevaTarea = { fecha: '', horas: 8, descripcion: '' };
  tarifaHora = 8;

  editandoIndex: number | null = null;
  editandoDescripcion = '';
  editandoHoras = 8;

  mesSeleccionado = 'todos';

  get mesesDisponibles(): string[] {
    const meses = new Set<string>();
    this.tareas.forEach((t: any) => {
      const p = t.fecha.split('/');
      if (p.length === 3) meses.add(`${p[2]}-${p[1]}`);
    });
    return Array.from(meses).sort();
  }

  formatearMes(m: string): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [y, mo] = m.split('-');
    return `${meses[parseInt(mo) - 1]} ${y}`;
  }

  get tareasFiltradas(): any[] {
    if (this.mesSeleccionado === 'todos') return this.tareas;
    return this.tareas.filter((t: any) => {
      const p = t.fecha.split('/');
      return p.length === 3 && `${p[2]}-${p[1]}` === this.mesSeleccionado;
    });
  }

  get nombreMesSel(): string {
    if (this.mesSeleccionado === 'todos') return 'todas las tareas';
    return this.formatearMes(this.mesSeleccionado).toLowerCase();
  }

  agregarTarea() {
    if (this.nuevaTarea.fecha && this.nuevaTarea.descripcion) {
      const partes = this.nuevaTarea.fecha.split('-');
      if (partes.length === 3) {
        this.nuevaTarea.fecha = `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      this.tareas.push({ ...this.nuevaTarea });
      this.sincronizar();
      this.nuevaTarea = { fecha: '', horas: 8, descripcion: '' };
      this.mesSeleccionado = 'todos';
    }
  }

  private sincronizar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tareas));
  }

  editarTarea(tarea: any) {
    const idx = this.tareas.indexOf(tarea);
    if (idx < 0) return;
    if (this.editandoIndex === idx) {
      this.tareas[idx].descripcion = this.editandoDescripcion;
      this.tareas[idx].horas = this.editandoHoras;
      this.sincronizar();
      this.editandoIndex = null;
    } else {
      this.editandoIndex = idx;
      this.editandoDescripcion = tarea.descripcion;
      this.editandoHoras = tarea.horas;
    }
  }

  cancelarEdicion() {
    this.editandoIndex = null;
  }

  eliminarTarea(tarea: any) {
    const idx = this.tareas.indexOf(tarea);
    if (idx >= 0) {
      this.tareas.splice(idx, 1);
      if (this.editandoIndex === idx) this.editandoIndex = null;
      this.sincronizar();
    }
  }

  calcularTotalHoras(datos?: any[]): number {
    return (datos ?? this.tareas).reduce((sum: number, item: any) => sum + item.horas, 0);
  }

  async generarPDF() {
    const pdf = new PdfMakeWrapper();
    const datos = this.tareasFiltradas;
    const totalHoras = this.calcularTotalHoras(datos);
    const montoTotal = totalHoras * this.tarifaHora;
    const fechaEmision = new Date().toLocaleDateString('es-VE');

    pdf.pageSize('A4');
    pdf.pageMargins([40, 40, 40, 40]);

    pdf.add(
      new Columns([
        new Txt('RECIBO DE SERVICIO').fontSize(18).bold().color('#2d3436').end,
        new Txt([new Txt('FECHA DE EMISIÓN: ').bold().end, fechaEmision]).alignment('right').end,
      ]).end,
    );

    pdf.add(new Canvas([new Line([0, 5], [520, 5]).lineColor('#0984e3').lineWidth(1).end]).end);
    pdf.add(pdf.ln(2));

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
    pdf.add(
      new Txt([
        new Txt('Nota técnica: ').bold().end,
        `El costo por hora de desarrollo ha sido establecido por mutuo acuerdo en `,
        new Txt(`${this.tarifaHora}$ USD.`).bold().end,
      ])
        .fontSize(9)
        .margin([0, 0, 0, 10]).end,
    );

    pdf.add(this.crearTablaActividades(datos));
    pdf.add(pdf.ln(1));

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
      ...datos.map((item: any) => [item.fecha, item.descripcion, { text: item.horas.toString(), alignment: 'center' }]),
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
