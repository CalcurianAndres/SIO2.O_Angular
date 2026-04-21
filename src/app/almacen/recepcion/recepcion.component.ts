import { Component } from '@angular/core';
import * as moment from 'moment';
import { Cell, Img, PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "../../../assets/fonts/custom";
import { AlmacenService } from 'src/app/services/almacen.service';
import { BobinasService } from 'src/app/services/bobinas.service';
import { RecepcionService } from 'src/app/services/recepcion.service';
import Swal from 'sweetalert2';
import Swall from 'sweetalert2'
@Component({
  selector: 'app-recepcion',
  standalone: false, templateUrl: './recepcion.component.html',
  styleUrls: ['./recepcion.component.scss']
})
export class RecepcionComponent {
  public clicked: any = [];
  public detalle: boolean = false;
  public edicion: boolean = false;
  public nueva: boolean = false;
  public Material_selected!: any;
  public n_word!: any
  public comentarios = false;
  public recepcion_id = ''
  public convertidora = ''
  public almacenar = false;

  constructor(public api: RecepcionService,
    public almacen: AlmacenService,
    public bobinas: BobinasService) {

  }



  DescargarIdentificacionProductoPDF = async (recepcion, Material) => {
    // Configuring custom fonts
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

    const formateador = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0, // Ajusta a 2 si siempre quieres ver decimales
      maximumFractionDigits: 2
    });

    const formatearFecha = (fecha: string) => {
      if (!fecha) return '';

      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    };

    PdfMakeWrapper.useFont('Gilroy');

    const pdf = new PdfMakeWrapper();
    pdf.pageSize('letter');
    pdf.pageMargins([15, 13, 15, 0])

    for (let i = 0; i < Material.length; i++) {
      for (let copia = 0; copia < 2; copia++) {


        pdf.add(
          new Txt('FAL-001')
            .absolutePosition(540, 760)
            .fontSize(10)
            .end
        );

        pdf.add(
          new Table([
            [
              new Cell(await new Img('../../assets/poli_cintillo.png').width(100).margin([0, 5, 0, 0]).build()).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('IDENTIFICACIÓN DE SUSTRATO').bold().alignment('center').end).margin([0, 15, 0, 15]).fontSize(25).end
                  ]
                ]).layout({
                  hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                  vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                  hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                  vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                }).widths(['100%']).end
              ).end
            ]
          ]).widths(['20%', '80%']).layout('noBorders').end
        )

        pdf.add('\n')

        pdf.add(
          new Table([
            [
              new Cell(new Txt('DATOS DEL PROVEEDOR').background('#000000').color('#ffffff').bold().alignment('center').fontSize(15).end).fillColor('#000000').color('#ffffff').end
            ]
          ]).widths(['100%']).end
        )

        pdf.add(
          new Table([
            [
              new Cell(new Txt('FABRICANTE / MOLINO:').fontSize(10).end).border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt(Material[i].material.fabricante.nombre).fontSize(30).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            }).widths(['100%']).end
        )

        pdf.add(
          new Table([
            [
              new Cell(new Txt('PROVEEDOR:').fontSize(10).end).border([true, false, true, false]).end,
              new Cell(new Txt('N° FACTURA:').fontSize(10).end).border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt(recepcion.proveedor.nombre || 'ERROR').fontSize(22).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
              new Cell(new Txt(recepcion.documento).fontSize(22).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            }).widths(['50%', '50%']).end
        )

        pdf.add('\n')

        pdf.add(
          new Table([
            [
              new Cell(new Txt('DATOS DE LA CONVERSIÓN').background('#000000').color('#ffffff').bold().alignment('center').fontSize(15).end).fillColor('#000000').color('#ffffff').end
            ]
          ]).widths(['100%']).end
        )

        pdf.add(
          new Table([
            [
              new Cell(new Txt('RAZÓN SOCIAL:').fontSize(10).end).border([true, false, true, false]).end,
              new Cell(new Txt('N° CONVERSIÓN:').fontSize(10).end).border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt('Wil Projects, C.A.').fontSize(22).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
              new Cell(new Txt('000000').fontSize(22).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            }).widths(['50%', '50%']).end
        )

        pdf.add('\n')

        pdf.add(
          new Table([
            [
              new Cell(new Txt('DATOS DEL MATERIAL').background('#000000').color('#ffffff').bold().alignment('center').fontSize(15).end).fillColor('#000000').color('#ffffff').end
            ]
          ]).widths(['100%']).end
        )

        pdf.add(
          new Table([
            [
              new Cell(new Txt('DESCRIPCIÓN:').fontSize(10).end).border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt(`${Material[i].material.nombre} (${Material[i].material.serie})`).bold().fontSize(40).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            }).widths(['100%']).end
        )

        pdf.add(
          new Table([
            [
              new Cell(
                new Txt([
                  { text: 'GRAMAJE (g/m', font: 'Gilroy' },
                  { text: '²', font: 'Roboto' },
                  { text: '):', font: 'Gilroy' }
                ])
                  .fontSize(10)
                  .end
              ).border([true, false, true, false]).end,
              new Cell(
                new Txt([
                  { text: 'CALIBRE (pt/', font: 'Gilroy' },
                  { text: 'µ', font: 'Roboto' },
                  { text: 'm):', font: 'Gilroy' }
                ])
                  .fontSize(10)
                  .end
              ).border([true, false, true, false]).end,
              new Cell(new Txt('TAMAÑO DE PLIEGO (cm):').fontSize(10).end).border([true, false, true, false]).end,
            ],
            [
              new Cell(new Txt(Material[i].material.gramaje).bold().fontSize(30).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
              new Cell(new Txt(Material[i].material.calibre).bold().fontSize(30).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
              new Cell(new Txt(`${Material[i].ancho} x ${Material[i].largo}`).bold().fontSize(30).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
            ],
          ])
            .layout({
              hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
              hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            }).widths(['33%', '33%', '34%']).end
        )

        pdf.add('\n')

        pdf.add(
          new Table([
            [
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('FECHA DE FABRICACIÓN:').fontSize(10).end).border([true, true, true, false]).end,
                  ],
                  [
                    new Cell(new Txt(formatearFecha(Material[i].fabricacion)).fontSize(22).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
                  ],
                  [
                    new Cell(new Txt('FECHA DE RECEPCIÓN:').fontSize(10).end).border([true, false, true, false]).end,
                  ],
                  [
                    new Cell(new Txt(formatearFecha(recepcion.recepcion)).fontSize(22).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
                  ],
                ]).layout({
                  hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                  vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                  hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                  vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                }).widths(['100%']).end
              ).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('N° LOTE:').fontSize(10).end).border([true, true, true, false]).end,
                  ],
                  [
                    new Cell(new Txt(Material[i].lote).alignment('center').bold().fontSize(48).end).border([true, false, true, true]).end,
                  ],
                ]).layout({
                  hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                  vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                  hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                  vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                }).widths(['100%']).end
              ).end
            ]
          ]).widths(['35%', '65%']).layout('noBorders').end
        )

        pdf.add('\n')

        const dashedExactLayout = {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineStyle: () => ({ dash: { length: 4, space: 2 } }),
          vLineStyle: () => ({ dash: { length: 4, space: 2 } }),
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        };

        // pdf.pageMargins([5, 5, 5, 0]);

        pdf.add(
          new Table([
            [
              new Cell(
                new Table([
                  [
                    new Cell(
                      new Txt('FLC-001\nESTATUS DE MATERIAL')
                        .alignment('center')
                        .bold()
                        .end
                    ).end
                  ]
                ])
                  .widths([283.46])     // 🔧 calibrado
                  .heights([212.60])     // 🔧 calibrado
                  .layout(dashedExactLayout)
                  .end
              ).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('N° PALETA:').fontSize(15).end).border([true, true, true, false]).end,
                  ],
                  [
                    new Cell(new Txt(Material[i].codigo
                    ).bold().fontSize(65).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
                  ],
                  [
                    new Cell(new Txt('CANTIDAD DE HOJAS:').fontSize(15).end).border([true, false, true, false]).end,
                  ],
                  [
                    new Cell(new Txt(Number(Material[i].neto).toLocaleString('es-VE', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })).fontSize(65).end).margin([0, -3, 0, -3]).border([true, false, true, true]).end,
                  ],
                ]).layout({
                  hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                  vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                  hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                  vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                }).widths(['100%']).end
              ).end,
            ]
          ]).pageBreak('after')
            .widths(['55%', '45%'])
            .layout('noBorders')
            .end
        );


      }





    }
    pdf.create().download();
  }


  recepcionID(id, index) {
    this.recepcion_id = `${id}-${index}`
  }
  // Función para verificar si un lote tiene análisis en el almacén y devuelve la información
  poseeAnalisis(lote) {
    // console.log(this.almacen.buscarPorLote(lote)); // Imprime en consola la información del análisis del lote
    return this.almacen.buscarPorLote(lote); // Retorna la información del análisis del lote
  }

  noConforme = async (recepcion, i) => {
    const { value: formValues } = await Swal.fire({
      title: "Descripción del reclamo",
      html:
        '<textarea id="swal-input1" class="swal2-textarea" placeholder="Describe el motivo de la no conformidad"></textarea>' +
        '<select id="swal-input2" class="swal2-select" style="margin-top: 10px;">' +
        '<option value="Por analizar">Por analizar</option>' +
        '<option value="Rechazado">Rechazado</option>' +
        '<option value="Revisión">Revisión</option>' +
        '</select>',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#48c78e',
      cancelButtonColor: '#f14668',
      preConfirm: () => {
        const textElement = document.getElementById('swal-input1') as HTMLTextAreaElement | null;
        const statusElement = document.getElementById('swal-input2') as HTMLSelectElement | null;

        if (textElement && statusElement) {
          const text = textElement.value;
          const status = statusElement.value;

          if (!text) {
            Swal.showValidationMessage("Por favor, ingresa una descripción");
            return null;
          }
          return { text, status };
        } else {
          Swal.showValidationMessage("Error al obtener los campos de entrada");
          return null;
        }
      }
    });

    if (formValues) {
      let data = {
        status: formValues.status,
        observacion: formValues.text,
        recepcion: `${recepcion._id}_${i}`
      }
      recepcion.resultados[i] = formValues.status;
      this.api.GuardarReclamos(data);
      this.api.GuardarRecepcion(recepcion)

      Swal.fire({
        title: 'Se generó reclamo',
        icon: 'success',
        toast: true,
        position: 'top-end',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  };

  buscarUltimoReclamoPorRecepcion(recepcion, i) {
    let recepcion_ = `${recepcion}_${i}`;
    return this.api.buscarUltimoReclamoPorRecepcion(recepcion_)
  }



  // Función asincrónica para enviar materiales al almacén
  EnviarAlmacen = async (index: number, i: number) => {
    const materiales = this.api.recepciones[index].materiales[i];
    await materiales.forEach((material: any) => {
      material.material = material.material; // Asigna el ID del material
      material.recepcion = this.api.recepciones[index]._id; // Asigna el ID de la recepción
    });
    console.log(materiales)
    this.almacen.GuardarAlmacen(materiales); // Guarda los materiales en el almacén
  }

  sumarNetos(materiales) {
    let cantidad = materiales.reduce((total, material) => total + Number(material.neto), 0);
    return cantidad.toFixed(2)
  }

  // Función para mostrar u ocultar información adicional en una sección
  showInfo(i) {
    if (!this.clicked[i]) {
      this.clicked[i] = true; // Si no se ha hecho clic previamente, muestra la información adicional
    } else {
      this.clicked[i] = false; // Si ya se hizo clic, oculta la información adicional
    }
  }

  showObservacion(observacion) {
    Swal.fire({
      title: 'Motivo',
      text: observacion,
      showConfirmButton: false,
    })
  }

  // Función para mostrar el detalle de una recepción
  mostrarDetalle() {
    this.detalle = true; // Muestra el detalle de la recepción
  }

  // Función para crear una nueva recepción
  NuevaRecepcion() {
    this.nueva = true; // Indica que se va a crear una nueva recepción
  }

  // Función para publicar un material seleccionado
  publicMaterial(x: number, y: number) {
    this.detalle = true; // Muestra el detalle del material seleccionado
    this.Material_selected = this.api.recepciones[x]; // Asigna el material seleccionado
    this.n_word = y; // Asigna un valor a la variable n_word
  }

  // Función para editar un material
  EdicionDeMaterial(x: number, y: number) {
    this.edicion = true; // Indica que se va a editar un material
    this.Material_selected = this.api.recepciones[x]; // Asigna el material seleccionado para editar
    this.n_word = y; // Asigna un valor a la variable n_word
  }

  // Función para notificar una recepción
  notificar(id: string) {
    this.api.NoticarRecepcion(id); // Notifica la recepción con el ID proporcionado
    setTimeout(() => {
      Swall.fire({
        text: this.api.mensaje.mensaje, // Muestra un mensaje
        icon: this.api.mensaje.icon, // Muestra un ícono
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000 // Configuración de la notificación
      })
    }, 1000) // Espera 1 segundo antes de mostrar la notificación
    console.log(id); // Imprime el ID en consola
  }

  // Función para verificar una recepción
  checkar(id: string) {
    console.log(id); // Imprime el ID en consola
    this.api.checkearRecepcion(id); // Realiza la verificación de la recepción con el ID proporcionado
  }

  ProductoNoConforme(recepcion, materiales, observacion) {

    console.log(recepcion)
    let reception = moment(recepcion.recepcion).format('DD/MM/YYYY')

    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);
    pdf.pageOrientation('portrait');
    pdf.pageSize('A4');

    async function generarPDF() {
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 5, 0, 0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO DE NO CONFORMIDAD \n DEL MATERIAL RECIBIDO
            `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
            new Cell(new Txt('Código: FAL-002').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revisión: 03/08/2023').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
        ]).widths(['25%', '50%', '25%']).end
      )


      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).alignment('center').border([false, false]).end,
            new Cell(new Txt('Nº NO CONFORMIDAD').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end,
          ]
        ]).widths(['80%', '20%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).alignment('center').border([false, false]).end,
            new Cell(new Txt(`NCC-24-${observacion.numero}`).end).alignment('center').end,
          ]
        ]).widths(['80%', '20%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('DETALLES DEL PRODUCTO').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end,
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Proveedor').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(`${recepcion.proveedor.nombre}`).end).end,
            new Cell(new Txt('Documento').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(recepcion.documento).end).end
          ],
          [
            new Cell(new Txt('Producto').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(`${materiales[0].material.nombre} (${materiales[0].material.fabricante.alias})`).end).end,
            new Cell(new Txt('Lote').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(materiales[0].lote).end).end
          ],
          [
            new Cell(new Txt('Fecha').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(reception).end).end,
            new Cell(new Txt('Orden Nº').end).fillColor('#d3d3d3').end,
            new Cell(new Txt(materiales[0].oc.numero).end).end
          ]
        ]).widths(['15%', '35%', '15%', '35%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('DETALLES DE LA NO CONFORMIDAD').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end,
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(observacion.observacion).end).border([false, false]).end
          ]
        ]).widths(['100%']).end
      )


      pdf.create().download(`${materiales[0].material.nombre}(${materiales[0].material.fabricante.alias})_${materiales[0].lote}`)
    }
    generarPDF();
  }

  DescargarFormato(informacion: any) {


    let condiciones = [{
      cajas_buen_estado: true,
      cajas_limpias: true,
      calidad: true,
      envases_cerrado: false,
      identificacion: true
    },
    {
      cajas_buen_estado: true,
      cajas_limpias: true,
      calidad: true,
      envases_cerrado: false,
      identificacion: false
    }]

    let date = informacion.recepcion.split('-');
    informacion.recepcion = `${date[2]}-${date[1]}-${date[0]}`
    let conditions: string[] = informacion.condicion.map((obj: any) => {
      return Object.entries(obj)
        .filter(([propiedad, valor]) => propiedad !== '_id')
        .map(([propiedad, valor]) => {
          propiedad = propiedad.replace(/_/g, ' '); // Remove underscores from property name
          return valor ? `(x) ${propiedad}` : `( ) ${propiedad}`;
        })
        .join(' ');
    });

    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);
    pdf.pageOrientation('landscape');
    pdf.pageSize('A4');

    async function generarPDF() {
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 5, 0, 0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            VERIFICACIÓN DE LAS CONDICIONES \n DEL MATERIAL RECIBIDO
            `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
            new Cell(new Txt('Código: FAL-002').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revisión: 03/08/2023').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
        ]).widths(['25%', '50%', '25%']).end
      )


      pdf.add(
        pdf.ln(1)
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('DATOS DE RECEPCIÓN DE MATERIAL').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end,
            new Cell(new Txt('').end).alignment('center').border([false]).color('#FFFFFF').fontSize(8).end,
            new Cell(new Txt('N° DE VERIFICACIÓN').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end
          ]
        ]).widths(['80%', '0.2%', '19.8%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Nombre del proveedor').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Nombre del transportista').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Fecha de recepción').end).fontSize(8).alignment('center').fillColor('#dddddd').end,
            new Cell(new Txt('N° Factura/ Nota de entrega').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('N° Orden de compra').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('').end).border([false]).fontSize(8).end,
            new Cell(new Txt(`AL-MR-001`).bold().end).margin([0, 5, 0, 0]).alignment('center').rowSpan(2).end,
          ],
          [
            new Cell(new Txt(informacion.proveedor.nombre).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(informacion.transportista).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(informacion.recepcion).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(informacion.documento).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(informacion.OC).end).alignment('center').fontSize(8).end,
            new Cell(new Txt('').end).border([false]).fontSize(8).end,
            new Cell(new Txt('').end).border([false]).fontSize(8).end,
          ]
        ]).widths(['15%', '20%', '15%', '15%', '14%', '0.2%', '21%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('DATOS DEL MATERIAL').end).alignment('center').color('#FFFFFF').fillColor('#9c9c9c').fontSize(8).end
          ]
        ]).widths(['100%']).layout('noBorders').end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Descripción').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Grupo').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('N° de lote').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Fecha de fabricación').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Código').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Presentación').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Capacidad').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Total de unidades').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Total').end).alignment('center').fillColor('#dddddd').fontSize(8).end
          ]
        ]).widths(['17.5%', '8%', '10%', '12.5%', '10%', '12.5%', '10%', '12.5%', '7%']).end
      )

      for (let i = 0; i < informacion.materiales.length; i++) {
        pdf.add(
          new Table([
            [
              new Cell(new Txt(`${informacion.materiales[i][0].material.nombre} (${informacion.materiales[i][0].material.fabricante.alias})`).end).alignment('center').fontSize(8).border([true, false, true, true]).end,
              new Cell(new Txt(`${informacion.materiales[i][0].material.grupo.nombre}`).end).alignment('center').fontSize(8).border([true, false, true, true]).end,
              new Cell(new Txt(`${informacion.materiales[i][0].lote}`).end).alignment('center').fontSize(8).border([true, false, true, true]).end,
              new Cell(new Txt(`${informacion.materiales[i][0].material.fabricante.nombre}`).end).alignment('center').fontSize(8).border([true, false, true, true]).end,
              new Cell(new Txt('N/A').end).alignment('center').fontSize(8).border([true, false, true, true]).end,
              new Cell(new Txt(`${informacion.materiales[i][0].presentacion}`).end).alignment('center').fontSize(8).border([true, false, true, true]).end,
              new Cell(new Txt(`${informacion.materiales[i][0].neto} ${informacion.materiales[i][0].unidad}`).end).alignment('center').fontSize(8).border([true, false, true, true]).end,
              new Cell(new Txt(`${informacion.materiales.length}`).end).alignment('center').fontSize(8).border([true, false, true, true]).end,
              new Cell(new Txt(`${informacion.cantidad[i]} ${informacion.materiales[i][0].unidad}`).end).alignment('center').fontSize(8).border([true, false, true, true]).end,
            ],
            [
              new Cell(new Txt(`${conditions[i]}`).end).fillColor('#eeeeee').colSpan(9).fontSize(7).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end
            ]
          ]).widths(['17.5%', '8%', '10%', '12.5%', '10%', '12.5%', '10%', '12.5%', '7%']).end
        )
      }
      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Observación').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(9).end,
                ],
                [
                  new Cell(new Txt(`\n\n\n`).end).fontSize(8).end,

                ]
              ]).widths(['100%']).end
            ).fontSize(8).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Realizado por:').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(9).end,
                ],
                [
                  new Cell(new Txt(`Firma: Usuario\n\nFecha: 01-01-2020`).end).fontSize(8).end,

                ]
              ]).widths(['100%']).end
            ).fontSize(8).end,
            new Cell(new Table([
              [
                new Cell(new Txt('Validado por:').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(9).end,
              ],
              [
                new Cell(new Txt(`Firma: Usuario\n\nFecha:01-10-2020`).end).fontSize(8).end,

              ]
            ]).widths(['100%']).end).fontSize(8).end
          ]
        ]).widths(['50%', '25%', '25%']).layout('noBorders').end
      )
      pdf.create().download(`test`)
    }

    generarPDF()
  }


  public bobinas_: any = []
  public reception: any
  informacion_bobinas(materiales: any, recepcion: any) {
    const itemsModificados = materiales.map(item => ({
      ...item,
      material: item.material._id,
      oc: item.oc._id,
      convertidora: this.convertidora
    }));
    this.bobinas_ = itemsModificados;
    this.reception = recepcion;
  }

  guardar_Bobinas() {
    let data = this.bobinas_.map(item => ({
      ...item,
      convertidora: this.convertidora
    }))

    this.reception.status = 'Terminado'

    this.api.GuardarRecepcion(this.reception)
    this.bobinas.guardarBobina(data)

    setTimeout(() => {
      Swal.fire({
        text: this.bobinas.mensaje.mensaje,
        icon: this.bobinas.mensaje.icon,
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      this.almacenar = false;
    }, 1000);
    // console.log(data)
  }

}
