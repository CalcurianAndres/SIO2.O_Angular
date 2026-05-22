import { ChangeDetectorRef, Component, OnInit, OnDestroy, OnChanges, HostListener } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import { OcompraService } from 'src/app/services/ocompra.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { ProductosService } from 'src/app/services/productos.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Import pdfmake-wrapper and the fonts to use
import { PdfMakeWrapper, Txt, Table, Cell, Img, QR } from 'pdfmake-wrapper';
import pdfFonts from '../../../assets/fonts/custom';
import { DevolucionesService } from 'src/app/services/devoluciones.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
// import * as pdfFonts from "pdfmake/build/vfs_fonts"; // fonts provided for pdfmake

// If any issue using previous fonts import. you can try this:

@Component({
  selector: 'app-produccion',
  standalone: false,
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.scss'],
})
export class ProduccionComponent implements OnInit, OnChanges {
  public nueva = false;
  public parametro_busqueda = '';
  public resultados: any = [];
  public productos_selected: any = [];
  public desde = '';
  public hasta = '';

  public anoActual: any;

  public gestiones: boolean = false;
  public orden_selected: any = [];

  public nueva_gestion: boolean = false;

  public devolucion: boolean = false;
  public op: any;
  public informacion = false;

  current: number[] = [0];
  target: number[] = [1000];
  progressPercentage: number[] = [0];

  showPaletteList: boolean = false;

  palete_selected: any = [];
  team_selected: any = [];
  totales: any = [];
  horas: any = [];
  paletas: any = [];

  fase_selected = 0;

  // Inicializa un array de booleanos para controlar la visibilidad por cada fase y gestión
  visibilityFlags: boolean[][] = [];
  loading = true;

  public comentarios = false;
  public unique_id = '';

  public asignacionesYDevoluciones: any;

  public solicitudes;

  public Impresion_presed = false;

  public tagsNumer = 746;

  public locked = true;

  public correccion = '';

  public Despacho = false;

  ngOnInit() {}

  editarImpresion() {
    this.locked = !this.locked;
  }

  op_seleccionada: any = '';
  despachos_por_confirmar: any = {
    observacion: '',
    fecha: '',
    despachos: [],
  };

  add_orden_al_despacho() {
    let data = {
      op: this.op_seleccionada._id,
      numero_op: this.op_seleccionada.numero_op,
      producto: this.op_seleccionada.producto[0].identificacion.producto,
      producto_id: this.op_seleccionada.producto[0]._id,
      cantidad: this.op_seleccionada.cantidad,
      cliente: this.op_seleccionada.cliente,
      almacenes: '',
      parcial: false,
    };
    console.log(data.producto);
    this.despachos_por_confirmar.despachos.push(data);
    this.op_seleccionada = '';
  }

  //ETIQUETAS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  public etiqueta_generada_por_imprimir: any;

  generarImpresion(indexEtiqueta, indexFase) {
    let gestion = this.api.GestionesDeFase(this.orden_selected, indexFase)[indexEtiqueta];

    let data = {
      gestion: gestion._id,
      completo: gestion,
      op_completa: gestion.orden,
      observacion: 'Impresion SIO',
      cantidad: gestion.productos,
      op: gestion.orden._id,
    };

    this.selectedPo = data.op_completa.oc.orden;
    this.generarEtiqueta();

    this.etiqueta_generada_por_imprimir = data;
  }

  ImprimirEtiquetaYMandarAProductoTerminado() {
    this.api.etiquetarProducto(this.etiqueta_generada_por_imprimir);
  }

  pdfUrl: string | null = null;

  selectedPo: string = '00000';
  printQuantity: number = 1;

  private debounceTimer: any;

  ngOnChanges() {
    if (this.gestiones) {
      this.onChange();
    }
  }

  onChange() {
    console.log('✏️ Cambio detectado');

    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      console.log('⏱ Ejecutando generarEtiqueta después de debounce');
      this.generarEtiqueta();
    }, 300);
  }
  async generarEtiqueta() {
    console.log('🚀 generarEtiqueta START');

    try {
      this.limpiarUrl();

      const blob = await this.buildPdf();

      console.log('✅ Blob generado:', blob);

      // 1. Generamos la URL base del blob
      const baseUrl = URL.createObjectURL(blob);

      // 2. Modificamos la URL concatenando los parámetros del visor PDF
      this.pdfUrl = baseUrl + '#toolbar=0&navpanes=0&scrollbar=0';

      console.log('🌐 URL modificada creada:', this.pdfUrl);
    } catch (error) {
      console.error('❌ Error en generarEtiqueta:', error);
    }
  }

  limpiarUrl() {
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = null;
    }
  }

  fecha_: Date = new Date();

  dia: string = String(this.fecha_.getDate()).padStart(2, '0');
  mes: string = String(this.fecha_.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
  anio: number = this.fecha_.getFullYear();

  fechaFormateada: string = `${this.dia}/${this.mes}/${this.anio}`;
  fechaDiaMes: string = `${this.mes}/${this.anio}`;

  async buildPdf(): Promise<Blob> {
    console.log('🧱 buildPdf START');

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
    const doc = new PdfMakeWrapper();

    try {
      const width = 100 * 28.35;
      const height = 75 * 28.35;

      doc.pageOrientation('landscape');
      doc.pageMargins([10, 10]);

      doc.add(
        new Table([
          [
            new Cell(await new Img('../../../assets/poli_cintillo_negro.png').width(250).build()).end,
            new Cell(
              new QR(`http://poligraficaindustrial.com/premio-theobaldo-de-nigris/`).fit(130).alignment('center').end,
            ).end,
            new Cell(
              new Table([
                [new Txt('ORDEN DE PRODUCCIÓN').alignment('center').bold().fontSize(18).end],
                [new Txt(`2023000`).alignment('center').margin([0, -18]).bold().fontSize(60).end],
              ]).alignment('center').end,
            )
              .fillColor('#000000')
              .color('#FFFFFF').end,
          ],
        ])
          .widths(['40%', '27%', '33%'])
          .layout('noBorders').end,
      );
      doc.add('\n');
      doc.add(
        new Table([
          [
            new Cell(
              new Table([
                [new Txt('PRODUCTO:').fontSize(10).end],
                [new Txt(`${this.orden_selected.producto[0].identificacion.producto}`).fontSize(28).end],
              ]).layout('noBorders').end,
            ).end,
          ],
        ]).widths(['100%']).end,
      );
      doc.add('\n');
      doc.add(
        new Table([
          [
            new Cell(
              new Table([
                [new Txt('CLIENTE:').fontSize(10).end],
                [new Txt(`${this.orden_selected.producto[0].identificacion.cliente.nombre}`).fontSize(28).end],
              ]).layout('noBorders').end,
            ).end,
            new Cell(
              new Table([
                [new Txt('ORDEN DE COMPRA N°:').fontSize(10).end],
                [new Txt(this.selectedPo).fontSize(28).end],
              ]).layout('noBorders').end,
            ).end,
          ],
        ]).widths(['70%', '30%']).end,
      );
      doc.add('\n');
      doc.add(
        new Table([
          [
            new Cell(
              new Table([
                [new Txt('SUSTRATO:').fontSize(10).end],
                [new Txt(`Poligrafica Industrial`).fontSize(28).end],
              ]).layout('noBorders').end,
            ).end,
            new Cell(
              new Table([
                [new Txt('CÓDIGO DE PRODUCTO:').fontSize(10).end],
                [new Txt(`${this.orden_selected.producto[0].identificacion.codigo_cliente}`).fontSize(28).end],
              ]).layout('noBorders').end,
            ).end,
          ],
        ]).widths(['70%', '30%']).end,
      );
      doc.add('\n');
      doc.add(
        new Table([
          [
            new Cell(
              new Table([
                [new Txt('COD. ESPECIFICACIÓN:').fontSize(10).end],
                [
                  new Txt(
                    `E-${this.orden_selected.producto[0].identificacion.cliente.codigo}-${this.orden_selected.producto[0].identificacion.codigo}-${this.orden_selected.producto[0].identificacion.version}`,
                  ).fontSize(20).end,
                ],
              ]).layout('noBorders').end,
            ).end,
            new Cell(
              new Table([
                [new Txt('FECHA DE FABRICACIÓN:').fontSize(10).end],
                [new Txt(`${this.fechaDiaMes}`).fontSize(25).end],
              ]).layout('noBorders').end,
            ).end,
            new Cell(
              new Table([
                [new Txt('FECHA DE ETIQ:').fontSize(10).end],
                [new Txt(`${this.fechaFormateada}`).fontSize(25).end],
              ]).layout('noBorders').end,
            ).end,
          ],
        ]).widths(['25%', '21%', '19%']).end,
      );
      doc.add(
        new Table([
          [
            new Cell(new Txt(' ').end).fillColor('#000000').color('#FFFFFF').end,
            new Cell(
              new Table([
                [new Txt(`00.000`).bold().alignment('center').fontSize(65).end],
                [new Txt('unidades').bold().alignment('center').fontSize(18).margin([0, -14]).end],
              ]).width('100%').end,
            )
              .fillColor('#000000')
              .color('#FFFFFF').end,
            new Cell(new Txt(' ').end).fillColor('#000000').color('#FFFFFF').end,
          ],
        ]).margin([565, -65]).end,
      );

      doc.add(
        new Table([
          [
            new Cell(
              new Txt(`\n\n\nSe recomienda el uso de este producto dentro de un lapso no mayor a 6 meses.
                             Para mas información lea detenidamente nuestra "Política de devoluciones o reclamos (DDE-005)"`).fontSize(
                12,
              ).end,
            ).alignment('center').end,
          ],
        ])
          .layout('noBorders')
          .widths(['65%']).end,
      );

      doc.add(
        new Table([[new Cell(new Txt(`FPR-018`).fontSize(15).margin([755, 0]).end).end]]).layout('noBorders').end,
      );

      console.log('🧾 Contenido agregado');

      return new Promise((resolve, reject) => {
        console.log('⏳ Generando blob...');

        doc.create().getBlob((blob: Blob) => {
          if (!blob) {
            console.error('❌ Blob vino null o undefined');
            reject('Blob vacío');
            return;
          }

          console.log('✅ Blob listo dentro del callback');

          resolve(blob);
        });
      });
    } catch (error) {
      console.error('❌ Error en buildPdf:', error);
      throw error;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Bloquear Ctrl+P (Imprimir) y Ctrl+S (Guardar)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'p' || event.key === 's')) {
      event.preventDefault();
      console.log('Acción bloqueada por seguridad.');
    }
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: any) {
    event.preventDefault(); // Bloquea el clic derecho en todo el componente
  }

  // Datos simulados (reemplazar con tu servicio)
  purchaseOrders = [
    { id: 'PO-001', name: 'Orden #001' },
    { id: 'PO-002', name: 'Orden #002' },
  ];

  subOrders = [
    { id: 'SUB-A', name: 'Sub Orden A', poId: 'PO-001' },
    { id: 'SUB-B', name: 'Sub Orden B', poId: 'PO-001' },
  ];

  // Llama a esta función cada vez que cambien los datos del formulario (ej. (change)="actualizarVistaPrevia()")

  // async generarEtiqueta() {
  //   try {
  //     const pdf = new PdfMakeWrapper();
  //     pdf.pageOrientation('landscape');
  //     pdf.pageMargins([10, 10, 10, 10]);

  //     // --- Tu contenido aquí ---
  //     pdf.add(new Txt('ETIQUETA DE PRUEBA').fontSize(30).bold().end);

  //     // CAMBIO AQUÍ: Usamos una Promesa explícita para obtener el Blob
  //     const pdfDocGenerator = pdf.create();

  //     pdfDocGenerator.getBlob((blob: Blob) => {
  //       // Creamos la URL del objeto a partir del Blob recibido en el callback
  //       const url = URL.createObjectURL(blob);

  //       // Sanitizamos y agregamos los parámetros de visualización
  //       const finalUrl = `${url}#toolbar=0&navpanes=0&scrollbar=0`;
  //       this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);

  //       // Forzamos la detección de cambios para que el iframe se actualice
  //       this.cdr.detectChanges();
  //     });

  //   } catch (error) {
  //     console.error('Error al generar el PDF:', error);
  //   }
  // }

  // async generarEtiqueta() {
  //   const pdf = new PdfMakeWrapper();

  //   // Configuración base
  //   pdf.watermark(new Txt('NO VALIDA').color('black').end);
  //   pdf.pageOrientation('landscape');
  //   pdf.pageMargins([10, 10, 10, 10]);

  //   // 1. Cabecera: Logo, QR y Título
  //   // pdf.add(
  //   //   new Table([
  //   //     [
  //   //       new Cell(
  //   //         // NOTA: Asegúrate de tener el logo en src/assets/images/ o usa base64
  //   //         await new Img('../../../assets/poli_cintillo_negro.png').width(250).build()
  //   //       ).end,
  //   //       new Cell(
  //   //         new QR('http://poligraficaindustrial.com/premio-theobaldo-de-nigris/')
  //   //           .fit(130).alignment('center').end
  //   //       ).end,
  //   //       new Cell(
  //   //         new Table([
  //   //           [new Txt('ORDEN DE PRODUCCIÓN').alignment('center').bold().fontSize(30).end],
  //   //           [new Txt('2023000').alignment('center').margin([0, -18, 0, 0]).bold().fontSize(80).end]
  //   //         ]).alignment('center').end
  //   //       ).fillColor('#000000').color('#FFFFFF').end
  //   //     ]
  //   //   ]).widths(['40%', '27%', '33%']).layout('noBorders').end
  //   // );

  //   pdf.add('\n');

  //   // 2. Fila: Producto
  //   pdf.add(
  //     new Table([
  //       [
  //         new Cell(
  //           new Table([
  //             [new Txt('PRODUCTO:').fontSize(10).end],
  //             [new Txt('Poligrafica Industrial').fontSize(28).end]
  //           ]).layout('noBorders').end
  //         ).end
  //       ]
  //     ]).widths(['100%']).end
  //   );

  //   pdf.add('\n');

  //   // 3. Fila: Cliente y Orden de Compra
  //   pdf.add(
  //     new Table([
  //       [
  //         new Cell(
  //           new Table([
  //             [new Txt('CLIENTE:').fontSize(10).end],
  //             [new Txt('Poligrafica Industrial').fontSize(28).end]
  //           ]).layout('noBorders').end
  //         ).end,
  //         new Cell(
  //           new Table([
  //             [new Txt('ORDEN DE COMPRA N°:').fontSize(10).end],
  //             [new Txt(this.selectedPo).fontSize(28).end] // Dato dinámico
  //           ]).layout('noBorders').end
  //         ).end
  //       ]
  //     ]).widths(['70%', '30%']).end
  //   );

  //   pdf.add('\n');

  //   // 4. Fila: Sustrato y Código
  //   pdf.add(
  //     new Table([
  //       [
  //         new Cell(
  //           new Table([
  //             [new Txt('SUSTRATO:').fontSize(10).end],
  //             [new Txt('Poligrafica Industrial').fontSize(28).end]
  //           ]).layout('noBorders').end
  //         ).end,
  //         new Cell(
  //           new Table([
  //             [new Txt('CÓDIGO DE PRODUCTO:').fontSize(10).end],
  //             [new Txt('000000').fontSize(28).end]
  //           ]).layout('noBorders').end
  //         ).end
  //       ]
  //     ]).widths(['70%', '30%']).end
  //   );

  //   pdf.add('\n');

  //   // 5. Fila: Especificaciones y Fechas
  //   pdf.add(
  //     new Table([
  //       [
  //         new Cell(
  //           new Table([
  //             [new Txt('COD. ESPECIFICACIÓN:').fontSize(10).end],
  //             [new Txt('E-PI-000-0-00').fontSize(28).end]
  //           ]).layout('noBorders').end
  //         ).end,
  //         new Cell(
  //           new Table([
  //             [new Txt('FECHA DE FABRICACIÓN:').fontSize(10).end],
  //             [new Txt('01/2023').fontSize(28).end]
  //           ]).layout('noBorders').end
  //         ).end,
  //         new Cell(
  //           new Table([
  //             [new Txt('FECHA DE ETIQ:').fontSize(10).end],
  //             [new Txt('01/01/2023').fontSize(28).end]
  //           ]).layout('noBorders').end
  //         ).end
  //       ]
  //     ]).widths(['25%', '21%', '19%']).end // Ojo: Estas sumas no dan 100%, puedes ajustarlo a [40%, 30%, 30%]
  //   );

  //   // 6. Fila: Bloque negro de unidades
  //   pdf.add(
  //     new Table([
  //       [
  //         new Cell(new Txt(' ').end).fillColor('#000000').end,
  //         new Cell(
  //           new Table([
  //             [new Txt(`${this.printQuantity}`).bold().alignment('center').fontSize(75).end], // Dato dinámico
  //             [new Txt('unidades').bold().alignment('center').fontSize(28).margin([0, -8, 0, 0]).end]
  //           ]).widths(['100%']).end
  //         ).fillColor('#000000').color('#FFFFFF').end,
  //         new Cell(new Txt(' ').end).fillColor('#000000').end
  //       ]
  //     ]).margin([575, -85, 0, 0]).end // Ajuste de márgenes según tu diseño
  //   );

  //   // 7. Textos legales y código inferior
  //   pdf.add(
  //     new Table([
  //       [
  //         new Cell(
  //           new Txt('\n\nSe recomienda el uso de este producto dentro de un lapso no mayor a 6 meses.\nPara mas información lea detenidamente nuestra "Política de devoluciones o reclamos (DDE-005)"')
  //             .fontSize(16).alignment('center').end
  //         ).end
  //       ]
  //     ]).layout('noBorders').widths(['65%']).end
  //   );

  //   pdf.add(
  //     new Table([
  //       [
  //         new Cell(
  //           new Txt('FPR-018').fontSize(16).margin([755, 0, 0, 0]).end
  //         ).end
  //       ]
  //     ]).layout('noBorders').end
  //   );

  //   // Generamos el blob para evitar strings gigantes en el DOM
  //   // Generar el DataURL
  //   pdf.create().getDataUrl((url) => {
  //     // Guardamos la URL con los parámetros para ocultar la barra
  //     this.pdfUrl = `${url}#toolbar=0&navpanes=0&scrollbar=0`;
  //   });
  // }

  // imprimirPrueba() {
  //   console.log('Imprimiendo etiqueta de prueba (1 copia)...');
  //   this.ejecutarImpresion(1);
  // }

  // imprimirLote() {
  //   if (!this.printQuantity || this.printQuantity < 1) {
  //     alert('Por favor ingrese una cantidad válida.');
  //     return;
  //   }
  //   console.log(`Imprimiendo lote de ${this.printQuantity} etiquetas...`);
  //   this.ejecutarImpresion(this.printQuantity);
  // }

  // private ejecutarImpresion(cantidad: number) {
  //   // Aquí va la lógica real para enviar a la impresora (ej. enviar petición al backend,
  //   // o abrir una ventana de impresión controlada si es a través del navegador).
  //   const payload = {
  //     orden: this.selectedPo,
  //     subOrden: this.selectedSubPo,
  //     copias: cantidad
  //   };
  //   console.log('Payload a imprimir:', payload);

  // FIN ETIQUETAS:::::::::::::.

  // Aquí vas guardando los ngModel
  orden_solicitud: any = {
    sustrato: { id: '', cantidad: 0 },
    tintas: [],
    barniz: { id: '', cantidad: 0 },
    pega: { id: '', cantidad: 0 },
    motivo: '',
  };

  se_prendio() {
    // Prellenar ids si quieres
    this.orden_solicitud.sustrato.id = this.op.sustrato.sustrato._id;
    this.orden_solicitud.barniz.id = this.op.barniz.barniz._id;
    this.orden_solicitud.pega.id = this.op.pega.pega._id;
    for (let i = 0; i < this.op.tinta.length; i++) {
      this.orden_solicitud.tintas.push({
        id: this.op.tinta[i].tinta._id,
        cantidad: 0,
      });
    }
  }

  // Método para obtener los datos filtrados y ordenados
  async obtenerDatos(op: any) {
    try {
      // Filtramos las asignaciones por op._id === orden._id
      let asignaciones = await this.api.asignaciones; // Obtén tus asignaciones de alguna manera
      asignaciones = asignaciones.filter((a: any) => a.op._id === op._id);

      // Ordenar las asignaciones por createdAt
      asignaciones.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Filtrar devoluciones por .status === "Confirmado" y ordenarlas por fecha
      let devoluciones = await this.devolucionesService.devoluciones; // Obtén tus devoluciones de alguna manera
      devoluciones = devoluciones.filter(
        (devolucion: any) => devolucion.op._id === op._id && devolucion.status === 'Confirmado',
      );

      // Ordenar las devoluciones por createdAt
      devoluciones.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      let solicitudes = await this.solicitudesServices.solicitudes;
      solicitudes = solicitudes.filter(
        (solicitud: any) => solicitud.op && solicitud.op._id === op._id && solicitud.status === 'Por Asignar',
      );

      // Combina ambas listas (asignaciones y devoluciones)
      const combinados = [...asignaciones, ...devoluciones, ...solicitudes];

      // Ordenar la lista combinada por fecha (createdAt)
      combinados.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Almacenar la lista combinada de asignaciones y devoluciones ordenada
      this.asignacionesYDevoluciones = combinados;
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  descargarOrden = async (orden) => {
    // Configuring custom fonts
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

    // Array de pasos (steps) que puede variar en cantidad
    let steps: any = [];

    const formatter = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',

      month: '2-digit',

      year: 'numeric',
    });

    for (let i = 0; i < orden.fases.length; i++) {
      steps.push({
        title: orden.fases[i].maquina.nombre,
        subtitle: orden.fases[i].nombre,
        date: formatter.format(new Date(orden.fases[i].fases[0].fecha)),
      });
    }

    const stepsCount = steps.length;
    const columnWidth = 514 / steps.length; // ancho fijo de cada columna
    const tableWidth = stepsCount * columnWidth;
    const circleRadius = 10; // radio del círculo
    const circleCenterY = 20; // posición vertical en el canvas

    // Fila superior: textos (título y subtítulo) centrados en cada celda
    const topRow = steps.map((step) => ({
      text: `${step.title}\n${step.subtitle}`,
      alignment: 'center',
      fontSize: 8,
      margin: [0, 3, 0, 0],
    }));

    // Fila inferior: fechas centradas en cada celda
    const bottomRow = steps.map((step) => ({
      text: step.date,
      alignment: 'center',
      fontSize: 6,
      margin: [0, 3, 0, 0],
    }));

    // Fila central: un canvas que abarca todas las columnas
    // Se calcula la posición de cada círculo en base a la columna en la que debe estar
    const canvasItems: any[] = [];
    for (let i = 0; i < stepsCount; i++) {
      // Posición X: centro exacto de la columna (i * columnWidth + half column)
      const centerX = i * columnWidth + columnWidth / 2;
      // Dibujar el círculo
      canvasItems.push({
        type: 'ellipse',
        x: centerX,
        y: circleCenterY,
        color: 'white',
        lineColor: '#c5c5c5',
        lineWidth: 2,
        r1: circleRadius,
        r2: circleRadius,
      });
      // Si no es el último, dibujar la línea de conexión al siguiente círculo
      if (i < stepsCount - 1) {
        const nextCenterX = (i + 1) * columnWidth + columnWidth / 2;
        canvasItems.push({
          type: 'line',
          x1: centerX + circleRadius, // borde derecho del círculo actual
          y1: circleCenterY,
          x2: nextCenterX - circleRadius, // borde izquierdo del siguiente círculo
          y2: circleCenterY,
          lineWidth: 5,
          lineColor: '#c5c5c5',
        });
      }
    }

    // La fila del canvas se arma con una celda que hace colSpan de todas las columnas
    // y se completan las celdas restantes con objetos vacíos para que la fila tenga el mismo número de celdas
    const canvasRow = [
      {
        canvas: canvasItems,
        width: tableWidth,
        height: 60,
        colSpan: stepsCount,
      },
      ...Array(stepsCount - 1).fill({}),
    ];

    const pdf = new PdfMakeWrapper();

    // pdf.watermark( new Txt('watermark with Txt object').color('blue').end );

    pdf.add(
      new Table([
        [
          new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 5, 0, -10]).build())
            .alignment('center')
            .rowSpan(4).end,
          new Cell(
            new Txt(`
                ORDEN DE PRODUCCIÓN
                `).bold().end,
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
          new Cell(new Txt('Fecha de Revision: 12/03/2025').end).fillColor('#dedede').fontSize(5).alignment('center')
            .end,
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
        .widths(['25%', '50%', '25%']).end,
    );

    pdf.add(new Txt(' ').fontSize(10).end);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('INFORMACIÓN DEL PRODUCTO').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('rgb(165, 172, 178)').end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('ORDEN DE PRODUCCIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('rgb(165, 172, 178)').end,
        ],
        [
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(
            new Txt([
              { text: 'N', fontSize: 5.7 },
              { text: 'º', font: 'Roboto', fontSize: 5.7 },
            ]).end,
          ).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(orden.producto[0].identificacion.producto).fontSize(11).end)
            .margin([0, -3, 0, -3])
            .border([true, false, true, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt(orden.numero_op).alignment('center').fontSize(22).bold().end)
            .margin([0, -15, 0, -3])
            .border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => 'rgb(85, 85, 85)',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['69%', '1%', '30%']).end,
    );

    let emision = formatter.format(new Date(orden.createdAt));
    pdf.add(
      new Table([
        [
          new Cell(new Txt('CÓDIGO DE ESPECIFICACIÓN:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('CÓDIGO DE PRODUCTO CLIENTE:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('FECHA DE EMISIÓN').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(
            new Txt(
              `E-${orden.producto[0].identificacion.cliente.codigo}-${orden.producto[0].identificacion.codigo}-${orden.producto[0].identificacion.version}`,
            ).fontSize(11).end,
          )
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(orden.producto[0].identificacion.codigo_cliente).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt(`${emision}`).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['30%', '38.5%', '1%', '30.6%']).end,
    );
    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, false, false, false]).end]]).widths(['100%'])
        .end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('INFORMACIÓN DEL CLIENTE').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );

    let fecha_oc = formatter.format(new Date(orden.solicitud));

    pdf.add(
      new Table([
        [
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(
            new Txt([
              { text: 'N', fontSize: 5.7 },
              { text: 'º', font: 'Roboto', fontSize: 5.7 },
              { text: ' ORDEN DE COMPRA', fontSize: 5.7 },
            ]).end,
          ).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA DE OC:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(orden.producto[0].identificacion.cliente.nombre).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(orden.oc.orden).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
            .end,
          new Cell(new Txt(fecha_oc).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['50%', '25%', '25%']).end,
    );

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, false, false, false]).end]]).widths(['100%'])
        .end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('CANTIDADES Y ENTREGAS').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(new Txt('CANTIDAD SOLICITADA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('FECHA SOLICITADA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('LUGAR DE ENTREGA:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['30%', '30%', '40%']).end,
    );

    // Filtramos los pedidos que correspondan al producto de la orden
    const pedidosFiltrados = orden.oc.pedido.filter((pedido) => pedido.producto === orden.producto[0]._id);

    // Iteramos sobre los pedidos filtrados para formatear la fecha y la cantidad
    pedidosFiltrados.forEach((pedido) => {
      // Formateamos la fecha
      pedido.solicitud = formatter.format(new Date(pedido.solicitud));
      // Formateamos la cantidad: separador de miles '.' y decimales ','
      // Usamos toLocaleString con la configuración de 'es-ES'
      pedido.cantidadFormateada = Number(pedido.cantidad).toLocaleString('es-ES');
    });

    //   // Creamos las filas de la tabla con los datos formateados
    //   const filasTabla:ICell =
    //     new Cell(new Stack([pedidosFiltrados.cantidadFormateada]).fontSize(11).end)
    //       .margin([0, -3, 0, 0])
    //       .border([true, false, true, true])
    //       .end,
    //     new Cell(new Stack([pedidosFiltrados.solicitud]).fontSize(11).end)
    //       .margin([0, -3, 0, 0])
    //       .border([true, false, true, true])
    //       .end,
    //     // Aquí puedes mantener o modificar el valor del lugar, por ejemplo:
    //     new Cell(new Stack(['Planta San Joaquin']).fontSize(11).end)
    //       .margin([0, -3, 0, 0])
    //       .border([true, false, true, true])
    //       .end
    // ;

    let total = pedidosFiltrados.reduce((acumulador, pedido) => acumulador + Number(pedido.cantidad), 0);
    total = Number(total).toLocaleString('es-ES');

    let celdas: any = [];
    for (let i = 0; i < pedidosFiltrados.length; i++) {
      let l = pedidosFiltrados.length - 1;

      celdas.push([
        new Cell(new Txt(pedidosFiltrados[i].cantidadFormateada).fontSize(11).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? 'rgb(242, 242, 242)' : '#FFFFFF').end,
        new Cell(new Txt(pedidosFiltrados[i].solicitud).fontSize(11).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [false, false, true, false] : [false, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
        new Cell(new Txt('Planta San Joaquin').fontSize(11).end)
          .margin([0, 0, 0, 0])
          .border(i != l ? [true, false, true, false] : [true, false, true, true])
          .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
      ]);
    }
    pdf.add(
      new Table(celdas)
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['30%', '30%', '40%']).end,
    );

    // Agregamos la tabla al PDF
    // pdf.add(
    //   new Table(filasTabla)
    //     .layout({
    //       hLineWidth: (rowIndex, node, columnIndex) => 0.5,
    //       vLineWidth: (rowIndex, node, columnIndex) => 0.5,
    //       hLineColor: (rowIndex, node, columnIndex) => '#555',
    //       vLineColor: (rowIndex, node, columnIndex) => '#555'
    //     })
    //     .widths(['30%', '30%', '40%'])
    //     .heights(38)
    //     .end
    // );

    pdf.add(
      new Table([
        [new Cell(new Txt('TOTAL:').fontSize(5.7).end).border([true, false, true, false]).end],
        [new Cell(new Txt(total).bold().fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['28.9%']).end,
    );

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, false, false, false]).end]]).widths(['100%'])
        .end,
    );

    pdf.add(
      new Table([
        [
          new Cell(
            new Txt('SUSTRATO / MONTAJE / IMPRESIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end,
          )
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );

    console.log(orden.sustrato.sustrato.nombre);

    pdf.add(
      new Table([
        [
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(
            new Txt([
              { text: 'GRAMAJE(g/m', fontSize: 5.7 },
              { text: '²', font: 'Roboto', fontSize: 5.7 },
              { text: ')', fontSize: 5.7 },
            ]).end,
          ).border([true, false, true, false]).end,
          new Cell(new Txt('CALIBRE(µm):').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('TAMAÑO DEL PLIEGO (cm):').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt(orden.sustrato.sustrato.nombre).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(orden.sustrato.sustrato.gramaje).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(orden.sustrato.sustrato.calibre).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt('73 x 103').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['55%', '15%', '15%', '15%']).end,
    );

    let asignadas = orden.hojas + orden.demasia;
    let demasia_percent: any = (orden.demasia * 100) / asignadas;

    asignadas = Number(asignadas).toLocaleString('es-ES');
    let demasia = Number(orden.demasia).toFixed(2);
    demasia = Number(demasia).toLocaleString('es-ES');
    let pa_imprimir = Number(orden.hojas).toLocaleString('es-ES');

    demasia_percent = Number(demasia_percent.toFixed(2)).toLocaleString('es-ES');

    pdf.add(
      new Table([
        [
          new Cell(new Txt('TAMAÑO A IMPRIMIR (cm):').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('DIRECCIÓN DE FIBRA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(
            new Txt([
              { text: 'N', fontSize: 5.7 },
              { text: 'º', font: 'Roboto', fontSize: 5.7 },
              { text: ' EJEMPLARES', fontSize: 5.7 },
            ]).end,
          ).border([true, false, true, false]).end,
          new Cell(new Txt('HOJAS A ASIGNAR:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('HOJAS DE DEMASÍA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('HOJAS A IMPRIMIR:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('72 x 102').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt('102').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(orden.ejemplares).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
            .end,
          new Cell(new Txt(asignadas).fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
          new Cell(new Txt(`${demasia}(${demasia_percent}%)`).fontSize(11).end)
            .margin([0, -3, 0, 0])
            .border([true, false, true, true]).end,
          new Cell(new Txt(pa_imprimir).bold().fontSize(14).end).margin([0, -6, 0, 0]).border([true, false, true, true])
            .end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['16.8%', '16%', '16%', '20%', '15.7%', '15.6%']).end,
    );

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, false, false, false]).end]]).widths(['100%'])
        .end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('COLORES / TINTAS / BARNIZ').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('SEC:').fontSize(5.7).end).border([true, false, false, false]).end,
          new Cell(new Txt('COLORES:').fontSize(5.7).end).border([false, false, true, false]).end,
          new Cell(new Txt('CÓDIGO DE PELICULAS:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('TINTA:').fontSize(5.7).end).border([true, false, true, false]).end,
          new Cell(new Txt('CANTIDAD (Kg):').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['3%', '22%', '20%', '45%', '10%']).end,
    );

    let data: any = [];

    for (let i = 0; i < orden.producto[0].impresion.secuencia[0].length; i++) {
      console.log(orden.tinta[i].tinta);

      data.push({
        seq: i + 1,
        color: orden.producto[0].impresion.secuencia[0][i],
        tinta: `${orden.tinta[i].tinta.nombre} (${orden.tinta[i].tinta.fabricante.alias})`,
        cantidad: Number(orden.tinta[i].cantidad).toLocaleString('es-ES'),
      });
    }

    for (let i = 0; i < data.length; i++) {
      pdf.add(
        new Table([
          [
            new Cell(new Txt(data[i].seq).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([true, false, false, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
            new Cell(new Txt(data[i].color).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([false, false, true, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
            new Cell(new Txt(data.peliculas).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([true, false, true, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
            new Cell(new Txt(data[i].tinta).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([true, false, true, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
            new Cell(new Txt(data[i].cantidad).fontSize(11).end)
              .margin([0, 0, 0, 0])
              .border([true, false, true, false])
              .fillColor(i % 2 === 0 ? '#F2F2F2' : '#FFFFFF').end,
          ],
        ])
          .layout({
            hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
            vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
            hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
            vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          })
          .widths(['3%', '22%', '20%', '45%', '10%']).end,
      );
    }

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(1).end).border([false, true, false, false]).end]])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['100%']).end,
    );
    pdf.add(
      new Table([
        [
          new Cell(
            new Table([
              [
                new Cell(new Txt('BARNICES / PEGAMENTO').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
                  .border([false])
                  .fillColor('#a5acb2').end,
              ],
            ]).widths(['100%']).end,
          ).end,
          new Cell(
            new Table([
              [
                new Cell(new Txt('EMBALAJE').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
                  .border([false])
                  .fillColor('#a5acb2').end,
              ],
            ]).widths(['100%']).end,
          ).end,
        ],
        [
          new Cell(
            new Table([
              [
                new Cell(new Txt('BARNIZ ACUOSO / UV / ESPECIAL:').fontSize(5.7).end).border([true, false, true, false])
                  .end,
              ],
              [
                new Cell(new Txt(orden.barniz.barniz.nombre).fontSize(11).end)
                  .margin([0, -3, 0, 0])
                  .border([true, false, true, true]).end,
              ],
              [new Cell(new Txt('PEGAMENTO:').fontSize(5.7).end).border([true, false, true, false]).end],
              [
                new Cell(new Txt(orden.pega.pega.nombre).fontSize(11).end)
                  .margin([0, -3, 0, 0])
                  .border([true, false, true, true]).end,
              ],
            ])
              .margin([0, -4])
              .layout({
                hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              })
              .widths(['100%']).end,
          ).end,
          new Cell(
            new Table([
              [
                new Cell(new Txt('CÓDIGO DE CAJA:').fontSize(5.7).end).border([true, false, true, false]).end,
                new Cell(new Txt('CANT. NECESARIA:').fontSize(5.7).end).border([true, false, true, false]).end,
                new Cell(new Txt('UNID. POR CAJA:').fontSize(5.7).end).border([true, false, true, false]).end,
                new Cell(new Txt('CINTA EMB. (m):').fontSize(5.7).end).border([true, false, true, false]).end,
              ],
              [
                new Cell(
                  new Txt([
                    { text: 'Caja N', fontSize: 11 },
                    { text: 'º', font: 'Roboto', fontSize: 11 },
                    { text: ' 11', fontSize: 11 },
                  ]).end,
                )
                  .margin([0, -3, 0, 0])
                  .border([true, false, true, true]).end,
                new Cell(new Txt('154').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
                new Cell(new Txt('136.000').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
                  .end,
                new Cell(new Txt('1.560,25').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true])
                  .end,
              ],
            ])
              .layout({
                hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
                hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
                vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
              })
              .widths(['25%', '25%', '25%', '25%']).end,
          )
            .margin([0, -4])
            .border([false]).end,
        ],
      ])
        .layout('noBorders')
        .widths(['50%', '50%']).end,
    );

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(3).end).border([false, false, false, false]).end]])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['100%']).end,
    );

    pdf.add(
      new Table([
        [
          new Cell(new Txt('PLANIFICACIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end)
            .border([false])
            .fillColor('#a5acb2').end,
        ],
      ]).widths(['100%']).end,
    );

    // Se arma la tabla con 3 filas: superior, canvas y fechas.
    // Se define un layout personalizado sin padding para evitar desajustes.
    pdf.add({
      table: {
        widths: Array(stepsCount).fill(columnWidth),
        body: [topRow, canvasRow, bottomRow],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
    });

    pdf.add(
      new Table([[new Cell(new Txt(' ').fontSize(3).end).border([false, false, false, false]).end]])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['100%']).end,
    );

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
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('NOMBRE:').fontSize(5.7).end).border([true, false, true, false]).end,
        ],
        [
          new Cell(new Txt('').fontSize(11).end).border([true, false, true, false]).end,
          new Cell(new Txt('').fontSize(11).end).border([false]).end,
          new Cell(new Txt('Andrés Calcurian:').fontSize(11).end)
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
          new Cell(new Txt('18/03/2025').fontSize(11).end).margin([0, -3, 0, 0]).border([true, false, true, true]).end,
        ],
      ])
        .layout({
          hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
          hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
          vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#555',
        })
        .widths(['69%', '1%', '30%']).end,
    );

    // pdf.add(
    //   new Table([
    //     [
    //       new Cell(new Txt('POST-IMPRESIÓN').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end,
    //       new Cell(new Txt('').end).border([false]).end,
    //       new Cell(new Txt('BARNICES / PEGAMENTO').alignment('center').bold().fontSize(9).color('#FFFFFF').end).border([false]).fillColor('#a5acb2').end
    //     ],
    //   ]).widths(['54%','1%','45%']).end
    // )

    // pdf.add(
    //   new Table([
    //     [
    //       new Cell(new Txt('FASE:').fontSize(5.7).end).border([true,false,true,false]).end,
    //       new Cell(new Txt('MÁQUINA:').fontSize(5.7).end).border([true,false,true,false]).end,
    //       new Cell(new Txt('').fontSize(5.7).end).border([false]).end,
    //       new Cell(new Txt('BARNIZ ACUOSO / UV / ESPECIAL:').fontSize(5.7).end).border([true,false,true,false]).end,
    //     ],
    //   ]).widths(['26.5%','26.5%','1.3%','45.7%']).end
    // )
    // pdf.add(
    //   new Table([
    //     [
    //       new Cell(new Txt('FASE:').fontSize(11).end).border([true,false,true,false]).end,
    //       new Cell(new Txt('MÁQUINA:').fontSize(11).end).border([true,false,true,false]).end,
    //       new Cell(new Txt('').fontSize(11).end).border([false]).end,
    //       new Cell(new Txt('BARNIZ ACUOSO / UV / ESPECIAL:').fontSize(11).end).border([true,false,true,false]).end,
    //     ],
    //   ]).widths(['26.5%','26.5%','1.3%','45.7%']).end
    // )

    pdf.create().download();
  };

  // Función para alternar la visibilidad
  toggleVisibility(index_fase: number, index_gestion: number) {
    this.visibilityFlags[index_fase][index_gestion] = !this.visibilityFlags[index_fase][index_gestion];
  }

  constructor(
    public api: OproduccionService,
    public clientes: ClientesService,
    public productos: ProductosService,
    public devolucionesService: DevolucionesService,
    public solicitudesServices: SolicitudesService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    public oc: OcompraService,
  ) {
    this.anoActual = new Date().getFullYear();
  }

  subOrdenes() {
    // 1. Corrección del .find(): debe ser una función flecha
    const orden_actual = this.oc.orden.find((o) => o.orden === this.selectedPo);

    // 2. Validación de seguridad: ¿Existe la orden y el índice?
    if (orden_actual && orden_actual.pedido && orden_actual.pedido[this.orden_selected_index]) {
      console.log(orden_actual.pedido[this.orden_selected_index]);

      // Retornamos el array de pedidos interno
      return orden_actual.pedido[this.orden_selected_index].derivadas;
    }

    // Si no encuentra nada, retorna un array vacío para no romper el HTML
    return [];
  }

  orden_selected_index = 0;
  ordenesdeCompra(producto) {
    console.log(this.oc.orden);
    return this.oc.orden
      .filter((o) => o.pedido && o.pedido.some((p) => p.producto?._id === producto))
      .map((o) => {
        // Agregamos una propiedad temporal con el índice para usarla en el HTML
        const index = o.pedido.findIndex((p) => p.producto?._id === producto);
        this.orden_selected_index = index;
        return { ...o, indiceEncontrado: index };
      });
  }

  buscarSiExisteDefecto(defectos: any, index: any) {
    let defecto = defectos.find((x) => x.paleta === index);
    if (defecto) {
      return {
        existe: true,
        defectos: defecto.defectos,
      };
    } else {
      return {
        existe: false,
      };
    }
  }

  formatearHora(fecha24Horas: string) {
    // Separa las horas y los minutos
    const [hora, minutos] = fecha24Horas.split(':').map(Number);

    // Determina si es AM o PM
    const sufijo = hora >= 12 ? 'p. m.' : 'a. m.';

    // Convierte las horas al formato de 12 horas
    const hora12 = hora % 12 || 12;

    // Asegúrate de que los minutos siempre tengan dos dígitos
    const minutosFormateados = minutos < 10 ? '0' + minutos : minutos.toString();

    // Retorna la hora en formato de 12 horas
    return `${hora12}:${minutosFormateados} ${sufijo}`;
  }

  cerrar_nueva_gestion() {
    setTimeout(() => {
      this.progress();
    }, 1000);
    this.gestiones = true;
    this.nueva_gestion = false;
  }

  togglePaletteList(index_fase, gestion): void {
    this.palete_selected[index_fase][gestion] = !this.palete_selected[index_fase][gestion];
    this.showPaletteList = !this.showPaletteList;
  }

  Gestiones(orden: any) {
    this.gestiones = true;
    this.orden_selected = JSON.parse(JSON.stringify(orden));
    this.progress();
  }

  showTeam(i, j) {
    if (!this.team_selected[i][j]) {
      this.team_selected[i][j] = true;
    } else {
      this.team_selected[i][j] = false;
    }
  }

  progress() {
    this.loading = true;

    for (let i = 0; i < this.orden_selected.fases.length; i++) {
      if (!this.totales[i]) {
        this.totales[i] = {
          hojas: 0,
          horas: 0,
          paletas: 0,
          tickets: 0,
        };
      }

      this.totales[i] = {
        hojas: 0,
        horas: 0,
        paletas: 0,
        tickets: 0,
      };

      this.visibilityFlags[i] = [];
      this.current[i] = 0;
      this.progressPercentage[i] = 0; // 💡 Inicia en 0 para la animación

      if (i === 0) {
        this.target[i] = this.orden_selected.cantidad;
      } else {
        this.target[i] = this.current[i - 1];
      }

      for (let j = 0; j < this.api.GestionesDeFase(this.orden_selected, i).length; j++) {
        if (!this.palete_selected[i]) this.palete_selected[i] = [];
        if (!this.team_selected[i]) this.team_selected[i] = [];
        if (!this.palete_selected[i][j]) this.palete_selected[i][j] = false;
        if (!this.team_selected[i][j]) this.team_selected[i][j] = false;

        this.visibilityFlags[i][j] = true;

        let gestion_ = this.api.GestionesDeFase(this.orden_selected, i)[j];
        this.current[i] += Number(gestion_.productos);

        // Opción nativa: Creamos objetos Date y les asignamos la hora del string "HH:mm"
        const [hInicio, mInicio] = gestion_.inicio.split(':');
        const inicio: any = new Date();
        inicio.setHours(hInicio, mInicio, 0, 0);

        const [hFin, mFin] = gestion_.fin.split(':');
        const fin: any = new Date();
        fin.setHours(hFin, mFin, 0, 0);

        let diffMs = fin - inicio;

        // Si el resultado es negativo, significa que el fin es el día siguiente
        if (diffMs < 0) {
          diffMs += 24 * 60 * 60 * 1000; // Sumamos 24 horas en milisegundos
        }

        const horas = diffMs / 3600000;

        this.totales[i].hojas += gestion_.hojas;
        this.totales[i].horas += Number(horas);
        this.totales[i].paletas += gestion_.paletas;
        this.totales[i].tickets += gestion_.defectos.length - 1;
      }

      // 💡 Efecto de llenado progresivo
      const finalProgress = (this.current[i] * 100) / this.target[i]; // Valor objetivo
      let incremento = 0; // Inicia en 0

      const interval = setInterval(() => {
        if (incremento < finalProgress) {
          incremento += 2; // Puedes ajustar la velocidad de llenado
          this.progressPercentage[i] = incremento;
        } else {
          this.progressPercentage[i] = finalProgress; // Asegurar que llegue al valor exacto
          clearInterval(interval);
        }
      }, 15); // Ajusta la velocidad de la animación (más bajo = más rápido)

      if (i === this.orden_selected.fases.length - 1) {
        this.loading = false;
      }
    }
  }

  filtrarResultados(valor: any) {
    this.resultados = this.api.orden.filter((item) => item.numero_op.includes(valor.value));
  }

  filtrarResultadosOC(valor: any) {
    this.resultados = this.api.orden.filter((item) => item.oc.orden.includes(valor.value));
  }

  filtrarResultadosCliente(valor: any) {
    this.resultados = this.api.orden.filter((item) => item.cliente._id.includes(valor.value));
  }

  filtrarResultadosProducto(valor: any) {
    this.resultados = this.api.orden.filter((item) => item.producto[0]._id.includes(valor.value));
  }

  BuscarPorFecha() {
    const desde_ = new Date(this.desde);
    const hasta_ = new Date(this.hasta);

    this.resultados = this.api.orden.filter((item) => {
      const fechaItem = new Date(item.createdAt);
      return fechaItem >= desde_ && fechaItem <= hasta_;
    });
  }

  BuscarProductos(event: any) {
    this.productos_selected = this.productos.buscarPorClientes(event.value);
  }
}
