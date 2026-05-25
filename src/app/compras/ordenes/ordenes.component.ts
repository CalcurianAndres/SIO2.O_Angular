import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import * as moment from 'moment';
import { Cell, Columns, Img, Ol, PdfMakeWrapper, Stack, Table, Txt, Ul } from 'pdfmake-wrapper';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { LoginService } from 'src/app/services/login.service';
import { OpoligraficaService } from 'src/app/services/opoligrafica.service';

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
            new Cell(new Txt('').bold().end).fontSize(8).alignment('center').end,
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
}
