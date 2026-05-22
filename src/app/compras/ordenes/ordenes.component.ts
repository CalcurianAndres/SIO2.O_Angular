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
      'Septiembre',
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
  public ORDEN = [false, false];

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

  public cliente = false; // Variable para controlar si se está buscando por cliente
  public fecha = true; // Variable para controlar si se está buscando por fecha
  public porProveedor: any = [];
  public Info_clientes = [false, false]; // Array de booleanos para controlar la visualización de información adicional por cliente

  public filtrado = false;
  public DesdeHasta = false;
  public Busqueda = false;
  public OC_NUMBER = false;
  public filtrados: any = [];
  public PorClientes: any = [];
  public searchTerm: any;
  public semaforo = ['rojo', 'amarillo', 'verde'];

  formatear_cifras(valor: number) {
    return this.decimalPipe.transform(valor, '1.0-2');
  }

  mostrarFiltros() {
    if (!this.filtrado) {
      this.filtrado = true;
    } else {
      this.filtrado = false;
    }
  }

  RealizarBusquedaFecha() {
    if (!this.DesdeHasta) {
      this.DesdeHasta = true;
    }
    this.fecha = false; // Ocultar la búsqueda por fecha
    this.cliente = false; // Mostrar la búsqueda por cliente
    this.Busqueda = true;
    this.Busqueda = true;
    this.OC_NUMBER = false;
    this.filtrados = [];
  }

  BusquedaPorNumero() {
    this.OC_NUMBER = true;
    this.DesdeHasta = false;
    this.fecha = false;
    this.cliente = false;
    this.Busqueda = true;
    this.filtrados = [];
  }

  formatNumberWithDotSeparator(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  buscarPorFecha(desde: string, hasta: string) {
    // Convertir las fechas sin alterar la zona horaria
    const inicio = new Date(desde + 'T00:00:00');
    const fin = new Date(hasta + 'T23:59:59');

    this.filtrados = this.api.orden.filter((orden) => {
      const fechaOrden = new Date(orden.createdAt);
      console.log(fechaOrden, 'Inicio:', inicio, 'Fin:', fin);
      return fechaOrden >= inicio && fechaOrden <= fin;
    });
  }

  buscarPorFecha_cliente(desde, hasta) {
    let OrdenesPorClientes = {};
    let filtracion = this.api.orden.filter((orden) => {
      // Convertir las fechas de los objetos OrdenCompra a objetos Date
      const fechaOrden = new Date(orden.recepcion);

      // Verificar si la fecha de la orden está dentro del rango especificado
      return fechaOrden >= new Date(desde) && fechaOrden <= new Date(hasta);
    });

    filtracion.forEach((orden) => {
      const { cliente } = orden;

      // Si el proveedor no existe en el objeto, lo creamos
      if (!OrdenesPorClientes[cliente.nombre]) {
        OrdenesPorClientes[cliente.nombre] = [];
      }

      // Agregamos el material al proveedor correspondiente
      OrdenesPorClientes[cliente.nombre].push(orden);
    });

    // Convertimos el objeto en un arreglo de proveedores
    this.PorClientes = Object.entries(OrdenesPorClientes);
  }

  search() {
    // Eliminar cualquier guion '-' del searchTerm antes de la búsqueda
    const cleanedSearchTerm = this.searchTerm.replace(/-/g, '');

    // Realizar la búsqueda con el término limpio
    this.filtrados = this.api.orden.filter((orden) => orden.numero.toString().includes(cleanedSearchTerm));

    console.log(this.filtrados);
  }

  // Función para buscar por cliente
  buscarporCliente() {
    this.fecha = false; // Ocultar la búsqueda por fecha
    this.cliente = true; // Mostrar la búsqueda por cliente

    console.log(this.api.separarPorProveedor());
    this.porProveedor = this.api.separarPorProveedor();
  }

  // Función para buscar por fecha
  buscarporFecha() {
    this.fecha = true; // Mostrar la búsqueda por fecha
    this.cliente = false; // Ocultar la búsqueda por cliente
    this.DesdeHasta = false;
    this.OC_NUMBER = false;
    this.Busqueda = false;
  }

  nueva_orden() {
    this.nueva = !this.nueva;
  }

  show_info(n) {
    if (this.ORDEN[n]) {
      this.ORDEN[n] = false; // Si la información está mostrándose, ocultarla
    } else {
      this.ORDEN[n] = true; // Si la información está oculta, mostrarla
    }
  }

  show_info_(n) {
    if (this.ORDEN[n]) {
      this.ORDEN[n] = false; // Si la información está mostrándose, ocultarla
    } else {
      this.ORDEN[n] = true; // Si la información está oculta, mostrarla
    }
  }

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
    let numberToString = n.toString();
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

    // Calcula el I.V.A. para cada posición en los arrays
    const ivas = cantidades[0].map((cantidad, i) => {
      console.log(i);
      const ivaCalculado = ((orden.iva / 100) * precios[0][i] * cantidad).toFixed(2);
      return parseFloat(ivaCalculado);
    });

    console.log('Valores de I.V.A. calculados para cada posición:', ivas);

    let netos = cantidades[0].map((cantidad, i) => {
      const neto = (precios[0][i] * cantidad).toFixed(2);
      return parseFloat(neto);
    });

    let SumaNetos: any = netos.reduce((total, neto) => total + neto, 0);
    SumaNetos = SumaNetos.toFixed(2);
    SumaNetos = SumaNetos.toString();

    let sumaIvas: any = ivas.reduce((total, iva) => total + iva, 0);
    sumaIvas = sumaIvas.toFixed(2);
    sumaIvas = sumaIvas.toString();

    let N_orden = this.addSlice(orden.numero);
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = today.getFullYear();

    let hoy = `${day}/${month}/${year}`;
    let entrega = moment(orden.entrega).format('DD/MM/YYYY');
    let usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;

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
