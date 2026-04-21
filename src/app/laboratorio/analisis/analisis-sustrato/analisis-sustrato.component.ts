import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { AnalisisSustrato, AnalisisSustrato2 } from 'src/app/compras/models/modelos-compra';
import { AnalisisService } from 'src/app/services/analisis.service';
import { AlmacenService } from 'src/app/services/almacen.service';
import { RecepcionService } from 'src/app/services/recepcion.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-analisis-sustrato',
  standalone: false, templateUrl: './analisis-sustrato.component.html',
  styleUrls: ['./analisis-sustrato.component.scss']
})
export class AnalisisSustratoComponent {

  @Input() sustrato!: boolean;
  @Input() Recepcion: any;
  @Input() Materiales: any;
  @Input() Index: any;
  @Input() analisis: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseSencillo = new EventEmitter()


  constructor(public api: AnalisisService,
    public almacen: AlmacenService,
    public recepcion: RecepcionService,
    public login: LoginService
  ) {

  }

  public Gramaje_Cobb = true;
  public calibre = false;
  public curling = false;
  public dimensiones = false;

  tabs(n) {
    switch (n) {
      case 1:
        this.Gramaje_Cobb = true;
        this.calibre = false;
        this.curling = false;
        this.dimensiones = false;
        break;
      case 2:
        this.calibre = true;
        this.Gramaje_Cobb = false;
        this.curling = false;
        this.dimensiones = false;
        break;
      case 3:
        this.curling = true;
        this.dimensiones = false;
        this.Gramaje_Cobb = false;
        this.calibre = false;
        break;
      case 4:
        this.Gramaje_Cobb = false;
        this.calibre = false;
        this.curling = false;
        this.dimensiones = true;
        break;
    }
  }

  desviacionEstandar(array, promedio) {
    let suma = 0;
    for (let i = 0; i < array.length; i++) {
      suma += Math.pow(array[i] - promedio, 2);
    }
    return Math.sqrt(suma / (array.length - 1));
  }

  Promedio(array) {
    const sum = array.reduce((a, b) => a + b, 0);
    const average = sum / array.length;
    return Number(average.toFixed(2))
  }

  gramaje(i) {
    this.analisis.gramaje.gramaje[i] = (this.analisis.gramaje.masa_inicial[i] / (this.analisis.ancho * this.analisis.largo)) * 10000;
    this.analisis.gramaje.gramaje[i] = Number(this.analisis.gramaje.gramaje[i].toFixed(2))
    this.analisis.gramaje.max = Number(Math.max.apply(Math, this.analisis.gramaje.gramaje).toFixed(2));
    this.analisis.gramaje.min = Number(Math.min.apply(Math, this.analisis.gramaje.gramaje).toFixed(2));

    const sum = this.analisis.gramaje.gramaje.reduce((a, b) => a + b, 0);
    const average = sum / this.analisis.gramaje.gramaje.length;
    this.analisis.gramaje.promedio = Number(average.toFixed(2));
    this.analisis.gramaje.desviacion = Number(this.desviacionEstandar(this.analisis.gramaje.gramaje, this.analisis.gramaje.promedio).toFixed(2))
    if (this.analisis.gramaje.desviacion > 0) {
      this.analisis.gramaje.decimales = 0;
    }
    if (this.analisis.gramaje.desviacion < 1) {
      let str = this.analisis.gramaje.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.gramaje.decimales = Number(i)
            this.analisis.gramaje.decimales = this.analisis.gramaje.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.gramaje.decimales = 2;
      }
    }
  }

  cobb(i) {

    if (i + 1 <= this.analisis.numero_muestras / 2) {
      this.analisis.cobb.top.cobb[i] = (this.analisis.gramaje.masa_final[i] - this.analisis.gramaje.masa_inicial[i]) * 100;
      this.analisis.cobb.top.cobb[i] = Number(this.analisis.cobb.top.cobb[i].toFixed(2))
      console.log(this.analisis.cobb.top.cobb[i], 'cobb');

      this.analisis.cobb.top.max = Math.max.apply(Math, this.analisis.cobb.top.cobb);
      this.analisis.cobb.top.min = Math.min.apply(Math, this.analisis.cobb.top.cobb);

      const sum = this.analisis.cobb.top.cobb.reduce((a, b) => a + b, 0);
      const average = sum / this.analisis.cobb.top.cobb.length;
      this.analisis.cobb.top.promedio = Number(average.toFixed(2));
      this.analisis.cobb.top.desviacion = Number(this.desviacionEstandar(this.analisis.cobb.top.cobb, this.analisis.cobb.top.promedio).toFixed(2))
      if (this.analisis.cobb.top.desviacion > 0) {
        this.analisis.cobb.top.decimales = 0;
      }
      if (this.analisis.cobb.top.desviacion < 1) {
        let str = this.analisis.cobb.top.desviacion.toString()
        let split = str.split('.')
        let decimales = split[1]

        if (decimales) {
          for (let i = 0; i < decimales.length; i++) {
            if (decimales[i] != '0') {
              this.analisis.cobb.top.decimales = Number(i)
              this.analisis.cobb.top.decimales = this.analisis.gramaje.decimales + 1;
              i = 100;
            }
          }
        } else {
          this.analisis.cobb.top.decimales = 2;
        }
      }
    }
    if (i + 1 > this.analisis.numero_muestras / 2) {
      this.analisis.cobb.back.cobb[i] = (this.analisis.gramaje.masa_final[i] - this.analisis.gramaje.masa_inicial[i]) * 100;
      this.analisis.cobb.back.cobb[i] = Number(this.analisis.cobb.back.cobb[i].toFixed(2))
      let fill = this.analisis.cobb.back.cobb.filter(x => x >= 0)
      this.analisis.cobb.back.max = Math.max(...fill);
      this.analisis.cobb.back.min = Math.min(...fill);

      const sum = this.analisis.cobb.back.cobb.reduce((a, b) => a + b, 0);
      const average = sum / fill.length;
      this.analisis.cobb.back.promedio = Number(average.toFixed(2));
      this.analisis.cobb.back.desviacion = Number(this.desviacionEstandar(fill, this.analisis.cobb.back.promedio).toFixed(2))
      if (this.analisis.cobb.back.desviacion > 0) {
        this.analisis.cobb.back.decimales = 0;
      }
      if (this.analisis.cobb.back.desviacion < 1) {
        let str = this.analisis.cobb.back.desviacion.toString()
        let split = str.split('.')
        let decimales = split[1]

        if (decimales) {
          for (let i = 0; i < decimales.length; i++) {
            if (decimales[i] != '0') {
              this.analisis.cobb.back.decimales = Number(i)
              this.analisis.cobb.back.decimales = this.analisis.gramaje.decimales + 1;
              i = 100;
            }
          }
        } else {
          this.analisis.cobb.back.decimales = 2;
        }

      }
    }
  }

  calibre_(i) {
    this.analisis.calibre.um.um[i] = this.analisis.calibre.mm.mm[i] * 1000;
    this.analisis.calibre.um.um[i] = Number(this.analisis.calibre.um.um[i].toFixed(2))
    this.analisis.calibre.pt.pt[i] = this.analisis.calibre.mm.mm[i] / 0.0254;
    this.analisis.calibre.pt.pt[i] = Number(this.analisis.calibre.pt.pt[i].toFixed(2))

    this.analisis.calibre.mm.max = Math.max(...this.analisis.calibre.mm.mm)
    this.analisis.calibre.mm.min = Math.min(...this.analisis.calibre.mm.mm)
    this.analisis.calibre.mm.promedio = this.Promedio(this.analisis.calibre.mm.mm)
    this.analisis.calibre.mm.desviacion = this.desviacionEstandar(this.analisis.calibre.mm.mm, this.analisis.calibre.mm.promedio)
    if (this.analisis.calibre.mm.desviacion < 1) {
      let str = this.analisis.calibre.mm.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.calibre.mm.decimales = Number(i)
            this.analisis.calibre.mm.decimales = this.analisis.calibre.mm.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.calibre.mm.decimales = 2;
      }
    }

    this.analisis.calibre.um.max = Math.max(...this.analisis.calibre.um.um)
    this.analisis.calibre.um.min = Math.min(...this.analisis.calibre.um.um)
    this.analisis.calibre.um.promedio = this.Promedio(this.analisis.calibre.um.um)
    this.analisis.calibre.um.desviacion = this.desviacionEstandar(this.analisis.calibre.um.um, this.analisis.calibre.um.promedio)
    if (this.analisis.calibre.um.desviacion < 1) {
      let str = this.analisis.calibre.um.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.calibre.um.decimales = Number(i)
            this.analisis.calibre.um.decimales = this.analisis.calibre.um.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.calibre.um.decimales = 2;
      }
    }


    this.analisis.calibre.pt.max = Math.max(...this.analisis.calibre.pt.pt)
    this.analisis.calibre.pt.min = Math.min(...this.analisis.calibre.pt.pt)
    this.analisis.calibre.pt.promedio = this.Promedio(this.analisis.calibre.pt.pt)
    this.analisis.calibre.pt.desviacion = this.desviacionEstandar(this.analisis.calibre.pt.pt, this.analisis.calibre.pt.promedio)
    if (this.analisis.calibre.pt.desviacion < 1) {
      let str = this.analisis.calibre.pt.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.calibre.pt.decimales = Number(i)
            this.analisis.calibre.pt.decimales = this.analisis.calibre.pt.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.calibre.pt.decimales = 2;
      }
    }

  }

  curling_(i) {
    this.analisis.curling_blancura.curling.max = Number(Math.max.apply(Math, this.analisis.curling_blancura.curling.curling).toFixed(2));
    this.analisis.curling_blancura.curling.min = Number(Math.min.apply(Math, this.analisis.curling_blancura.curling.curling).toFixed(2));

    const sum = this.analisis.curling_blancura.curling.curling.reduce((a, b) => a + b, 0);
    const average = sum / this.analisis.curling_blancura.curling.curling.length;
    this.analisis.curling_blancura.curling.promedio = Number(average.toFixed(2));
    this.analisis.curling_blancura.curling.desviacion = Number(this.desviacionEstandar(this.analisis.curling_blancura.curling.curling, this.analisis.curling_blancura.curling.promedio).toFixed(2))
    if (this.analisis.curling_blancura.curling.desviacion > 0) {
      this.analisis.curling_blancura.curling.decimales = 0;
    }
    if (this.analisis.curling_blancura.curling.desviacion < 1) {
      let str = this.analisis.curling_blancura.curling.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.curling_blancura.curling.decimales = Number(i)
            this.analisis.curling_blancura.curling.decimales = this.analisis.curling_blancura.curling.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.curling_blancura.curling.decimales = 2;
      }
    }
  }

  blancura_(i) {
    this.analisis.curling_blancura.blancura.max = Number(Math.max.apply(Math, this.analisis.curling_blancura.blancura.blancura).toFixed(2));
    this.analisis.curling_blancura.blancura.min = Number(Math.min.apply(Math, this.analisis.curling_blancura.blancura.blancura).toFixed(2));

    const sum = this.analisis.curling_blancura.blancura.blancura.reduce((a, b) => a + b, 0);
    const average = sum / this.analisis.curling_blancura.blancura.blancura.length;
    this.analisis.curling_blancura.blancura.promedio = Number(average.toFixed(2));
    this.analisis.curling_blancura.blancura.desviacion = Number(this.desviacionEstandar(this.analisis.curling_blancura.blancura.blancura, this.analisis.curling_blancura.blancura.promedio).toFixed(2))
    if (this.analisis.curling_blancura.blancura.desviacion > 0) {
      this.analisis.curling_blancura.blancura.decimales = 0;
    }
    if (this.analisis.curling_blancura.blancura.desviacion < 1) {
      let str = this.analisis.curling_blancura.blancura.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.curling_blancura.blancura.decimales = Number(i)
            this.analisis.curling_blancura.blancura.decimales = this.analisis.curling_blancura.blancura.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.curling_blancura.blancura.decimales = 2;
      }
    }
  }

  escuadra_(i) {
    this.analisis.dimensiones.Escuadra.max = Number(Math.max.apply(Math, this.analisis.dimensiones.Escuadra.escuadra).toFixed(2));
    this.analisis.dimensiones.Escuadra.min = Number(Math.min.apply(Math, this.analisis.dimensiones.Escuadra.escuadra).toFixed(2));

    const sum = this.analisis.dimensiones.Escuadra.escuadra.reduce((a, b) => a + b, 0);
    const average = sum / this.analisis.dimensiones.Escuadra.escuadra.length;
    this.analisis.dimensiones.Escuadra.promedio = Number(average.toFixed(2));
    this.analisis.dimensiones.Escuadra.desviacion = Number(this.desviacionEstandar(this.analisis.dimensiones.Escuadra.escuadra, this.analisis.dimensiones.Escuadra.promedio).toFixed(2))
    if (this.analisis.dimensiones.Escuadra.desviacion > 0) {
      this.analisis.dimensiones.Escuadra.decimales = 0;
    }
    if (this.analisis.dimensiones.Escuadra.desviacion < 1) {
      let str = this.analisis.dimensiones.Escuadra.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.dimensiones.Escuadra.decimales = Number(i)
            this.analisis.dimensiones.Escuadra.decimales = this.analisis.dimensiones.Escuadra.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.dimensiones.Escuadra.decimales = 2;
      }
    }
  }

  contraEscuadra_(i) {
    this.analisis.dimensiones.contraEscuadra.max = Number(Math.max.apply(Math, this.analisis.dimensiones.contraEscuadra.contraEscuadra).toFixed(2));
    this.analisis.dimensiones.contraEscuadra.min = Number(Math.min.apply(Math, this.analisis.dimensiones.contraEscuadra.contraEscuadra).toFixed(2));

    const sum = this.analisis.dimensiones.contraEscuadra.contraEscuadra.reduce((a, b) => a + b, 0);
    const average = sum / this.analisis.dimensiones.contraEscuadra.contraEscuadra.length;
    this.analisis.dimensiones.contraEscuadra.promedio = Number(average.toFixed(2));
    this.analisis.dimensiones.contraEscuadra.desviacion = Number(this.desviacionEstandar(this.analisis.dimensiones.contraEscuadra.contraEscuadra, this.analisis.dimensiones.contraEscuadra.promedio).toFixed(2))
    if (this.analisis.dimensiones.contraEscuadra.desviacion > 0) {
      this.analisis.dimensiones.contraEscuadra.decimales = 0;
    }
    if (this.analisis.dimensiones.contraEscuadra.desviacion < 1) {
      let str = this.analisis.dimensiones.contraEscuadra.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.dimensiones.contraEscuadra.decimales = Number(i)
            this.analisis.dimensiones.contraEscuadra.decimales = this.analisis.dimensiones.contraEscuadra.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.dimensiones.contraEscuadra.decimales = 2;
      }
    }
  }

  Pinza_(i) {
    this.analisis.dimensiones.Pinza.max = Number(Math.max.apply(Math, this.analisis.dimensiones.Pinza.pinza).toFixed(2));
    this.analisis.dimensiones.Pinza.min = Number(Math.min.apply(Math, this.analisis.dimensiones.Pinza.pinza).toFixed(2));

    const sum = this.analisis.dimensiones.Pinza.pinza.reduce((a, b) => a + b, 0);
    const average = sum / this.analisis.dimensiones.Pinza.pinza.length;
    this.analisis.dimensiones.Pinza.promedio = Number(average.toFixed(2));
    this.analisis.dimensiones.Pinza.desviacion = Number(this.desviacionEstandar(this.analisis.dimensiones.Pinza.pinza, this.analisis.dimensiones.Pinza.promedio).toFixed(2))
    if (this.analisis.dimensiones.Pinza.desviacion > 0) {
      this.analisis.dimensiones.Pinza.decimales = 0;
    }
    if (this.analisis.dimensiones.Pinza.desviacion < 1) {
      let str = this.analisis.dimensiones.Pinza.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.dimensiones.Pinza.decimales = Number(i)
            this.analisis.dimensiones.Pinza.decimales = this.analisis.dimensiones.Pinza.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.dimensiones.Pinza.decimales = 2;
      }
    }
  }

  contraPinza_(i) {
    this.analisis.dimensiones.contraPinza.max = Number(Math.max.apply(Math, this.analisis.dimensiones.contraPinza.contraPinza).toFixed(2));
    this.analisis.dimensiones.contraPinza.min = Number(Math.min.apply(Math, this.analisis.dimensiones.contraPinza.contraPinza).toFixed(2));

    const sum = this.analisis.dimensiones.contraPinza.contraPinza.reduce((a, b) => a + b, 0);
    const average = sum / this.analisis.dimensiones.contraPinza.contraPinza.length;
    this.analisis.dimensiones.contraPinza.promedio = Number(average.toFixed(2));
    this.analisis.dimensiones.contraPinza.desviacion = Number(this.desviacionEstandar(this.analisis.dimensiones.contraPinza.contraPinza, this.analisis.dimensiones.contraPinza.promedio).toFixed(2))
    if (this.analisis.dimensiones.contraPinza.desviacion > 0) {
      this.analisis.dimensiones.contraPinza.decimales = 0;
    }
    if (this.analisis.dimensiones.contraPinza.desviacion < 1) {
      let str = this.analisis.dimensiones.contraPinza.desviacion.toString()
      let split = str.split('.')
      let decimales = split[1]

      if (decimales) {
        for (let i = 0; i < decimales.length; i++) {
          if (decimales[i] != '0') {
            this.analisis.dimensiones.contraPinza.decimales = Number(i)
            this.analisis.dimensiones.contraPinza.decimales = this.analisis.dimensiones.contraPinza.decimales + 1;
            i = 100;
          }
        }
      } else {
        this.analisis.dimensiones.contraPinza.decimales = 2;
      }
    }
  }

  guardar(usuario: boolean, resultado?: string) {
    this.analisis.resultado.guardado.fecha = moment().format('DD/MM/YYYY')
    if (usuario) {
      this.analisis.resultado.guardado.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;
    }

    if (resultado) {
      this.analisis.resultado.resultado = resultado
    }
    this.api.EnviarAnalisisSustrato(this.analisis, this.Recepcion, this.Index);
    this.onCloseModal.emit();
  }

  AnalisisCompletado() {

    let analisis = this.analisis
    let muestras_ = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    let Material = this.Materiales[0]
    let recepcion = this.Recepcion
    console.log(Material)

    let hoy = moment().format('dd/mm/yyyy')
    async function GenerarCertificado() {
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('landscape');
      pdf.pageSize('A4');

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(50).margin([0, 5]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
          FORMATO DE REPORTE DE ANÁLISIS DE SUSTRATO
          `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
            new Cell(new Txt('Código: FLC-004').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revision: 28/06/2023').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
        ]).widths(['25%', '50%', '25%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('INFORMACIÓN DE SUSTRATO').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end
          ]
        ]).widths(['100%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('Descripción:').end).fillColor('#dedede').fontSize(6).end,
            new Cell(new Txt(`${Material.material.nombre} ${Material.material.gramaje}g (${Material.ancho}x${Material.largo})`).end).fontSize(6).colSpan(2).end,
            new Cell(new Txt('').end).fontSize(6).end,
            new Cell(new Txt('Marca:').end).fontSize(6).fillColor('#dedede').end,
            new Cell(new Txt(`${Material.material.marca}`).bold().fontSize(6).fontSize(6).end).end,
            new Cell(new Txt('Molino:').end).fontSize(6).fillColor('#dedede').end,
            new Cell(new Txt('NOMBRE DE MOLINO').end).fontSize(6).end,
            new Cell(new Txt('N° Lote').end).margin([15, 6]).fillColor('#dedede').rowSpan(2).fontSize(6).end,
            new Cell(new Txt(Material.lote).alignment('center').bold().end).alignment('center').rowSpan(2).margin([0, 3]).end,

          ],
          [
            new Cell(new Txt('Tamaño de muestra (cm):').end).fontSize(6).fillColor('#dedede').end,
            new Cell(new Txt(`${analisis.ancho} x ${analisis.largo}`).end).fontSize(6).end,
            // new Cell(new Txt(`${material.lote}`).end).fontSize(6).end,
            new Cell(new Txt('Area (cm²):').end).fontSize(6).fillColor('#dedede').end,
            new Cell(new Txt(`${analisis.ancho * analisis.largo}`).end).fontSize(6).end,
            new Cell(new Txt('Fecha:').end).fontSize(6).fillColor('#dedede').end,
            new Cell(new Txt(hoy).end).colSpan(2).fontSize(6).end,
            new Cell(new Txt('').end).border([false, false, false, false,]).fontSize(6).end,
            new Cell(new Txt(Material.lote).end).rowSpan(2).fontSize(6).end,
            new Cell(new Txt('').end).fontSize(6).end,
          ],
        ]).widths(['11%', '8%', '6%', '8%', '10%', '11%', '11%', '11%', '24%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('PROPIEDADES A EVALUAR DEL SUSTRATO').bold().end).fontSize(8).color('#ffffff').fillColor('#000000').decorationColor('#ffffff').alignment('center').end
          ]
        ]).widths(['100%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('#').alignment('center').end).fontSize(6).margin([0, 15]).rowSpan(4).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('Gramaje').alignment('center').end).fontSize(6).colSpan(2).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('Gramaje').alignment('center').end).fontSize(6).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('Cobb').alignment('center').end).fontSize(6).colSpan(3).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('-').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('Gramaje').alignment('center').end).fontSize(6).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('Calibre').alignment('center').end).fontSize(6).colSpan(3).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('Curling').alignment('center').end).fontSize(6).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('Blancura').alignment('center').end).fontSize(6).fillColor('#4e4e4e').color('#FFFFFF').end,
            new Cell(new Txt('').alignment('center').end).rowSpan(3).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('').alignment('center').end).rowSpan(4).fontSize(6).fillColor('#4e4e4e').end,
            new Cell(new Txt('Dimensiones del pliego (mm)').alignment('center').end).fillColor('#4e4e4e').color('#FFFFFF').colSpan(4).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).end,
          ],
          [
            new Cell(new Txt(' ').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('Masa inicial (g)').alignment('center').margin([0, 10]).end).rowSpan(3).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('Gramaje\n (g/m²)').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('Masa final (g)').alignment('center').margin([0, 10]).end).rowSpan(3).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('Cobb (g/m²) \n TOP').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('Cobb (g/m²) \nBACK').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('(mm)').alignment('center').margin([0, 5]).end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('(um)').alignment('center').margin([0, 5]).end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('(pt)').alignment('center').margin([0, 5]).end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('(s)').alignment('center').margin([0, 5]).end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('(%)').alignment('center').margin([0, 5]).end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('Escuadra').alignment('center').margin([0, 5]).end).rowSpan(3).fillColor('#bdbdbd').fontSize(6).end,
            new Cell(new Txt('contra escuadra').alignment('center').margin([0, 5]).end).rowSpan(3).fillColor('#bdbdbd').fontSize(6).end,
            new Cell(new Txt('Pinza').alignment('center').margin([0, 5]).end).rowSpan(3).fillColor('#bdbdbd').fontSize(6).end,
            new Cell(new Txt('Contra pinza').alignment('center').margin([0, 5]).end).rowSpan(3).fillColor('#bdbdbd').fontSize(6).end,
          ],
          [
            new Cell(new Txt(' ').alignment('center').end).fontSize(6).fillColor('#cecece').end,
            new Cell(new Txt('Masa inicial (g)').alignment('center').end).fontSize(6).fillColor('#cecece').end,
            new Cell(new Txt('COVENIN 945-84').alignment('center').end).fontSize(5).fillColor('#cecece').end,
            new Cell(new Txt('Masa final (g)').alignment('center').end).fontSize(6).fillColor('#cecece').end,
            new Cell(new Txt('COVENIN 1243-78').alignment('center').end).colSpan(2).fontSize(5).fillColor('#cecece').end,
            new Cell(new Txt('-').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('COVENIN 946-79').alignment('center').end).colSpan(3).fontSize(6).fillColor('#cecece').end,
            new Cell(new Txt('(um)').alignment('center').end).fontSize(6).fillColor('#cecece').end,
            new Cell(new Txt('(pt)').alignment('center').end).fontSize(6).fillColor('#cecece').end,
            new Cell(new Txt('ISO 5635').alignment('center').end).fontSize(5).fillColor('#cecece').end,
            new Cell(new Txt('ISO 2470').alignment('center').end).rowSpan(2).fontSize(5).fillColor('#cecece').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('Escuadra').alignment('center').end).fillColor('#cecece').fontSize(6).end,
            new Cell(new Txt('contra escuadra').alignment('center').end).fillColor('#cecece').fontSize(6).end,
            new Cell(new Txt('Pinza').alignment('center').end).fillColor('#cecece').fontSize(6).end,
            new Cell(new Txt('Contra pinza').alignment('center').end).fillColor('#cecece').fontSize(6).end,
          ],
          [
            new Cell(new Txt(' ').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('Masa inicial (g)').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('TAPPI T410').alignment('center').end).fontSize(5).fillColor('#eeeded').end,
            new Cell(new Txt('Masa final (g)').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('TAPPI T411').alignment('center').end).colSpan(2).fontSize(5).fillColor('#eeeded').end,
            new Cell(new Txt('-').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('TAPPI T411').alignment('center').end).colSpan(3).fontSize(5).fillColor('#eeeded').end,
            new Cell(new Txt('(um)').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('(pt)').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('TAPPI T466').alignment('center').end).fontSize(5).fillColor('#eeeded').end,
            new Cell(new Txt('(%)').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('Escuadra').alignment('center').end).fillColor('#eeeded').fontSize(6).end,
            new Cell(new Txt('contra escuadra').alignment('center').end).fillColor('#eeeded').fontSize(6).end,
            new Cell(new Txt('Pinza').alignment('center').end).fillColor('#eeeded').fontSize(6).end,
            new Cell(new Txt('Contra pinza').alignment('center').end).fillColor('#eeeded').fontSize(6).end,
          ],
          [
            new Cell(new Stack(muestras_).end).rowSpan(2).fontSize(6).alignment('center').end,
            new Cell(new Stack(analisis.gramaje.masa_inicial).fontSize(6).alignment('center').end).rowSpan(2).end,
            new Cell(new Stack(analisis.gramaje.gramaje).end).fontSize(6).alignment('center').rowSpan(2).end,
            new Cell(new Stack(analisis.gramaje.masa_final).fontSize(6).alignment('center').end).rowSpan(2).fillColor('#dedede').end,
            new Cell(new Stack(analisis.cobb.top.cobb).end).rowSpan(2).fontSize(6).alignment('center').fillColor('#dedede').end,
            new Cell(new Stack(analisis.cobb.back.cobb).end).rowSpan(2).fontSize(6).alignment('center').fillColor('#dedede').end,
            new Cell(new Stack(analisis.calibre.mm.mm).end).rowSpan(2).fontSize(6).alignment('center').end,
            new Cell(new Stack(analisis.calibre.um.um).end).rowSpan(2).fontSize(6).alignment('center').end,
            new Cell(new Stack(analisis.calibre.pt.pt).end).rowSpan(2).fontSize(6).alignment('center').end,
            new Cell(new Stack(analisis.curling_blancura.curling.curling).end).rowSpan(2).fontSize(6).alignment('center').fillColor('#dedede').end,
            new Cell(new Stack(analisis.curling_blancura.blancura.blancura).end).rowSpan(2).fontSize(6).alignment('center').end,
            new Cell(new Txt('').alignment('center').end).rowSpan(2).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Stack(muestras_).alignment('center').end).rowSpan(2).fontSize(6).end,
            new Cell(new Stack(analisis.dimensiones.Escuadra.escuadra).alignment('center').end).rowSpan(2).fontSize(6).end,
            new Cell(new Stack(analisis.dimensiones.contraEscuadra.contraEscuadra).alignment('center').end).rowSpan(2).fontSize(6).end,
            new Cell(new Stack(analisis.dimensiones.Pinza.pinza).alignment('center').end).rowSpan(2).fontSize(6).end,
            new Cell(new Stack(analisis.dimensiones.contraPinza.contraPinza).alignment('center').end).rowSpan(2).fontSize(6).end,
          ],
          [
            new Cell(new Txt('').end).fontSize(6).alignment('center').end,
            new Cell(new Txt('').fontSize(6).alignment('center').end).end,
            new Cell(new Txt('').end).fontSize(6).alignment('center').end,
            new Cell(new Txt('').fontSize(6).alignment('center').end).fillColor('#dedede').end,
            new Cell(new Txt('').end).fontSize(6).alignment('center').fillColor('#dedede').end,
            new Cell(new Stack(analisis.cobb.back.cobb).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').end).fontSize(6).alignment('center').end,
            new Cell(new Txt('').end).fontSize(6).alignment('center').end,
            new Cell(new Txt('').end).fontSize(6).alignment('center').end,
            new Cell(new Txt('').end).fontSize(6).alignment('center').fillColor('#dedede').end,
            new Cell(new Txt('').end).fontSize(6).alignment('center').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).end,
          ]
        ]).widths(['4.5%', '6.5%', '6.5%', '6.5%', '6.5%', '6.5%', '6.5%', '6.5%', '6.5%', '6.5%', '6.5%', '1%', '3.5%', '6.5%', '6.5%', '6.5%', '6.5%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('X̅').alignment('center').bold().end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('n/a').alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.gramaje.promedio.toFixed(analisis.gramaje.decimales)).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('n/a').alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(`${analisis.cobb.top.promedio.toString()}`).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(`${analisis.cobb.back.promedio.toString()}`).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.mm.promedio.toFixed(analisis.calibre.mm.decimales)).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.um.promedio.toFixed(analisis.calibre.um.decimales)).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.pt.promedio.toFixed(analisis.calibre.pt.decimales)).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.curling_blancura.curling.promedio.toFixed(analisis.curling_blancura.curling.deciameles)).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.curling_blancura.blancura.promedio.toFixed(analisis.curling_blancura.blancura.decimales)).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('X̅').alignment('center').end).border([true, false, true, true]).fillColor('#bdbdbd').fontSize(6).end,
            new Cell(new Txt(analisis.dimensiones.Escuadra.promedio.toFixed(analisis.dimensiones.Escuadra.decimales)).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.dimensiones.contraEscuadra.promedio.toFixed(analisis.dimensiones.contraEscuadra.decimales)).alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.dimensiones.Pinza.promedio.toFixed(analisis.dimensiones.Pinza.decimales)).alignment('center').end).colSpan(2).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(analisis.dimensiones.contraPinza.promedio.toFixed(analisis.dimensiones.contraPinza.deciameles)).alignment('center').end).colSpan(2).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
          ],
          [
            new Cell(new Txt('S').alignment('center').bold().end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('n/a').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.gramaje.desviacion.toFixed(analisis.gramaje.decimales)).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('n/a').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(`${analisis.cobb.top.desviacion.toString()}`).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(`${analisis.cobb.back.desviacion.toString()}`).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.mm.desviacion.toFixed(analisis.calibre.mm.decimales)).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.um.desviacion.toFixed(analisis.calibre.um.decimales)).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.pt.desviacion.toFixed(analisis.calibre.pt.decimales)).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.curling_blancura.curling.desviacion.toFixed(analisis.curling_blancura.curling.deciameles)).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.curling_blancura.blancura.desviacion.toFixed(analisis.curling_blancura.blancura.deciameles)).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('S').alignment('center').end).fillColor('#bdbdbd').fontSize(6).end,
            new Cell(new Txt(analisis.dimensiones.Escuadra.desviacion.toFixed(analisis.dimensiones.Escuadra.decimales)).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.dimensiones.contraEscuadra.desviacion.toFixed(analisis.dimensiones.contraEscuadra.decimales)).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.dimensiones.Pinza.desviacion.toFixed(analisis.dimensiones.Pinza.decimales)).alignment('center').end).colSpan(2).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(analisis.dimensiones.contraPinza.desviacion.toFixed(analisis.dimensiones.contraPinza.decimales)).alignment('center').end).colSpan(2).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
          ],
          [
            new Cell(new Txt('mín').alignment('center').bold().end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('n').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.gramaje.min.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('n').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(`${analisis.cobb.top.min}`).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(`${analisis.cobb.back.min}`).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.mm.min.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.um.min.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.pt.min.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.curling_blancura.curling.min.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.curling_blancura.blancura.min.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('mín').alignment('center').end).fillColor('#bdbdbd').fontSize(6).end,
            new Cell(new Txt(analisis.dimensiones.Escuadra.min.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.dimensiones.contraEscuadra.min.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.dimensiones.Pinza.min.toString()).alignment('center').end).colSpan(2).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(analisis.dimensiones.contraPinza.min.toString()).alignment('center').end).colSpan(2).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
          ],
          [
            new Cell(new Txt('máx').alignment('center').bold().end).border([true, false, true, true]).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('n').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.gramaje.max.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('n').alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(`${analisis.cobb.top.max}`).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(`${analisis.cobb.back.max}`).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.mm.max.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.um.max.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.calibre.pt.max.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.curling_blancura.curling.max.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.curling_blancura.blancura.max.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('máx').alignment('center').end).fillColor('#bdbdbd').fontSize(6).end,
            new Cell(new Txt(analisis.dimensiones.Escuadra.max.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.dimensiones.contraEscuadra.max.toString()).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(analisis.dimensiones.Pinza.max.toString()).alignment('center').end).colSpan(2).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(analisis.dimensiones.contraPinza.max.toString()).alignment('center').end).colSpan(2).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).colSpan(2).fontSize(6).fillColor('#eeeded').end,
          ],
          [
            new Cell(new Txt('ESPEC.').alignment('center').bold().margin([0, 10]).end).border([true, false, true, true]).rowSpan(3).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('mín').alignment('center').bold().end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.gramaje.min).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('n/a').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.cobb.top.min).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.cobb.back.min).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.mm.min).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.um.min).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.pt.min).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.curling.min).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.blancura.min).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('std').alignment('center').end).fillColor('#bdbdbd').fontSize(6).end,
            new Cell(new Txt(Material.material.ancho).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(Material.material.ancho).alignment('center').end).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt(Material.material.largo).alignment('center').end).colSpan(2).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.largo).alignment('center').end).colSpan(2).fontSize(6).fillColor('#bdbdbd').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
          ],
          [
            new Cell(new Txt('').alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('std').alignment('center').bold().end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.gramaje.nom).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('n/a').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.cobb.top.nom).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.cobb.back.nom).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.mm.nom).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.um.nom).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.pt.nom).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.curling.nom).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.blancura.nom).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('Medicion N°').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('1').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('2').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('3').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('X').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('S').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
          ],
          [
            new Cell(new Txt('').alignment('center').end).border([true, false, true, true]).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('máx').alignment('center').bold().end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.gramaje.max).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('n/a').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.cobb.top.max).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.cobb.back.max).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.mm.max).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.um.max).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.calibre.pt.max).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.curling.max).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt(Material.material.especificacion.blancura.max).alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('Temp.').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
          ],
          [
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).end,
            new Cell(new Txt('').alignment('center').end).border([false, false]).fontSize(6).color('#FFFFFF').end,
            new Cell(new Txt('Humedad.').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
            new Cell(new Txt('').alignment('center').end).fontSize(6).fillColor('#eeeded').end,
          ]
        ]).widths(['4.7%', '6.6%', '6.7%', '6.8%', '6.7%', '6.6%', '6.7%', '6.7%', '6.7%', '6.7%', '6.7%', '1%', '3.6%', '6.7%', '6.7%', '2.6%', '2.6%', '2.6%', '2.6%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('OBSERVACIÓN').fontSize(8).alignment('center').end).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('RESULTADO DE ANÁLISIS').fontSize(8).alignment('center').end).fillColor('#0000000').color('#FFFFFF').end
          ],
          [
            new Cell(new Txt(analisis.resultado.observacion).fontSize(8).end).rowSpan(2).end,
            new Cell(new Txt(analisis.resultado.resultado).fontSize(10).bold().end).border([false]).alignment('center').end
          ],
          [
            new Cell(new Txt('').fontSize(8).end).end,
            new Cell(new Table([
              [
                new Cell(new Txt('Realizado por:').fontSize(8).alignment('center').end).colSpan(2).fillColor('#000000').color('#FFFFFF').end,
                new Cell(new Txt('Realizado por:').fontSize(8).alignment('center').end).fillColor('#000000').color('#FFFFFF').end,
                new Cell(new Txt('').fontSize(8).alignment('center').end).border([false]).fillColor('#FFFFFF').end,
                new Cell(new Txt('Validado por:').fontSize(8).alignment('center').end).colSpan(2).fillColor('#0000000').color('#FFFFFF').end,
                new Cell(new Txt('Validado por:').fontSize(8).alignment('center').end).fillColor('#000000').color('#FFFFFF').end
              ],
              [
                new Cell(new Txt('Firma:').fontSize(6).alignment('center').end).end,
                new Cell(new Txt(analisis.resultado.guardado.usuario).fontSize(6).alignment('center').end).end,
                new Cell(new Txt('').fontSize(6).alignment('center').end).border([false]).fillColor('#FFFFFF').end,
                new Cell(new Txt('Firma:').fontSize(6).alignment('center').end).end,
                new Cell(new Txt(analisis.resultado.validado.usuario).fontSize(6).alignment('center').end).end,
              ],
              [
                new Cell(new Txt('Fecha:').fontSize(6).alignment('center').end).end,
                new Cell(new Txt(analisis.resultado.guardado.fecha).fontSize(6).alignment('center').end).end,
                new Cell(new Txt('').fontSize(6).alignment('center').end).border([false]).fillColor('#FFFFFF').end,
                new Cell(new Txt('Fecha:').fontSize(6).alignment('center').end).end,
                new Cell(new Txt(analisis.resultado.validado.fecha).fontSize(6).alignment('center').end).end,
              ]
            ]).widths(['10%', '38%', '2%', '10%', '38%']).end
            ).alignment('center').border([false]).end
          ]
        ]).widths(['60%', '40%']).end
      )


      pdf.create().download(`test`)
    }
    GenerarCertificado()

    setTimeout(() => {

      const RESULTADO = this.analisis.resultado.resultado
      if (this.analisis.resultado.pendiente) {
        this.analisis.resultado.resultado = ''
      }

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
        if (!this.analisis.resultado.pendiente) {
          recepcion.resultados[this.Index] = 'Aprobado';
          this.recepcion.GuardarRecepcion(recepcion)
        }
        if (!this.analisis.resultado.liberado) {
          EnviarAlmacen(this.Materiales, recepcion, this.almacen);
          this.analisis.resultado.liberado = true;
          // this.Analisis.resultado.resultado = ''
          this.api.EnvarAnalisis(this.analisis, this.Recepcion, this.Index);
        }
      } else {
        recepcion.resultados[this.Index] = 'Rechazado';
        recepcion.observacion[this.Index] = this.analisis.resultado.observacion;
        this.recepcion.GuardarRecepcion(recepcion)
      }
    }, 2000);

  }

  // Solo después de su aprobación se generará el análisis correspondiente.

  tipoAnalisis(e: any) {
    if (e.value === 'true') {
      this.analisis.resultado.pendiente = true;
    } else {
      this.analisis.resultado.pendiente = false;
    }
  }
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
    }).then(result => {
      if (result.isConfirmed) {
        this.guardar(true, resultado);
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
      confirmButtonColor: '#198754'
    }).then(r => {
      if (r.isConfirmed) {
        this.analisis.resultado.pendiente = false;
        this.guardar(true, 'APROBADO');
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
      confirmButtonColor: '#0d6efd'
    }).then(r => {
      if (r.isConfirmed) {
        this.analisis.resultado.pendiente = true;
        this.guardar(true, 'APROBADO');
      }
    });
  }


  cerrar() {
    this.onCloseSencillo.emit();
  }
}