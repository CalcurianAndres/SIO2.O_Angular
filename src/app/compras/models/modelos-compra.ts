import { SweetAlertIcon } from 'sweetalert2';

export class Origenes {
  constructor(
    public pais: string,
    public estado: string,
  ) {}
}

export class Grupo {
  constructor(
    public nombre: string,
    public trato?: boolean,
    public icono?: string,
    public parcial?: boolean,
    public otro?: boolean,
    public _id?: string,
  ) {}
}

export class Fabricante {
  constructor(
    public nombre: string,
    public alias: string,
    public origenes: Array<Origenes>,
    public grupo: any,
    public _id: string,
    public proveedor: boolean,
  ) {}
}

export class Fabricante_populated {
  constructor(
    public nombre: string,
    public alias: string,
    public origenes: Array<Origenes>,
    public grupo: Array<Grupo>,
    public _id?: string,
  ) {}
}

export class Materiales {
  constructor(
    public nombre: string,
    public calibre: string,
    public codigo: string,
    public color: string,
    public fabricante: string,
    public gramaje: string,
    public grupo: string,
    public origen: string,
    public serie: string,
  ) {}
}

export class Proveedores {
  constructor(
    public nombre: string,
    public direccion: string,
    public rif: string,
    public fabricantes: any,
    public contactos: [
      {
        nombre: string;
        email: string;
        numero: string;
      },
    ],
  ) {}
}

export class Mensaje {
  constructor(
    public mensaje: string,
    public icon: SweetAlertIcon,
  ) {}
}

export class Gramaje {
  constructor(
    public min: number,
    public nom: number,
    public max: number,
  ) {}
}

export class Calibre {
  constructor(
    public pt: Gramaje,
    public um: Gramaje,
    public mm: Gramaje,
  ) {}
}

export class Cobb {
  constructor(
    public top: Gramaje,
    public back: Gramaje,
  ) {}
}

export class EspecificacionSustrato {
  constructor(
    public gramaje: Gramaje,
    public calibre: Calibre,
    public cobb: Cobb,
    public curling: Gramaje,
    public blancura: Gramaje,
  ) {}
}

export class AnalisisSustrato {
  constructor(
    public numero_muestras: number,
    public masa_inicial: number[],
    public masa_final: number[],
    public gramaje: any,
    public cobb_top: number[],
    public cobb_back: number[],
    public ancho: number,
    public largo: number,
    public gramaje_cobb: {
      promedio: number;
      desviacion: number;
      max: number;
      min: number;
      cobb_top_max: number;
      cobb_top_min: number;
      cobb_back_max: number;
      cobb_back_min: number;
      decimales: number;
    },
  ) {}
}

export class AnalisisSustrato2 {
  constructor(
    public numero_muestras: number,
    public ancho: number,
    public largo: number,
    public gramaje: {
      masa_inicial: number[];
      masa_final: number[];
      gramaje: any;
      promedio: number;
      desviacion: number;
      max: number;
      min: number;
      decimales: number;
    },
    public cobb: {
      top: {
        cobb: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
      back: {
        cobb: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
    },
    public calibre: {
      mm: {
        mm: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
      um: {
        um: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
      pt: {
        pt: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
    },
    public curling_blancura: {
      curling: {
        curling: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
      blancura: {
        blancura: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
    },
    public dimensiones: {
      Escuadra: {
        escuadra: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
      contraEscuadra: {
        contraEscuadra: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
      Pinza: {
        pinza: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
      contraPinza: {
        contraPinza: number[];
        max: number;
        min: number;
        promedio: number;
        desviacion: number;
        decimales: number;
      };
    },
    public resultado: {
      estandar: string;
      resultado: string;
      pendiente: boolean | undefined;
      observacion: string;
      guardado: {
        usuario: string;
        fecha: string;
      };
      validado: {
        usuario: string;
        fecha: string;
      };
    },
  ) {}
}

export class Tinta {
  constructor(
    public tinta: string,
    public cantidad: number,
  ) {}
}

export class Barniz {
  constructor(
    public barniz: string,
    public cantidad: number,
  ) {}
}

export class Pegamento {
  constructor(
    public pega: string,
    public cantidad: number,
  ) {}
}

class Identificacion {
  constructor(
    public cliente: string,
    public categoria: string,
    public producto: string,
    public codigo: string,
    public version: string,
    public codigo_cliente: string,
  ) {}
}

class Dimensiones {
  constructor(
    public desplegado: { ancho: string; largo: string; tolerancia: string },
    public cerrado: { ancho: string; largo: string; alto: string; tolerancia: string },
    public diseno: string,
  ) {}
}

class Tinta_ {
  constructor(
    public tinta: string | any,
    public cantidad: number,
  ) {}
}

class Barniz_ {
  constructor(
    public barniz: string,
    public cantidad: number,
  ) {}
}

class TamanoSustrato {
  constructor(
    public montajes: { ancho: string; largo: string; ejemplares: string }[],
    public margenes: { inferior: string; superior: string; izquierdo: string; derecho: string }[],
  ) {}
}

class Plancha {
  constructor(
    public tipo: string,
    public marca: string,
    public tiempo_exposicion: string,
  ) {}
}

class Pegamento_ {
  constructor(
    public pega: string,
    public cantidad: number,
  ) {}
}

class Distribucion {
  constructor(
    public aerea: string,
    public v3d: string,
    public peso_cajas: string,
    public estibas: string,
    public paletizado: string,
  ) {}
}

export class Producto_ {
  constructor(
    public identificacion: Identificacion,
    public dimensiones: Dimensiones,
    public materia_prima: { sustrato: string[]; tintas: Tinta_[]; barnices: Barniz_[] },
    public pre_impresion: {
      diseno: string;
      montajes: string;
      nombre_montajes: string[];
      tamano_sustrato: TamanoSustrato;
      plancha: Plancha;
      pelicula: any;
    },
    public impresion: { impresoras: string[]; secuencia: string[][]; pinzas: string[][]; fuentes: string[] },
    public post_impresion: {
      otros: string[];
      troqueladora: string[];
      henidura: { alto: string; ancho: string };
      guillotina: string[];
      pegadora: string[];
      pegamento: Pegamento_[];
      caja: { nombre: string; cabida: string[] };
      distribucion: Distribucion;
    },
  ) {}
}

export class Producto {
  constructor(
    public cliente: string,
    public producto: string,
    public codigo: string,
    public codigo_cliente: string,
    public tamano_desplegado: number[],
    public tamano_cerrado: number[],
    public diseno: string,
    public sustrato: string[],
    public tintas: Tinta[],
    public barnices: Barniz[],
    public archivo_diseno: string,
    public archivo_montaje: string[],
    public tipo_plancha: string,
    public tiempo_exposicion: string,
    public maquinas: string[],
    public tamano_sustrato_imprimir: number[],
    public area_efectiva: number[],
    public fuente: string[],
    public troqueladora: string[],
    public guillotina: string[],
    public pegadora: string[],
    public pegamento: Pegamento[],
    public embalaje: string,
    public caja: string[],
    public unidades_por_caja: number,
    public cantidad_por_paquetes: number,
    public vista_aerea: string,
    public vista_3d: string,
    public tipo_paleta: string,
    public tamano_paleta: string,
    public cantidad_estibas: number,
    public peso_cajas: string,
    public paletizado: string,
  ) {}
}
