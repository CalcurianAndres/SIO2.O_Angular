import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { rgb2lab, lab2rgb, deltaE } from 'rgb-lab';
import { Draggable } from 'Draggable';
import { AnalisisService } from 'src/app/services/analisis.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as moment from 'moment';
import { AlmacenService } from 'src/app/services/almacen.service';
import { RecepcionService } from 'src/app/services/recepcion.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-analisis-tinta',
  standalone: false,
  templateUrl: './analisis-tinta.component.html',
  styleUrls: ['./analisis-tinta.component.scss'],
})
export class AnalisisTintaComponent implements OnChanges {
  constructor(
    public api: AnalisisService,
    public subirImagen_: SubirArchivosService,
    public almacen: AlmacenService,
    public recepcion: RecepcionService,
    public solicitudes__: SolicitudesService,
    public materiales: MaterialesService,
    public login: LoginService,
  ) {}

  @Input() Tinta: any;
  @Input() Recepcion: any;
  @Input() Materiales: any;
  @Input() Index: any;
  @Input() Analisis: any;
  @Input() Preparacion: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseSencillo = new EventEmitter();

  public estandar = 'background-color: rgb(255,255,255)';
  public muestra = 'background-color: rgb(255,255,255)';
  public compare = false;
  public selecccion = 0;

  tipoAnalisis(e: any) {
    if (e.value === 'true') {
      this.Analisis.resultado.pendiente = true;
    } else {
      this.Analisis.resultado.pendiente = false;
    }
  }

  ngOnChanges(): void {
    if (this.Analisis.cuantitativo.carton != '') {
      this.selecccion = 1;
    }
  }

  public RollDown = {
    descarga_1: {
      muestra: '',
      estandar: '',
    },
    descarga_2: {
      muestra: '',
      estandar: '',
    },
    descarga_3: {
      muestra: '',
      estandar: '',
    },
  };

  public RollDownModal = false;

  MostrarImagen() {
    Swal.fire({
      title: 'Draw down',
      imageUrl: `https://192.168.0.22/api/imagen/analisis/${this.Analisis.img}`,
      imageAlt: 'Draw down',
      showConfirmButton: false,
    });
  }

  isAnalisisCartonFilled(): boolean {
    const carton = this.Analisis.carton;
    return (
      carton.estandar_1.l &&
      carton.estandar_1.a &&
      carton.estandar_1.b &&
      carton.estandar_2.l &&
      carton.estandar_2.a &&
      carton.estandar_2.b &&
      carton.estandar_3.l &&
      carton.estandar_3.a &&
      carton.estandar_3.b &&
      carton.muestra_1.l &&
      carton.muestra_1.a &&
      carton.muestra_1.b &&
      carton.muestra_1.ll &&
      carton.muestra_1.aa &&
      carton.muestra_1.bb &&
      carton.muestra_1.e &&
      carton.muestra_2.l &&
      carton.muestra_2.a &&
      carton.muestra_2.b &&
      carton.muestra_2.ll &&
      carton.muestra_2.aa &&
      carton.muestra_2.bb &&
      carton.muestra_2.e &&
      carton.muestra_3.l &&
      carton.muestra_3.a &&
      carton.muestra_3.b &&
      carton.muestra_3.ll &&
      carton.muestra_3.aa &&
      carton.muestra_3.bb &&
      carton.muestra_3.e
    );
  }

  isAnalisisPapelFilled(): boolean {
    const papel = this.Analisis.papel;
    return (
      papel.estandar_1.l &&
      papel.estandar_1.a &&
      papel.estandar_1.b &&
      papel.estandar_2.l &&
      papel.estandar_2.a &&
      papel.estandar_2.b &&
      papel.estandar_3.l &&
      papel.estandar_3.a &&
      papel.estandar_3.b &&
      papel.muestra_1.l &&
      papel.muestra_1.a &&
      papel.muestra_1.b &&
      papel.muestra_1.ll &&
      papel.muestra_1.aa &&
      papel.muestra_1.bb &&
      papel.muestra_1.e &&
      papel.muestra_2.l &&
      papel.muestra_2.a &&
      papel.muestra_2.b &&
      papel.muestra_2.ll &&
      papel.muestra_2.aa &&
      papel.muestra_2.bb &&
      papel.muestra_2.e &&
      papel.muestra_3.l &&
      papel.muestra_3.a &&
      papel.muestra_3.b &&
      papel.muestra_3.ll &&
      papel.muestra_3.aa &&
      papel.muestra_3.bb &&
      papel.muestra_3.e
    );
  }

  subirImagen(e) {
    let image = e.target.files[0];
    this.subirImagen_.actualizarFoto(image, 'analisis', 'id').then((img) => {
      this.Analisis.img = img;
    });
  }

  selaccionar(n: number) {
    this.selecccion = n;
  }

  muestreo(e) {
    this.Analisis.cuantitativo.muestra = e.value;
  }

  Carton(event: any) {
    this.selecccion = 1;
    // if(event.target.checked){
    //   this.Analisis.cuantitativo.carton = true;
    // }else{
    //   this.Analisis.cuantitativo.carton = false;
    // }
  }

  Papel(event: any) {
    this.selecccion = 2;
    // if(event.target.checked){
    //   this.Analisis.cuantitativo.papel = true;
    // }else{
    //   this.Analisis.cuantitativo.papel = false;
    // }
  }

  comparar(dato) {
    switch (dato) {
      case 'C1':
        let estandar = lab2rgb([
          this.Analisis.carton.estandar_1.l,
          this.Analisis.carton.estandar_1.a,
          this.Analisis.carton.estandar_1.b,
        ]);
        this.estandar = 'background-color: rgb(' + estandar[0] + ',' + estandar[1] + ',' + estandar[2] + ')';
        let muestra = lab2rgb([
          this.Analisis.carton.muestra_1.l,
          this.Analisis.carton.muestra_1.a,
          this.Analisis.carton.muestra_1.b,
        ]);
        this.muestra = 'background-color: rgb(' + muestra[0] + ',' + muestra[1] + ',' + muestra[2] + ')';
        break;
      case 'C2':
        let estandar2 = lab2rgb([
          this.Analisis.carton.estandar_2.l,
          this.Analisis.carton.estandar_2.a,
          this.Analisis.carton.estandar_2.b,
        ]);
        this.estandar = 'background-color: rgb(' + estandar2[0] + ',' + estandar2[1] + ',' + estandar2[2] + ')';
        let muestra2 = lab2rgb([
          this.Analisis.carton.muestra_2.l,
          this.Analisis.carton.muestra_2.a,
          this.Analisis.carton.muestra_2.b,
        ]);
        this.muestra = 'background-color: rgb(' + muestra2[0] + ',' + muestra2[1] + ',' + muestra2[2] + ')';
        break;
      case 'C3':
        let estandar3 = lab2rgb([
          this.Analisis.carton.estandar_3.l,
          this.Analisis.carton.estandar_3.a,
          this.Analisis.carton.estandar_3.b,
        ]);
        this.estandar = 'background-color: rgb(' + estandar3[0] + ',' + estandar3[1] + ',' + estandar3[2] + ')';
        let muestra3 = lab2rgb([
          this.Analisis.carton.muestra_3.l,
          this.Analisis.carton.muestra_3.a,
          this.Analisis.carton.muestra_3.b,
        ]);
        this.muestra = 'background-color: rgb(' + muestra3[0] + ',' + muestra3[1] + ',' + muestra3[2] + ')';
        break;
    }
    this.compare = true;
  }

  move() {
    let rgb_converted = lab2rgb([
      this.Analisis.carton.estandar_1.l,
      this.Analisis.carton.estandar_1.a,
      this.Analisis.carton.estandar_1.b,
    ]);
  }

  move2() {
    let rgb_converted = lab2rgb([
      this.Analisis.carton.muestra_1.l,
      this.Analisis.carton.muestra_1.a,
      this.Analisis.carton.muestra_1.b,
    ]);
  }

  ShowRollDown(n) {
    // 0 = carton
    // 1 = papel

    switch (n) {
      case 0:
        let estandar = lab2rgb([
          this.Analisis.carton.estandar_1.l,
          this.Analisis.carton.estandar_1.a,
          this.Analisis.carton.estandar_1.b,
        ]);
        let muestra = lab2rgb([
          this.Analisis.carton.muestra_1.l,
          this.Analisis.carton.muestra_1.a,
          this.Analisis.carton.muestra_1.b,
        ]);
        let estandar2 = lab2rgb([
          this.Analisis.carton.estandar_2.l,
          this.Analisis.carton.estandar_2.a,
          this.Analisis.carton.estandar_2.b,
        ]);
        let muestra2 = lab2rgb([
          this.Analisis.carton.muestra_2.l,
          this.Analisis.carton.muestra_2.a,
          this.Analisis.carton.muestra_2.b,
        ]);
        let estandar3 = lab2rgb([
          this.Analisis.carton.estandar_3.l,
          this.Analisis.carton.estandar_3.a,
          this.Analisis.carton.estandar_3.b,
        ]);
        let muestra3 = lab2rgb([
          this.Analisis.carton.muestra_3.l,
          this.Analisis.carton.muestra_3.a,
          this.Analisis.carton.muestra_3.b,
        ]);

        this.RollDown.descarga_1.estandar =
          'background-color: rgb(' + estandar[0] + ',' + estandar[1] + ',' + estandar[2] + ')';
        this.RollDown.descarga_1.muestra =
          'background-color: rgb(' + muestra[0] + ',' + muestra[1] + ',' + muestra[2] + ')';
        this.RollDown.descarga_2.estandar =
          'background-color: rgb(' + estandar2[0] + ',' + estandar2[1] + ',' + estandar2[2] + ')';
        this.RollDown.descarga_2.muestra =
          'background-color: rgb(' + muestra2[0] + ',' + muestra2[1] + ',' + muestra2[2] + ')';
        this.RollDown.descarga_3.estandar =
          'background-color: rgb(' + estandar3[0] + ',' + estandar3[1] + ',' + estandar3[2] + ')';
        this.RollDown.descarga_3.muestra =
          'background-color: rgb(' + muestra3[0] + ',' + muestra3[1] + ',' + muestra3[2] + ')';
        break;
      case 1:
        let estandar_ = lab2rgb([
          this.Analisis.papel.estandar_1.l,
          this.Analisis.papel.estandar_1.a,
          this.Analisis.papel.estandar_1.b,
        ]);
        let muestra_ = lab2rgb([
          this.Analisis.papel.muestra_1.l,
          this.Analisis.papel.muestra_1.a,
          this.Analisis.papel.muestra_1.b,
        ]);
        let estandar2_ = lab2rgb([
          this.Analisis.papel.estandar_2.l,
          this.Analisis.papel.estandar_2.a,
          this.Analisis.papel.estandar_2.b,
        ]);
        let muestra2_ = lab2rgb([
          this.Analisis.papel.muestra_2.l,
          this.Analisis.papel.muestra_2.a,
          this.Analisis.papel.muestra_2.b,
        ]);
        let estandar3_ = lab2rgb([
          this.Analisis.papel.estandar_3.l,
          this.Analisis.papel.estandar_3.a,
          this.Analisis.papel.estandar_3.b,
        ]);
        let muestra3_ = lab2rgb([
          this.Analisis.papel.muestra_3.l,
          this.Analisis.papel.muestra_3.a,
          this.Analisis.papel.muestra_3.b,
        ]);

        this.RollDown.descarga_1.estandar =
          'background-color: rgb(' + estandar_[0] + ',' + estandar_[1] + ',' + estandar_[2] + ')';
        this.RollDown.descarga_1.muestra =
          'background-color: rgb(' + muestra_[0] + ',' + muestra_[1] + ',' + muestra_[2] + ')';
        this.RollDown.descarga_2.estandar =
          'background-color: rgb(' + estandar2_[0] + ',' + estandar2_[1] + ',' + estandar2_[2] + ')';
        this.RollDown.descarga_2.muestra =
          'background-color: rgb(' + muestra2_[0] + ',' + muestra2_[1] + ',' + muestra2_[2] + ')';
        this.RollDown.descarga_3.estandar =
          'background-color: rgb(' + estandar3_[0] + ',' + estandar3_[1] + ',' + estandar3_[2] + ')';
        this.RollDown.descarga_3.muestra =
          'background-color: rgb(' + muestra3_[0] + ',' + muestra3_[1] + ',' + muestra3_[2] + ')';
        break;
    }

    this.RollDownModal = true;
  }

  guardar(resultado?: string) {
    this.Analisis.resultado.guardado.fecha = moment().format('DD/MM/YYYY');
    if (resultado) {
      this.Analisis.resultado.resultado = resultado;
      this.Analisis.resultado.guardado.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;
    }
    this.api.EnvarAnalisis(this.Analisis, this.Recepcion, this.Index);

    this.onCloseModal.emit();
  }

  guardarPreparacion() {
    this.Analisis.resultado.guardado.fecha = moment().format('DD/MM/YYYY');
    this.api.EnviarAnalisisPreparacion(this.Analisis, this.Recepcion, this.Index);

    this.onCloseModal.emit();
  }

  cerrarSencillo() {
    this.onCloseSencillo.emit();
  }

  AnalisisPreparacion() {
    console.log(this.Recepcion);

    if (this.Analisis.resultado.resultado === 'LIBERADO') {
      this.api.EnviarAnalisisPreparacion(this.Analisis, this.Recepcion, this.Index);
      setTimeout(() => {
        this.solicitudes__.LiberarSolicitud(this.Recepcion._id);
        this.onCloseModal.emit();
      }, 2000);
    } else {
      let analisis = this.Analisis;
      let recepcion = this.Recepcion;

      let fabricacion = moment(recepcion.createdAt).format('DD/MM/yyyy');

      let tono = '';
      let opacidad = '';
      let viscosidad = '';
      let secadoCapaFina = '';
      let secadoCapaGruesa = '';
      let brillo = '';

      if (analisis.cualitativo.tono) {
        tono = 'Cumple';
      } else tono = 'No cumple';
      if (analisis.cualitativo.opacidad) {
        opacidad = 'Cumple';
      } else opacidad = 'No cumple';
      if (analisis.cualitativo.viscosidad) {
        viscosidad = 'Cumple';
      } else viscosidad = 'No cumple';
      if (analisis.cualitativo.secadoCapaFina) {
        secadoCapaFina = 'Cumple';
      } else secadoCapaFina = 'No cumple';
      if (analisis.cualitativo.secadoCapaGruesa) {
        secadoCapaGruesa = 'Cumple';
      } else secadoCapaGruesa = 'No cumple';
      if (analisis.cualitativo.brillo) {
        brillo = 'Cumple';
      } else brillo = 'No cumple';

      async function GenerarCertificado() {
        const pdf = new PdfMakeWrapper();
        PdfMakeWrapper.setFonts(pdfFonts);
        pdf.pageOrientation('portrait');
        pdf.pageSize('A4');

        pdf.add(
          new Table([
            [
              new Cell(await new Img('../../assets/poli_cintillo.png').width(50).margin([0, 5]).build())
                .alignment('center')
                .rowSpan(4).end,
              new Cell(
                new Txt(`
                FORMATO DE REPORTE DE ANÁLISIS DE TINTAS
                `).bold().end,
              )
                .alignment('center')
                .fontSize(9)
                .rowSpan(4).end,
              new Cell(new Txt('Código: FLC-005').end).fillColor('#dedede').fontSize(5).alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('Fecha de Revisión: 03/08/2023').end)
                .fillColor('#dedede')
                .fontSize(5)
                .alignment('center').end,
            ],
            [
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
            ],
          ]).widths(['25%', '50%', '25%']).end,
        );

        pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

        pdf.add(
          new Table([
            [
              new Cell(new Txt('Información de la tinta').bold().end)
                .bold()
                .color('#FFFFFF')
                .alignment('center')
                .fillColor('#000000')
                .colSpan(4).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
            ],
            [
              new Cell(new Txt('').bold().end).border([false, false]).colSpan(4).bold().alignment('center').fontSize(0)
                .end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
              new Cell(new Txt('').end).end,
            ],
            [
              new Cell(new Txt('Producto').bold().end).fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt(recepcion.material.nombre).bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('Proveedor').bold().end).fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('Poligrafica').alignment('center').bold().end).fontSize(7).end,
            ],
            [
              new Cell(new Txt('N° de Lote').bold().end).fillColor('#dedede').fontSize(7).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('Presentación').bold().end).fillColor('#dedede').fontSize(7).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(7).end,
            ],
            [
              new Cell(new Txt('Fecha de fabricación').bold().end).fillColor('#dedede').fontSize(7).end,
              new Cell(new Txt(fabricacion).bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('Fecha de vencimiento').bold().end).fillColor('#dedede').fontSize(7).end,
              new Cell(new Txt('0000-00-00').bold().end).alignment('center').fontSize(7).end,
            ],
            [
              new Cell(new Txt('Cantidad (Kg)').bold().end).fillColor('#dedede').fontSize(7).end,
              new Cell(new Txt(recepcion.cantidad).bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('Estándar Utilizado').bold().end).fillColor('#dedede').fontSize(7).end,
              new Cell(new Txt(analisis.resultado.estandar).bold().end).alignment('center').fontSize(7).end,
            ],
          ]).widths(['15%', '35%', '15%', '35%']).end,
        );

        pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

        pdf.add(
          new Table([
            [
              new Cell(new Txt('Propiedades y características evaluadas').bold().end)
                .colSpan(13)
                .bold()
                .color('#FFFFFF')
                .alignment('center')
                .fillColor('#000000').end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
            ],
            [
              new Cell(new Txt('').bold().end).border([false, false]).colSpan(13).bold().fontSize(0).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
            ],
            [
              new Cell(new Txt('Análisis cualitativo (Draw down)').bold().end)
                .border([false, false])
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e')
                .colSpan(12).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end)
                .border([false, false])
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('').bold().end).border([false, false]).colSpan(12).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).border([false, false]).end,
            ],
            [
              new Cell(new Txt('Tono').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt(tono).bold().end).colSpan(7).fontSize(8).alignment('center').end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(
                await new Img(`https://192.168.0.22/api/imagen/analisis/${analisis.img}`)
                  .width(150)
                  .margin([8, 0])
                  .build(),
              )
                .rowSpan(34)
                .border([false, false])
                .fontSize(8).end,
            ],
            [
              new Cell(new Txt('Transparencia / Opacidad').alignment('center').bold().end)
                .fontSize(8)
                .fillColor('#dedede')
                .colSpan(5).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt(opacidad).bold().end).colSpan(7).fontSize(8).alignment('center').end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
            ],
            [
              new Cell(new Txt('Viscosidad').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5)
                .end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt(viscosidad).bold().end).colSpan(7).fontSize(8).alignment('center').end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
            ],
            [
              new Cell(new Txt('Secado capa fina (1-3 horas)').alignment('center').bold().end)
                .fontSize(8)
                .fillColor('#dedede')
                .colSpan(5).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt(secadoCapaFina).bold().end).colSpan(7).fontSize(8).alignment('center').end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
            ],
            [
              new Cell(new Txt('Secado capa gruesa (24 horas)').alignment('center').bold().end)
                .fontSize(8)
                .fillColor('#dedede')
                .colSpan(5).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt(secadoCapaGruesa).bold().end).colSpan(7).fontSize(8).alignment('center').end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
            ],
            [
              new Cell(new Txt('Brillo').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5)
                .end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt(brillo).bold().end).colSpan(7).fontSize(8).alignment('center').end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
            ],
            [
              new Cell(new Txt('').bold().end).border([false, false]).fontSize(0).colSpan(12).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Análisis cuantitativo (Roll down)').bold().end)
                .border([false, false])
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e')
                .colSpan(12).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('').bold().end).border([false, false]).fontSize(0).colSpan(12).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Tipo de sustrato').bold().end)
                .alignment('center')
                .fontSize(7)
                .fillColor('#dedede')
                .colSpan(3).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Descarga').bold().end)
                .margin([0, 6, 0, 0])
                .alignment('center')
                .rowSpan(2)
                .fontSize(5)
                .fillColor('#dedede').end,
              new Cell(new Txt('Tinta evaluada').bold().end)
                .margin([0, 5, 0, 0])
                .alignment('center')
                .rowSpan(2)
                .fontSize(5)
                .fillColor('#dedede').end,
              new Cell(new Txt('Coordenadas de color (ISO 12647-2:2013)').alignment('center').bold().end)
                .fontSize(7)
                .fillColor('#dedede')
                .colSpan(7).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('').bold().end).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Descripción').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('Gramaje \n (g/m²)').bold().end).fontSize(4).alignment('center').fillColor('#dedede')
                .end,
              new Cell(new Txt('Calibre (pt)').bold().end).fontSize(4).alignment('center').fillColor('#dedede').end,
              new Cell(new Txt('Descarga').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('Tinta evaluada').bold().end).fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('L*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('a*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('b*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('∆L*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('∆a*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('∆b*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('∆E*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).margin([0, 30, 0, 0]).rowSpan(6).alignment('center').fontSize(7)
                .end,
              new Cell(new Txt('N/A').bold().end).margin([0, 30, 0, 0]).rowSpan(6).fontSize(7).alignment('center').end,
              new Cell(new Txt(analisis.cuantitativo.calibre).bold().end)
                .margin([0, 30, 0, 0])
                .rowSpan(6)
                .fontSize(7)
                .alignment('center').end,
              new Cell(new Txt('1°').bold().end)
                .fillColor('#cccccc')
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(7).end,
              new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_1.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_1.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_1.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_1.ll).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_1.aa).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_1.bb).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_1.e).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_1.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_1.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_1.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
              new Cell(new Txt('2°').bold().end)
                .fillColor('#dddddd')
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(7).end,
              new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_2.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_2.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_2.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_2.ll).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_2.aa).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_2.bb).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_2.e).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_2.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_2.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_2.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
              new Cell(new Txt('3°').bold().end)
                .fillColor('#eeeeee')
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(7).end,
              new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_3.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_3.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.estandar_3.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_3.ll).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_3.aa).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_3.bb).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_3.e).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('1°').bold().end)
                .fillColor('#cccccc')
                .margin([0, 5, 0, 0])
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_3.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_3.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.carton.muestra_3.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Papel').bold().end).margin([0, 30, 0, 0]).rowSpan(6).alignment('center').fontSize(7)
                .end,
              new Cell(new Txt(analisis.cuantitativo.gramaje).bold().end)
                .margin([0, 30, 0, 0])
                .rowSpan(6)
                .fontSize(7)
                .alignment('center').end,
              new Cell(new Txt('N/A').bold().end).margin([0, 30, 0, 0]).rowSpan(6).fontSize(7).alignment('center').end,
              new Cell(new Txt('1°').bold().end)
                .fillColor('#cccccc')
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(7).end,
              new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_1.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_1.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_1.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_1.ll).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_1.aa).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_1.bb).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_1.e).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_1.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_1.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_1.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
              new Cell(new Txt('2°').bold().end)
                .fillColor('#dddddd')
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(7).end,
              new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_2.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_2.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_2.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_2.ll).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_2.aa).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_2.bb).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_2.e).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_2.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_2.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_2.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
              new Cell(new Txt('3°').bold().end)
                .fillColor('#eeeeee')
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(7).end,
              new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_3.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_3.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.estandar_3.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_3.ll).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_3.aa).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_3.bb).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_3.e).bold().end)
                .margin([0, 5, 0, 0])
                .rowSpan(2)
                .alignment('center')
                .fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_3.l).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_3.a).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt(analisis.papel.muestra_3.b).bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt(' ').bold().end).border([false, false]).colSpan(12).alignment('center').fontSize(0).end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Prueba o ensayos adicionales').bold().end)
                .border([false, false])
                .colSpan(12)
                .alignment('center')
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(10)
                .fillColor('#9e9e9e')
                .colSpan(12).end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt(' ').bold().end).border([false, false]).colSpan(12).alignment('center').fontSize(0).end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Descarga').bold().end).fillColor('#dedede').alignment('center').fontSize(7).end,
              new Cell(new Txt('L*').bold().end).fillColor('#dedede').fontSize(7).alignment('center').end,
              new Cell(new Txt('a*').bold().end).fillColor('#dedede').fontSize(7).alignment('center').end,
              new Cell(new Txt('b*').bold().end).fillColor('#dedede').alignment('center').fontSize(7).end,
              new Cell(new Txt('Sustrato:').bold().end).alignment('center').fillColor('#dedede').colSpan(2).fontSize(7)
                .end,
              new Cell(new Txt('').bold().end).alignment('center').colSpan(3).fontSize(7).end,
              new Cell(new Txt(analisis.cuantitativo.muestra).bold().end).colSpan(2).alignment('center').fontSize(5)
                .end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).colSpan(4).border([false, false]).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],

            [
              new Cell(new Txt('1°').bold().end).fillColor('#cccccc').alignment('center').fontSize(7).end,
              new Cell(new Txt(analisis.muestra.estandar_1.l).bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt(analisis.muestra.estandar_1.a).bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt(analisis.muestra.estandar_1.b).bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('').bold().end).border([false, false]).colSpan(8).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],

            [
              new Cell(new Txt('2°').bold().end).fillColor('#dddddd').alignment('center').fontSize(7).end,
              new Cell(new Txt(analisis.muestra.estandar_2.l).bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt(analisis.muestra.estandar_2.a).bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt(analisis.muestra.estandar_2.b).bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('').bold().end).border([false, false]).colSpan(8).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],

            [
              new Cell(new Txt('3°').bold().end).fillColor('#eeeeee').alignment('center').fontSize(7).end,
              new Cell(new Txt(analisis.muestra.estandar_3.l).bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt(analisis.muestra.estandar_3.a).bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt(analisis.muestra.estandar_3.b).bold().end).alignment('center').fontSize(7).end,
              new Cell(new Txt('').bold().end).border([false, false]).colSpan(8).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt(' ').bold().end).border([false, false]).colSpan(12).alignment('center').fontSize(0).end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt('Observaciones').bold().end)
                .colSpan(12)
                .alignment('center')
                .alignment('center')
                .color('#FFFFFF')
                .fillColor('#000000')
                .colSpan(12).end,
              new Cell(new Txt(analisis.resultado.observacion).bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt(analisis.resultado.observacion).bold().end)
                .border([false, false])
                .colSpan(12)
                .alignment('center')
                .fontSize(0).end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],
            [
              new Cell(new Txt(analisis.resultado.observacion).bold().end)
                .height(150)
                .colSpan(12)
                .fontSize(7)
                .colSpan(12).end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
              new Cell(new Txt('Draw down').bold().end)
                .alignment('center')
                .color('#FFFFFF')
                .fontSize(0)
                .fillColor('#9e9e9e').end,
            ],
          ]).widths(['10%', '5%', '5%', '6%', '6%', '4%', '4%', '4%', '4%', '4%', '4%', '4%', '40%']).end,
        );
        pdf.add(
          new Table([
            [
              new Cell(new Txt('').bold().end).border([false, false]).alignment('center').fontSize(0).end,
              new Cell(new Txt('').bold().end).border([false, false]).alignment('center').fontSize(0).end,
              new Cell(new Txt('').bold().end).border([false, false]).alignment('center').fontSize(0).end,
            ],
            [
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('Resultado de análisis:').bold().end)
                      .colSpan(2)
                      .fillColor('#000000')
                      .color('#FFFFFF')
                      .alignment('center').end,
                    new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                  ],
                  [
                    new Cell(new Txt(analisis.resultado.resultado).bold().end)
                      .margin([0, 9.5])
                      .colSpan(2)
                      .alignment('center').end,
                    new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                  ],
                ]).widths(['35%', '65%']).end,
              )
                .border([false, false])
                .alignment('center').end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('Realizado por:').bold().end)
                      .colSpan(2)
                      .fillColor('#000000')
                      .color('#FFFFFF')
                      .alignment('center').end,
                    new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                  ],
                  [
                    new Cell(new Txt('Firma:').bold().end)
                      .border([true, false, false, false])
                      .fillColor('#eaeaea')
                      .alignment('center').end,
                    new Cell(new Txt('guardado').bold().end)
                      .border([false, false, true, false])
                      .alignment('center')
                      .fontSize(7).end,
                  ],
                  [
                    new Cell(new Txt('Fecha:').bold().end)
                      .border([true, false, false, true])
                      .fillColor('#eaeaea')
                      .alignment('center').end,
                    new Cell(new Txt(analisis.resultado.guardado.fecha).bold().end)
                      .border([false, false, true, true])
                      .alignment('center')
                      .fontSize(7).end,
                  ],
                ]).widths(['35%', '65%']).end,
              )
                .border([false, false])
                .alignment('center').end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('Validado por:').bold().end)
                      .colSpan(2)
                      .fillColor('#000000')
                      .color('#FFFFFF')
                      .alignment('center').end,
                    new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                  ],
                  [
                    new Cell(new Txt('Firma:').bold().end)
                      .border([true, false, false, false])
                      .fillColor('#eaeaea')
                      .alignment('center').end,
                    new Cell(new Txt('validado').bold().end)
                      .border([false, false, true, false])
                      .alignment('center')
                      .fontSize(7).end,
                  ],
                  [
                    new Cell(new Txt('Fecha:').bold().end)
                      .border([true, false, false, true])
                      .fillColor('#eaeaea')
                      .alignment('center').end,
                    new Cell(new Txt(analisis.resultado.validado.fecha).bold().end)
                      .border([false, false, true, true])
                      .alignment('center')
                      .fontSize(7).end,
                  ],
                ]).widths(['35%', '65%']).end,
              )
                .border([false, false])
                .alignment('center').end,
            ],
          ]).widths(['33%', '33%', '33%']).end,
        );

        pdf.create().download(`${recepcion.material.nombre} Poligrafica Lote:`);
      }
      GenerarCertificado();
    }
  }

  AnalisisCompletado(preparacion) {
    let analisis = this.Analisis;
    let producto = this.Materiales;
    let recepcion = this.Recepcion;
    let cualidad = [];
    let index = this.Index;

    let tono = '';
    let opacidad = '';
    let viscosidad = '';
    let secadoCapaFina = '';
    let secadoCapaGruesa = '';
    let brillo = '';

    if (analisis.cualitativo.tono) {
      tono = 'Cumple';
    } else tono = 'No cumple';
    if (analisis.cualitativo.opacidad) {
      opacidad = 'Cumple';
    } else opacidad = 'No cumple';
    if (analisis.cualitativo.viscosidad) {
      viscosidad = 'Cumple';
    } else viscosidad = 'No cumple';
    if (analisis.cualitativo.secadoCapaFina) {
      secadoCapaFina = 'Cumple';
    } else secadoCapaFina = 'No cumple';
    if (analisis.cualitativo.secadoCapaGruesa) {
      secadoCapaGruesa = 'Cumple';
    } else secadoCapaGruesa = 'No cumple';
    if (analisis.cualitativo.brillo) {
      brillo = 'Cumple';
    } else brillo = 'No cumple';

    analisis.resultado.validado.fecha = moment().format('DD/MM/YYYY');
    recepcion.fabricacion[index] = moment(recepcion.fabricacion[index]).format('DD/MM/YYYY');

    async function GenerarCertificado() {
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('portrait');
      pdf.pageSize('A4');

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(50).margin([0, 5]).build())
              .alignment('center')
              .rowSpan(4).end,
            new Cell(
              new Txt(`
            FORMATO DE REPORTE DE ANÁLISIS DE TINTAS
            `).bold().end,
            )
              .alignment('center')
              .fontSize(9)
              .rowSpan(4).end,
            new Cell(new Txt('Código: FLC-005').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revisión: 03/08/2023').end).fillColor('#dedede').fontSize(5).alignment('center')
              .end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
        ]).widths(['25%', '50%', '25%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Información de la tinta').bold().end)
              .bold()
              .color('#FFFFFF')
              .alignment('center')
              .fillColor('#000000')
              .colSpan(4).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false, false]).colSpan(4).bold().alignment('center').fontSize(0)
              .end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('Producto').bold().end).fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt(producto[0].material.nombre).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('Proveedor').bold().end).fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt(producto[0].material.fabricante.alias).alignment('center').bold().end).fontSize(7).end,
          ],
          [
            new Cell(new Txt('N° de Lote').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(producto[0].lote).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('Presentación').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(producto[0].presentacion).bold().end).alignment('center').fontSize(7).end,
          ],
          [
            new Cell(new Txt('Fecha de fabricación').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(recepcion.fabricacion[index]).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('Fecha de vencimiento').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt('0000-00-00').bold().end).alignment('center').fontSize(7).end,
          ],
          [
            new Cell(new Txt('Cantidad (Kg)').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(recepcion.cantidad[index]).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('Estándar Utilizado').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(analisis.resultado.estandar).bold().end).alignment('center').fontSize(7).end,
          ],
        ]).widths(['15%', '35%', '15%', '35%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Propiedades y características evaluadas').bold().end)
              .colSpan(13)
              .bold()
              .color('#FFFFFF')
              .alignment('center')
              .fillColor('#000000').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false, false]).colSpan(13).bold().fontSize(0).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
          ],
          [
            new Cell(new Txt('Análisis cualitativo (Draw down)').bold().end)
              .border([false, false])
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e')
              .colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end)
              .border([false, false])
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false, false]).colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).border([false, false]).end,
          ],
          [
            new Cell(new Txt('Tono').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(tono).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(
              await new Img(`https://192.168.0.22/api/imagen/analisis/${analisis.img}`)
                .width(150)
                .margin([8, 0])
                .build(),
            )
              .rowSpan(34)
              .border([false, false])
              .fontSize(8).end,
          ],
          [
            new Cell(new Txt('Transparencia / Opacidad').alignment('center').bold().end)
              .fontSize(8)
              .fillColor('#dedede')
              .colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(opacidad).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('Viscosidad').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5)
              .end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(viscosidad).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('Secado capa fina (1-3 horas)').alignment('center').bold().end)
              .fontSize(8)
              .fillColor('#dedede')
              .colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(secadoCapaFina).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('Secado capa gruesa (24 horas)').alignment('center').bold().end)
              .fontSize(8)
              .fillColor('#dedede')
              .colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(secadoCapaGruesa).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('Brillo').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(brillo).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false, false]).fontSize(0).colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Análisis cuantitativo (Roll down)').bold().end)
              .border([false, false])
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e')
              .colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false, false]).fontSize(0).colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Tipo de sustrato').bold().end)
              .alignment('center')
              .fontSize(7)
              .fillColor('#dedede')
              .colSpan(3).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Descarga').bold().end)
              .margin([0, 6, 0, 0])
              .alignment('center')
              .rowSpan(2)
              .fontSize(5)
              .fillColor('#dedede').end,
            new Cell(new Txt('Tinta evaluada').bold().end)
              .margin([0, 5, 0, 0])
              .alignment('center')
              .rowSpan(2)
              .fontSize(5)
              .fillColor('#dedede').end,
            new Cell(new Txt('Coordenadas de color (ISO 12647-2:2013)').alignment('center').bold().end)
              .fontSize(7)
              .fillColor('#dedede')
              .colSpan(7).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Descripción').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('Gramaje \n (g/m²)').bold().end).fontSize(4).alignment('center').fillColor('#dedede').end,
            new Cell(new Txt('Calibre (pt)').bold().end).fontSize(4).alignment('center').fillColor('#dedede').end,
            new Cell(new Txt('Descarga').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('Tinta evaluada').bold().end).fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('L*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('a*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('b*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('∆L*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('∆a*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('∆b*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('∆E*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).margin([0, 30, 0, 0]).rowSpan(6).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).margin([0, 30, 0, 0]).rowSpan(6).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.cuantitativo.calibre).bold().end)
              .margin([0, 30, 0, 0])
              .rowSpan(6)
              .fontSize(7)
              .alignment('center').end,
            new Cell(new Txt('1°').bold().end)
              .fillColor('#cccccc')
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_1.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_1.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_1.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_1.ll).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_1.aa).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_1.bb).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_1.e).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_1.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_1.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_1.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('2°').bold().end)
              .fillColor('#dddddd')
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_2.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_2.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_2.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_2.ll).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_2.aa).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_2.bb).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_2.e).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_2.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_2.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_2.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('3°').bold().end)
              .fillColor('#eeeeee')
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_3.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_3.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.estandar_3.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_3.ll).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_3.aa).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_3.bb).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_3.e).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).fillColor('#cccccc').margin([0, 5, 0, 0]).alignment('center').fontSize(5)
              .end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_3.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_3.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton.muestra_3.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Papel').bold().end).margin([0, 30, 0, 0]).rowSpan(6).alignment('center').fontSize(7).end,
            new Cell(new Txt(analisis.cuantitativo.gramaje).bold().end)
              .margin([0, 30, 0, 0])
              .rowSpan(6)
              .fontSize(7)
              .alignment('center').end,
            new Cell(new Txt('N/A').bold().end).margin([0, 30, 0, 0]).rowSpan(6).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end)
              .fillColor('#cccccc')
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_1.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_1.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_1.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_1.ll).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_1.aa).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_1.bb).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_1.e).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_1.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_1.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_1.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('2°').bold().end)
              .fillColor('#dddddd')
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_2.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_2.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_2.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_2.ll).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_2.aa).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_2.bb).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_2.e).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_2.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_2.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_2.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('3°').bold().end)
              .fillColor('#eeeeee')
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_3.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_3.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.estandar_3.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_3.ll).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_3.aa).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_3.bb).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_3.e).bold().end)
              .margin([0, 5, 0, 0])
              .rowSpan(2)
              .alignment('center')
              .fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_3.l).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_3.a).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel.muestra_3.b).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(' ').bold().end).border([false, false]).colSpan(12).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Prueba o ensayos adicionales').bold().end)
              .border([false, false])
              .colSpan(12)
              .alignment('center')
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(10)
              .fillColor('#9e9e9e')
              .colSpan(12).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(' ').bold().end).border([false, false]).colSpan(12).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Descarga').bold().end).fillColor('#dedede').alignment('center').fontSize(7).end,
            new Cell(new Txt('L*').bold().end).fillColor('#dedede').fontSize(7).alignment('center').end,
            new Cell(new Txt('a*').bold().end).fillColor('#dedede').fontSize(7).alignment('center').end,
            new Cell(new Txt('b*').bold().end).fillColor('#dedede').alignment('center').fontSize(7).end,
            new Cell(new Txt('Sustrato:').bold().end).alignment('center').fillColor('#dedede').colSpan(2).fontSize(7)
              .end,
            new Cell(new Txt('').bold().end).alignment('center').colSpan(3).fontSize(7).end,
            new Cell(new Txt(analisis.cuantitativo.muestra).bold().end).colSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).colSpan(4).border([false, false]).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],

          [
            new Cell(new Txt('1°').bold().end).fillColor('#cccccc').alignment('center').fontSize(7).end,
            new Cell(new Txt(analisis.muestra.estandar_1.l).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.muestra.estandar_1.a).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.muestra.estandar_1.b).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('').bold().end).border([false, false]).colSpan(8).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],

          [
            new Cell(new Txt('2°').bold().end).fillColor('#dddddd').alignment('center').fontSize(7).end,
            new Cell(new Txt(analisis.muestra.estandar_2.l).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.muestra.estandar_2.a).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.muestra.estandar_2.b).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('').bold().end).border([false, false]).colSpan(8).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],

          [
            new Cell(new Txt('3°').bold().end).fillColor('#eeeeee').alignment('center').fontSize(7).end,
            new Cell(new Txt(analisis.muestra.estandar_3.l).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.muestra.estandar_3.a).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.muestra.estandar_3.b).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('').bold().end).border([false, false]).colSpan(8).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(' ').bold().end).border([false, false]).colSpan(12).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Observaciones').bold().end)
              .colSpan(12)
              .alignment('center')
              .alignment('center')
              .color('#FFFFFF')
              .fillColor('#000000')
              .colSpan(12).end,
            new Cell(new Txt(analisis.resultado.observacion).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(analisis.resultado.observacion).bold().end)
              .border([false, false])
              .colSpan(12)
              .alignment('center')
              .fontSize(0).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(analisis.resultado.observacion).bold().end).height(150).colSpan(12).fontSize(7).colSpan(12)
              .end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end)
              .alignment('center')
              .color('#FFFFFF')
              .fontSize(0)
              .fillColor('#9e9e9e').end,
          ],
        ]).widths(['10%', '5%', '5%', '6%', '6%', '4%', '4%', '4%', '4%', '4%', '4%', '4%', '40%']).end,
      );
      pdf.add(
        new Table([
          [
            new Cell(new Txt('').bold().end).border([false, false]).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).border([false, false]).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).border([false, false]).alignment('center').fontSize(0).end,
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Resultado de análisis:').bold().end)
                    .colSpan(2)
                    .fillColor('#000000')
                    .color('#FFFFFF')
                    .alignment('center').end,
                  new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                ],
                [
                  new Cell(new Txt(analisis.resultado.resultado).bold().end)
                    .margin([0, 9.5])
                    .colSpan(2)
                    .alignment('center').end,
                  new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                ],
              ]).widths(['35%', '65%']).end,
            )
              .border([false, false])
              .alignment('center').end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Realizado por:').bold().end)
                    .colSpan(2)
                    .fillColor('#000000')
                    .color('#FFFFFF')
                    .alignment('center').end,
                  new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                ],
                [
                  new Cell(new Txt('Firma:').bold().end)
                    .border([true, false, false, false])
                    .fillColor('#eaeaea')
                    .alignment('center').end,
                  new Cell(new Txt('guardado').bold().end)
                    .border([false, false, true, false])
                    .alignment('center')
                    .fontSize(7).end,
                ],
                [
                  new Cell(new Txt('Fecha:').bold().end)
                    .border([true, false, false, true])
                    .fillColor('#eaeaea')
                    .alignment('center').end,
                  new Cell(new Txt(analisis.resultado.guardado.fecha).bold().end)
                    .border([false, false, true, true])
                    .alignment('center')
                    .fontSize(7).end,
                ],
              ]).widths(['35%', '65%']).end,
            )
              .border([false, false])
              .alignment('center').end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Validado por:').bold().end)
                    .colSpan(2)
                    .fillColor('#000000')
                    .color('#FFFFFF')
                    .alignment('center').end,
                  new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                ],
                [
                  new Cell(new Txt('Firma:').bold().end)
                    .border([true, false, false, false])
                    .fillColor('#eaeaea')
                    .alignment('center').end,
                  new Cell(new Txt('validado').bold().end)
                    .border([false, false, true, false])
                    .alignment('center')
                    .fontSize(7).end,
                ],
                [
                  new Cell(new Txt('Fecha:').bold().end)
                    .border([true, false, false, true])
                    .fillColor('#eaeaea')
                    .alignment('center').end,
                  new Cell(new Txt(analisis.resultado.validado.fecha).bold().end)
                    .border([false, false, true, true])
                    .alignment('center')
                    .fontSize(7).end,
                ],
              ]).widths(['35%', '65%']).end,
            )
              .border([false, false])
              .alignment('center').end,
          ],
        ]).widths(['33%', '33%', '33%']).end,
      );

      pdf
        .create()
        .download(`${producto[0].material.nombre} ${producto[0].material.fabricante.alias} Lote:${producto[0].lote}`);
    }

    GenerarCertificado();
    if (!preparacion) {
      const RESULTADO = this.Analisis.resultado.resultado;
      if (this.Analisis.resultado.pendiente) {
        this.Analisis.resultado.resultado = '';
      }
      this.api.EnvarAnalisis(this.Analisis, this.Recepcion, this.Index);
      setTimeout(() => {
        if (RESULTADO === 'APROBADO') {
          async function EnviarAlmacen(materiales, recepcion, almacen) {
            let materiales_ = materiales;
            for (let material of materiales_) {
              material.oc = material.oc._id;
              material.material = material.material._id;
              material.recepcion = recepcion._id; // Asegúrate de que `recepcion` está accesible en este contexto
            }
            almacen.GuardarAlmacen(materiales); // Guarda los materiales en el almacé
          }
          if (!this.Analisis.resultado.pendiente) {
            recepcion.resultados[this.Index] = 'Aprobado';
            this.recepcion.GuardarRecepcion(recepcion);
          }
          if (!this.Analisis.resultado.liberado) {
            EnviarAlmacen(this.Materiales, recepcion, this.almacen);
            this.Analisis.resultado.liberado = true;
            // this.Analisis.resultado.resultado = ''
            this.api.EnvarAnalisis(this.Analisis, this.Recepcion, this.Index);
          }
        } else {
          recepcion.resultados[this.Index] = 'Rechazado';
          recepcion.observacion[this.Index] = this.Analisis.resultado.observacion;
          this.recepcion.GuardarRecepcion(recepcion);
        }
      }, 2000);

      this.onCloseModal.emit();
    } else {
      // alert('yes')
      if (this.Analisis.resultado.resultado === 'LIBERADO') {
        this.api.EnviarAnalisisPreparacion(this.Analisis, this.Recepcion, this.Index);
        setTimeout(() => {
          this.solicitudes__.LiberarSolicitud(this.Recepcion._id);
        }, 2000);
      }
    }
  }

  // Solo después de su aprobación se generará el análisis correspondiente.
  enviarAValidacion(resultado) {
    Swal.fire({
      title: '¿Quieres culminar el analisis?',
      text: 'Finalizar el análisis actual y enviar a validación',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#48c78e',
      cancelButtonColor: '#f03a5f',
      // background: '#0f172a',
      // color: '#e5e7eb'
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardar(resultado);
      }
    });
  }

  confirmarFinalizacion() {
    Swal.fire({
      title: 'Confirmar envío a validación final',
      html: `
      <p>
        Esta acción <b>envía la información a validación</b>.
      </p>

      <p>
        Si el responsable autoriza:
      </p>

      <ul style="text-align:left">
        <li>• Se generará el análisis</li>
        <li>• El material será liberado</li>
        <li>• El proceso se cerrará definitivamente</li>
      </ul>
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Enviar a validación final',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754',
    }).then((r) => {
      if (r.isConfirmed) {
        this.Analisis.resultado.pendiente = false;
        this.guardar('APROBADO');
      }
    });
  }

  confirmarNuevoAnalisis() {
    Swal.fire({
      title: 'Confirmar envío a validación',
      html: `
      <p>
        Esta acción <b>envía la información a validación</b>.
      </p>

      <p>
        Si el responsable autoriza:
      </p>

      <ul style="text-align:left">
        <li>• Se generará el análisis</li>
        <li>• El material será liberado</li>
        <li>• Podrá realizarse un nuevo análisis del mismo material</li>
        </ul>
    `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Enviar a validación',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
    }).then((r) => {
      if (r.isConfirmed) {
        this.Analisis.resultado.pendiente = true;
        this.guardar('APROBADO');
      }
    });
  }
}
