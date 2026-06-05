import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PdfMakeWrapper, Txt, Table, Cell } from 'pdfmake-wrapper';
import pdfFonts from '../../../assets/fonts/custom';
import { InspectionLevel, IsoService } from 'src/app/services/iso.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { AnalisisService } from 'src/app/services/analisis.service';

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
    private analisisService: AnalisisService,
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
  analisisMateriales: any[] = [];

  get items() {
    return (this.api.orden || []).filter((op: any) => !op.certificado);
  }

  get kpiTotalOPs() {
    return (this.api.orden || []).length;
  }

  get kpiPorMuestrear() {
    return this.items.length;
  }

  get kpiEmitidos() {
    return (this.api.orden || []).filter((op: any) => op.certificado).length;
  }

  get filteredItems(): any[] {
    if (!this.searchTerm.trim()) return this.items;
    const term = this.searchTerm.toLowerCase();
    return this.items.filter(
      (op: any) =>
        (op.numero_op || '').toLowerCase().includes(term) ||
        (op.nombre || '').toLowerCase().includes(term) ||
        (op.producto?.[0]?.identificacion?.producto || '').toLowerCase().includes(term),
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
    this.analisisMateriales = [];
    this.inkAnalysisList = (op.tinta || []).map((t) => ({
      name: (t.tinta && (t.tinta.nombre || t.tinta.color)) || 'Tinta',
      visualInspection: true,
    }));
    if (op._id) {
      this.analisisService.buscarAnalisisMateriaPrimaOP(op._id).then((data) => {
        this.analisisMateriales = data;
      });
    }
    this.limpiarMuestreo();
    this.showModal = true;
    setTimeout(() => this.calculate(), 50);
  }

  finalizarMuestreo() {
    if (this.selectedOp?._id) {
      this.api.certificarOP(this.selectedOp._id);
    }
    this.showModal = false;
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
    this.inkAnalysisList = this.inkAnalysisList.length ? this.inkAnalysisList : [];
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
  inkAnalysisList: { name: string; visualInspection: boolean }[] = [];

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
      link.download = `Certificado_${this.selectedOp?.numero_op || 'Analisis'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar o descargar el PDF:', error);
    }
  }

  private fmtDate(d: any): string {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('es-ES');
  }

  private hCell(text: string, bg: string) {
    return new Cell(new Txt(text).alignment('center').bold().fontSize(9).color('#FFFFFF').end)
      .border([false])
      .fillColor(bg).end;
  }

  private eCell() {
    return new Cell(new Txt('').end).border([false]).end;
  }

  private lCell(text: string) {
    return new Cell(new Txt(text).fontSize(5.7).end).border([false, false, false, false]).end;
  }

  private vCell(text: string, align: string = 'left') {
    const alignment = align as 'left' | 'center' | 'right';
    return new Cell(new Txt(text).fontSize(11).end)
      .margin([0, -3, 0, -3])
      .border([false, false, false, true])
      .alignment(alignment).end;
  }

  private vCellBold(text: string, align: string = 'center') {
    const alignment = align as 'left' | 'center' | 'right';
    return new Cell(new Txt(text).bold().fontSize(15).end)
      .margin([0, -3, 0, -3])
      .border([false, false, false, true])
      .alignment(alignment).end;
  }

  async buildPdf(): Promise<Blob> {
    const op = this.selectedOp;
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

    const safe = (val: any, fb = '—') => (val !== null && val !== undefined && val !== '' ? val : fb);

    pdf.add(
      new Table([
        [this.hCell('', ''), this.eCell(), this.hCell('', '')],
        [this.eCell(), this.eCell(), this.lCell('OP:')],
        [this.eCell(), this.eCell(), this.vCellBold(safe(op?.numero_op))],
        [this.eCell(), this.eCell(), this.lCell('CANTIDAD:')],
        [this.eCell(), this.eCell(), this.vCellBold(safe(op?.cantidad?.toLocaleString?.('es-ES') ?? op?.cantidad))],
        [this.eCell(), this.eCell(), this.lCell('FECHA DE EMISIÓN:')],
        [this.vCell('CERTIFICADO DE ANÁLISIS', 'center'), this.eCell(), this.vCell(this.fmtDate(new Date()))],
        [this.lCell('CLIENTE:'), this.eCell(), this.lCell('FECHA DE PRODUCCIÓN:')],
        [this.vCell(safe(op?.cliente?.nombre)), this.eCell(), this.vCell(this.fmtDate(op?.createdAt))],
        [this.lCell('PRODUCTO:'), this.eCell(), this.lCell('ORDEN DE COMPRA:')],
        [
          this.vCell(safe(op?.producto?.[0]?.identificacion?.producto)),
          this.eCell(),
          this.vCellBold(safe(op?.oc?.orden)),
        ],
        [this.lCell('IDIOMA:'), this.eCell(), this.lCell('# DE CONTROL')],
        [this.vCell('ESPAÑOL LATINO'), this.eCell(), this.vCell('')],
      ])
        .layout({
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#555',
          vLineColor: () => '#555',
        })
        .widths(['69%', '1%', '30%']).end,
    );

    pdf.add(new Txt(' ').end);

    const legalNote = (text: string) =>
      new Table([
        [
          new Cell(new Txt([{ text, font: 'Roboto' }]).fontSize(6).end)
            .fillColor('#cccccc')
            .alignment('center')
            .border([false]).end,
        ],
      ]).widths(['100%']).end;

    pdf.add(
      legalNote(
        'Los resultados y observaciones a continuacion fueron obtenidos durante los análisis efectuados en el Laboratorio de Calidad y proceso de fabricación en Poligráfica Industrial, C.A. y bajo una temperatura de 23± 5°C / 53± 8% HR. Variaciones podrán ocurrrir con rl paso del tiempo en condiciones distintas a los ensayos realizados.',
      ),
    );
    pdf.add(new Txt(' ').end);

    const headerBg = '#a5acb2';
    const sectionBg = '#d1d5d8';
    const rowEven = '#f2f4f5';
    const rowOdd = '#ffffff';

    const sectionHeader = (text: string, bg: string) =>
      new Cell(new Txt(text).alignment('center').bold().fontSize(8).color('#FFFFFF').end).border([false]).fillColor(bg)
        .end;

    pdf.add(
      new Table([
        [
          sectionHeader('PROPIEDADES', headerBg),
          sectionHeader('REF. NORMATIVA', headerBg),
          sectionHeader('ESPECIFICACIÓN (MIN - NOM - MAX)', headerBg),
          sectionHeader('RESULTADOS', headerBg),
        ],
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
      ])
        .widths(['32%', '24%', '28%', '16%'])
        .layout({
          hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: any) => (i === 0 ? '#444444' : '#e0e0e0'),
        }).end,
    );
    pdf.add(new Txt(' ').end);

    // PLAN DE MUESTREO
    if (this.samplingPlan) {
      const planRows: any[] = [
        [sectionHeader('PLAN DE MUESTREO', headerBg), sectionHeader('VALOR', headerBg)],
        ...(() => {
          const data: any[] = [
            ['Tamaño del Lote', safe(op?.cantidad?.toLocaleString?.('es-ES') ?? op?.cantidad)],
            ['Nivel de Inspección', safe(this.selectedLevel)],
            ['Severidad', safe(this.selectedSeverity)],
            ['Plan AQL', safe(this.selectedAql)],
            ['Tamaño de Muestra (n)', `${this.samplingPlan.sampleSize}`],
            ['Ac / Re', `${this.samplingPlan.ac} / ${this.samplingPlan.re}`],
            ['Población muestreada', `${this.currentProgress} de ${this.samplingPlan.sampleSize}`],
          ];
          return data.map(([label, value], i) => [
            new Cell(new Txt(label).fontSize(7).margin([5, 1]).end)
              .fillColor(i % 2 === 0 ? rowEven : rowOdd)
              .border([false]).end,
            new Cell(new Txt(value).alignment('center').bold().fontSize(8).end)
              .fillColor(i % 2 === 0 ? rowEven : rowOdd)
              .border([false]).end,
          ]);
        })(),
      ];

      pdf.add(
        new Table(planRows).widths(['50%', '50%']).layout({
          hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: any) => (i === 0 ? '#444444' : '#e0e0e0'),
        }).end,
      );
      pdf.add(new Txt(' ').end);
    }

    // INSPECCIÓN DE COLOR
    if (this.inkAnalysisList.length > 0) {
      const colorRows: any[] = [
        [sectionHeader('INSPECCIÓN DE COLOR', headerBg), sectionHeader('RESULTADO', headerBg)],
        ...this.inkAnalysisList.map((color, i) => [
          new Cell(new Txt(color.name).fontSize(7).margin([5, 1]).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(
            new Txt(color.visualInspection ? 'CONFORME' : 'NO CONFORME').alignment('center').bold().fontSize(8).end,
          )
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
        ]),
      ];

      pdf.add(
        new Table(colorRows).widths(['50%', '50%']).layout({
          hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: any) => (i === 0 ? '#444444' : '#e0e0e0'),
        }).end,
      );
      pdf.add(new Txt(' ').end);
    }

    // MEDICIONES FÍSICAS
    if (this.burstHistory.length > 0) {
      const measRows: any[] = [
        [
          sectionHeader('Cant.', headerBg),
          sectionHeader('Alto', headerBg),
          sectionHeader('Largo', headerBg),
          sectionHeader('Ancho', headerBg),
          sectionHeader('Barniz', headerBg),
          sectionHeader('Cód.B', headerBg),
          sectionHeader('Img/Txt', headerBg),
          sectionHeader('Troquel', headerBg),
        ],
        ...this.burstHistory.map((b: any, i: number) => [
          new Cell(new Txt(`${b.qty}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(`${b.alto}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(`${b.largo}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(`${b.ancho}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(`${b.barniz}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(`${b.vCod}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(`${b.vImg}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(`${b.vCor}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
        ]),
      ];

      pdf.add(
        new Table(measRows).widths(['12%', '12%', '12%', '12%', '12%', '14%', '14%', '12%']).layout({
          hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: any) => (i === 0 ? '#444444' : '#e0e0e0'),
        }).end,
      );
      pdf.add(new Txt(' ').end);
    }

    // REGISTRO DE DEFECTOS
    if (this.defectHistory.length > 0) {
      const defRows: any[] = [
        [
          sectionHeader('Cant.', headerBg),
          sectionHeader('Defecto Detectado', headerBg),
          sectionHeader('Criticidad', headerBg),
        ],
        ...this.defectHistory.map((d: any, i: number) => [
          new Cell(new Txt(`${d.qty}`).alignment('center').fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(d.defecto).fontSize(7).margin([5, 1]).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
          new Cell(new Txt(d.tipo).alignment('center').bold().fontSize(7).end)
            .fillColor(i % 2 === 0 ? rowEven : rowOdd)
            .border([false]).end,
        ]),
      ];

      pdf.add(
        new Table(defRows).widths(['15%', '60%', '25%']).layout({
          hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: any) => (i === 0 ? '#444444' : '#e0e0e0'),
        }).end,
      );
      pdf.add(new Txt(' ').end);
    }

    // VEREDICTO
    const veredictoColor = this.isLotAccepted ? '#2e7d32' : '#c62828';
    const veredictoText = this.isLotAccepted ? 'APROBADO' : 'RECHAZADO';
    pdf.add(
      new Table([
        [
          new Cell(new Txt('VEREDICTO').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor(headerBg).end,
        ],
        [
          new Cell(new Txt(veredictoText).alignment('center').bold().fontSize(15).color(veredictoColor).end).border([
            false,
          ]).end,
        ],
        [
          new Cell(
            new Txt(
              `Críticos: ${this.stats.criticos}/${this.limits.criticos.re}  |  Mayores: ${this.stats.mayores}/${this.limits.mayores.re}  |  Menores: ${this.stats.menores}/${this.limits.menores.re}`,
            )
              .alignment('center')
              .fontSize(7).end,
          ).border([false]).end,
        ],
      ])
        .widths(['100%'])
        .layout({
          hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: any) => (i === 0 ? '#444444' : '#e0e0e0'),
        }).end,
    );
    pdf.add(new Txt(' ').end);

    pdf.add(
      legalNote(
        'Poligráfica Industrial C.A. recomienda el uso y/o almacenamiento de los empaques de papel o cartón por un tiempo no mayor a los 6 meses contados a partir de la fecha de entrega del producto, siguiendo las condiciones de almacenamiento previstas en la Politica de Devoluciones o Reclamos (DDE-005), sin menoscabo de los lapsos para las devoluciones o reclamos según lo establece dicho documento.',
      ),
    );

    return new Promise((resolve, reject) => {
      pdf.create().getBlob((blob: any) => {
        blob ? resolve(blob) : reject('Error al generar PDF');
      });
    });
  }
}
