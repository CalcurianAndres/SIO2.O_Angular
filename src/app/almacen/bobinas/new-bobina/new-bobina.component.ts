import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BobinasService } from 'src/app/services/bobinas.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import pdfFonts from "../../../../assets/fonts/custom";
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-bobina',
  templateUrl: './new-bobina.component.html',
  styleUrls: ['./new-bobina.component.scss']
})
export class NewBobinaComponent {


  constructor(public api:BobinasService,
              public materiales:MaterialesService,
              public login:LoginService
  ){

  }


  @Input() nueva:any;
  @Output() onCloseModal = new EventEmitter()

  public sustrato
  public ancho = 0
  public largo = 0
  public hojas = 0
  public peso = 0
  public lote = ''
  public fabricacion = ''
  public convertidora = ''
  public observacion = ''

  cerrar(){
    this.onCloseModal.emit();
  }

  guardarData(){

  }


  buscarSustratosDeBobinas() {
  const bobinasFiltradas = this.api.bobinas.filter(b => b.convertidora === this.convertidora);
  const idsMaterialesUsados = [...new Set(bobinasFiltradas.map(b => b.material._id))];
  const materialesFiltrados = this.materiales.materiales.filter(m => idsMaterialesUsados.includes(m._id));
  return materialesFiltrados;
  
}

agregarFabricacion(){
  this.fabricacion = this.api.bobinas.filter((b:any) => b.lote === this.lote)[0].fabricacion;
} 


  disabled() {
    return !this.sustrato || this.ancho < 1 || this.largo < 1 || this.hojas < 1 || this.peso <= 0 || !this.observacion;
  }

  buscarAnchos(){
    return [...new Set(this.api.bobinas.map(b => b.ancho))];
  }

  calcularToneladas(){

    let gramaje = this.materiales.materiales.find((m:any) => m._id === this.sustrato).gramaje

    const pesoKg = (gramaje * (this.ancho / 100) * (this.largo / 100) * this.hojas) / 1000;
    this.peso = Number((pesoKg / 1000).toFixed(2));
  }

  calcularWidth(){
    return (this.largo * 300) / this.ancho;
  }

  calcularHojasDesdeToneladas() {
  const gramaje = this.materiales.materiales.find((m: any) => m._id === this.sustrato).gramaje;

  const anchoM = this.ancho / 100;
  const largoM = this.largo / 100;

  const hojas = (this.peso * 1_000_000) / (gramaje * anchoM * largoM);
  this.hojas = Math.floor(hojas); // redondear hacia abajo a entero
  }

  obtenerLotes(e:any){

  }


    async generatePdf() {

      let data = {
        convertidora:this.convertidora,
        material:this.sustrato,
        ancho:this.ancho,
        largo:this.largo,
        peso:this.peso,
        lote:this.lote,
        cantidad:this.hojas,
        observacion:this.observacion,
        fabricacion:this.fabricacion,
        usuario:`${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`,
      }

      this.api.guardarConversion(data)

      setTimeout(() => {
        Swal.fire({
          text:this.api.mensaje.mensaje,
          icon:this.api.mensaje.icon,
          toast:true,
          position:'top-end',
          timer:5000,
          showConfirmButton:false,
          timerProgressBar:true
        })

        this.sustrato = ''
        this.ancho = 0
        this.largo = 0
        this.hojas = 0
        this.peso = 0
        this.convertidora = ''
        this.observacion = ''
        this.fabricacion = ''

        this.onCloseModal.emit();
      }, 1000);
    

        let material = this.materiales.materiales.find((m: any) => m._id === this.sustrato).nombre

        PdfMakeWrapper.setFonts(pdfFonts, {
          Gilroy: {
            normal: 'Gilroy-Light.otf',
            bold: 'Gilroy-ExtraBold.otf',
            italics: 'Gilroy-ExtraBold.otf',
            bolditalics: 'Gilroy-ExtraBold.otf'
          },
          Roboto: {
            normal: 'Roboto-Light.ttf',
            bold: 'Roboto-Bold.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-Italic.ttf'
          }
        });
    
        PdfMakeWrapper.useFont('Gilroy');
    
        async function loadImageAsBase64(imagePath: string): Promise<string> {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            fetch(imagePath)
              .then(response => response.blob())
              .then(blob => {
                reader.readAsDataURL(blob);
                reader.onloadend = () => resolve(reader.result as string);
              })
              .catch(error => reject(error));
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
          keywords: 'PDF, Reporte, Ventas'
        });

        pdf.pageOrientation('portrait')
    
    
        // Define el header para que se repita en cada página
        pdf.add(
          new Table([
            [
              new Cell(await new Img('../../../../assets/poli_cintillo.png').width(60).margin([0, 3, 0, 0]).build()).alignment('center').rowSpan(4).end,
              new Cell(new Txt(`
                    SOLICITUD DE CONVERSIÓN`).bold().end).alignment('center').fontSize(11).rowSpan(4).end,
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
              new Cell(new Txt('Fecha de Revision: 12/03/2025').end).fillColor('#dedede').fontSize(5).alignment('center').end,
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
            .widths(['25%', '50%', '25%']).end
        )
    
    
        pdf.add(
          new Txt(' ').fontSize(10).end
        )

        pdf.add(
          new Table([
            [
              new Cell(new Txt('CONVERTIDORA').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end,
              new Cell(new Txt('').end).border([false]).end,
              new Cell(new Txt('CONVERSIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end,
            ],
            [
              new Cell(new Txt('Convertidora:').fontSize(5.7).end).border([true, true, true, false]).end,
              new Cell(new Txt('').end).border([false]).end,
              new Cell(new Txt([
              { text: 'N', fontSize: 5.7 },
              { text: 'º', font: 'Roboto', fontSize: 5.7 }
            ]).end).border([true, true, true, false]).end,
            ],
            [
              new Cell(new Txt('Convertidora Finlandia, C.A.').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
              new Cell(new Txt('').end).border([false]).end,
              new Cell(new Txt('25009').alignment('center').fontSize(22).bold().end).margin([0, -15, 0, -3]).border([true, false, true, true]).end,
            ],
            [
              new Cell(new Txt('Dirección:').fontSize(5.7).end).border([true, true, true, false]).end,
              new Cell(new Txt('').end).border([false]).end,
              new Cell(new Txt('Fecha:').fontSize(5.7).end).border([true, true, true, false]).end,
            ],
            [
              new Cell(new Txt('La apoteosica ciudad de Guatire, Tierra de caballeros y buenas costumbres.').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
              new Cell(new Txt('').end).border([false]).end,
              new Cell(new Txt('20/05/2025').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
            ],
          ])
          .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            })
          .widths(['74%', '1%', '25%']).end
        )

        pdf.add(
          new Txt(' ').fontSize(10).end
        )

        pdf.add(
          new Table([
            [
              new Cell(new Txt('DETALLES').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end,
            ]
          ])
          .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            })
          .widths(['100%']).end
        )
        pdf.add(
          new Table([
            [
              new Cell(new Txt('Material:').fontSize(5.7).end).border([true, true, true, false]).end,
              new Cell(new Txt([
              { text: 'Gramaje (g/m', fontSize: 5.7 },
              { text: '²', font: 'Roboto', fontSize: 5.7 },
              { text: ')', fontSize: 5.7 },
            ]).end).border([true, true, true, false]).end,
              new Cell(new Txt('Ancho (cm):').fontSize(5.7).end).border([true, true, true, false]).end,
              new Cell(new Txt('Largo (cm):').fontSize(5.7).end).border([true, true, true, false]).end,
              new Cell(new Txt('Peso (t):').fontSize(5.7).end).border([true, true, true, false]).end,
              new Cell(new Txt('Hojas (und):').fontSize(5.7).end).border([true, true, true, false]).end,
            ],
            [
              new Cell(new Txt(material).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
              new Cell(new Txt('300').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
              new Cell(new Txt('70').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
              new Cell(new Txt('150').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
              new Cell(new Txt('25,09').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
              new Cell(new Txt('100.000').fontSize(15).bold().end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
            ]
          ])
          .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            })
          .widths(['50%','10%','8%','8%','8%','16%']).end
        )

        pdf.add(
          new Txt(' ').fontSize(10).end
        )

        pdf.add(
      new Table([
        [

          new Cell(new Txt('OBSERVACIONES').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end,
          new Cell(new Txt(' ').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).end,
          new Cell(new Txt('ELABORADO POR').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end,
        ],
        [
          new Cell(new Txt('Garantizar las hojas solicitadas').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('Andrés Calcurian:').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, false]).end,
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
        ]
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        }).widths(['69%', '1%', '30%']).end
    )


        pdf.create().download()

  }

}
