import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CargosService } from 'src/app/services/cargos.service';
import { DepartamentosService } from 'src/app/services/departamentos.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import { TasasService } from 'src/app/services/tasas.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-trabajador',
  standalone: false,
  templateUrl: './nuevo-trabajador.component.html',
  styleUrls: ['./nuevo-trabajador.component.scss'],
})
export class NuevoTrabajadorComponent implements OnInit, OnChanges {
  constructor(
    private http: HttpClient,
    public departamentos: DepartamentosService,
    public cargos: CargosService,
    public api: TrabajadoresService,
    public imagenes: SubirArchivosService,
    public tasas: TasasService,
  ) {}

  @Input() nuevo_trabajador: any;
  @Input() trabajador: any;
  @Input() referencias: any;
  @Input() carga: any;
  @Input() emergencias: any;
  @Input() cursos_realizados: any;
  @Input() softwares: any;
  @Output() onCloseModal = new EventEmitter();

  public idiomas: any = [];
  public trabajoAnterior: any = [];

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
    this.cargarEstados();
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trabajador']) {
      const foto = this.trabajador?.datos_personales?.foto;
      if (foto && foto !== 'no-image') {
        this.fotoPreview = `${environment.imgUrl}/imagen/empleado/${foto}`;
      } else {
        this.fotoPreview = null;
      }
      this.normalizarContratacion();
    }
    // Recargar estados y tasa cada vez que se abre el modal
    if (changes['nuevo_trabajador'] && changes['nuevo_trabajador'].currentValue === true) {
      this.cargarEstados();
      this.tasas.obtenerTasaActual();
      this.tasas.tasaActual$.subscribe((tasa) => {
        this.tasaActual = tasa?.tasa ?? null;
        this.tasaRequiereManual = tasa?.manual ?? true;
        if (this.tasaActual && !this.trabajador?.contratacion?.tasa) {
          this.trabajador.contratacion.tasa = this.tasaActual;
        }
      });
    }
  }

  normalizarContratacion(): void {
    if (!this.trabajador) return;

    // Asegurar que la fecha se pueda mostrar en input type="date"
    const fecha = this.trabajador.contratacion?.fecha;
    if (fecha && typeof fecha === 'string' && fecha.includes('T')) {
      this.trabajador.contratacion.fecha = fecha.split('T')[0];
    }

    // Normalizar "De" vacío a null para indicar departamento/directo
    if (this.trabajador.contratacion?.de === '6696bc0c3b59a8877b99bf36') {
      this.trabajador.contratacion.de = '';
    }
  }

  get fechaIngresoInput(): string {
    const fecha = this.trabajador?.contratacion?.fecha;
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha.split('T')[0];
    const d = new Date(fecha);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  set fechaIngresoInput(value: string) {
    if (this.trabajador?.contratacion) {
      this.trabajador.contratacion.fecha = value;
    }
  }

  get tasaRegistro(): number {
    return this.trabajador?.contratacion?.tasa || this.tasaActual || 0;
  }

  get sueldoBs(): number {
    const sueldo = this.trabajador?.contratacion?.sueldo;
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
    const historial = (this.api.contrataciones || [])
      .filter((c: any) => c.trabajador === this.trabajador?._id || c.trabajador?._id === this.trabajador?._id)
      .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Mostrar fila del contrato que se está creando/editando solo para empleados nuevos
    if (!this.trabajador?._id) {
      const actual = this.filaContratoActual;
      if (actual) return [actual, ...historial];
    }

    return historial;
  }

  get filaContratoActual(): any | null {
    const c = this.trabajador?.contratacion;
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

  guardarTasaManual(): void {
    if (this.tasaManual && this.tasaManual > 0) {
      this.tasas.guardarTasa(this.tasaManual);
      this.trabajador.contratacion.tasa = this.tasaManual;
      this.tasaRequiereManual = false;
    }
  }

  cerrar() {
    this.onCloseModal.emit();
  }

  formatCedula(event: any) {
    const regex = /^[VE]-?\d{0,8}$/; // Expresión regular actualizada
    const newValue = event.target.value.toUpperCase();

    if (!regex.test(newValue)) {
      this.CI = newValue.substring(0, newValue.length - 1);
    } else {
      // Agregar guiones automáticamente
      const formattedValue = newValue.replace(/(\d{0})(\d{8})/, '$1-$2');
      this.trabajador.datos_personales.cedula = this.CI;
      this.CI = formattedValue; // Establecer el valor formateado n el campo de input
    }
  }

  BuscarMunicipio(e) {
    const dividir = e.value.split('-');
    this.trabajador.datos_personales.estado = dividir[1];
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
    this.trabajador.datos_personales.municipio = dividir[1];
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
    const apellidos = (this.trabajador?.datos_personales?.apellidos || '').trim();
    const nombres = (this.trabajador?.datos_personales?.nombres || '').trim();

    this.erroresPaso1.apellidos = apellidos === '';
    this.erroresPaso1.nombres = nombres === '';

    return !this.erroresPaso1.apellidos && !this.erroresPaso1.nombres;
  }

  goToStep(n: number) {
    if (n >= 1 && n <= this.steps.length) {
      // Solo validar al avanzar del paso 1 al 2
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
    this.trabajador.informacion_adicional.referencias = this.referencias;
    this.trabajador.informacion_adicional.carga_familiar = this.carga;
    this.trabajador.informacion_adicional.emergencia = this.emergencias;
    this.trabajador.instruccion_academica.cursos = this.cursos_realizados;
    this.trabajador.instruccion_academica.idiomas.idiomas = this.idiomas;
    this.trabajador.manejo_herramientas.otros = this.softwares;
    this.trabajador.manejo_herramientas.referencias = this.trabajoAnterior;

    // Normalizar "De" vacío a null para indicar empleado directo del departamento
    if (this.trabajador.contratacion?.de === '') {
      this.trabajador.contratacion.de = null;
    }

    // Asegurar que la tasa de registro esté presente
    if (!this.trabajador.contratacion.tasa) {
      this.trabajador.contratacion.tasa = this.tasaActual || this.tasaManual || 0;
    }

    this.api.nuevoTrabajador(this.trabajador);
    setTimeout(() => {
      this.trabajador = {
        datos_personales: {
          apellidos: '',
          nombres: '',
          cedula: '',
          fecha_nac: '',
          altura: '',
          peso: '',
          sexo: '',
          nacimiento: '',
          nacionalidad: '',
          estado_civil: '',
          licencia: '',
          grado: '',
          rif: '',
          email: '',
          estado: '',
          municipio: '',
          parroquia: '',
          sector: '',
          domicilio: '',
          telefono: '',
          celular: '',
        },
        informacion_adicional: {
          referencias: [],
          carga_familiar: [],
          emergencia: [],
        },
        instruccion_academica: {
          grado: {
            instruccion: '',
            ano: '',
            titulo: '',
          },
          cursos: [],
          idiomas: {
            idiomas: [],
          },
        },
        manejo_herramientas: {
          computadora: false,
          softwares: {
            word: false,
            excel: false,
            power_point: false,
            acrobat: false,
          },
          otros: [],
          referencias: [],
        },
        contratacion: {
          fecha: '',
          departamento: '',
          cargo: '',
          de: '',
          sueldo: '',
        },
      };
      this.referencias = [];
      this.carga = [];
      this.emergencias = [];
      this.cursos_realizados = [];
      this.idiomas = [];
      this.softwares = [];
      this.trabajoAnterior = [];
      Swal.fire({
        text: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        position: 'top-end',
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        timer: 5000,
      });
      this.cerrar();
    }, 500);
  }

  // Función para actualizar el objeto 'softwares' cuando cambia un checkbox
  updateSoftwares() {
    // Obtener referencias a los elementos del DOM
    const wordCheckbox: any = document.getElementById('wordCheckbox');
    const excelCheckbox: any = document.getElementById('excelCheckbox');
    const powerPointCheckbox: any = document.getElementById('powerPointCheckbox');
    const acrobatCheckbox: any = document.getElementById('acrobatCheckbox');

    this.trabajador.manejo_herramientas.softwares.word = wordCheckbox.checked;
    this.trabajador.manejo_herramientas.softwares.excel = excelCheckbox.checked;
    this.trabajador.manejo_herramientas.softwares.power_point = powerPointCheckbox.checked;
    this.trabajador.manejo_herramientas.softwares.acrobat = acrobatCheckbox.checked;
  }

  onFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      this.imagenes.actualizarFoto(file, 'empleado', 'EMPLEADOS').then((img) => {
        this.trabajador.datos_personales.foto = img;
      });
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  public subAreas: any = [];

  buscarSubArea(e) {
    this.subAreas = this.departamentos.buscarSubUnidad(e.value);
  }
}
