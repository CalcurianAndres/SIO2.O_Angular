import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CargosService } from 'src/app/services/cargos.service';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import { TasasService } from 'src/app/services/tasas.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { TasaCambioService } from 'src/app/services/tasa-cambio.service';

@Component({
  selector: 'app-editar-trabajador',
  standalone: false,
  templateUrl: './editar-trabajador.component.html',
  styleUrls: ['./editar-trabajador.component.scss'],
})
export class EditarTrabajadorComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public departamentos: DepartamentosService,
    public cargos: CargosService,
    public api: TrabajadoresService,
    public imagenes: SubirArchivosService,
    public tasas: TasasService,
    public tasaCambio: TasaCambioService,
  ) {}

  @Input() empleado: any;
  @Output() onCloseModal = new EventEmitter();

  public copiaInterna: any;
  public idiomas: any = [];
  public trabajoAnterior: any = [];
  public referencias: any = [];
  public carga: any = [];
  public emergencias: any = [];
  public cursos_realizados: any = [];
  public softwares: any = [];

  public CI = 'V-';
  public estados: any = [];
  public Municipio;
  public Parroquia;

  public estado = '';
  public municipio = '';
  public parroquia = '';

  steps = [
    { num: 1, label: 'Datos personales', icon: 'fa-user' },
    { num: 2, label: 'Referencias', icon: 'fa-user-friends' },
    { num: 3, label: 'Cargas familiares', icon: 'fa-users' },
    { num: 4, label: 'Instrucción académica', icon: 'fa-user-graduate' },
    { num: 5, label: 'Función en la empresa', icon: 'fa-user-tie' },
  ];
  currentStep: number = 1;
  fotoPreview: string | null = null;
  tasaActual: number | null = null;
  tasaManual: number | null = null;
  tasaRequiereManual: boolean = false;
  tasaSubscription: Subscription = new Subscription();
  tasaLoading: boolean = false;
  tasaError: string | null = null;

  erroresPaso1 = {
    apellidos: false,
    nombres: false,
  };

  public REFERENCIA = {
    apellidos: '',
    nombres: '',
    direccion: '',
    telefono: '',
    ocupacion: '',
  };

  public CARGA_FAMILIAR = {
    parentesco: '',
    apellidos: '',
    nombres: '',
    fecha: '',
  };

  public EMERGENCIA = {
    parentesco: '',
    apellidos: '',
    nombres: '',
    direccion: '',
    telefono: '',
  };

  public CURSO = {
    nombre: '',
    periodo: '',
  };

  public IDIOMA = {
    idioma: '',
    nivel: '',
  };

  public SOFTWARE = '';

  public TRABAJOS_ANTERIORES = {
    empresa: '',
    periodo: '',
    cargo: '',
    remuneracion: '',
    motivo: '',
  };

  ngOnInit(): void {
    if (this.empleado) {
      this.copiaInterna = JSON.parse(JSON.stringify(this.empleado));
      this.referencias = JSON.parse(JSON.stringify(this.empleado.informacion_adicional?.referencias || []));
      this.carga = JSON.parse(JSON.stringify(this.empleado.informacion_adicional?.carga_familiar || []));
      this.emergencias = JSON.parse(JSON.stringify(this.empleado.informacion_adicional?.emergencia || []));
      this.cursos_realizados = JSON.parse(JSON.stringify(this.empleado.instruccion_academica?.cursos || []));
      this.softwares = JSON.parse(JSON.stringify(this.empleado.manejo_herramientas?.otros || []));
      this.idiomas = JSON.parse(JSON.stringify(this.empleado.instruccion_academica?.idiomas?.idiomas || []));
      this.trabajoAnterior = JSON.parse(JSON.stringify(this.empleado.manejo_herramientas?.referencias || []));
      this.cargarEstados();
      const foto = this.copiaInterna?.datos_personales?.foto;
      if (foto && foto !== 'no-image') {
        this.fotoPreview = `${environment.imgUrl}/imagen/empleado/${foto}`;
      } else {
        this.fotoPreview = null;
      }
      this.normalizarContratacion();
      this.obtenerTasa();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['empleado'] && changes['empleado'].currentValue) {
      this.copiaInterna = JSON.parse(JSON.stringify(changes['empleado'].currentValue));
      this.referencias = JSON.parse(
        JSON.stringify(changes['empleado'].currentValue.informacion_adicional?.referencias || []),
      );
      this.carga = JSON.parse(
        JSON.stringify(changes['empleado'].currentValue.informacion_adicional?.carga_familiar || []),
      );
      this.emergencias = JSON.parse(
        JSON.stringify(changes['empleado'].currentValue.informacion_adicional?.emergencia || []),
      );
      this.cursos_realizados = JSON.parse(
        JSON.stringify(changes['empleado'].currentValue.instruccion_academica?.cursos || []),
      );
      this.softwares = JSON.parse(
        JSON.stringify(changes['empleado'].currentValue.manejo_herramientas?.otros || []),
      );
      this.idiomas = JSON.parse(
        JSON.stringify(changes['empleado'].currentValue.instruccion_academica?.idiomas?.idiomas || []),
      );
      this.trabajoAnterior = JSON.parse(
        JSON.stringify(changes['empleado'].currentValue.manejo_herramientas?.referencias || []),
      );
      const foto = this.copiaInterna?.datos_personales?.foto;
      if (foto && foto !== 'no-image') {
        this.fotoPreview = `${environment.imgUrl}/imagen/empleado/${foto}`;
      } else {
        this.fotoPreview = null;
      }
      this.normalizarContratacion();
    }
  }

  cargarEstados() {
    this.http
      .get(`${environment.apiUrl}/external`, {
        params: { url: 'http://api.geonames.org/childrenJSON?geonameId=3625428&username=poligrafica' },
      })
      .subscribe({
        next: (response: any) => {
          this.estados = response.geonames;
        },
        error: (err) => {
          console.error('Error al cargar estados:', err);
          this.estados = [];
        },
      });
  }

  obtenerTasa(): void {
    this.tasaLoading = true;
    this.tasaError = null;

    this.http
      .get(`${environment.apiUrl}/external`, {
        params: { url: 'https://ve.dolarapi.com/v1/dolares/oficial' },
      })
      .subscribe({
        next: (response: any) => {
          const tasa = response?.promedio ?? response?.tasa ?? response?.rate;
          if (typeof tasa === 'number' && tasa > 0) {
            this.tasaActual = tasa;
            this.tasaRequiereManual = false;
            this.tasaLoading = false;
            if (this.copiaInterna?.contratacion) {
              this.copiaInterna.contratacion.tasa = this.tasaActual;
            }
          } else {
            this.fallbackTasaSocket();
          }
        },
        error: () => {
          this.fallbackTasaSocket();
        },
      });
  }

  private fallbackTasaSocket(): void {
    this.tasas.obtenerTasaActual();
    this.tasaSubscription.unsubscribe();
    this.tasaSubscription = this.tasas.tasaActual$.subscribe((tasa) => {
      if (tasa?.tasa) {
        this.tasaActual = tasa.tasa;
        this.tasaRequiereManual = false;
        this.tasaLoading = false;
        if (this.copiaInterna?.contratacion) {
          this.copiaInterna.contratacion.tasa = this.tasaActual;
        }
        return;
      }
      this.tasaLoading = false;
      this.tasaRequiereManual = true;
      this.tasaError = 'No se pudo obtener la tasa automática. Ingrésela manualmente.';
    });
  }

  ngOnDestroy(): void {
    this.tasaSubscription.unsubscribe();
  }

  normalizarContratacion(): void {
    if (!this.copiaInterna) return;

    const fecha = this.copiaInterna.contratacion?.fecha;
    if (fecha && typeof fecha === 'string' && fecha.includes('T')) {
      this.copiaInterna.contratacion.fecha = fecha.split('T')[0];
    }

    if (this.copiaInterna.contratacion?.de === '6696bc0c3b59a8877b99bf36') {
      this.copiaInterna.contratacion.de = '';
    }

    const deAreaId = this.copiaInterna.contratacion?.de;

    if (!deAreaId) {
      if (this.copiaInterna.contratacion?.departamento) {
        const deptoId = this.copiaInterna.contratacion.departamento;
        const todas = this.departamentos.buscarSubUnidad(deptoId);
        this.subUnidadesDisponibles = todas.filter((x: any) => x.sup === '#');
      } else {
        this.subUnidadesDisponibles = [];
      }
      this.subAreas = [];
      this.subUnidadSeleccionada = null;
      this.copiaInterna.contratacion.subUnidadTemp = '';
      return;
    }

    const areaSeleccionada = this.departamentos.subunidad.find((x: any) => String(x._id) === String(deAreaId));
    if (!areaSeleccionada) {
      this.subUnidadesDisponibles = [];
      this.subAreas = [];
      this.subUnidadSeleccionada = null;
      return;
    }

    const depto = this.departamentos.departamentos.find((d: any) => d.nombre === areaSeleccionada.departamento);
    if (depto) {
      this.copiaInterna.contratacion.departamento = depto._id;
      const todas = this.departamentos.buscarSubUnidad(depto._id);
      this.subUnidadesDisponibles = todas.filter((x: any) => x.sup === '#');

      if (areaSeleccionada.sup === '#') {
        this.subUnidadSeleccionada = areaSeleccionada;
        this.subAreas = todas.filter((x: any) => x.sup === this.subUnidadSeleccionada.nombre);
      } else {
        const padre = this.departamentos.subunidad.find((x: any) => x.nombre === areaSeleccionada.sup);
        if (padre) {
          this.subUnidadSeleccionada = padre;
          this.subAreas = todas.filter((x: any) => x.sup === this.subUnidadSeleccionada.nombre);
        }
      }
    }
  }

  get fechaIngresoInput(): string {
    const fecha = this.copiaInterna?.contratacion?.fecha;
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha.split('T')[0];
    const d = new Date(fecha);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  set fechaIngresoInput(value: string) {
    if (this.copiaInterna?.contratacion) {
      this.copiaInterna.contratacion.fecha = value;
    }
  }

  get tasaRegistro(): number {
    return this.copiaInterna?.contratacion?.tasa || this.tasaActual || 0;
  }

  get sueldoBs(): number {
    const sueldo = this.copiaInterna?.contratacion?.sueldo;
    if (!sueldo) return 0;
    return parseFloat(String(sueldo).replace(/[^0-9.]/g, '')) || 0;
  }

  get sueldoUSDRegistro(): number {
    const tasa = this.tasaRegistro;
    if (!tasa || tasa <= 0) return 0;
    return this.sueldoBs / tasa;
  }

  get sueldoUSDActual(): number {
    const tasa = this.tasaActual || this.tasaRegistro;
    if (!tasa || tasa <= 0) return 0;
    return this.sueldoBs / tasa;
  }

  get devaluacionSalarial(): number {
    const original = this.sueldoUSDRegistro;
    const actual = this.sueldoUSDActual;
    if (!original || original <= 0 || !actual || actual <= 0) return 0;
    return ((original - actual) / original) * 100;
  }

  get historialContrataciones(): any[] {
    if (!this.copiaInterna?._id) {
      return [];
    }

    return (this.api.contrataciones || [])
      .filter((c: any) => c.trabajador === this.copiaInterna._id || c.trabajador?._id === this.copiaInterna._id)
      .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  get filaContratoActual(): any | null {
    const c = this.copiaInterna?.contratacion;
    if (!c || !c.fecha || !c.sueldo) return null;

    return {
      fecha: c.fecha,
      departamento: { nombre: this.getNombreDepartamento(c.departamento) },
      cargo: { nombre: this.getNombreCargo(c.cargo) },
      de: c.de ? { nombre: this.getNombreDepartamento(c.de) } : null,
      sueldo: c.sueldo,
      tasa: c.tasa,
      activo: true,
    };
  }

  getNombreDepartamento(id: string): string {
    const d = this.departamentos?.departamentos?.find((x: any) => String(x._id) === String(id));
    return d?.nombre || '-';
  }

  getNombreCargo(id: string): string {
    const c = this.cargos?.cargos?.find((x: any) => String(x._id) === String(id));
    return c?.nombre || '-';
  }

  calcularUSDHoy(sueldo: any): number {
    const tasa = this.tasaActual || this.tasaManual || 0;
    const s = parseFloat(String(sueldo).replace(/[^0-9.]/g, '')) || 0;
    if (!tasa || tasa <= 0 || !s || s <= 0) return 0;
    return s / tasa;
  }

  calcularDevaluacion(sueldo: any, tasaRegistro: any): number {
    const s = parseFloat(String(sueldo).replace(/[^0-9.]/g, '')) || 0;
    const tr = parseFloat(String(tasaRegistro).replace(/[^0-9.]/g, '')) || 0;
    if (!s || !tr || tr <= 0) return 0;
    const usdHistorico = s / tr;
    const usdHoy = this.calcularUSDHoy(sueldo);
    if (!usdHistorico || !usdHoy) return 0;
    return ((usdHistorico - usdHoy) / usdHistorico) * 100;
  }

  getClaseDevaluacion(devaluacion: number): string {
    if (devaluacion >= 20) return 'is-danger';
    if (devaluacion >= 10) return 'is-warning';
    return 'is-success';
  }

  guardarTasaManual(): void {
    if (this.tasaManual && this.tasaManual > 0) {
      this.tasas.guardarTasa(this.tasaManual);
      this.tasaActual = this.tasaManual;
      this.copiaInterna.contratacion.tasa = this.tasaManual;
      this.tasaRequiereManual = false;
      Swal.fire({
        icon: 'success',
        title: 'Tasa guardada',
        text: `Tasa de ${this.tasaManual} Bs/USD guardada correctamente`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  cerrar() {
    this.onCloseModal.emit();
  }

  formatCedula(event: any) {
    const regex = /^[VE]-?\d{0,8}$/;
    const newValue = event.target.value.toUpperCase();

    if (!regex.test(newValue)) {
      this.CI = newValue.substring(0, newValue.length - 1);
    } else {
      const formattedValue = newValue.replace(/(\d{0})(\d{8})/, '$1-$2');
      this.copiaInterna.datos_personales.cedula = this.CI;
      this.CI = formattedValue;
    }
  }

  BuscarMunicipio(e) {
    const dividir = e.value.split('-');
    this.copiaInterna.datos_personales.estado = dividir[1];
    this.http
      .get(`${environment.apiUrl}/external`, {
        params: { url: `http://api.geonames.org/childrenJSON?geonameId=${dividir[0]}&username=poligrafica` },
      })
      .subscribe({
        next: (response: any) => {
          this.Municipio = response.geonames;
        },
        error: (err) => {
          console.error('Error al cargar municipios:', err);
          this.Municipio = [];
        },
      });
  }

  BuscarParroquia(e) {
    const dividir = e.value.split('-');
    this.copiaInterna.datos_personales.municipio = dividir[1];
    this.http
      .get(`${environment.apiUrl}/external`, {
        params: { url: `http://api.geonames.org/childrenJSON?geonameId=${dividir[0]}&username=poligrafica` },
      })
      .subscribe({
        next: (response: any) => {
          this.Parroquia = response.geonames;
        },
        error: (err) => {
          console.error('Error al cargar parroquias:', err);
          this.Parroquia = [];
        },
      });
  }

  isStep(step: number): boolean {
    return this.currentStep === step;
  }

  validarPaso1(): boolean {
    const apellidos = (this.copiaInterna?.datos_personales?.apellidos || '').trim();
    const nombres = (this.copiaInterna?.datos_personales?.nombres || '').trim();

    this.erroresPaso1.apellidos = apellidos === '';
    this.erroresPaso1.nombres = nombres === '';

    return !this.erroresPaso1.apellidos && !this.erroresPaso1.nombres;
  }

  goToStep(n: number) {
    if (n >= 1 && n <= this.steps.length) {
      if (this.currentStep === 1 && n === 2 && !this.validarPaso1()) {
        return;
      }
      this.currentStep = n;
    }
  }

  private concatenarNombre(apellidos: string, nombres: string): string {
    return `${apellidos || ''} ${nombres || ''}`.trim();
  }

  addReferencia() {
    this.referencias.push({
      ...this.REFERENCIA,
      nombre: this.concatenarNombre(this.REFERENCIA.apellidos, this.REFERENCIA.nombres),
    });
    this.REFERENCIA = {
      apellidos: '',
      nombres: '',
      direccion: '',
      telefono: '',
      ocupacion: '',
    };
  }

  addCarga() {
    this.carga.push({
      ...this.CARGA_FAMILIAR,
      nombre: this.concatenarNombre(this.CARGA_FAMILIAR.apellidos, this.CARGA_FAMILIAR.nombres),
    });
    this.CARGA_FAMILIAR = {
      parentesco: '',
      apellidos: '',
      nombres: '',
      fecha: '',
    };
  }

  addEmergencia() {
    this.emergencias.push({
      ...this.EMERGENCIA,
      nombre: this.concatenarNombre(this.EMERGENCIA.apellidos, this.EMERGENCIA.nombres),
    });
    this.EMERGENCIA = {
      parentesco: '',
      apellidos: '',
      nombres: '',
      direccion: '',
      telefono: '',
    };
  }

  addCurso() {
    this.cursos_realizados.push(this.CURSO);
    this.CURSO = {
      nombre: '',
      periodo: '',
    };
  }

  addIdioma() {
    this.idiomas.push(this.IDIOMA);
    this.IDIOMA = {
      idioma: '',
      nivel: '',
    };
  }

  addSoftware() {
    this.softwares.push(this.SOFTWARE);
    this.SOFTWARE = '';
  }

  addTrabajoAnterior() {
    this.trabajoAnterior.push(this.TRABAJOS_ANTERIORES);
    this.TRABAJOS_ANTERIORES = {
      empresa: '',
      periodo: '',
      cargo: '',
      remuneracion: '',
      motivo: '',
    };
  }

  guardar_trabajo() {
    this.copiaInterna.informacion_adicional.referencias = this.referencias;
    this.copiaInterna.informacion_adicional.carga_familiar = this.carga;
    this.copiaInterna.informacion_adicional.emergencia = this.emergencias;
    this.copiaInterna.instruccion_academica.cursos = this.cursos_realizados;
    this.copiaInterna.instruccion_academica.idiomas.idiomas = this.idiomas;
    this.copiaInterna.manejo_herramientas.otros = this.softwares;
    this.copiaInterna.manejo_herramientas.referencias = this.trabajoAnterior;

    if (this.copiaInterna.contratacion?.de === '') {
      this.copiaInterna.contratacion.de = null;
    }

    if (!this.copiaInterna.contratacion.tasa) {
      this.copiaInterna.contratacion.tasa = this.tasaActual || this.tasaManual || 0;
    }

    this.api.nuevoTrabajador(this.copiaInterna);
    setTimeout(() => {
      this.cerrar();
    }, 500);
  }

  updateSoftwares() {
    const wordCheckbox: any = document.getElementById('wordCheckbox');
    const excelCheckbox: any = document.getElementById('excelCheckbox');
    const powerPointCheckbox: any = document.getElementById('powerPointCheckbox');
    const acrobatCheckbox: any = document.getElementById('acrobatCheckbox');

    this.copiaInterna.manejo_herramientas.softwares.word = wordCheckbox.checked;
    this.copiaInterna.manejo_herramientas.softwares.excel = excelCheckbox.checked;
    this.copiaInterna.manejo_herramientas.softwares.power_point = powerPointCheckbox.checked;
    this.copiaInterna.manejo_herramientas.softwares.acrobat = acrobatCheckbox.checked;
  }

  onFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      this.imagenes.actualizarFoto(file, 'empleado', 'EMPLEADOS').then((img) => {
        this.copiaInterna.datos_personales.foto = img;
      });
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  public subUnidadesDisponibles: any = [];
  public subAreas: any = [];
  public subUnidadSeleccionada: any = null;

  buscarSubUnidades(e) {
    const deptoId = e.value;
    if (!deptoId) {
      this.subUnidadesDisponibles = [];
      this.subAreas = [];
      this.subUnidadSeleccionada = null;
      return;
    }
    const todas = this.departamentos.buscarSubUnidad(deptoId);
    this.subUnidadesDisponibles = todas.filter((x: any) => x.sup === '#');
    this.subAreas = [];
    this.subUnidadSeleccionada = null;
  }

  onSubUnidadChange(e) {
    const subUnidadId = e.value;
    if (!subUnidadId) {
      this.subAreas = [];
      this.subUnidadSeleccionada = null;
      this.copiaInterna.contratacion.de = null;
      return;
    }
    this.subUnidadSeleccionada = this.subUnidadesDisponibles.find((x: any) => x._id === subUnidadId) || null;
    if (!this.subUnidadSeleccionada) return;
    const depto = this.departamentos.departamentos.find(
      (d: any) => d._id === this.copiaInterna.contratacion.departamento,
    );
    if (!depto) return;
    this.subAreas = this.departamentos.subunidad.filter(
      (x: any) => x.departamento === depto.nombre && x.sup === this.subUnidadSeleccionada.nombre,
    );
    this.copiaInterna.contratacion.subUnidadTemp = subUnidadId;
    this.copiaInterna.contratacion.de = subUnidadId;
  }

  onSubAreaChange(e) {
    const areaId = e.value;
    if (!areaId) {
      if (this.subUnidadSeleccionada) {
        this.copiaInterna.contratacion.de = this.subUnidadSeleccionada._id;
      }
      return;
    }
    this.copiaInterna.contratacion.de = areaId;
  }

  buscarSubArea(e) {
    this.subAreas = this.departamentos.buscarSubUnidad(e.value);
  }
}
