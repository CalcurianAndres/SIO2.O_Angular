import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PdfMakeWrapper, Txt, Table, Cell } from 'pdfmake-wrapper';
import pdfFonts from '../../../assets/fonts/custom';
import { InspectionLevel, IsoService } from 'src/app/services/iso.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';

@Component({
  selector: 'app-certificado',
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.scss'],
})
export class CertificadoComponent implements OnInit {
  constructor(
    private isoService: IsoService,
    public api: OproduccionService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['op']) {
        this.searchTerm = params['op'];
      } else if (params['producto']) {
        this.searchTerm = params['producto'];
      }
      if (params['cantidad']) {
        this.lotSize = +params['cantidad'];
      }
    });
    setTimeout(() => {
      this.cargando = false;
    }, 600);
  }

  cargando = true;
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  pageSizes = [10, 25, 50, 100];
  showModal = false;
  selectedOp: any = null;

  get items() {
    return this.api.orden || [];
  }

  get kpiTotalOPs() {
    return this.items.length;
  }

  get kpiPorMuestrear() {
    return this.items.filter((op: any) => !op.certificado).length;
  }

  get kpiEmitidos() {
    return this.items.filter((op: any) => op.certificado).length;
  }

  get filteredItems(): any[] {
    if (!this.searchTerm.trim()) return this.items;
    const term = this.searchTerm.toLowerCase();
    return this.items.filter(
      (op: any) =>
        (op.opNumero || '').toLowerCase().includes(term) ||
        (op.nombre || '').toLowerCase().includes(term) ||
        (op.producto || '').toLowerCase().includes(term),
    );
  }

  get totalPages() {
    return Math.ceil(this.filteredItems.length / this.pageSize) || 1;
  }

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch() {
    this.currentPage = 1;
  }

  changePageSize(event: any) {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  iniciarMuestreo(op: any) {
    this.selectedOp = op;
    this.lotSize = op.cantidad || 0;
    this.limpiarMuestreo();
    this.showModal = true;
    setTimeout(() => this.calculate(), 50);
  }

  private limpiarMuestreo() {
    this.letterResult = null;
    this.samplingPlan = null;
    this.currentProgress = 0;
    this.burstHistory = [];
    this.defectHistory = [];
    this.stats = { criticos: 0, mayores: 0, menores: 0 };
    this.isLotAccepted = true;
    this.lotSize = this.selectedOp?.cantidad || 0;
    this.selectedLevel = 'II';
    this.selectedSeverity = 'normal';
    this.selectedAql = '1.0';
    this.burstQty = 0;
    this.tempAlto = 0;
    this.tempLargo = 0;
    this.tempAncho = 0;
    this.tempBarniz = 0;
    this.tempCodBarras = '';
    this.tempImgTexto = '';
    this.tempCorte = '';
    this.tempShortDescription = '';
    this.defectQty = '';
    this.selectedDefect = null;
    this.flags = {
      altoNA: false,
      largoNA: false,
      anchoNA: true,
      barnizNA: false,
      codBarrasNA: false,
      imgTextoNA: false,
      corteNA: false,
    };
    this.inkAnalysisList = [
      { name: 'Negro (K)', visualInspection: true },
      { name: 'Cyan (C)', visualInspection: true },
      { name: 'Magenta (M)', visualInspection: true },
      { name: 'Pantone 109', visualInspection: true },
      { name: 'Pantone 2035', visualInspection: true },
    ];
  }

  calculate() {
    if (!this.lotSize || this.lotSize < 2) {
      this.letterResult = '';
      this.samplingPlan = null;
      return;
    }
    const letter = this.isoService.getLetterCode(this.lotSize, 'II');
    if (!letter) {
      this.letterResult = '';
      this.samplingPlan = null;
      return;
    }
    this.letterResult = letter;
    const plan = this.isoService.getSamplingPlan(this.letterResult, '1.0', 'normal');
    if (plan) {
      this.samplingPlan = {
        sampleSize: plan.sampleSize,
        ac: plan.ac,
        re: plan.re,
      };
    } else {
      this.samplingPlan = null;
    }
    this.currentProgress = 0;
    this.stats = { criticos: 0, mayores: 0, menores: 0 };
    this.burstHistory = [];
    this.isLotAccepted = true;
  }

  lotSize = 0;
  selectedLevel: InspectionLevel = 'II';
  selectedAql = '1.0';
  letterResult: string | null = null;
  samplingPlan: any = null;
  readonly aqlOptions = ['0.65', '1.0', '1.5', '2.5', '4.0'];
  readonly generalLevels = ['I', 'II', 'III'];
  readonly specialLevels = ['S1', 'S2', 'S3', 'S4'];
  selectedSeverity: 'normal' | 'rigurosa' | 'reducida' = 'normal';
  currentProgress = 0;
  currentDefects = 0;
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
  flags = {
    altoNA: false,
    largoNA: false,
    anchoNA: true,
    barnizNA: false,
    codBarrasNA: false,
    imgTextoNA: false,
    corteNA: false,
  };
  inkAnalysisList = [
    { name: 'Negro (K)', visualInspection: true },
    { name: 'Cyan (C)', visualInspection: true },
    { name: 'Magenta (M)', visualInspection: true },
    { name: 'Pantone 109', visualInspection: true },
    { name: 'Pantone 2035', visualInspection: true },
  ];

  onColorStatusChange(index: number) {
    const colorAfectado = this.inkAnalysisList[index];
    console.log(`Cambio en ${colorAfectado.name}:`, colorAfectado.visualInspection);
  }

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

  selectedDefect: any = null;
  isLotAccepted = true;
  stats = { criticos: 0, mayores: 0, menores: 0 };
  limits = {
    criticos: { ac: 0, re: 1 },
    mayores: { ac: 1, re: 2 },
    menores: { ac: 3, re: 4 },
  };
  defectHistory: any[] = [];

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
    this.burstQty = 0;
  }

  removeBurst(index: number) {
    const item = this.burstHistory[index];
    this.currentProgress -= item.qty;
    this.burstHistory.splice(index, 1);
  }

  addDefect() {
    if (!this.defectQty || this.defectQty <= 0 || !this.selectedDefect) return;
    const tipo = this.selectedDefect.tipo as 'criticos' | 'mayores' | 'menores';
    this.stats[tipo] += this.defectQty;
    this.defectHistory.push({
      qty: this.defectQty,
      defecto: this.selectedDefect.nombre,
      tipo: tipo,
      descripcion: this.tempShortDescription || 'Sin observaciones',
    });
    this.evaluateLotStatus();
    this.defectQty = 0;
    this.selectedDefect = null;
    this.tempShortDescription = '';
  }

  removeDefect(index: number) {
    const item = this.defectHistory[index];
    this.stats[item.tipo as 'criticos' | 'mayores' | 'menores'] -= item.qty;
    this.defectHistory.splice(index, 1);
    this.evaluateLotStatus();
  }

  private evaluateLotStatus() {
    const criticoFalla = this.stats.criticos >= this.limits.criticos.re;
    const mayorFalla = this.stats.mayores >= this.limits.mayores.re;
    const menorFalla = this.stats.menores >= this.limits.menores.re;
    this.isLotAccepted = !(criticoFalla || mayorFalla || menorFalla);
  }

  async downloadPdf() {
    try {
      const blob = await this.buildPdf();
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
          new Cell(new Txt('OP:').fontSize(5.7).end).border([false, false, false, false]).end,
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
          new Cell(new Txt('CANTIDAD:').fontSize(5.7).end).border([false, false, false, false]).end,
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
          new Cell(new Txt('FECHA DE EMISIÓN:').fontSize(5.7).end).border([false, false, false, false]).end,
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
          new Cell(new Txt('FECHA DE PRODUCCIÓN:').fontSize(5.7).end).border([false, false, false, false]).end,
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
          new Cell(new Txt('ORDEN DE COMPRA:').fontSize(5.7).end).border([false, false, false, false]).end,
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
          new Cell(new Txt('# DE CONTROL').fontSize(5.7).end).border([false, false, false, false]).end,
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

    const headerBg = '#7a8288';
    const sectionBg = '#d1d5d8';
    const rowEven = '#f2f4f5';
    const rowOdd = '#ffffff';

    pdf.add(
      new Table([
        [
          new Cell(new Txt('PROPIEDADES').alignment('center').bold().fontSize(8).color('#FFFFFF').end)
            .border([false])
            .fillColor(headerBg).end,
          new Cell(new Txt('REF. NORMATIVA').alignment('center').bold().fontSize(8).color('#FFFFFF').end)
            .border([false])
            .fillColor(headerBg).end,
          new Cell(new Txt('ESPECIFICACIÓN (MIN - NOM - MAX)').alignment('center').bold().fontSize(8).color('#FFFFFF').end)
            .border([false])
            .fillColor(headerBg).end,
          new Cell(new Txt('RESULTADOS').alignment('center').bold().fontSize(8).color('#FFFFFF').end)
            .border([false])
            .fillColor(headerBg).end,
        ],
        [
          new Cell(new Txt('SUSTRATO: CARTÓN REV. CREMA VITAPLUS CAL. 0,016"').bold().fontSize(8).margin([5, 2]).end)
            .colSpan(4)
            .fillColor(sectionBg)
            .border([false]).end,
          {}, {}, {},
        ],
        [
          new Cell(new Txt('PESO BÁSICO (g/m²)').fontSize(7).margin([5, 1]).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('COVENIN 954-84 / TAPPI 410').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('252 - 265 - 278').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('264').alignment('center').bold().fontSize(8).end).fillColor(rowOdd).border([false]).end,
        ],
        [
          new Cell(new Txt('CALIBRE / ESPESOR (pt)').fontSize(7).margin([5, 1]).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('COVENIN 436-79 / TAPPI 411').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('16,46 - 17,32 - 18,19').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('17,5').alignment('center').bold().fontSize(8).end).fillColor(rowEven).border([false]).end,
        ],
        [
          new Cell(new Txt('GRADO DE ABS. DE AGUA (COBB) (g/m²)').fontSize(7).margin([5, 1]).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('COVENIN 1243-78 / TAPPI 441').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('N/A').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
          new Cell(new Txt('NO APLICA').alignment('center').fontSize(7).end).fillColor(rowOdd).border([false]).end,
        ],
        [
          new Cell(new Txt('HUMEDAD RELATIVA (%)').fontSize(7).margin([5, 1]).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('TAPPI 502').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('40 - 50 - 60').alignment('center').fontSize(7).end).fillColor(rowEven).border([false]).end,
          new Cell(new Txt('48,3').alignment('center').bold().fontSize(8).end).fillColor(rowEven).border([false]).end,
        ],
      ])
        .widths(['32%', '24%', '28%', '16%'])
        .layout({
          hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: any) => (i === 0 ? '#444444' : '#e0e0e0'),
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
      pdf.create().getBlob((blob: any) => {
        blob ? resolve(blob) : reject('Error al generar PDF');
      });
    });
  }
}
