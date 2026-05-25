import { Component } from '@angular/core';
import { RecepcionService } from 'src/app/services/recepcion.service';
import { AnalisisService } from 'src/app/services/analisis.service';
import { GruposService } from 'src/app/services/grupos.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import { AnalisisSustrato2 } from 'src/app/compras/models/modelos-compra';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-analisis-pendientes',
  standalone: false,
  templateUrl: './analisis-pendientes.component.html',
  styleUrls: ['./analisis-pendientes.component.scss'],
})
export class AnalisisPendientesComponent {
  public Tinta = false;
  public Sustrato = false;
  public Caja = false;
  public pads = false;
  public otro = false;
  public Preparacion = false;
  public Recepcion_selected: any;
  public Material_selected: any;
  public index_material: number = 0;
  public Busqueda = false;
  public parametro: any = [];
  public cargando = true;

  // filtros
  public filterMode: string = 'home';
  public tipo_de_busqueda = '';
  public grupo_selected = '';
  public material_selected = '';
  public lote_selected = '';
  public desde = '';
  public hasta = '';
  public fabricante_selected = '';
  public Materiales: any = [];
  public Math: any = Math;

  // paginación
  public pageSize = 25;
  public currentPage = 1;

  public Analisis: any = {
    img: 'no-image',
    cualitativo: {
      tono: false,
      opacidad: false,
      viscosidad: false,
      secadoCapaFina: false,
      secadoCapaGruesa: false,
      brillo: false,
    },
    cuantitativo: { papel: '', carton: '', gramaje: '', calibre: '', muestra: '' },
    sustrato_muestra: '',
    carton: this.initEstandar(),
    papel: this.initEstandar(),
    muestra: {
      estandar_1: { l: '', a: '', b: '' },
      estandar_2: { l: '', a: '', b: '' },
      estandar_3: { l: '', a: '', b: '' },
    },
    resultado: {
      estandar: '',
      resultado: '',
      observacion: '',
      pendiente: undefined,
      guardado: { usuario: '', fecha: '' },
      validado: { usuario: '', fecha: '' },
    },
  };

  public analisisSustrato: AnalisisSustrato2 = {
    numero_muestras: 0,
    ancho: 0,
    largo: 0,
    gramaje: {
      masa_inicial: [],
      masa_final: [],
      gramaje: [],
      promedio: 0,
      desviacion: 0,
      max: 0,
      min: 0,
      decimales: 0,
    },
    cobb: {
      top: { cobb: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
      back: { cobb: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
    },
    calibre: {
      mm: { mm: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
      um: { um: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
      pt: { pt: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
    },
    curling_blancura: {
      curling: { curling: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
      blancura: { blancura: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
    },
    dimensiones: {
      Escuadra: { escuadra: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
      contraEscuadra: { contraEscuadra: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
      Pinza: { pinza: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
      contraPinza: { contraPinza: [], max: 0, min: 0, promedio: 0, desviacion: 0, decimales: 0 },
    },
    resultado: {
      estandar: '',
      resultado: '',
      observacion: '',
      pendiente: undefined,
      guardado: { usuario: '', fecha: '' },
      validado: { usuario: '', fecha: '' },
    },
  };

  public AnalisisCajas: any = {
    longitud_interna: {
      largo: { largo: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
      ancho: { ancho: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
      alto: { alto: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
    },
    longitud_externa: {
      largo: { largo: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
      ancho: { ancho: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
      alto: { alto: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
    },
    espesor: { espesor: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
    resultado: {
      observacion: '',
      resultado: '',
      guardado: { usuario: '', fecha: '' },
      validado: { usuario: '', fecha: '' },
    },
    muestras: 0,
  };

  public analisisPads: any = {
    muestras: 0,
    largo: { largo: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
    ancho: { ancho: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
    signado: { signado: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
    espesor: { espesor: [], min: 0, max: 0, promedio: 0, desviacion: 0, decimales: 0 },
    resultado: {
      observacion: '',
      resultado: '',
      guardado: { usuario: '', fecha: '' },
      validado: { usuario: '', fecha: '' },
    },
  };

  public AnalisisOtro: any = {
    apariencia: false,
    ph: '',
    otro: '',
    resultado: {
      observacion: '',
      resultado: '',
      guardado: { usuario: '', fecha: '' },
      validado: { usuario: '', fecha: '' },
    },
  };

  public mostrarEtiquetas = false;
  public informacion: any;
  public recepcion_: any;

  constructor(
    public recepciones: RecepcionService,
    public analisis: AnalisisService,
    public grupos: GruposService,
    public materiales: MaterialesService,
    public solicitudes: SolicitudesService,
  ) {}

  get pendientes(): any[] {
    const items: any[] = [];
    if (!this.recepciones.recepciones) return items;

    const seen = new Set();
    for (const recepcion of this.recepciones.recepciones) {
      if (recepcion.status !== 'En observacion') continue;
      for (const grupoMateriales of recepcion.materiales) {
        if (!this.verificarSiSerealizoAnalisis(grupoMateriales)) continue;
        if (grupoMateriales[0]?.presentacion === 'bobinas') continue;
        const key = grupoMateriales[0]?._id || Math.random();
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({ recepcion, materiales: grupoMateriales });
      }
    }

    for (const prep of this.PreparacionesTinta()) {
      const key = prep._id || Math.random();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ recepcion: prep, materiales: [prep], esPreparacion: true });
    }

    return items;
  }

  get paginatedPendientes(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.pendientes.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.pendientes.length / this.pageSize);
  }

  get mesActual(): string {
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
    return meses[new Date().getMonth()];
  }

  get yearActual(): number {
    return new Date().getFullYear();
  }

  pageChanged(page: number) {
    this.currentPage = page;
  }

  PreparacionesTinta() {
    return (
      this.solicitudes.solicitudes?.filter(
        (s: any) => s.tag === 'Preparacion' && (s.status === 'Por Asignar' || s.status === 'Por Etiquetar'),
      ) || []
    );
  }

  CalcularPeso(materiales: any[]) {
    return materiales.reduce((total, m) => total + Number(m.neto || 0), 0).toFixed(2);
  }

  private initEstandar() {
    return {
      estandar_1: { l: '', a: '', b: '' },
      estandar_2: { l: '', a: '', b: '' },
      estandar_3: { l: '', a: '', b: '' },
      muestra_1: { l: '', a: '', b: '', ll: '', aa: '', bb: '', e: '' },
      muestra_2: { l: '', a: '', b: '', ll: '', aa: '', bb: '', e: '' },
      muestra_3: { l: '', a: '', b: '', ll: '', aa: '', bb: '', e: '' },
    };
  }

  verificarSiSerealizoAnalisis(material: any[]) {
    if (!material[0]?.analisis) return true;
    const grupo = material[0].material?.grupo;
    if (!grupo) return true;

    const id = material[0].analisis;
    if (grupo.nombre === 'Tintas' || grupo.nombre === 'Barniz s/impresión') {
      return !this.analisis.buscarAnalisisPorID(id)?.resultado?.validado?.usuario;
    }
    if (grupo.nombre === 'Cajas Corrugadas') {
      return !this.analisis.buscarAnalisisCajasPorID(id)?.resultado?.validado?.usuario;
    }
    if (grupo.nombre === 'Soportes de Embalaje') {
      return !this.analisis.buscarAnalisisPadsPorID(id)?.resultado?.validado?.usuario;
    }
    if (grupo.trato === true) {
      return !this.analisis.buscarAnalisisSustratoPorID(id)?.resultado?.validado?.usuario;
    }
    return !this.analisis.buscarAnalisisOtrosPorID(id)?.resultado?.validado?.usuario;
  }

  get statsRows() {
    const items = [
      { label: 'Sustrato', icon: 'fa-scroll', approved: this.analisis.SustratoAprobado || 0, rejected: this.analisis.SustratoRechazado || 0 },
      { label: 'Tinta', icon: 'fa-palette', approved: this.analisis.TintasAprobadas || 0, rejected: this.analisis.TintasRechazadas || 0 },
      { label: 'Cajas', icon: 'fa-box', approved: this.analisis.CajasAceptadas || 0, rejected: this.analisis.CajasRechazadas || 0 },
      { label: 'Pads', icon: 'fa-square', approved: this.analisis.PadsAprobados || 0, rejected: this.analisis.PadsRechazados || 0 },
      { label: 'Otros', icon: 'fa-flask', approved: this.analisis.OtrosAprobados || 0, rejected: this.analisis.OtrosRechazados || 0 },
    ];
    return items.map(r => {
      const total = r.approved + r.rejected;
      return { ...r, total, pct: total > 0 ? Math.round((r.approved / total) * 100) : 0 };
    });
  }

  get totalStats() {
    const approved = this.statsRows.reduce((a, r) => a + r.approved, 0);
    const total = this.statsRows.reduce((a, r) => a + r.total, 0);
    return { approved, total, pct: total > 0 ? Math.round((approved / total) * 100) : 0 };
  }

  lastFiveInfo(item: any) {
    const lote = item.lote || item.material?.lote || '—';
    const material = item.material?.nombre || item.nombre || '—';
    const date = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('es-ES') : '—';
    return { lote, material, date };
  }

  getBadge(material: any[]) {
    if (!material[0]?.analisis) return { class: 'is-danger', text: 'PENDIENTE' };
    const analisis = this.analisis.BuscarAnalisis(material[0].analisis);
    if (!analisis?.resultado?.resultado) return { class: 'is-warning', text: 'EN PROCESO' };
    return { class: 'is-success', text: 'POR VALIDAR' };
  }

  AnalizarPreparacion(preparacion: any) {
    this.Tinta = true;
    this.Recepcion_selected = preparacion;
    this.Preparacion = true;
    this.Material_selected = preparacion.material;
    if (this.analisis.buscarAnalisisPorID(preparacion.analisis)) {
      this.Analisis = this.analisis.buscarAnalisisPorID(preparacion.analisis);
    }
  }

  Analizar(recepcion: any, material: any[], index_recepcion: number, index_material: number) {
    const grupo = material[0]?.material?.grupo;
    if (!grupo) return;

    if (grupo.trato === true) {
      this.Sustrato = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisSustratoPorID(material[0].analisis)) {
        this.analisisSustrato = this.analisis.buscarAnalisisSustratoPorID(material[0].analisis);
        if (!this.analisisSustrato.resultado.resultado) {
          this.analisisSustrato.resultado.pendiente = undefined;
        }
      }
    } else if (grupo.nombre === 'Tintas' || grupo.nombre === 'Barniz s/impresión') {
      this.Tinta = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisPorID(material[0].analisis)) {
        this.Analisis = this.analisis.buscarAnalisisPorID(material[0].analisis);
        if (!this.Analisis.resultado.resultado) {
          this.Analisis.resultado.pendiente = undefined;
        }
      }
    } else if (grupo.nombre === 'Cajas Corrugadas') {
      this.Caja = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisCajasPorID(material[0].analisis)) {
        this.AnalisisCajas = this.analisis.buscarAnalisisCajasPorID(material[0].analisis);
      }
    } else if (grupo.nombre === 'Soportes de Embalaje') {
      this.pads = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisPadsPorID(material[0].analisis)) {
        this.analisisPads = this.analisis.buscarAnalisisPadsPorID(material[0].analisis);
      }
    } else {
      this.otro = true;
      this.Recepcion_selected = recepcion;
      this.Material_selected = material;
      this.index_material = index_material;
      if (this.analisis.buscarAnalisisOtrosPorID(material[0].analisis)) {
        this.AnalisisOtro = this.analisis.buscarAnalisisOtrosPorID(material[0].analisis);
      }
    }
  }

  abrirEtiquetas(material: any, recepcion: any) {
    this.informacion = material;
    this.recepcion_ = recepcion;
    this.mostrarEtiquetas = true;
  }

  setFilter(mode: string) {
    this.filterMode = mode;
    this.grupo_selected = '';
    this.material_selected = '';
    this.lote_selected = '';
    this.desde = '';
    this.hasta = '';
    this.fabricante_selected = '';
    this.Materiales = [];
  }

  buscarPorFabricante() {
    this.currentPage = 1;
    if (!this.fabricante_selected) return;
    this.Materiales = [];
    for (const recepcion of this.recepciones.recepciones || []) {
      if (recepcion.status !== 'En observacion') continue;
      for (const grupoMateriales of recepcion.materiales) {
        const mat = grupoMateriales[0];
        if (mat?.material?.fabricante?.alias?.toLowerCase().includes(this.fabricante_selected.toLowerCase())) {
          this.Materiales.push({ material: grupoMateriales, Recepcion: recepcion });
        }
      }
    }
    if (this.Materiales.length > 0) this.MostrarBusquedad();
  }

  reset() {
    if (this.tipo_de_busqueda !== 'grupo') {
      this.grupo_selected = '';
      this.material_selected = '';
    }
    if (this.tipo_de_busqueda !== 'lote') {
      this.lote_selected = '';
    }
    if (this.tipo_de_busqueda !== 'fecha') {
      this.desde = '';
      this.hasta = '';
    }
  }

  buscar_() {
    this.currentPage = 1;
    if (this.grupo_selected) {
      this.Materiales = this.recepciones.filtrarMaterialesPorGrupoYAnalisis(
        this.grupo_selected,
        this.material_selected,
      );
    }
    if (this.lote_selected) {
      this.Materiales = this.recepciones.filtrarMaterialesPorLoteYAnalisis(this.lote_selected);
    }
    if (this.desde && this.hasta) {
      if (this.hasta < this.desde) {
        Swal.fire({
          showConfirmButton: false,
          icon: 'error',
          text: 'Debes ingresar un lapso de fechas validas',
          toast: true,
          timerProgressBar: true,
          timer: 5000,
          position: 'top-end',
        });
      } else {
        this.Materiales = this.recepciones.filtrarMaterialesporFecha(Date.parse(this.desde), Date.parse(this.hasta));
      }
    }
  }

  MostrarBusquedad() {
    this.Busqueda = true;
  }

  MostrarDesdeBusqueda(e: any) {
    this.Busqueda = false;
    this.Analizar(e[0], e[1], e[2], e[3]);
  }

  cerrarModal(tipo: string) {
    (this as any)[tipo] = false;
  }

  cerrarConMensaje() {
    this.Caja = false;
    this.pads = false;
    this.otro = false;
    setTimeout(() => {
      Swal.fire({
        title: this.analisis.mensaje?.mensaje,
        icon: this.analisis.mensaje?.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }

  Cerrar() {
    this.Tinta = false;
    setTimeout(() => {
      Swal.fire({
        title: this.analisis.mensaje?.mensaje,
        icon: this.analisis.mensaje?.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }

  Cerrar_tinta() {
    this.Sustrato = false;
    setTimeout(() => {
      Swal.fire({
        title: this.analisis.mensaje?.mensaje,
        icon: this.analisis.mensaje?.icon,
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
      });
    }, 1000);
  }
}
