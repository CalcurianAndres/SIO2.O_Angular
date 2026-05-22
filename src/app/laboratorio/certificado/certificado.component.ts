import { Component, HostListener, OnInit } from '@angular/core';
import { PdfMakeWrapper, Txt, Table, Cell, Img, QR, Columns, Stack } from 'pdfmake-wrapper';
import pdfFonts from '../../../assets/fonts/custom';
import { InspectionLevel, IsoService } from 'src/app/services/iso.service';

@Component({
  selector: 'app-certificado',
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.scss'],
})
export class CertificadoComponent implements OnInit {
  ngOnInit(): void {
    this.calculate();
  }

  constructor(private isoService: IsoService) {}

  calculate() {
    // 1. Validación inicial del tamaño del lote
    if (!this.lotSize || this.lotSize < 2) {
      this.letterResult = '';
      this.samplingPlan = null;
      return;
    }

    // 2. Obtener la letra código real usando el servicio (Metemos 'II' por defecto que era tu simulación)
    // Nota: Si en tu componente tienes una propiedad para el nivel (ej. this.inspectionLevel), úsala aquí.
    const letter = this.isoService.getLetterCode(this.lotSize, 'II');

    if (!letter) {
      this.letterResult = '';
      this.samplingPlan = null;
      return;
    }

    this.letterResult = letter;

    // 3. Obtener el plan de muestreo real desde el servicio
    // Nota: Si tienes propiedades para el AQL y el Tipo (ej. this.selectedAql, this.inspectionType), las pasas aquí.
    // Dejé '1.0' y 'normal' fijos como ejemplo por si no los tienes declarados en el componente.
    const plan = this.isoService.getSamplingPlan(this.letterResult, '1.0', 'normal');

    if (plan) {
      this.samplingPlan = {
        sampleSize: plan.sampleSize,
        ac: plan.ac, // Ahora también tienes el número de aceptación disponible
        re: plan.re, // Y el número de rechazo
      };
    } else {
      // Si por alguna razón el AQL no cruza con la letra, al menos dejamos el tamaño de muestra base de la letra
      this.samplingPlan = null;
    }

    // 4. Reiniciamos los contadores del flujo de inspección (exactamente como lo tenías)
    this.currentProgress = 0;
    this.stats = { criticos: 0, mayores: 0, menores: 0 };
    this.burstHistory = [];
    this.isLotAccepted = true;
  }

  // Variables de entrada (Input)
  lotSize: number = 0;
  selectedLevel: InspectionLevel = 'II'; // Nivel por defecto: II (Normal)
  selectedAql: string = '1.0'; // AQL por defecto: 1.0%

  // Variables de resultado (Output)
  letterResult: string | null = null; // Almacena la letra (A, B, C...)
  samplingPlan: any = null; // Objeto con { sampleSize, ac, re }

  // Opcional: Listas para los selectores (si quieres generarlos con *ngFor)
  readonly aqlOptions = ['0.65', '1.0', '1.5', '2.5', '4.0'];
  readonly generalLevels = ['I', 'II', 'III'];
  readonly specialLevels = ['S1', 'S2', 'S3', 'S4'];
  // Nuevo valor por defecto
  selectedSeverity: 'normal' | 'rigurosa' | 'reducida' = 'normal';

  // Variables de control
  currentProgress: number = 0;
  currentDefects: number = 0;
  burstHistory: any[] = [];

  burstQty: any = 0;
  tempAlto: any = 0;
  tempLargo: any = 0;
  tempBarniz: any = 0;
  tempAncho: any = 0;

  tempCodBarras: any = '';
  tempImgTexto: any = '';
  tempCorte: any = '';
  tempShortDescription: any = '';
  defectQty: any = '';

  // Función para añadir
  flags = {
    altoNA: false,
    largoNA: false,
    anchoNA: true,
    barnizNA: false,
    codBarrasNA: false,
    imgTextoNA: false,
    corteNA: false,
  };

  public inkAnalysisList = [
    { name: 'Negro (K)', visualInspection: true },
    { name: 'Cyan (C)', visualInspection: true },
    { name: 'Magenta (M)', visualInspection: true },
    { name: 'Pantone 109', visualInspection: true },
    { name: 'Pantone 2035', visualInspection: true },
  ];

  public onColorStatusChange(index: number): void {
    // Aquí manejas la lógica por si un "No Cumple" debe disparar
    // alguna alerta o afectar el estado global del lote
    const colorAfectado = this.inkAnalysisList[index];
    console.log(`Cambio en ${colorAfectado.name}:`, colorAfectado.visualInspection);
  }

  showModal: boolean = false;
  // 1. Agrega la variable con tu JSON exacto
  defectos = {
    menores: {
      causas: [['porque no esquivocamos '], ['porque nos volvimos a equivocar '], ['ya no tenemos remedio']],
      defectos: ['menor 1 ', 'menor 2 ', 'menor 3 '],
      aql: 4,
    },
    mayores: {
      causas: [],
      defectos: ['mayor 1', 'mayor 2 ', 'mayor 3'],
      aql: 2.5,
    },
    criticos: {
      causas: [],
      defectos: ['critico 1', 'critico 2 ', 'critico 3 '],
      aql: 0.65,
    },
  };

  // 2. Agrega estas variables de control si no existen para evitar errores en el HTML:
  selectedDefect: any = null;
  isLotAccepted: boolean = true;
  stats = { criticos: 0, mayores: 0, menores: 0 };
  limits = {
    criticos: { ac: 0, re: 1 },
    mayores: { ac: 1, re: 2 },
    menores: { ac: 3, re: 4 },
  };

  // Dos historiales separados
  defectHistory: any[] = [];

  // 1. REGISTRO EXCLUSIVO DE DIMENSIONES Y ASPECTO
  addSampleBurst() {
    if (!this.burstQty || this.burstQty <= 0) return;

    this.burstHistory.push({
      qty: this.burstQty,
      alto: this.flags.altoNA ? 'N/A' : this.tempAlto || '-',
      largo: this.flags.largoNA ? 'N/A' : this.tempLargo || '-',
      ancho: this.flags.anchoNA ? 'N/A' : this.tempAncho || '-',
      barniz: this.flags.barnizNA ? 'N/A' : this.tempBarniz || '-',
      vCod: this.flags.codBarrasNA ? 'N/A' : this.tempCodBarras ? 'C' : 'NC',
      vImg: this.flags.imgTextoNA ? 'N/A' : this.tempImgTexto ? 'C' : 'NC',
      vCor: this.flags.corteNA ? 'N/A' : this.tempCorte ? 'C' : 'NC',
    });

    this.currentProgress += this.burstQty;
    this.burstQty = 0; // Limpiamos solo el input de muestra dimensional
  }

  removeBurst(index: number) {
    const item = this.burstHistory[index];
    this.currentProgress -= item.qty;
    this.burstHistory.splice(index, 1);
  }

  // 2. REGISTRO EXCLUSIVO DE DEFECTOS Y CRITICIDAD (AQL)
  addDefect() {
    if (!this.defectQty || this.defectQty <= 0 || !this.selectedDefect) return;

    const tipo = this.selectedDefect.tipo as 'criticos' | 'mayores' | 'menores';

    // Sumamos la cantidad real de piezas defectuosas encontradas al acumulador ISO
    this.stats[tipo] += this.defectQty;

    this.defectHistory.push({
      qty: this.defectQty,
      defecto: this.selectedDefect.nombre,
      tipo: tipo,
      descripcion: this.tempShortDescription || 'Sin observaciones',
    });

    this.evaluateLotStatus();

    // Limpiamos los selectores del bloque de defectos
    this.defectQty = 0;
    this.selectedDefect = null;
    this.tempShortDescription = '';
  }

  removeDefect(index: number) {
    const item = this.defectHistory[index];

    // Restamos del acumulador la cantidad exacta que tenía ese registro
    this.stats[item.tipo as 'criticos' | 'mayores' | 'menores'] -= item.qty;
    this.defectHistory.splice(index, 1);

    this.evaluateLotStatus();
  }

  // Evalúa si el lote sigue aprobado o pasa a Rechazo
  private evaluateLotStatus() {
    const criticoFalla = this.stats.criticos >= this.limits.criticos.re;
    const mayorFalla = this.stats.mayores >= this.limits.mayores.re;
    const menorFalla = this.stats.menores >= this.limits.menores.re;

    this.isLotAccepted = !(criticoFalla || mayorFalla || menorFalla);
  }

  async downloadPdf() {
    try {
      const blob = await this.buildPdf();

      // Opción A: Descargar directamente (Recomendado para el botón)
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificado_Análisis_.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar o descargar el PDF:', error);
    }
  }

  async buildPdf(): Promise<Blob> {
    const pdf = new PdfMakeWrapper();
    const formatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // 1. Configuración de Fuentes (Igual a tu OP)
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

    pdf.add(
      new Table([
        [
          new Cell(new Txt('SECCION A').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('SECCION B').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
        [
          new Cell(new Txt('').fontSize(5.7).end).border([false, false, false, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('OP:').fontSize(5.7).end)
            .border([false, false, false, false])
            .border([false, false, false, false]).end,
        ],
        [
          new Cell(new Txt('').bold().fontSize(15).end)
            .alignment('center')
            .margin([0, -3, 0, -3])
            .border([false, false, false, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('2026049').fontSize(15).bold().end)
            .alignment('center')
            .margin([0, -3, 0, -3])
            .border([false, false, false, true]).end,
        ],
        [
          new Cell(new Txt('').fontSize(5.7).end).border([false, false, false, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('CANTIDAD:').fontSize(5.7).end)
            .border([false, false, false, false])
            .border([false, false, false, false]).end,
        ],
        [
          new Cell(new Txt('').bold().fontSize(15).end)
            .alignment('center')
            .margin([0, -3, 0, -3])
            .border([false, false, false, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('5.700').fontSize(15).bold().end)
            .alignment('center')
            .margin([0, -3, 0, -3])
            .border([false, false, false, true]).end,
        ],
        [
          new Cell(new Txt('').fontSize(5.7).end).border([false, false, false, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('FECHA DE EMISIÓN:').fontSize(5.7).end)
            .border([false, false, false, false])
            .border([false, false, false, false]).end,
        ],
        [
          new Cell(new Txt('CERTIFICADO DE ANÁLISIS').bold().fontSize(15).end)
            .alignment('center')
            .margin([0, -3, 0, -3])
            .border([false, false, false, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('05/05/2026').fontSize(11).end).margin([0, -3, 0, -3]).border([false, false, false, true])
            .end,
        ],
        [
          new Cell(new Txt('CLIENTE:').fontSize(5.7).end).border([false, false, false, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('FECHA DE PRODUCCIÓN:').fontSize(5.7).end)
            .border([false, false, false, false])
            .border([false, false, false, false]).end,
        ],
        [
          new Cell(new Txt('COMPAÑIA OPERATIVA DE ALIMENTOS COR, C.A.').fontSize(11).end)
            .margin([0, -3, 0, -3])
            .border([false, false, false, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('04/05/2026').fontSize(11).end).margin([0, -3, 0, -3]).border([false, false, false, true])
            .end,
        ],
        [
          new Cell(new Txt('PRODUCTO:').fontSize(5.7).end).border([false, false, false, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('ORDEN DE COMPRA:').fontSize(5.7).end)
            .border([false, false, false, false])
            .border([false, false, false, false]).end,
        ],
        [
          new Cell(new Txt('FAMILY BOX').fontSize(11).end).margin([0, -3, 0, -3]).border([false, false, false, true])
            .end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('571752').fontSize(15).bold().end)
            .alignment('center')
            .margin([0, -3, 0, -3])
            .border([false, false, false, true]).end,
        ],
        [
          new Cell(new Txt('IDIOMA:').fontSize(5.7).end).border([false, false, false, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('# DE CONTROL').fontSize(5.7).end)
            .border([false, false, false, false])
            .border([false, false, false, false]).end,
        ],
        [
          new Cell(new Txt('ESPAÑOL LATINO').fontSize(11).end)
            .margin([0, -3, 0, -3])
            .border([false, false, false, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('').fontSize(11).end).margin([0, -3, 0, -3]).border([false, false, false, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#c8c8c8',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#c8c8c8',
        })
        .widths(['69%', '1%', '30%']).end,
    );
    pdf.add(new Txt(' ').end);
    pdf.add(
      new Table([
        [
          new Cell(
            new Txt([
              {
                text: 'Los resultados y observaciones a continuacion fueron obtenidos durante los análisis efectuados en el Laboratorio de Calidad y proceso de fabricación en Poligráfica Industrial, C.A. y bajo una temperatura de 23± 5°C / 53± 8% HR. Variaciones podrán ocurrrir con rl paso del tiempo en condiciones distintas a los ensayos realizados.',
                font: 'Roboto',
              },
            ]).fontSize(6).end,
          )
            .fillColor('#cccccc')
            .alignment('center')
            .border([false]).end,
        ],
      ]).widths(['100%']).end,
    );
    pdf.add(new Txt(' ').end);

    // Colores de diseño
    const headerBg = '#7a8288'; // Gris oscuro para encabezados
    const sectionBg = '#d1d5d8'; // Gris medio para separadores de sección
    const rowEven = '#f2f4f5'; // Gris muy tenue para filas pares
    const rowOdd = '#ffffff'; // Blanco para filas impares

    pdf.add(
      new Table([
        // --- ENCABEZADO PRINCIPAL ---
        [
          new Cell(new Txt('PROPIEDADES').alignment('center').bold().fontSize(8).color('#FFFFFF').end)
            .border([false])
            .fillColor(headerBg).end,
          new Cell(new Txt('REF. NORMATIVA').alignment('center').bold().fontSize(8).color('#FFFFFF').end)
            .border([false])
            .fillColor(headerBg).end,
          new Cell(
            new Txt('ESPECIFICACIÓN (MIN - NOM - MAX)').alignment('center').bold().fontSize(8).color('#FFFFFF').end,
          )
            .border([false])
            .fillColor(headerBg).end,
          new Cell(new Txt('RESULTADOS').alignment('center').bold().fontSize(8).color('#FFFFFF').end)
            .border([false])
            .fillColor(headerBg).end,
        ],

        // --- SECCIÓN 1: SUSTRATO ---
        [
          new Cell(new Txt('SUSTRATO: CARTÓN REV. CREMA VITAPLUS CAL. 0,016"').bold().fontSize(8).margin([5, 2]).end)
            .colSpan(4)
            .fillColor(sectionBg)
            .border([false]).end,
          {},
          {},
          {},
        ],
        [
          new Cell(new Txt('PESO BÁSICO (g/m²)').fontSize(7).margin([5, 1]).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('COVENIN 954-84 / TAPPI 410').alignment('center').fontSize(7).end)
            .fillColor(rowOdd)
            .border([false]).end,
          new Cell(new Txt('252 - 265 - 278').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false])
            .end,
          new Cell(new Txt('264').alignment('center').bold().fontSize(8).end).fillColor(rowOdd).border([false]).end,
        ],
        [
          new Cell(new Txt('CALIBRE / ESPESOR (pt)').fontSize(7).margin([5, 1]).end).fillColor(rowEven).border([false])
            .end,
          new Cell(new Txt('COVENIN 436-79 / TAPPI 411').alignment('center').fontSize(7).end)
            .fillColor(rowEven)
            .border([false]).end,
          new Cell(new Txt('16,46 - 17,32 - 18,19').alignment('center').fontSize(7).end)
            .fillColor(rowEven)
            .border([false]).end,
          new Cell(new Txt('17,5').alignment('center').bold().fontSize(8).end).fillColor(rowEven).border([false]).end,
        ],
        [
          new Cell(new Txt('GRADO DE ABS. DE AGUA (COBB) (g/m²)').fontSize(7).margin([5, 1]).end)
            .fillColor(rowOdd)
            .border([false]).end,
          new Cell(new Txt('COVENIN 1243-78 / TAPPI 441').alignment('center').fontSize(7).end)
            .fillColor(rowOdd)
            .border([false]).end,
          new Cell(new Txt('N/A').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('NO APLICA').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
        ],
        [
          new Cell(new Txt('HUMEDAD RELATIVA (%)').fontSize(7).margin([5, 1]).end).fillColor(rowEven).border([false])
            .end,
          new Cell(new Txt('TAPPI 502').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('40 - 50 - 60').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('48,3').alignment('center').bold().fontSize(8).end).fillColor(rowEven).border([false]).end,
        ],
        [
          new Cell(new Txt('DIRECCIÓN DE FIBRA').fontSize(7).margin([5, 1]).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('COVENIN 26-79 / TAPPI 409').alignment('center').fontSize(7).end)
            .fillColor(rowOdd)
            .border([false]).end,
          new Cell(new Txt('Perpendicular a los signados principales').alignment('center').fontSize(6).end)
            .fillColor(rowOdd)
            .border([false]).end,
          new Cell(new Txt('CUMPLE').alignment('center').bold().fontSize(7).end).fillColor(rowOdd).border([false]).end,
        ],
        [
          new Cell(new Txt('RESISTENCIA AL ÁLCALI').fontSize(7).margin([5, 1]).end).fillColor(rowEven).border([false])
            .end,
          new Cell(new Txt('DIN 16524-9').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('SIN PULPEO (NaOH 2,5% 80°C)').alignment('center').fontSize(6).end)
            .fillColor(rowEven)
            .border([false]).end,
          new Cell(new Txt('NO APLICA').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
        ],

        // --- SECCIÓN 2: COLOR ---
        [
          new Cell(new Txt('COLOR: ESTÁNDAR DE COLOR APROBADO POR EL CLIENTE').bold().fontSize(8).margin([5, 2]).end)
            .colSpan(4)
            .fillColor(sectionBg)
            .border([false]).end,
          {},
          {},
          {},
        ],
        ...['NEGRO (K)', 'CYAN (C)', 'MAGENTA (M)', 'PANTONE 109', 'PANTONE 2035'].map((color, idx) => [
          new Cell(new Txt(color).fontSize(7).margin([20, 1]).end)
            .fillColor(idx % 2 === 0 ? rowOdd : rowEven)
            .border([false]).end,
          new Cell(new Txt('INSPECCIÓN VISUAL').alignment('center').fontSize(7).end)
            .fillColor(idx % 2 === 0 ? rowOdd : rowEven)
            .border([false]).end,
          new Cell(new Txt('ESTÁNDAR DE COLOR').alignment('center').fontSize(7).end)
            .fillColor(idx % 2 === 0 ? rowOdd : rowEven)
            .border([false]).end,
          new Cell(new Txt('CUMPLE').alignment('center').bold().fontSize(7).color('#27ae60').end)
            .fillColor(idx % 2 === 0 ? rowOdd : rowEven)
            .border([false]).end,
        ]),

        // --- SECCIÓN 3: PRODUCTO TERMINADO ---
        [
          new Cell(new Txt('PRODUCTO TERMINADO').bold().fontSize(8).margin([5, 2]).end)
            .colSpan(4)
            .fillColor(sectionBg)
            .border([false]).end,
          {},
          {},
          {},
        ],
        [
          new Cell(new Txt('DIMENSIONES (mm): ALTO').fontSize(7).margin([5, 1]).end).fillColor(rowOdd).border([false])
            .end,
          new Cell(new Txt('INSPECCIÓN VISUAL').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false])
            .end,
          new Cell(new Txt('539 - 540 - 541').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false])
            .end,
          new Cell(new Txt('540').alignment('center').bold().fontSize(8).end).fillColor(rowOdd).border([false]).end,
        ],
        [
          new Cell(new Txt('DIMENSIONES (mm): LARGO').fontSize(7).margin([5, 1]).end).fillColor(rowEven).border([false])
            .end,
          new Cell(new Txt('INSPECCIÓN VISUAL').alignment('center').fontSize(7).end).fillColor(rowEven).border([false])
            .end,
          new Cell(new Txt('893 - 894 - 895').alignment('center').fontSize(7).end).fillColor(rowEven).border([false])
            .end,
          new Cell(new Txt('894').alignment('center').bold().fontSize(8).end).fillColor(rowEven).border([false]).end,
        ],
        [
          new Cell(new Txt('RESERVA DE BARNIZ (mm)').fontSize(7).margin([5, 1]).end).fillColor(rowOdd).border([false])
            .end,
          new Cell(new Txt('INSPECCIÓN VISUAL').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false])
            .end,
          new Cell(new Txt('14 - 15 - 16').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('15').alignment('center').bold().fontSize(8).end).fillColor(rowOdd).border([false]).end,
        ],
        [
          new Cell(new Txt('CÓDIGO DE BARRAS').fontSize(7).margin([5, 1]).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('COVENIN 3382:98 / ANSI X3.182-90').alignment('center').fontSize(6).end)
            .fillColor(rowEven)
            .border([false]).end,
          new Cell(new Txt('N/A').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('NO APLICA').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
        ],
        [
          new Cell(new Txt('IMÁGENES Y TEXTOS').fontSize(7).margin([5, 1]).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('INSPECCIÓN VISUAL').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false])
            .end,
          new Cell(new Txt('SEGÚN ESTÁNDAR').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('CUMPLE').alignment('center').bold().fontSize(7).end).fillColor(rowOdd).border([false]).end,
        ],
        [
          new Cell(new Txt('TROQUELADO O CORTE').fontSize(7).margin([5, 1]).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('INSPECCIÓN VISUAL').alignment('center').fontSize(7).end).fillColor(rowEven).border([false])
            .end,
          new Cell(new Txt('SEGÚN ESTÁNDAR').alignment('center').fontSize(7).end).fillColor(rowEven).border([false])
            .end,
          new Cell(new Txt('CUMPLE').alignment('center').bold().fontSize(7).end).fillColor(rowEven).border([false]).end,
        ],
        [
          new Cell(new Txt('MUESTREO').fontSize(7).margin([5, 1]).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('COVENIN 3133-1:2001').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false])
            .end,
          new Cell(
            new Txt('NIVEL DE INSP. G1 PLAN DE MUEST. SIMPLE / INSP. NORMAL').alignment('center').fontSize(5.5).end,
          )
            .fillColor(rowOdd)
            .border([false]).end,
          new Cell(new Txt('SATISFACTORIO').alignment('center').bold().fontSize(6).end)
            .fillColor(rowOdd)
            .border([false]).end,
        ],
      ])
        .widths(['32%', '24%', '28%', '16%'])
        .layout({
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i) => (i === 0 ? '#444444' : '#e0e0e0'),
        }).end,
    );
    pdf.add(new Txt(' ').end);
    pdf.add(
      new Table([
        [
          new Cell(
            new Txt([
              {
                text: 'Poligráfica Industrial C.A. recomienda el uso y/o almacenamiento de los empaques de papel o cartón por un tiempo no mayor a los 6 meses contados a partir de la fecha de entrega del producto, siguiendo las condiciones de almacenamiento previstas en la Politica de Devoluciones o Reclamos (DDE-005), sin menoscabo de los lapsos para las devoluciones o reclamos según lo establece dicho documento.',
                font: 'Roboto',
              },
            ]).fontSize(6).end,
          )
            .fillColor('#cccccc')
            .alignment('center')
            .border([false]).end,
        ],
      ]).widths(['100%']).end,
    );

    return new Promise((resolve, reject) => {
      pdf.create().getBlob((blob) => {
        blob ? resolve(blob) : reject('Error al generar PDF');
      });
    });
  }
}
