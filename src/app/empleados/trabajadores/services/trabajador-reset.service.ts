import { Injectable } from '@angular/core';
import { createEmptyTrabajador, Trabajador } from '../models/trabajador.model';

/**
 * Servicio dedicado a la limpieza total del estado del formulario de trabajador.
 * Encapsula la responsabilidad de "reset" para evitar que el componente crezca
 * con lógica de inicialización difícil de mantener.
 */
@Injectable({
  providedIn: 'root',
})
export class TrabajadorResetService {
  /**
   * Devuelve un Trabajador completamente vacío (nueva referencia de objeto).
   * @example
   *   this.trabajador = this.resetService.nuevoTrabajador();
   */
  nuevoTrabajador(): Trabajador {
    return createEmptyTrabajador();
  }

  /**
   * Resetea todos los arrays de input que se pasan al componente hijo.
   * Se invoca desde el componente padre ANTES de abrir el modal.
   */
  resetInputs(): {
    referencias: [];
    carga: [];
    emergencias: [];
    cursos_realizados: [];
    softwares: [];
  } {
    return {
      referencias: [],
      carga: [],
      emergencias: [],
      cursos_realizados: [],
      softwares: [],
    };
  }
}
