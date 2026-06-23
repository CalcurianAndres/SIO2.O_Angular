/**
 * Trabajador — Modelo de dominio del empleado.
 * Estructura completa anidada que se persiste en MongoDB.
 * Cualquier cambio aquí DEBE reflejarse en el backend (models/trabajador.js).
 */

export interface DatosPersonales {
  apellidos: string;
  nombres: string;
  cedula: string;
  fecha_nac: string;
  altura: string;
  peso: string;
  sexo: string;
  nacimiento: string;
  nacionalidad: string;
  estado_civil: string;
  licencia: string;
  grado: string;
  rif: string;
  email: string;
  estado: string;
  municipio: string;
  parroquia: string;
  sector: string;
  domicilio: string;
  telefono: string;
  celular: string;
  foto: string;
}

export interface Referencia {
  apellidos: string;
  nombres: string;
  nombre: string;
  direccion: string;
  telefono: string;
  ocupacion: string;
}

export interface CargaFamiliar {
  parentesco: string;
  apellidos: string;
  nombres: string;
  nombre: string;
  fecha: string;
}

export interface Emergencia {
  parentesco: string;
  apellidos: string;
  nombres: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface InformacionAdicional {
  referencias: Referencia[];
  carga_familiar: CargaFamiliar[];
  emergencia: Emergencia[];
}

export interface GradoAcademico {
  instruccion: string;
  ano: string;
  titulo: string;
}

export interface Curso {
  nombre: string;
  periodo: string;
}

export interface Idioma {
  idioma: string;
  nivel: string;
}

export interface IdiomasBloque {
  idiomas: Idioma[];
}

export interface InstruccionAcademica {
  grado: GradoAcademico;
  cursos: Curso[];
  idiomas: IdiomasBloque;
}

export interface SoftwaresBloque {
  word: boolean;
  excel: boolean;
  power_point: boolean;
  acrobat: boolean;
}

export interface TrabajoAnterior {
  empresa: string;
  periodo: string;
  cargo: string;
  remuneracion: string;
  motivo: string;
}

export interface ManejoHerramientas {
  computadora: boolean | string;
  softwares: SoftwaresBloque;
  otros: string[];
  referencias: TrabajoAnterior[];
}

export interface Contratacion {
  fecha: string;
  departamento: string;
  cargo: string;
  de: string | null;
  sueldo: string;
  tasa?: number | null;
  subUnidadTemp?: string;
}

export interface Trabajador {
  _id?: string;
  datos_personales: DatosPersonales;
  informacion_adicional: InformacionAdicional;
  instruccion_academica: InstruccionAcademica;
  manejo_herramientas: ManejoHerramientas;
  contratacion: Contratacion;
}

/**
 * Plantilla inmutable del Trabajador vacío.
 * Se usa como base para `createEmptyTrabajador()` y nunca debe mutarse.
 */
export const EMPTY_TRABAJADOR_TEMPLATE: Trabajador = Object.freeze({
  datos_personales: Object.freeze({
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
    foto: '',
  }),
  informacion_adicional: Object.freeze({
    referencias: [] as unknown as Referencia[],
    carga_familiar: [] as unknown as CargaFamiliar[],
    emergencia: [] as unknown as Emergencia[],
  }),
  instruccion_academica: Object.freeze({
    grado: Object.freeze({ instruccion: '', ano: '', titulo: '' }),
    cursos: [] as unknown as Curso[],
    idiomas: Object.freeze({ idiomas: [] as unknown as Idioma[] }),
  }),
  manejo_herramientas: Object.freeze({
    computadora: false,
    softwares: Object.freeze({ word: false, excel: false, power_point: false, acrobat: false }),
    otros: [] as unknown as string[],
    referencias: [] as unknown as TrabajoAnterior[],
  }),
  contratacion: Object.freeze({
    fecha: '',
    departamento: '',
    cargo: '',
    de: '',
    sueldo: '',
    tasa: null,
    subUnidadTemp: '',
  }),
}) as unknown as Trabajador;

/**
 * Factory function: crea una instancia fresca del Trabajador vacío.
 * Usa structuredClone cuando está disponible (Node 17+ / navegadores modernos),
 * con fallback a JSON.parse(JSON.stringify(...)) para entornos legacy.
 * Esto garantiza que cada "Nuevo empleado" obtenga una referencia de objeto
 * nueva, evitando el "ghost data" del empleado previamente editado.
 */
export function createEmptyTrabajador(): Trabajador {
  const clone = (input: unknown): unknown => {
    if (typeof structuredClone === 'function') {
      return structuredClone(input);
    }
    return JSON.parse(JSON.stringify(input));
  };
  return clone(EMPTY_TRABAJADOR_TEMPLATE) as unknown as Trabajador;
}
