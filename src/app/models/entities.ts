export interface Usuario {
  _id: string;
  Nombre: string;
  Apellido: string;
  Correo: string;
  password?: string;
  role: string;
  token?: string;
}

export interface Cliente {
  _id: string;
  nombre: string;
  rif: string;
  direccion: string;
  contactos: Contacto[];
  fecha_registro?: string;
}

export interface Contacto {
  nombre: string;
  email: string;
  numero: string;
}

export interface Proveedor {
  _id: string;
  nombre: string;
  direccion: string;
  rif: string;
  fabricantes: any[];
  contactos: Contacto[];
}

export interface Orden {
  _id: string;
  folio: string;
  status: string;
  cliente?: Cliente | string;
  producto?: string;
  cantidad: number;
  fecha_entrega?: string;
  fecha_creacion?: string;
}

export interface Producto {
  _id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
}

export interface Material {
  _id: string;
  nombre: string;
  codigo: string;
  calibre: string;
  color: string;
  fabricante: string;
  gramaje: string;
  grupo: any;
  origen: string;
  serie: string;
}

export interface Maquina {
  _id: string;
  nombre: string;
  alias: string;
  fase: string;
  activa?: boolean;
}

export interface Fase {
  _id: string;
  nombre: string;
  alias: string;
  orden: number;
}

export interface Empleado {
  _id: string;
  Nombre: string;
  Apellido: string;
  cedula: string;
  cargo: any;
  departamento: any;
  activo?: boolean;
}

export interface Notificacion {
  _id: string;
  mensaje: string;
  usuario?: string;
  tipo: string;
  leida: boolean;
  fecha: string;
}

export interface Grupo {
  _id?: string;
  nombre: string;
  trato?: boolean;
  icono?: string;
  parcial?: boolean;
  otro?: boolean;
}

export interface Fabricante {
  _id: string;
  nombre: string;
  alias: string;
  origenes: any[];
  grupo: any;
  proveedor: boolean;
}
