import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import * as moment from 'moment';
import { Cell, Columns, Img, Ol, PdfMakeWrapper, Stack, Table, Txt, Ul } from 'pdfmake-wrapper';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { LoginService } from 'src/app/services/login.service';
import { OpoligraficaService } from 'src/app/services/opoligrafica.service';
import pdffonts from '../../../assets/fonts/custom';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ordenes',
  standalone: false,
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.scss'],
  providers: [DecimalPipe],
})
export class OrdenesComponent {
  public mesActual;
  public yearActual;
  constructor(
    public api: OpoligraficaService,
    public login: LoginService,
    public decimalPipe: DecimalPipe,
  ) {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const fechaActual = new Date();
    this.mesActual = meses[fechaActual.getMonth()];
    this.yearActual = new Date().getFullYear();
  }

  public nueva = false;
  public Orden = {
    proveedor: '',
    fabricante: '',
    iva: 16,
    pedido: [],
    pago: 'Contado',
    entrega: '',
    descripcion: 'Esta orden será cancelada en bolívares según tasa BCV del día de la emisión del pago.',
    alto: '',
    ancho: '',
    gramaje: '',
    calibre: '',
  };

  public filtrados: any = [];
  public searchTerm: any;
  public filterMode: string = 'home';
  public ordenExpandida: boolean[] = [];
  public cargando = false;

  get ordenesCerradas(): number {
    return this.api.orden?.filter((o) => o.estado === 'cerrada').length || 0;
  }

  get proveedoresUnicas(): string[] {
    if (!this.api.orden) return [];
    return [...new Set(this.api.orden.map((o) => o.proveedor?.nombre).filter(Boolean))] as string[];
  }

  get fabricantesUnicas(): string[] {
    if (!this.api.orden) return [];
    const nombres = new Set<string>();
    this.api.orden.forEach((o) => {
      if (!o.pedido) return;
      o.pedido.forEach((p: any) => {
        const alias = p.material?.fabricante?.alias || p.material?.fabricante?.nombre;
        if (alias) nombres.add(alias);
      });
    });
    return [...nombres];
  }

  get ordenesVisibles(): any[] {
    if (this.filtrados.length > 0) return this.filtrados;
    return this.api.orden || [];
  }

  setFilter(mode: string) {
    this.filterMode = mode;
    this.filtrados = [];
    this.searchTerm = '';
  }

  toggleOrder(n: number) {
    this.ordenExpandida[n] = !this.ordenExpandida[n];
  }

  formatear_cifras(valor: number) {
    return this.decimalPipe.transform(valor, '1.0-2');
  }

  buscarPorFecha(desde: string, hasta: string) {
    const inicio = new Date(desde + 'T00:00:00');
    const fin = new Date(hasta + 'T23:59:59');

    this.filtrados = this.api.orden.filter((orden) => {
      const fechaOrden = new Date(orden.createdAt);
      return fechaOrden >= inicio && fechaOrden <= fin;
    });
  }

  buscarPorFecha_cliente(desde, hasta) {
    const OrdenesPorClientes = {};
    const filtracion = this.api.orden.filter((orden) => {
      const fechaOrden = new Date(orden.recepcion);
      return fechaOrden >= new Date(desde) && fechaOrden <= new Date(hasta);
    });
    filtracion.forEach((orden) => {
      const { cliente } = orden;
      if (!OrdenesPorClientes[cliente.nombre]) {
        OrdenesPorClientes[cliente.nombre] = [];
      }
      OrdenesPorClientes[cliente.nombre].push(orden);
    });
    this.PorClientes = Object.entries(OrdenesPorClientes);
  }

  search() {
    const cleanedSearchTerm = this.searchTerm.replace(/-/g, '');
    this.filtrados = this.api.orden.filter((orden) => orden.numero.toString().includes(cleanedSearchTerm));
  }

  filtrarPorProveedor(target) {
    const valor = target.value;
    if (!valor) {
      this.filtrados = [];
      return;
    }
    this.filtrados = this.api.orden.filter((orden) => orden.proveedor?.nombre === valor);
  }

  filtrarPorFabricante(target) {
    const valor = target.value;
    if (!valor) {
      this.filtrados = [];
      return;
    }
    this.filtrados = this.api.orden.filter((orden) => {
      if (!orden.pedido) return false;
      return orden.pedido.some(
        (p: any) =>
          (p.material?.fabricante?.alias || p.material?.fabricante?.nombre) === valor,
      );
    });
  }

  public PorClientes: any = [];

  cerrar() {
    this.Orden = {
      proveedor: '',
      fabricante: '',
      iva: 16,
      pedido: [],
      pago: 'Contado',
      entrega: '',
      descripcion: 'Esta orden será cancelada en bolívares según tasa BCV del día de la emisión del pago.',
      alto: '',
      ancho: '',
      gramaje: '',
      calibre: '',
    };
    this.nueva = false;
  }

  addSlice(n: number) {
    const numberToString = n.toString();
    return `${numberToString.slice(0, 2)}-${numberToString.slice(2)}`;
  }

  calcularTotalIva(orden) {
    return orden.pedido.reduce((total, material) => {
      return total + (orden.iva / 100) * material.precio * material.cantidad;
    }, 0);
  }

  calcularTotalNeto(orden) {
    return orden.pedido.reduce((total, material) => {
      return total + material.precio * material.cantidad;
    }, 0);
  }

  reset() {
    this.Orden = {
      proveedor: '',
      fabricante: '',
      iva: 16,
      pedido: [],
      pago: 'Contado',
      entrega: '',
      descripcion: 'Esta orden será cancelada en bolívares según tasa BCV del día de la emisión del pago.',
      alto: '',
      ancho: '',
      gramaje: '',
      calibre: '',
    };
  }

  /* ═══════════════════════════════════════════════════════════════
     🔒 DescargarPDF original (FRP-007) — comentado el 09/06/2026
     ═══════════════════════════════════════════════════════════════
  DescargarPDF(orden) {
    const materiales = [orden].map((orden) => orden.pedido.map((item) => item.material.nombre));
    const cantidades = [orden].map((orden) => orden.pedido.map((item) => item.cantidad));
    const modelos = [orden].map((orden) => orden.pedido.map((item) => item.material.modelo));
    const cantidades_ = [orden].map((orden) =>
      orden.pedido.map((item, index) => `${item.cantidad}${orden.pedido[index].unidad}`),
    );
    const precios = [orden].map((orden) => orden.pedido.map((item) => item.precio));

    const ivas = cantidades[0].map((cantidad, i) => {
      const ivaCalculado = ((orden.iva / 100) * precios[0][i] * cantidad).toFixed(2);
      return parseFloat(ivaCalculado);
    });

    const netos = cantidades[0].map((cantidad, i) => {
      const neto = (precios[0][i] * cantidad).toFixed(2);
      return parseFloat(neto);
    });

    let SumaNetos: any = netos.reduce((total, neto) => total + neto, 0);
    SumaNetos = SumaNetos.toFixed(2);
    SumaNetos = SumaNetos.toString();

    let sumaIvas: any = ivas.reduce((total, iva) => total + iva, 0);
    sumaIvas = sumaIvas.toFixed(2);
    sumaIvas = sumaIvas.toString();

    const N_orden = this.addSlice(orden.numero);
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const hoy = `${day}/${month}/${year}`;
    const entrega = moment(orden.entrega).format('DD/MM/YYYY');
    const usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;

    let TotalNeto = (Number(SumaNetos) + Number(sumaIvas)).toFixed(2);
    TotalNeto = TotalNeto.toString();

    async function generarOrden() {
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('portrait');
      pdf.pageSize('A4');


      pdf.add(
        new Table([
         [
            new Cell(await new Img('../../../assets/poli_cintillo.png').width(90).build())
              .alignment('left').end,
            new Cell(
              new Txt(`ORDEN DE COMPRA
                        PURCHASE ORDER`).alignment('right').end
            ).end
         ]
        ]).widths(['50%','50%']).end
      )

      pdf.add(
          new Table([
         [
            new Cell(
              new Txt('Calle Pantin Galpon N29, Urb, Chacao, Edo Mirandda, Venezuela').end
            ).alignment('left').end,
            new Cell(
              new Txt(`OCP-2600028`).alignment('right').end
            ).end
         ]
        ]).widths(['44%','56%']).end
      )

      pdf.add('\n')

      pdf.add(
      new Table([
         [
            new Cell(
              new Txt('Calle Pantin Galpon N29, Urb, Chacao, Edo Mirandda, Venezuela').end
            ).alignment('left').end,
            new Cell(
              new Txt(`OCP-2600028`).alignment('right').end
            ).end
         ]
        ]).widths(['44%','56%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10, 0, 0]).build())
              .alignment('center')
              .rowSpan(4).end,
            new Cell(
              new Txt(`
            ORDEN DE COMPRA
            `).bold().end,
            )
              .alignment('center')
              .margin([0, 10, 0, 0])
              .fontSize(13)
              .rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 2 de 2').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%', '50%', '25%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt('ORDEN DE COMPRA').bold().end)
              .colSpan(2)
              .alignment('center')
              .fillColor('#000000')
              .color('#FFFFFF')
              .border([false]).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt('Nº').bold().end).alignment('center').fillColor('#C9C9C9').end,
            new Cell(new Txt(N_orden).bold().end).alignment('center').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt('FECHA EMISIÓN').bold().end).alignment('center').fillColor('#C9C9C9').end,
            new Cell(new Txt(hoy).end).alignment('center').end,
          ],
        ]).widths(['60%', '20%', '20%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('INFORMACIÓN DEL PROVEEDOR').bold().end)
              .colSpan(2)
              .alignment('center')
              .fillColor('#000000')
              .color('#FFFFFF').end,
            new Cell(new Txt(' ').end).end,
          ],
          [
            new Cell(new Txt('RAZÓN SOCIAL:').bold().end).fontSize(10).fillColor('#C9C9C9').end,
            new Cell(new Txt(orden.proveedor.nombre).end).fontSize(10).end,
          ],
          [
            new Cell(new Txt('R.I.F:').bold().end).fontSize(10).fillColor('#C9C9C9').end,
            new Cell(new Txt(orden.proveedor.rif).end).fontSize(10).end,
          ],
          [
            new Cell(new Txt('DIRECCIÓN:').bold().end).fontSize(10).fillColor('#C9C9C9').end,
            new Cell(new Txt(orden.proveedor.direccion).end).fontSize(10).end,
          ],
          [
            new Cell(new Txt('TELEFONO:').bold().end).fontSize(10).fillColor('#C9C9C9').end,
            new Cell(
              new Txt(`${orden.proveedor.contactos[0].numero} - ${orden.proveedor.contactos[0].nombre}`).end,
            ).fontSize(10).end,
          ],
        ]).widths(['15%', '85%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('INFORMACIÓN DE LA COMPRA').bold().end)
              .colSpan(6)
              .alignment('center')
              .fillColor('#000000')
              .color('#FFFFFF').end,
            new Cell(new Txt(' ').end).end,
            new Cell(new Txt(' ').end).end,
            new Cell(new Txt(' ').end).end,
            new Cell(new Txt(' ').end).end,
            new Cell(new Txt(' ').end).end,
          ],
          [
            new Cell(new Txt('Código').bold().end).fillColor('#c9c9c9').fontSize(10).alignment('center').end,
            new Cell(new Txt('Descripción').bold().end).fillColor('#c9c9c9').fontSize(10).alignment('center').end,
            new Cell(new Txt('Cantidad').bold().end).fillColor('#c9c9c9').fontSize(10).alignment('center').end,
            new Cell(new Txt('Costo Unit. (USD)').bold().end).fillColor('#c9c9c9').fontSize(10).alignment('center').end,
            new Cell(new Txt('Base Imp. (USD)').bold().end)
              .colSpan(2)
              .fillColor('#c9c9c9')
              .fontSize(10)
              .alignment('center').end,
            new Cell(new Txt('I.V.A (16%)').bold().end).fillColor('#c9c9c9').fontSize(10).alignment('center').end,
          ],
          [
            new Cell(new Stack(modelos).end).fontSize(10).alignment('center').end,
            new Cell(new Stack(materiales[0]).end).fontSize(10).alignment('center').end,
            new Cell(new Stack(cantidades_[0]).end).fontSize(10).alignment('center').end,
            new Cell(new Stack(precios[0]).end).fontSize(10).alignment('center').end,
            new Cell(new Stack(netos).end).colSpan(2).fontSize(10).alignment('center').end,
            new Cell(new Stack(ivas).end).fontSize(10).alignment('center').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt('Sub-Total').bold().end).fillColor('#c9c9c9').fontSize(10).alignment('center').end,
            new Cell(new Txt(SumaNetos).end).colSpan(2).fontSize(10).alignment('center').end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt('I.V.A.:').bold().end).fillColor('#c9c9c9').fontSize(10).alignment('center').end,
            new Cell(new Txt(sumaIvas).end).colSpan(2).fontSize(10).alignment('center').end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt('Total:').bold().end).fillColor('#c9c9c9').fontSize(10).alignment('center').end,
            new Cell(new Txt(TotalNeto).bold().end).colSpan(2).fontSize(10).alignment('center').end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
        ]).widths(['15%', '37%', '12%', '18%', '18%', '1%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('OBSERVACIONES').bold().end)
              .alignment('center')
              .fillColor('#000000')
              .color('#FFFFFF')
              .border([false]).end,
          ],
          [new Cell(new Txt(orden.descripcion).end).fontSize(8).end],
        ]).widths(['100%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('CONDICIONES DE PAGO').bold().end)
              .colSpan(2)
              .alignment('center')
              .fillColor('#000000')
              .color('#FFFFFF').end,
            new Cell(new Txt(' ').end).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt('ELABORADO POR').bold().end)
              .colSpan(2)
              .alignment('center')
              .fillColor('#000000')
              .color('#FFFFFF').end,
            new Cell(new Txt(' ').end).end,
          ],
          [
            new Cell(new Txt('Fecha Entrega:').bold().end).fillColor('#c9c9c9').fontSize(8).alignment('center').end,
            new Cell(new Txt(entrega).bold().end).fontSize(8).alignment('center').end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt('Nombre:').bold().end).fillColor('#c9c9c9').fontSize(8).alignment('center').end,
            new Cell(new Txt(usuario).bold().end).fontSize(8).alignment('center').end,
          ],
          [
            new Cell(new Txt('Condic. Pago:').bold().end).fillColor('#c9c9c9').fontSize(8).alignment('center').end,
            new Cell(new Txt('Contado').bold().end).fontSize(8).alignment('center').end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt('Firma:').bold().end).fillColor('#c9c9c9').fontSize(8).alignment('center').end,
            new Cell(new Txt(firmaTexto).bold().end).fontSize(7).alignment('center').end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt(' ').end).border([false]).end,
            new Cell(new Txt('Fecha:').bold().end).fillColor('#c9c9c9').fontSize(8).alignment('center').end,
            new Cell(new Txt(hoy).bold().end).fontSize(8).alignment('center').end,
          ],
        ]).widths(['14.95%', '14.95%', '0.1%', '40%', '0.1%', '10.95%', '18.95%']).end,
      );
      pdf.create().download();
    }
    generarOrden();
  }
  ═══════════════════════════════════════════════════════════════ */

  // ✅ Nuevo DescargarPDF — formato FCP-001 exacto (09/06/2026) + protección contra edición
  DescargarPDF(orden) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hoy = `${day}/${month}/${year}`;
    const horas = String(today.getHours()).padStart(2, '0');
    const minutos = String(today.getMinutes()).padStart(2, '0');
    const segundos = String(today.getSeconds()).padStart(2, '0');
    const ahora = `${hoy} ${horas}:${minutos}:${segundos}`;
    const entrega = orden.entrega ? moment(orden.entrega).format('DD/MM/YYYY') : '';
    const usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;
    const firmaTexto = `${usuario} - ${ahora}`;
    const fmt = (n) => this.decimalPipe.transform(n || 0, '1.2-2', 'es') ?? '0,00';

    async function generarOrden() {
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdffonts, {
      Gilroy: {
        normal: 'Gilroy-Light.otf',
        bold: 'Gilroy-ExtraBold.otf',
        italics: 'Gilroy-ExtraBold.otf',
        bolditalics: 'Gilroy-ExtraBold.otf',
      }
    });

    PdfMakeWrapper.useFont('Gilroy');
      pdf.defaultStyle({ font: 'Gilroy' });
      pdf.pageOrientation('portrait');
      pdf.pageSize('LETTER');
      pdf.pageMargins([22, 18, 22, 50]);

      const logo = await new Img('../../../assets/poli_cintillo.png').width(120).build();

      // ═══════════ 1. ENCABEZADO SUPERIOR ═══════════
      pdf.add(
        new Table([
          [
            new Cell(logo).border([false]).alignment('left').end,
            new Cell(
              new Stack([
                new Txt(' ').fontSize(4).end,
                new Txt('ORDEN DE COMPRA').fontSize(25).bold().color('#83929B').alignment('right').margin([0,0,0,0]).end,
                new Txt('PURCHASE ORDER').fontSize(20).color('#83929B').alignment('right').end,
              ]).end,
            ).border([false]).alignment('right').end,
          ],
        ]).widths(['50%', '50%']).end,
      );

      pdf.add(
        new Table([
          [
            new Cell(
              new Txt('Calle Pantín, Galpón N°29, Urb. Chacao,\nEdo. Miranda. Venezuela.').fontSize(9).end
            ).border([false, true, false, false]).alignment('left').end,
            new Cell(
              new Txt(`OCP-${orden.numero}`).fontSize(30).bold().color('white').end,
            ).border([false, true, false, false]).fillColor('#83929B').alignment('center').end,
          ],
        ]).layout({
            hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 2,
            vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 2,
            hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#83929B',
            vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#83929B',
          })
.widths(['60%', '40%']).end,
      );

      pdf.add(new Txt(' ').fontSize(4).end);
      pdf.add('\n')
      pdf.add('\n')
      // ═══════════ 2. PROVEEDOR / CONDICIONES ═══════════
      pdf.add(
        new Table([
          [
            new Cell(
              new Txt([{ text: 'PROVEEDOR', fontSize: 10, bold:true },
                      { text: ' SUPPLIER', bold: false, fontSize: 10 }]).alignment('left').color('white').end,
            ).fillColor('#9db0ba').margin([10,0,0,0]).end,
            new Cell(new Txt('').end).end,
            new Cell(
              new Txt([
                {text:'CONDICIONES', fontSize: 10, bold:true},
                {text:' TERMS', fontSize:10, bold:false}
              ]).bold().fontSize(10).color('white').margin([0,0,10,0]).end,
            ).fillColor('#9db0ba').alignment('right').end,
          ],
          [
            new Cell(
              new Stack([
                new Txt(orden.proveedor?.nombre || '').bold().fontSize(10).end,
                new Txt(orden.proveedor?.direccion || '').fontSize(10).end,
                new Txt(`RIF: ${orden.proveedor?.rif || ''}`).fontSize(10).end,
                new Txt(`
                Atención Sr (a):
                ${orden.proveedor?.contactos?.[0]?.nombre || ''}`).fontSize(10).end,
                new Txt(
                  orden.proveedor?.contactos?.[0]?.email ||
                  orden.proveedor?.contactos?.[0]?.numero || ''
                ).fontSize(10).color('#0066CC').end,
              ]).end,
            ).fontSize(9).end,
            new Cell(new Txt('').end).end,
            new Cell(
              new Stack([
                new Txt(`Fecha de entrega / Shipping date:`).alignment('right').fontSize(10).end,
                new Txt(entrega).fontSize(10).bold().alignment('right').end,
                new Txt(`
                Lugar de entrega / Delivery location:\n Poligráfica Industrial, C.A.\n Calle Pantín, Galpón N°29 Urb. Chacao,\n Edo. Miranda. Venezuela.`).alignment('right').fontSize(8).end,
                new Txt(`
                Comprador / Purchaser:\n ${usuario}`).fontSize(10).end,
              ]).end,
            ).fontSize(0).alignment('right').end,
          ],
        ]).layout('noBorders').widths(['40%', '20%', '40%']).end,
      );

      pdf.add(new Txt(' ').fontSize(4).end);

      // ═══════════ 3. TABLA PRINCIPAL DE ÍTEMES ═══════════
 const hCell = (txt, marginTop = 0) =>
  new Cell(
    new Txt(txt)
      .bold()
      .fontSize(9)
      .color('white')
      .alignment('center')
      .margin([0, marginTop, 0, 0])
      .end
  ).fillColor('#9db0ba').alignment('center').end;

const itemsBody = [
  [
    hCell('POS.', 6),
    hCell([
      {text:'CANTIDAD', bold:true},
      {text:'\nQTY.', bold:false}
    ]),
    hCell('DESCRIPCIÓN', 6),
    hCell([
      {text:'MON.'},
      {text:'\nCCY', bold:false}
    ]),
    hCell([
      {text:'PRECIO UNITARIO.'},
      {text:'\nUNIT PRICE', bold:false}
    ]),
    hCell('TOTAL', 6)
  ],
];

      orden.pedido.forEach((item, index) => {
        const cantidad = `${item.cantidad} ${item.unidad || ''}`;
        const precio = parseFloat(item.precio) || 0;
        const total = precio * (parseFloat(item.cantidad) || 0);

        const descLines: any[] = [
          new Txt(item.material?.nombre || '').bold().fontSize(10).end,
          new Txt(`Cal. ${item.calibre || item.material?.calibre || item.material?.color || ''} / ${item.gramaje || ''} g/m2`).fontSize(10).end,
        ];

        if (item.ancho && item.alto) {
          descLines.push(new Txt(`Medidas: ${item.ancho} x ${item.alto} cm`).fontSize(10).end);
        } else if (item.ancho) {
          descLines.push(new Txt(`Medidas: ${item.ancho} cm`).fontSize(10).end);
        } else if (item.alto) {
          descLines.push(new Txt(`Medidas: ${item.alto} cm`).fontSize(10).end);
        }

        descLines.push(new Txt('Persentación:').fontSize(10).end);
        descLines.push(new Txt(item.bobina ? 'Bobinas / Rolls' : 'Paletas / Skids').fontSize(10).end);

        itemsBody.push([
          new Cell(new Txt((index + 1).toString()).fontSize(10).end).alignment('center').end,
          new Cell(new Txt(cantidad).fontSize(10).end).alignment('center').end,
          new Cell(new Stack(descLines).end).fontSize(10).end,
          new Cell(new Txt('USD').fontSize(10).end).alignment('center').end,
          new Cell(new Txt(fmt(precio)).fontSize(10).end).alignment('right').end,
          new Cell(new Txt(fmt(total)).fontSize(10).end).alignment('right').end,
        ]);
      });

      pdf.add(
        new Table(itemsBody)
          .widths(['5%', '10%', '43%', '6%', '20%', '16%'])
          .layout({
            hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 4,
            vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 4,
            hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#fff',
            vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#fff',
          })
          .fontSize(10).end,
      );

      // ═══════════ 4. TOTALES ═══════════
      const netos = orden.pedido.reduce(
        (sum, item) => sum + (parseFloat(item.precio) || 0) * (parseFloat(item.cantidad) || 0),
        0,
      );
      const ivaTotal = netos * ((orden.iva || 0) / 100);
      const flete = 0;
      const netoTotal = netos + ivaTotal + flete;

      pdf.add(new Txt(' ').fontSize(6).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Subtotal:').bold().fontSize(10).end).border([false, true, false, false]).alignment('right').end,
            new Cell(new Txt(fmt(netos)).bold().fontSize(10).end).border([false, true, false, false]).alignment('right').end,
          ],
          [
            new Cell(new Txt('Impuesto / Taxes:').fontSize(10).end).border([false]).alignment('right').end,
            new Cell(new Txt(fmt(ivaTotal)).fontSize(10).end).border([false]).alignment('right').end,
          ],
          [
            new Cell(new Txt('Flete / freight:').fontSize(10).end).border([false]).alignment('right').end,
            new Cell(new Txt(fmt(flete)).fontSize(10).end).border([false]).alignment('right').end,
          ],
          [
            new Cell(new Txt('Total:').bold().fontSize(10).end).border([false, true, false, false]).alignment('right').end,
            new Cell(new Txt(fmt(netoTotal)).bold().fontSize(10).end).border([false, true, false, false]).alignment('right').end,
          ],
        ]).layout({
            hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 2,
            vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 2,
            hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#90b0ba',
            vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#9db0ba',
          }).widths(['75%', '25%']).end,
      );

      // ═══════════ 5. FOOTER ═══════════
      pdf.add(new Txt(' ').fontSize(4).end);
      pdf.footer((currentPage, pageCount) => {
      return new Table([
        [
          new Cell(new Txt('').end).border([false, false, false, true]).end,
          new Cell(new Txt(`Página ${currentPage} / ${pageCount}`).fontSize(7).end)
            .border([false, false, false, true]).alignment('right').end,
        ],
        [
          new Cell(new Txt('').end).border([false]).end,
          new Cell(new Txt('FCP-001').fontSize(7).end)
            .border([false]).bold().alignment('right').end,
        ],
        [
          new Cell(new Txt(`Descargado por: ${firmaTexto}`).fontSize(6).color('#999999').end)
            .border([false]).alignment('left').end,
          new Cell(new Txt(`N° de Revisión: 1 / Fecha: 03/05/2026`).fontSize(7).end)
            .border([false]).alignment('right').end,
        ],
      ]).layout({
            hLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
            vLineWidth: (rowIndex?: number, node?: any, columnIndex?: number) => 0.5,
            hLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#cccccc',
            vLineColor: (rowIndex?: number, node?: any, columnIndex?: number) => '#cccccc',
          }).widths(['50%', '50%']).margin([30,0,30,0]).end;
});
      pdf.permissions('SioDoc2026', {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
      });
      pdf.create().download(`OCP-${orden.numero}.pdf`);
    }
    generarOrden();
  }
}
