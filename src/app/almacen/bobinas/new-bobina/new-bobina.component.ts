import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BobinasService } from 'src/app/services/bobinas.service';
import { AlmacenService } from 'src/app/services/almacen.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { Cell, Img, PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import pdfFonts from '../../../../assets/fonts/custom';
import { LoginService } from 'src/app/services/login.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-bobina',
  templateUrl: './new-bobina.component.html',
  styleUrls: ['./new-bobina.component.scss'],
})
export class NewBobinaComponent {
  constructor(
    public api: BobinasService,
    public almacenSvc: AlmacenService,
    public materiales: MaterialesService,
    public login: LoginService,
  ) {}

  @Input() nueva: any;
  @Output() onCloseModal = new EventEmitter();

  public sustrato = '';
  public ancho = 0;
  public largo = 0;
  public hojas = 0;
  public peso = 0;
  public lote = '';
  public fabricacion = '';
  public almacen = '';
  public convertidora = '';
  public observacion = '';

  cerrar() {
    this.onCloseModal.emit();
  }

  guardarData() {}

  get almacenesConBobinas(): any[] {
    if (!this.api.bobinas) return [];
    const externos = (this.almacenSvc.almacenes || []).filter(
      (a: any) => this.getBobinasPorAlmacen(a._id).length > 0,
    );
    const principalTieneBobinas = this.getBobinasPorAlmacen(null).length > 0;
    return [
      ...(principalTieneBobinas ? [{ _id: null, nombre: 'Almacén principal' }] : []),
      ...externos,
    ];
  }

  getBobinasPorAlmacen(almacenId: string | null): any[] {
    if (!this.api.bobinas) return [];
    return this.api.bobinas.filter((b: any) => {
      const id = b.almacen_id?._id || b.almacen_id;
      return String(id || null) === String(almacenId || null);
    });
  }

  buscarSustratosDeBobinas() {
    const bobinasFiltradas = this.getBobinasPorAlmacen(this.almacen);
    const idsMaterialesUsados = [...new Set(bobinasFiltradas.map((b) => b.material._id))];
    return this.materiales.materiales.filter((m) => idsMaterialesUsados.includes(m._id));
  }

  buscarAnchos() {
    const bobinasFiltradas = this.getBobinasPorAlmacen(this.almacen);
    return [...new Set(bobinasFiltradas.map((b) => b.ancho))];
  }

  agregarFabricacion() {
    const bobina = this.api.bobinas.find((b: any) => b.lote === this.lote);
    if (bobina) this.fabricacion = bobina.fabricacion;
  }

  disabled() {
    return !this.almacen || !this.convertidora || !this.sustrato || this.ancho < 1 || this.largo < 1 || this.hojas < 1 || this.peso <= 0 || !this.observacion;
  }

  calcularToneladas() {
    const gramaje = this.materiales.materiales.find((m: any) => m._id === this.sustrato).gramaje;
    const pesoKg = (gramaje * (this.ancho / 100) * (this.largo / 100) * this.hojas) / 1000;
    this.peso = Number((pesoKg / 1000).toFixed(2));
  }

  calcularWidth() {
    return (this.largo * 300) / this.ancho;
  }

  calcularHojasDesdeToneladas() {
    const gramaje = this.materiales.materiales.find((m: any) => m._id === this.sustrato).gramaje;
    const anchoM = this.ancho / 100;
    const largoM = this.largo / 100;
    const hojas = (this.peso * 1_000_000) / (gramaje * anchoM * largoM);
    this.hojas = Math.floor(hojas);
  }

  obtenerLotes(e: any) {}

  resetForm() {
    this.sustrato = '';
    this.ancho = 0;
    this.largo = 0;
    this.hojas = 0;
    this.peso = 0;
    this.almacen = '';
    this.convertidora = '';
    this.observacion = '';
    this.fabricacion = '';
    this.lote = '';
  }

  async generatePdf() {
    const convertidoraData = this.api.convertidora?.find((c: any) => c._id === this.convertidora);
    const materialData = this.materiales.materiales.find((m: any) => m._id === this.sustrato);
    const hoy = new Date().toLocaleDateString('es-ES');
    const usuarioNombre = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;

    const data = {
      convertidora: this.convertidora,
      material: this.sustrato,
      ancho: this.ancho,
      largo: this.largo,
      peso: this.peso,
      lote: this.lote,
      cantidad: this.hojas,
      observacion: this.observacion,
      fabricacion: this.fabricacion,
      almacen_id: this.almacen || null,
      usuario: usuarioNombre,
    };

    // Limpiar respuesta anterior y enviar guardado
    this.api.conversionGuardada = null;
    this.api.guardarConversion(data);

    // Esperar la respuesta del backend (máx 3 segundos)
    const esperarConversion = (): Promise<any> => {
      return new Promise((resolve) => {
        let intentos = 0;
        const intervalo = setInterval(() => {
          intentos++;
          if (this.api.conversionGuardada || intentos >= 30) {
            clearInterval(intervalo);
            resolve(this.api.conversionGuardada);
          }
        }, 100);
      });
    };

    const guardada = await esperarConversion();
    const numConversion = guardada?.conversion;

    setTimeout(() => {
      Swal.fire({
        text: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        toast: true,
        position: 'top-end',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      this.resetForm();
      this.onCloseModal.emit();
    }, 1000);

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

    pdf.info({
      title: 'Solicitud de Conversión',
      author: environment.company.nombre,
      subject: 'Conversión de material',
    });

    pdf.pageOrientation('portrait');

    // ══════════ HEADER ══════════
    pdf.add(
      new Table([
        [
          new Cell(await new Img('../../../../assets/poli_cintillo.png').width(60).margin([0, 3, 0, 0]).build())
            .alignment('center')
            .rowSpan(4).end,
          new Cell(
            new Txt(`
SOLICITUD DE CONVERSIÓN`).bold().end,
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
          new Cell(new Txt(`Fecha: ${hoy}`).end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
        ],
      ])
        .layout({
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#555',
          vLineColor: () => '#555',
        })
        .widths(['25%', '50%', '25%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    // ══════════ CONVERTIDORA + CONVERSIÓN ══════════
    const convNombre = convertidoraData?.nombre || '—';
    const convRif = convertidoraData?.rif || '';
    const convDireccion = convertidoraData?.direccion || '';

    pdf.add(
      new Table([
        [
          new Cell(new Txt('CONVERTIDORA').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('CONVERSIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
        [
          new Cell(new Txt('Nombre:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(
            new Txt([
              { text: 'N', fontSize: 5.7 },
              { text: 'º', font: 'Roboto', fontSize: 5.7 },
            ]).end,
          ).border([true, true, true, false]).end,
        ],
        [
          new Cell(new Txt(convNombre).fontSize(11).end)
            .margin([0, -7, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt(`${numConversion || '—'}`).alignment('center').fontSize(22).bold().end)
            .margin([0, -5, 0, 0])
            .border([true, false, true, true]).end,
        ],
        [
          new Cell(new Txt('RIF:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('Fecha:').fontSize(5.7).end).border([true, true, true, false]).end,
        ],
        [
          new Cell(new Txt(convRif || '—').fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt(hoy).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
        ],
        [
          new Cell(new Txt('Dirección:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('').end).border([false]).end,
        ],
        [
          new Cell(new Txt(convDireccion || '—').fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('').end).border([false]).end,
        ],
      ])
        .layout({
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#555',
          vLineColor: () => '#555',
        })
        .widths(['74%', '1%', '25%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    // ══════════ DETALLES ══════════
    pdf.add(
      new Table([
        [
          new Cell(new Txt('DETALLES').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ])
        .layout({
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#555',
          vLineColor: () => '#555',
        })
        .widths(['100%']).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(new Txt('Material:').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(
            new Txt([
              { text: 'Gramaje (g/m', fontSize: 5.7 },
              { text: '²', font: 'Roboto', fontSize: 5.7 },
              { text: ')', fontSize: 5.7 },
            ]).end,
          ).border([true, true, true, false]).end,
          new Cell(new Txt('Ancho (cm):').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('Largo (cm):').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('Peso (t):').fontSize(5.7).end).border([true, true, true, false]).end,
          new Cell(new Txt('Hojas (und):').fontSize(5.7).end).border([true, true, true, false]).end,
        ],
        [
          new Cell(new Txt(materialData?.nombre || '—').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`${materialData?.gramaje || '—'}`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`${this.ancho}`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`${this.largo}`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`${this.peso}`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`${this.hojas}`).fontSize(15).bold().end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#555',
          vLineColor: () => '#555',
        })
        .widths(['50%', '10%', '8%', '8%', '8%', '16%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    // ══════════ OBSERVACIONES + ELABORADO POR ══════════
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
          new Cell(new Txt(this.observacion || '—').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt(usuarioNombre).fontSize(11).end)
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
          new Cell(new Txt(hoy).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#555',
          vLineColor: () => '#555',
        })
        .widths(['69%', '1%', '30%']).end,
    );

    pdf.create().download();
  }
}
