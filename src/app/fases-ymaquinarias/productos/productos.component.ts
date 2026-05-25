import { Component, OnInit } from '@angular/core';
import { Cell, Columns, Img, Ol, PdfMakeWrapper, Stack, Table, Txt, Ul } from 'pdfmake-wrapper';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Producto, Producto_ } from 'src/app/compras/models/modelos-compra';
import { ClientesService } from 'src/app/services/clientes.service';
import { ProductosService } from 'src/app/services/productos.service';
import { DefectosService } from 'src/app/services/defectos.service';
import { FormulasService } from 'src/app/services/formulas.service';

@Component({
  selector: 'app-productos',
  standalone: false,
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
})
export class ProductosComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = 'YOUR_SERVER_PUBLIC_KEY';

  constructor(
    public clientes: ClientesService,
    public productos_: ProductosService,
    public defects: DefectosService,
    public formulas: FormulasService,
  ) {}

  ngOnInit(): void {
    this.cambiosDiferentes = this.detectarDiferencias(this.test);
  }

  public sustratos_nombres: string[] = [];
  public tinta_nombres: string[] = [];
  public barniz_nombres: string[] = [];
  public impresoras_nombre: string[] = [];
  public fuentes_nombres: string[] = [];
  public troqueladora_nombres: string[] = [];
  public guillotina_nombres: string[] = [];
  public pegadora_nombres: string[] = [];
  public pega_nombres: string[] = [];
  public cajas_nombres: string[] = [];
  public caja_nombre = '';

  public nuevo;
  public cliente;
  public editar = false;
  public productos: any = [];
  public id_selected = '';
  public cargando = false;

  public cambiosDiferentes;
  public cambios = false;

  public data = {
    nombre: '',
    rif: '',
    codigo: '',
    direccion: '',
    contactos: [],
    almacenes: [],
  };

  public producto: Producto = {
    cliente: '',
    producto: '',
    codigo: '',
    codigo_cliente: '',
    tamano_desplegado: [],
    tamano_cerrado: [],
    diseno: '',
    sustrato: [],
    tintas: [],
    barnices: [],
    archivo_diseno: '',
    archivo_montaje: [],
    tipo_plancha: '',
    tiempo_exposicion: '',
    maquinas: [],
    tamano_sustrato_imprimir: [],
    area_efectiva: [],
    fuente: [],
    troqueladora: [],
    guillotina: [],
    pegadora: [],
    pegamento: [],
    embalaje: '',
    caja: [],
    unidades_por_caja: 0,
    cantidad_por_paquetes: 0,
    vista_aerea: '',
    vista_3d: '',
    tipo_paleta: '',
    tamano_paleta: '',
    cantidad_estibas: 0,
    peso_cajas: '',
    paletizado: '',
  };

  Producto: Producto_ = {
    identificacion: { cliente: '', categoria: '', producto: '', codigo: '', version: '', codigo_cliente: '' },
    dimensiones: {
      desplegado: { ancho: '', largo: '', tolerancia: '' },
      cerrado: { ancho: '', largo: '', alto: '', tolerancia: '' },
      diseno: '',
    },
    materia_prima: { sustrato: [], tintas: [], barnices: [] },
    pre_impresion: {
      diseno: '',
      montajes: '',
      nombre_montajes: [],
      tamano_sustrato: {
        montajes: [
          { ancho: '', largo: '', ejemplares: '' },
          { ancho: '', largo: '', ejemplares: '' },
        ],
        margenes: [
          { inferior: '', superior: '', izquierdo: '', derecho: '' },
          { inferior: '', superior: '', izquierdo: '', derecho: '' },
        ],
      },
      plancha: { tipo: '', marca: '', tiempo_exposicion: '' },
      pelicula: [],
    },
    impresion: { impresoras: [], secuencia: [[]], pinzas: [[]], fuentes: [] },
    post_impresion: {
      otros: [],
      troqueladora: [],
      henidura: { alto: '', ancho: '' },
      guillotina: [],
      pegadora: [],
      pegamento: [],
      caja: { nombre: '', cabida: [] },
      distribucion: { aerea: '', v3d: '', peso_cajas: '', estibas: '', paletizado: '' },
    },
  };

  // --- Search & Pagination ---
  public searchTerm: string = '';
  public currentPage: number = 1;
  public pageSize: number = 10;

  get filteredProductos(): any[] {
    if (!this.searchTerm?.trim()) return this.productos;
    const t = this.searchTerm.toLowerCase().trim();
    return this.productos.filter(
      (p) =>
        p.identificacion?.producto?.toLowerCase().includes(t) ||
        p.identificacion?.codigo?.toLowerCase().includes(t) ||
        p.identificacion?.cliente?.codigo?.toLowerCase().includes(t),
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProductos.length / this.pageSize) || 1;
  }

  get paginatedProductos(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProductos.slice(start, start + this.pageSize);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  onSearch() {
    this.currentPage = 1;
  }

  // --- Existing methods ---
  public cambios_todos: any = [];
  public fechas_cambios: any = [];
  public codigo_producto: string = '';

  Cambios_realizados(producto_id, producto) {
    this.codigo_producto = `E-${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}`;
    const cambios = this.productos_.buscarHistorialPorProducto(producto_id);
    for (let i = 0; i < cambios.length; i++) {
      this.cambios_todos.push(this.detectarDiferencias(cambios[i]));
      this.fechas_cambios.push(cambios[i].fechaCambio);
      if (i === cambios.length - 1) {
        this.cambios = true;
      }
    }
  }

  public test = {
    producto: { $oid: '66eac4a10c16248fb81e30dd' },
    cambios: {
      identificacion_cliente: 'De: 66e98997cc8a9a662a67f2c0 A: 66e98997cc8a9a662a67f2c0',
      identificacion_categoria: 'De: 66e9e0297c8231c41dc30d29 A: 66e9e0297c8231c41dc30d29',
      identificacion_producto: 'De: Manzanilla con Limón 20 bolsitas A: Est. Manzanilla con Limón 20 bolsitas',
      materia_prima_sustrato: 'De: ["66bf73e3605b8ca0df5681e4"] A: ["66bf73e3605b8ca0df5681e4"]',
      materia_prima_tintas:
        'De: [{"tinta":"66cde7d1ba0114d33760f23e","cantidad":"0.15"},{"tinta":"66cde879ba0114d33760f24a","cantidad":"0.15"},{"tinta":"66bf7743605b8ca0df568225","cantidad":"0.10"},{"tinta":"66cde780ba0114d33760f232","cantidad":"0.2"}] A: same',
      materia_prima_barnices: 'De: [{"barniz":"66bf7a19605b8ca0df56824b","cantidad":"0.5"}] A: same',
      pre_impresion_tamano_sustrato: 'De: complex A: same',
      impresion_impresoras: 'De: ["66e99fcc8f52c9992854dbf2","66e99ffd8f52c9992854dbf7"] A: same',
      impresion_fuentes: 'De: ["66e9aafe8f52c9992854dd20"] A: complex',
      post_impresion_troqueladora: 'De: ["66e9a25f8f52c9992854dc06"] A: same',
      post_impresion_guillotina: 'De: ["66e9a33c8f52c9992854dc15"] A: same',
      post_impresion_pegadora: 'De: ["66e9a50d8f52c9992854dc2e"] A: same',
    },
    fechaCambio: { $date: '2024-09-18T12:37:50.815Z' },
  };

  detectarDiferencias(obj) {
    const cambios = obj.cambios;
    const diferencias = {};
    for (const key in cambios) {
      const valor = cambios[key];
      const deMatch = valor.match(/De:\s*(.*?)\s*A:/);
      const aMatch = valor.match(/A:\s*(.*)$/);
      if (deMatch && aMatch && deMatch[1] !== aMatch[1]) {
        diferencias[key] = { De: deMatch[1], A: aMatch[1] };
      }
    }
    return diferencias;
  }

  BuscarProductos(clienteID) {
    this.productos = this.productos_.buscarPorClientes(clienteID);
    this.id_selected = clienteID;
    this.currentPage = 1;
    this.searchTerm = '';
  }

  nuevoProducto() {
    this.producto = {
      cliente: '', producto: '', codigo: '', codigo_cliente: '',
      tamano_desplegado: [], tamano_cerrado: [], diseno: '',
      sustrato: [], tintas: [], barnices: [],
      archivo_diseno: '', archivo_montaje: [], tipo_plancha: '', tiempo_exposicion: '',
      maquinas: [], tamano_sustrato_imprimir: [], area_efectiva: [], fuente: [],
      troqueladora: [], guillotina: [], pegadora: [], pegamento: [], embalaje: '',
      caja: [], unidades_por_caja: 0, cantidad_por_paquetes: 0,
      vista_aerea: '', vista_3d: '', tipo_paleta: '', tamano_paleta: '',
      cantidad_estibas: 0, peso_cajas: '', paletizado: '',
    };
    this.nuevo = true;
  }

  private fromNested(n: any): Producto {
    const id = (v: any) => (v && typeof v === 'object' ? v._id || '' : v || '');
    const arrId = (a: any[]) => (a || []).map((v: any) => (v && typeof v === 'object' ? v._id || v : v));
    return {
      _id: n._id,
      cliente: id(n.identificacion?.cliente),
      producto: n.identificacion?.producto || '',
      codigo: n.identificacion?.codigo || '',
      codigo_cliente: n.identificacion?.codigo_cliente || '',
      tamano_desplegado: n.dimensiones?.desplegado ? [n.dimensiones.desplegado.ancho, n.dimensiones.desplegado.largo, n.dimensiones.desplegado.tolerancia].filter(Boolean).map(Number) : [],
      tamano_cerrado: n.dimensiones?.cerrado ? [n.dimensiones.cerrado.ancho, n.dimensiones.cerrado.largo, n.dimensiones.cerrado.tolerancia].filter(Boolean).map(Number) : [],
      diseno: n.dimensiones?.diseno || '',
      sustrato: arrId(n.materia_prima?.sustrato),
      tintas: (n.materia_prima?.tintas || []).map((t: any) => ({ tinta: id(t.tinta), cantidad: Number(t.cantidad) || 0 })),
      barnices: (n.materia_prima?.barnices || []).map((b: any) => ({ barniz: id(b.barniz), cantidad: Number(b.cantidad) || 0 })),
      archivo_diseno: n.pre_impresion?.diseno || '',
      archivo_montaje: n.pre_impresion?.nombre_montajes || [],
      tipo_plancha: n.pre_impresion?.plancha?.tipo || '',
      tiempo_exposicion: n.pre_impresion?.plancha?.tiempo_exposicion || '',
      maquinas: arrId(n.impresion?.impresoras),
      tamano_sustrato_imprimir: (() => {
        const m = n.pre_impresion?.tamano_sustrato?.montajes || [];
        const r: number[] = [];
        if (m[0]) { r.push(Number(m[0].ancho) || 0, Number(m[0].largo) || 0, Number(m[0].ejemplares) || 0); }
        if (m[1]?.ancho) { r.push(Number(m[1].ancho) || 0, Number(m[1].largo) || 0, Number(m[1].ejemplares) || 0); }
        return r;
      })(),
      area_efectiva: n.pre_impresion?.area_efectiva || [],
      fuente: (n.impresion?.fuentes || []).map((f: any) => id(f)),
      troqueladora: arrId(n.post_impresion?.troqueladora),
      guillotina: arrId(n.post_impresion?.guillotina),
      pegadora: arrId(n.post_impresion?.pegadora),
      pegamento: (n.post_impresion?.pegamento || []).map((p: any) => ({ pega: id(p.pega), cantidad: p.cantidad || '' })),
      embalaje: n.post_impresion?.embalaje || '',
      caja: n.post_impresion?.caja?.nombre ? [n.post_impresion.caja.nombre] : [],
      unidades_por_caja: Number(n.post_impresion?.caja?.cabida?.[0]) || 0,
      cantidad_por_paquetes: 0,
      vista_aerea: n.post_impresion?.distribucion?.aerea || '',
      vista_3d: n.post_impresion?.distribucion?.v3d || '',
      tipo_paleta: n.post_impresion?.distribucion?.paletizado || '',
      tamano_paleta: '',
      cantidad_estibas: Number(n.post_impresion?.distribucion?.estibas) || 0,
      peso_cajas: n.post_impresion?.distribucion?.peso_cajas || '',
      paletizado: '',
    };
  }

  editarProducto(p: any) {
    this.producto = this.fromNested(p);
    this.nuevo = true;
  }

  nuevoCliente() {
    this.cliente = true;
  }

  cerrar() {
    this.nuevo = false;
    this.cliente = false;
    this.editar = false;
    this.BuscarProductos(this.id_selected);
  }

  GuardarCiente() {
    this.data = { nombre: '', rif: '', codigo: '', direccion: '', contactos: [], almacenes: [] };
    this.nuevo = false;
    this.cliente = false;
    this.editar = false;
  }

  filas() {
    return Math.ceil(this.clientes.clientes.length / 5);
  }

  EditarCliente(cliente) {
    this.data = cliente;
    this.editar = true;
  }

  DescargarPDF(producto: any) {
    const defecto_ = producto.identificacion?.categoria?._id
      ? this.defects.buscarPorClienteYCategoria(
          producto.identificacion.cliente._id,
          producto.identificacion.categoria._id,
        )
      : [];
    let formulas___: any = [];
    for (let i = 0; i < producto.materia_prima.tintas.length; i++) {
      let color = producto.materia_prima.tintas[i].tinta.color;

      switch (color) {
        case 'A':
          color = 'Amarillo';
          break;
        case 'C':
          color = 'Cyan';
          break;
        case 'M':
          color = 'Magenta';
          break;
        case 'K':
          color = 'Negro';
          break;
        default:
          const codigoTinta = producto.materia_prima.tintas[i].tinta.codigo;

          // Filtrar las fórmulas que coinciden con el código de tinta buscado
          const formulasEncontradas = this.formulas.BuscarFormulas(codigoTinta);

          console.log(formulasEncontradas);

          const agrupadoPorPantone = {};

          // Suponiendo que 'resultados' es tu arreglo de fórmulas original
          const formulas_ = formulasEncontradas.reduce((agrupadoPorPantone, { pantone, formula }) => {
            // Convertir la fórmula a un arreglo de texto 'material - cantidad'
            const formulaTexto = formula.map((f) => `${f.material.nombre} - ${f.cantidad}kg`);

            // Verificar si el pantone ya está en el objeto agrupado
            if (!agrupadoPorPantone[pantone]) {
              agrupadoPorPantone[pantone] = [];
            }

            // Agregar el arreglo de texto al arreglo correspondiente al pantone
            agrupadoPorPantone[pantone].push(formulaTexto);

            return agrupadoPorPantone;
          }, {});

          formulas___ = Object.entries(formulas_).map(([color, formulas]) => ({ color, formulas }));
          console.log(formulas___);

          break;
      }
    }

    async function generarEspecificacion() {
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('portrait');
      pdf.pageSize('A4');

      const Sustratos: any = [];
      const Sustratos_: any = [];
      const barnices: any = [];
      const colores: any = [];
      if (producto.materia_prima.sustrato?.length) {
        for (let i = 0; i < Math.min(1, producto.materia_prima.sustrato.length); i++) {
          Sustratos.push(
            `${producto.materia_prima.sustrato[i].nombre} ${producto.materia_prima.sustrato[i].gramaje}g ${producto.materia_prima.sustrato[i].calibre}pt`,
          );
        }
      }
      for (let i = 0; i < (producto.materia_prima.barnices?.length || 0); i++) {
        barnices.push(
          `${producto.materia_prima.barnices[i]?.barniz?.nombre || ''} - ${producto.materia_prima.barnices[i]?.cantidad || ''}kg.`,
        );
      }

      for (let i = 0; i < producto.materia_prima.sustrato.length; i++) {
        Sustratos_.push(
          `${producto.materia_prima.sustrato[i].nombre} (${producto.materia_prima.sustrato[i].fabricante.alias}) ${producto.materia_prima.sustrato[i].gramaje}g ${producto.materia_prima.sustrato[i].calibre}pt ${producto.materia_prima.sustrato[i].origen}`,
        );
      }

      const peliculas: any = [];
      const peliculasB: any = [];

      const colorNumero = {
        Negro: 1,
        Cyan: 2,
        Magenta: 3,
        Amarillo: 4,
      };

      let numero = 5; // Número inicial para colores no especificados

      colores.forEach((color, index) => {
        if (colorNumero[color.color]) {
          peliculas.push(
            `Pelicula Nº${index + 1}: ${color.color}:${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-A-${colorNumero[color.color]}`,
          );
          if (producto.pre_impresion.montajes > 1) {
            peliculasB.push(
              `Pelicula Nº${index + 1}: ${color.color}:${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-B-${colorNumero[color.color]}`,
            );
          }
        } else {
          peliculas.push(
            `Pelicula Nº${index + 1}: ${color.color}:${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-A-${numero}`,
          );
          if (producto.pre_impresion.montajes > 1) {
            peliculasB.push(
              `Pelicula Nº${index + 1}: ${color.color}:${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-B-${numero}`,
            );
          }
          numero++;
        }
      });

      let area_efectiva: any;
      let area_efectivaB: any;

      const areaTotal =
        Number(producto.pre_impresion.tamano_sustrato.montajes[0].ancho) *
        Number(producto.pre_impresion.tamano_sustrato.montajes[0].largo);
      const AnchoEfectivo =
        Number(producto.pre_impresion.tamano_sustrato.montajes[0].ancho) -
        (Number(producto.pre_impresion.tamano_sustrato.margenes[0].superior) +
          Number(producto.pre_impresion.tamano_sustrato.margenes[0].inferior));
      const AltoEfectivo =
        Number(producto.pre_impresion.tamano_sustrato.montajes[0].largo) -
        (Number(producto.pre_impresion.tamano_sustrato.margenes[0].izquierdo) +
          Number(producto.pre_impresion.tamano_sustrato.margenes[0].derecho));
      area_efectiva = AnchoEfectivo * AltoEfectivo;
      const area_Desperdicio = areaTotal - area_efectiva;
      const porcentajePerdida = (area_Desperdicio / areaTotal) * 100;

      const areaTotalB =
        Number(producto.pre_impresion.tamano_sustrato.montajes[1].ancho) *
        Number(producto.pre_impresion.tamano_sustrato.montajes[1].largo);
      const AnchoEfectivoB =
        Number(producto.pre_impresion.tamano_sustrato.montajes[1].ancho) -
        (Number(producto.pre_impresion.tamano_sustrato.margenes[1].superior) +
          Number(producto.pre_impresion.tamano_sustrato.margenes[1].inferior));
      const AltoEfectivoB =
        Number(producto.pre_impresion.tamano_sustrato.montajes[1].largo) -
        (Number(producto.pre_impresion.tamano_sustrato.margenes[1].izquierdo) +
          Number(producto.pre_impresion.tamano_sustrato.margenes[1].derecho));
      area_efectivaB = AnchoEfectivoB * AltoEfectivoB;
      const area_DesperdicioB = areaTotalB - area_efectivaB;
      const porcentajePerdidaB = (area_DesperdicioB / areaTotalB) * 100;

      const impresoras: any = [];
      const troqueladoras: any = [];
      const guillotinas: any = [];
      const pegadoras: any = [];

      for (let i = 0; i < producto.impresion.impresoras.length; i++) {
        impresoras.push(producto.impresion.impresoras[i].nombre);
        console.log(producto.impresion.impresoras[i].nombre);
      }
      for (let i = 0; i < producto.post_impresion.troqueladora.length; i++) {
        troqueladoras.push(producto.post_impresion.troqueladora[i].nombre);
      }
      for (let i = 0; i < producto.post_impresion.guillotina.length; i++) {
        guillotinas.push(producto.post_impresion.guillotina[i].nombre);
      }
      for (let i = 0; i < producto.post_impresion.pegadora.length; i++) {
        pegadoras.push(producto.post_impresion.pegadora[i].nombre);
      }

      // Obtener la última fuente (con salto si no hay fuentes)
      const ultimaFuente = producto.impresion?.fuentes?.[producto.impresion.fuentes.length - 1];
      const ultimaEspecificacion = ultimaFuente?.especificacion2?.especificacion || {};
      const propiedadesUltimaEspecificacion = Object.keys(ultimaEspecificacion);
      const ultimaPropiedad = propiedadesUltimaEspecificacion[propiedadesUltimaEspecificacion.length - 1] || '';

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10, 0, 0]).build())
              .alignment('center')
              .rowSpan(4).end,
            new Cell(
              new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end,
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

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).border([false]).end,
            new Cell(new Txt('Código de especificación').bold().end)
              .fillColor('#000000')
              .color('#FFFFFF')
              .alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).border([false]).end,
            new Cell(
              new Txt(
                `E-${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}`,
              ).bold().end,
            )
              .fontSize(15)
              .alignment('center').end,
          ],
        ]).widths(['70%', '30%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('1. Identificación del producto').bold().end)
              .bold()
              .color('#FFFFFF')
              .fillColor('#000000')
              .colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt('1.1 Cliente').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt(`${producto.identificacion.cliente.nombre}`).end).border([false]).end,
          ],
          [
            new Cell(new Txt('1.2 Producto').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Txt(`${producto.identificacion.producto}`).end).border([false]).end,
          ],
          [
            new Cell(new Txt('1.3 Código del producto').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(
              new Txt(
                `${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}`,
              ).end,
            ).border([false]).end,
          ],
        ]).widths(['30%', '70%']).end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('2. Dimensiones del producto').bold().end)
              .bold()
              .color('#FFFFFF')
              .fillColor('#000000')
              .colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt('2.1 Tamaño del producto desplegado (mm)').end).fillColor('#dedede').bold().border([false])
              .end,
            new Cell(
              new Txt(
                `${producto.dimensiones.desplegado.ancho} x ${producto.dimensiones.desplegado.largo} ± ${producto.dimensiones.desplegado.tolerancia}`,
              ).end,
            ).border([false]).end,
          ],
          [
            new Cell(new Txt('2.1 Tamaño del producto cerrado (mm)').end).fillColor('#dedede').bold().border([false])
              .end,
            new Cell(
              new Txt(
                `${producto.dimensiones.cerrado.ancho} x ${producto.dimensiones.cerrado.largo} x ${producto.dimensiones.cerrado.alto} ± ${producto.dimensiones.cerrado.tolerancia}`,
              ).end,
            ).border([false]).end,
          ],
        ]).widths(['55%', '45%']).end,
      );

      pdf.add(
        new Table([
          [new Cell(new Txt('2.3 Diseño del producto').end).fillColor('#dedede').bold().border([false]).end],
          [
            new Cell(
              await new Img(`https://192.168.0.22/api/imagen/producto/${producto.dimensiones.diseno}`)
                .width(400)
                .margin([0, 15])
                .build(),
            )
              .alignment('center')
              .border([false])
              .pageBreak('after').end,
          ],
        ]).widths(['100%']).end,
      );

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10, 0, 0]).build())
              .alignment('center')
              .rowSpan(4).end,
            new Cell(
              new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end,
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

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [new Cell(new Txt('3. Materia prima').bold().end).bold().color('#FFFFFF').fillColor('#000000').end],
          [new Cell(new Txt(' ').end).border([false]).fontSize(1).end],
          [new Cell(new Txt('3.1 Tipo de sustrato a utilizar').end).fillColor('#dedede').bold().border([false]).end],
          [new Cell(new Stack(Sustratos).end).border([false]).end],
          [new Cell(new Txt('3.2 Propiedades').end).fillColor('#dedede').bold().border([false]).end],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Marca').end)
                    .alignment('center')
                    .fillColor('#f1f1f1')
                    .rowSpan(2)
                    .margin([0, 10, 0, 0])
                    .bold()
                    .border([false]).end,
                  new Cell(new Txt('Ubicación').end)
                    .alignment('center')
                    .fillColor('#f1f1f1')
                    .rowSpan(2)
                    .margin([0, 10, 0, 0])
                    .bold()
                    .border([false]).end,
                  new Cell(new Txt('Calibre (pt)').end).alignment('center').fillColor('#f1f1f1').bold().border([false])
                    .end,
                  new Cell(new Txt('Gramaje (g/m²)').end)
                    .alignment('center')
                    .fillColor('#f1f1f1')
                    .bold()
                    .border([false]).end,
                ],
                [
                  new Cell(new Txt('').end).fillColor('#f1f1f1').bold().border([false]).end,
                  new Cell(new Txt('').end).fillColor('#f1f1f1').bold().border([false]).end,
                  new Cell(
                    new Table([
                      [
                        new Cell(new Txt('Mín.').end).alignment('center').border([false]).end,
                        new Cell(new Txt('Nóm.').end).alignment('center').border([false]).end,
                        new Cell(new Txt('Máx.').end).alignment('center').border([false]).end,
                      ],
                    ]).widths(['33.3%', '33.3%', '33.3%']).end,
                  )
                    .fillColor('#c9c9c9')
                    .bold()
                    .border([false]).end,
                  new Cell(
                    new Table([
                      [
                        new Cell(new Txt('Mín.').end).alignment('center').border([false]).end,
                        new Cell(new Txt('Nóm.').end).alignment('center').border([false]).end,
                        new Cell(new Txt('Máx.').end).alignment('center').border([false]).end,
                      ],
                    ]).widths(['33.3%', '33.3%', '33.3%']).end,
                  )
                    .fillColor('#c9c9c9')
                    .bold()
                    .border([false]).end,
                ],
              ]).widths(['20%', '20%', '30%', '30%']).end,
            ).border([false]).end,
          ],
        ]).widths(['100%']).end,
      );

      for (let i = 0; i < producto.materia_prima.sustrato.length; i++) {
        pdf.add(
          new Table([
            [
              new Cell(new Txt(producto.materia_prima.sustrato[i].fabricante.alias).end)
                .bold()
                .border([false])
                .alignment('center').end,
              new Cell(new Txt(producto.materia_prima.sustrato[i].origen).end)
                .fontSize(8)
                .bold()
                .border([false])
                .alignment('center').end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(producto.materia_prima.sustrato[i]?.especificacion?.calibre?.pt?.min ?? '').end)
                      .border([false])
                      .alignment('center').end,
                    new Cell(new Txt(producto.materia_prima.sustrato[i]?.especificacion?.calibre?.pt?.nom ?? '').end)
                      .border([false])
                      .alignment('center').end,
                    new Cell(new Txt(producto.materia_prima.sustrato[i]?.especificacion?.calibre?.pt?.max ?? '').end)
                      .border([false])
                      .alignment('center').end,
                  ],
                ]).widths(['33.3%', '33.3%', '33.3%']).end,
              )
                .bold()
                .border([false]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(producto.materia_prima.sustrato[i]?.especificacion?.gramaje?.min ?? '').end)
                      .border([false])
                      .alignment('center').end,
                    new Cell(new Txt(producto.materia_prima.sustrato[i]?.especificacion?.gramaje?.nom ?? '').end)
                      .border([false])
                      .alignment('center').end,
                    new Cell(new Txt(producto.materia_prima.sustrato[i]?.especificacion?.gramaje?.max ?? '').end)
                      .border([false])
                      .alignment('center').end,
                  ],
                ]).widths(['33.3%', '33.3%', '33.3%']).end,
              )
                .bold()
                .border([false]).end,
            ],
          ])
            .widths(['20%', '19%', '30%', '30%'])
            .margin([5, 0, 0, 0]).end,
        );
      }

      // PAGINA 3 ***************************************
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10, 0, 0]).build())
              .alignment('center')
              .rowSpan(4).end,
            new Cell(
              new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end,
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
        ])
          .widths(['25%', '50%', '25%'])
          .pageBreak('before').end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('3.4 Tintas aprobadas').end)
              .colSpan(5)
              .fillColor('#dedede')
              .bold()
              .border([false, false, false, false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
          ],
        ]).widths(['20%', '20%', '20%', '20%', '20%']).end,
      );

      pdf.add('\n');

      for (let i = 0; i < producto.pre_impresion.pelicula.length; i++) {
        if (
          producto.pre_impresion.pelicula[i].color != 'Amarillo' &&
          producto.pre_impresion.pelicula[i].color != 'Cyan' &&
          producto.pre_impresion.pelicula[i].color != 'Magenta' &&
          producto.pre_impresion.pelicula[i].color != 'Negro'
        ) {
          pdf.add(
            new Table([
              [
                new Cell(new Txt(producto.pre_impresion.pelicula[i].color).end)
                  .decoration('underline')
                  .decorationStyle('dotted')
                  .linkToPage(9)
                  .bold()
                  .fillColor('#c9c9c9')
                  .border([false]).end,
              ],
            ]).widths(['100%']).end,
          );
        } else {
          pdf.add(
            new Table([
              [
                new Cell(new Txt(producto.pre_impresion.pelicula[i].color).end)
                  .bold()
                  .fillColor('#c9c9c9')
                  .border([false]).end,
              ],
            ]).widths(['100%']).end,
          );
        }
        for (let n = 0; n < producto.pre_impresion.pelicula[i].tintas.length; n++) {
          if (n === 0) {
            pdf.add(
              new Table([
                [
                  new Cell(new Txt('Nombre').end).bold().fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Serie').end).bold().fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Marca').end).bold().fillColor('#f1f1f1').border([false]).end,
                  new Cell(new Txt('Consumo (kg)').end).bold().fillColor('#f1f1f1').border([false]).end,
                ],
              ]).widths(['25%', '25%', '25%', '25%']).end,
            );
          }
          pdf.add(
            new Table([
              [
                new Cell(new Txt(producto.pre_impresion.pelicula[i].tintas[n].tinta.nombre).end).border([false]).end,
                new Cell(new Txt(producto.pre_impresion.pelicula[i].tintas[n].tinta.serie).end).border([false]).end,
                new Cell(new Txt(producto.pre_impresion.pelicula[i].tintas[n].tinta.fabricante.alias).end).border([
                  false,
                ]).end,
                new Cell(new Txt(producto.pre_impresion.pelicula[i].tintas[n].cantidad).end).border([false]).end,
              ],
            ]).widths(['25%', '25%', '25%', '25%']).end,
          );
        }
      }
      // PAGINA 4 ******************************

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10, 0, 0]).build())
              .alignment('center')
              .rowSpan(4).end,
            new Cell(
              new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end,
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
        ])
          .widths(['25%', '50%', '25%'])
          .pageBreak('before').end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('3.5 Barnices aprobados').end)
              .colSpan(5)
              .fillColor('#dedede')
              .bold()
              .border([false, false, false, false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
            new Cell(new Txt('Color').end).fillColor('#c9c9c9').border([false]).end,
          ],
        ]).widths(['20%', '20%', '20%', '20%', '20%']).end,
      );

      pdf.add(new Ul(barnices).end);

      if (producto.pre_impresion.montajes === '2') {
        pdf.add(
          new Table([
            [new Cell(new Txt(' ').end).border([false]).fontSize(1).end],
            [new Cell(new Txt('4. Pre-impresión').bold().end).bold().color('#FFFFFF').fillColor('#000000').end],
            [new Cell(new Txt(' ').end).border([false]).fontSize(1).end],
            [
              new Cell(new Txt('4.1 Nombre del archivo del diseño del producto').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [new Cell(new Txt(producto.pre_impresion.diseno).end).border([false]).end],
            [
              new Cell(new Txt('4.2 Código del montaje').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(new Columns([new Txt('Montaje A').bold().end, new Txt('Montaje B').bold().end]).end).border([
                false,
              ]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(
                    `M-${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-A`,
                  ).end,
                  new Txt('').end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(new Txt('4.3 Nombre del archivo del montaje del producto').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(producto.pre_impresion.nombre_montajes[0]).end,
                  new Txt(producto.pre_impresion.nombre_montajes[1]).end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(new Txt('4.4 Código de películas').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [new Cell(new Columns([new Ul(peliculas).end, new Ul(peliculasB).end]).end).border([false]).end],

            [
              new Cell(new Txt('4.5 Tamaño de sustrato a imprimir / Cantidad de ejemplares').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(
                    `${producto.pre_impresion.tamano_sustrato.montajes[0].ancho} x ${producto.pre_impresion.tamano_sustrato.montajes[0].largo} cm`,
                  ).end,
                  new Txt(
                    `${producto.pre_impresion.tamano_sustrato.montajes[1].ancho} x ${producto.pre_impresion.tamano_sustrato.montajes[1].largo} cm`,
                  ).end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[0].ejemplares} Ejemplares`).end,
                  new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[1].ejemplares} Ejemplares`).end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(new Txt('4.6 Márgenes (Inf. Sup. Der. Izq.)').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(
                    `${producto.pre_impresion.tamano_sustrato.margenes[0].inferior} x ${producto.pre_impresion.tamano_sustrato.margenes[0].superior} x ${producto.pre_impresion.tamano_sustrato.margenes[0].derecho} x ${producto.pre_impresion.tamano_sustrato.margenes[0].izquierdo}`,
                  ).end,
                  new Txt(
                    `${producto.pre_impresion.tamano_sustrato.margenes[1].inferior} x ${producto.pre_impresion.tamano_sustrato.margenes[1].superior} x ${producto.pre_impresion.tamano_sustrato.margenes[1].derecho} x ${producto.pre_impresion.tamano_sustrato.margenes[1].izquierdo}`,
                  ).end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(new Txt('4.7 Área efectiva de impresión (cm²):').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [new Cell(new Columns([new Txt(area_efectiva).end, new Txt(area_efectivaB).end]).end).border([false]).end],
            [
              new Cell(new Txt('4.8 Porcentaje de desperdicio (%):').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(porcentajePerdida.toFixed(2).toString()).end,
                  new Txt(porcentajePerdidaB.toFixed(2).toString()).end,
                ]).end,
              ).border([false]).end,
            ],
            [new Cell(new Txt('4.9 Plancha').end).fillColor('#dedede').bold().border([false, false, false, false]).end],
            [
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('Tipo').bold().end).fillColor('#f1f1f1').border([false]).end,
                    new Cell(new Txt('Marca').bold().end).fillColor('#f1f1f1').border([false]).end,
                    new Cell(new Txt('Tiempo de exposición (s)').bold().end).fillColor('#f1f1f1').border([false]).end,
                  ],
                  [
                    new Cell(new Txt(producto.pre_impresion.plancha.tipo).end).border([false]).end,
                    new Cell(new Txt(producto.pre_impresion.plancha.marca).end).border([false]).end,
                    new Cell(new Txt(producto.pre_impresion.plancha.tiempo_exposicion).end).border([false]).end,
                  ],
                ]).widths(['45%', '25%', '30%']).end,
              ).border([false]).end,
            ],
          ]).widths(['100%']).end,
        );
      } else {
        pdf.add(
          new Table([
            [new Cell(new Txt(' ').end).border([false]).fontSize(1).end],
            [new Cell(new Txt('4. Pre-impresión').bold().end).bold().color('#FFFFFF').fillColor('#000000').end],
            [new Cell(new Txt(' ').end).border([false]).fontSize(1).end],
            [
              new Cell(new Txt('4.1 Nombre del archivo del diseño del producto').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [new Cell(new Txt(producto.pre_impresion.diseno).end).border([false]).end],
            [
              new Cell(new Txt('4.2 Código del montaje').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [new Cell(new Columns([new Txt('Montaje A').bold().end, new Txt('').bold().end]).end).border([false]).end],
            [
              new Cell(
                new Columns([
                  new Txt(
                    `M-${producto.identificacion.cliente.codigo}-${producto.identificacion.codigo}-${producto.identificacion.version}-A`,
                  ).end,
                  new Txt('').end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(new Txt('4.3 Nombre del archivo del montaje del producto').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(
                new Columns([new Txt(producto.pre_impresion.nombre_montajes[0]).end, new Txt('').end]).end,
              ).border([false]).end,
            ],
            [
              new Cell(new Txt('4.4 Código de películas').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [new Cell(new Ul(peliculas).end).border([false]).end],
            [
              new Cell(new Txt('4.5 Tamaño de sustrato a imprimir / Cantidad de ejemplares').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(
                    `${producto.pre_impresion.tamano_sustrato.montajes[0].ancho} x ${producto.pre_impresion.tamano_sustrato.montajes[0].largo} cm`,
                  ).end,
                  new Txt('').end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(`${producto.pre_impresion.tamano_sustrato.montajes[0].ejemplares} Ejemplares`).end,
                  new Txt('').end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(new Txt('4.6 Márgenes (Inf. Sup. Der. Izq.)').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(
                new Columns([
                  new Txt(
                    `${producto.pre_impresion.tamano_sustrato.margenes[0].inferior} x ${producto.pre_impresion.tamano_sustrato.margenes[0].superior} x ${producto.pre_impresion.tamano_sustrato.margenes[0].derecho} x ${producto.pre_impresion.tamano_sustrato.margenes[0].izquierdo}`,
                  ).end,
                  new Txt('').end,
                ]).end,
              ).border([false]).end,
            ],
            [
              new Cell(new Txt('4.7 Área efectiva de impresión (cm²):').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [new Cell(new Columns([new Txt(area_efectiva).end, new Txt('').end]).end).border([false]).end],
            [
              new Cell(new Txt('4.8 Porcentaje de desperdicio (%):').end)
                .fillColor('#dedede')
                .bold()
                .border([false, false, false, false]).end,
            ],
            [
              new Cell(new Columns([new Txt(porcentajePerdida.toFixed(2).toString()).end, new Txt('').end]).end).border(
                [false],
              ).end,
            ],
            [new Cell(new Txt('4.9 Plancha').end).fillColor('#dedede').bold().border([false, false, false, false]).end],
            [
              new Cell(
                new Table([
                  [
                    new Cell(new Txt('Tipo').bold().end).fillColor('#f1f1f1').border([false]).end,
                    new Cell(new Txt('Marca').bold().end).fillColor('#f1f1f1').border([false]).end,
                    new Cell(new Txt('Tiempo de exposición (s)').bold().end).fillColor('#f1f1f1').border([false]).end,
                  ],
                  [
                    new Cell(new Txt(producto.pre_impresion.plancha.tipo).end).border([false]).end,
                    new Cell(new Txt(producto.pre_impresion.plancha.marca).end).border([false]).end,
                    new Cell(new Txt(producto.pre_impresion.plancha.tiempo_exposicion).end).border([false]).end,
                  ],
                ]).widths(['45%', '25%', '30%']).end,
              ).border([false]).end,
            ],
          ]).widths(['100%']).end,
        );
      }

      // PAGINA 5 ***************************************
      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 10, 0, 0]).build())
              .alignment('center')
              .rowSpan(4).end,
            new Cell(
              new Txt(`FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO`).bold().end,
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
        ])
          .widths(['25%', '50%', '25%'])
          .pageBreak('before').end,
      );

      pdf.add(new Table([[new Cell(new Txt(' ').end).border([false]).fontSize(1).end]]).widths(['100%']).end);

      pdf.add(
        new Table([
          [
            new Cell(new Txt('5. Impresión').bold().end).bold().color('#FFFFFF').fillColor('#000000').end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
          [
            new Cell(new Txt('5.1 Máquinas').end).fillColor('#dedede').bold().border([false]).end,
            new Cell(new Stack(impresoras).end).border([false]).end,
          ],
          [
            new Cell(new Txt('5.2 Fuente(s) de alimentación / Especificaciones').end)
              .fillColor('#dedede')
              .bold()
              .border([false, false, false, false]).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('Fabricante').bold().end).fillColor('#f1f1f1').border([false]).end,
            new Cell(new Txt('Descripción').bold().end).fillColor('#f1f1f1').border([false]).end,
            new Cell(new Txt('Especificación').bold().end).fillColor('#f1f1f1').border([false]).end,
          ],
          ...(producto.impresion.fuentes?.length
            ? [
                [
                  new Cell(new Txt(producto.impresion.fuentes[0]?.fabricante?.alias ?? '').end).border([false]).end,
                  new Cell(new Txt(producto.impresion.fuentes[0]?.nombre ?? '').end).border([false]).end,
                  new Cell(
                    new Ul([
                      `pH: ${producto.impresion.fuentes[0]?.especificacion2?.especificacion?.ph_m ?? ''} - ${producto.impresion.fuentes[0]?.especificacion2?.especificacion?.ph_M ?? ''}`,
                      `${ultimaPropiedad}: ${ultimaEspecificacion[ultimaPropiedad] ?? ''}`,
                    ]).end,
                  ),
                ] as any,
              ]
            : []),
        ]).widths(['35%', '35%', '30%']).end,
      );

      for (let i = 0; i < (producto.impresion.fuentes?.length || 0); i++) {
        const fuente = producto.impresion.fuentes[i];
        if (!fuente) continue;
        const especificacion2 = fuente?.especificacion2?.especificacion || {};
        const propiedades = Object.keys(especificacion2);
        const items: any = [];
        if (especificacion2.ph_m && especificacion2.ph_M) {
          items.push(`pH: ${especificacion2.ph_m} - ${especificacion2.ph_M}`);
        }
        for (let j = 0; j < propiedades.length; j++) {
          const prop = propiedades[j];
          if (prop !== 'ph_m' && prop !== 'ph_M') {
            items.push(`${prop}: ${especificacion2[prop]}`);
          }
        }
        if (items.length) {
          pdf.add(
            new Table([
              [
                new Cell(new Txt(fuente?.fabricante?.alias ?? '').end).border([false]).end,
                new Cell(new Txt(fuente?.nombre ?? '').end).border([false]).end,
                new Cell(new Ul(items).end).border([false]).end,
              ],
            ]).widths(['35%', '35%', '30%']).end,
          );
        }
      }

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
        ]).widths(['100%']).end,
      );

      // *********** DEFECTOS **************

      pdf.add(
        new Table([
          [new Cell(new Txt('6. Post-impresión').bold().end).bold().color('#FFFFFF').fillColor('#000000').end],
          [new Cell(new Txt(' ').end).border([false]).fontSize(1).end],
          [new Cell(new Txt('6.1 Troquelado').end).fillColor('#dedede').bold().border([false]).end],
          [new Cell(new Stack(troqueladoras).end).border([false]).end],
          [new Cell(new Txt('6.2 Guillotina').end).fillColor('#dedede').bold().border([false]).end],
          [new Cell(new Stack(guillotinas).end).border([false]).end],
          [new Cell(new Txt('6.3 Pegado').end).fillColor('#dedede').bold().border([false]).end],
          [new Cell(new Stack(pegadoras).end).border([false]).end],
          [new Cell(new Txt('6.4 Empaquetado').end).fillColor('#dedede').bold().border([false]).end],
          [new Cell(new Txt(producto.post_impresion.empaquetado).end).border([false]).end],
          [new Cell(new Txt('6.5 Henidura').end).fillColor('#dedede').bold().border([false]).end],
          [new Cell(new Txt(producto.post_impresion.henidura).end).border([false]).end],
        ]).widths(['100%']).end,
      );

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
        ]).widths(['100%']).end,
      );

      pdf.add(
        new Table([
          [new Cell(new Txt('6.6 Defectos aceptables').bold().end).bold().color('#FFFFFF').fillColor('#000000').end],
          [new Cell(new Txt(' ').end).border([false]).fontSize(1).end],
          [
            new Cell(new Txt('6.6.1 Categoría').end).fillColor('#dedede').bold().border([false, false, false, false])
              .end,
          ],
          [
            new Cell(new Txt(defecto_ && defecto_[0] ? defecto_[0].categoria.nombre : 'Valor por defecto').end).border([
              false,
            ]).end,
          ],
          [new Cell(new Txt('6.6.2 Valores').end).fillColor('#dedede').bold().border([false, false, false, false]).end],
        ]).widths(['100%']).end,
      );

      if (defecto_ && defecto_[0].defectos) {
        pdf.add(
          new Table([
            [
              new Cell(new Txt('Defecto').bold().end).alignment('center').fillColor('#c9c9c9').border([false]).end,
              new Cell(new Txt('Aceptable').bold().end).alignment('center').fillColor('#c9c9c9').border([false]).end,
              new Cell(new Txt('Rechazable').bold().end).alignment('center').fillColor('#c9c9c9').border([false]).end,
            ],
            ...defecto_[0].defectos.map((def) => [
              new Cell(new Txt(def.defecto).end).border([false]).end,
              new Cell(new Txt(def.aceptable).end).border([false]).end,
              new Cell(new Txt(def.rechazable).end).border([false]).end,
            ]),
          ]).widths(['40%', '30%', '30%']).end,
        );
      } else {
        pdf.add(
          new Table([[new Cell(new Txt('No hay defectos asociados.').end).border([false]).end]]).widths(['100%']).end,
        );
      }

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end,
          ],
        ]).widths(['100%']).end,
      );

      pdf.add(
        new Table([
          [new Cell(new Txt('7. Observaciones').bold().end).bold().color('#FFFFFF').fillColor('#000000').end],
          [new Cell(new Txt(producto.observaciones).end).border([false]).end],
        ]).widths(['100%']).end,
      );

      pdf.create().download();
    }
    generarEspecificacion();
  }
}
