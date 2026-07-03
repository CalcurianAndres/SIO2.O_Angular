import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { HorariosService } from 'src/app/services/horarios.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import Swal from 'sweetalert2';

/**
 * TASK-016: Rediseño visual del componente de horarios.
 * - Cards: Bulma .card estándar (reemplaza grid-container_ / tarjeta)
 * - Calendario: CSS custom properties, dark mode, número de semana ISO
 * - Vista mensual: toggle para ver un mes individual
 * - Year selector mejorado con Bulma .buttons
 * - Animaciones: fadeIn + slideUp al cambiar de año/vista
 */
@Component({
  selector: 'app-horarios',
  standalone: false,
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss'],
  animations: [
    trigger('calendarAnimation', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(12px) scale(0.98)' }),
        animate(
          '350ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
    ]),
  ],
})
export class HorariosComponent {
  constructor(
    public api: HorariosService,
    public order: OproduccionService,
  ) {}

  /** Modal nuevo/editar horario */
  public nuevo: boolean = false;

  horario = {
    nombre: '',
    de: '',
    a: '',
    inicio: '',
    fin: '',
  };

  /* ──────────────── Vista: anual / mensual ──────────────── */

  /** true = mostrar un solo mes; false = mostrar los 12 meses */
  vistaMensual: boolean = false;

  /** Mes seleccionado en vista mensual (0-indexado) */
  selectedMonth: number = new Date().getMonth();

  /* ──────────────── Datos de calendario ──────────────── */

  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  weekdays: string[] = ['L', 'M', 'M', 'J', 'V', 'S', 'D', 'SEM'];
  currentYear: number = new Date().getFullYear();

  /* ──────────────── Semana ISO ──────────────── */

  /**
   * Calcula el número de semana ISO 8601 para una fecha dada.
   */
  getISOWeekNumber(date: Date): number {
    const temp = new Date(date.valueOf());
    // Jueves de la misma semana ISO
    const dayNum = (date.getDay() + 6) % 7;
    temp.setDate(temp.getDate() - dayNum + 3);
    const firstThursday = temp.valueOf();
    // Inicio del año
    temp.setMonth(0, 1);
    if (temp.getDay() !== 4) {
      temp.setMonth(0, 1 + ((4 - temp.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - temp.valueOf()) / 604800000);
  }

  /* ──────────────── Semanas del mes (agrupadas) ──────────────── */

  /**
   * Retorna las semanas de un mes con sus días y número de semana ISO.
   * Cada semana tiene: { days: DayData[], weekNumber: number }
   */
  getWeeksInMonth(month: number): any[] {
    const year = this.currentYear;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // 0 = Domingo, 1 = Lunes, …
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    // Convertir a base lunes: 0=Lun, 1=Mar, …, 6=Dom
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const weeks: any[] = [];
    let currentWeek: any[] = [];

    // Celdas vacías (días del mes anterior)
    for (let i = 0; i < startOffset; i++) {
      currentWeek.push({ day: 0, empty: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dow = date.getDay(); // 0=Dom
      const monBased = dow === 0 ? 6 : dow - 1;

      currentWeek.push({
        day,
        empty: false,
        date,
        weekday: monBased,
      });

      // Fin de semana (sábado = 6) o último día del mes
      if (monBased === 6 || day === daysInMonth) {
        // Rellenar última semana si es necesario
        while (currentWeek.length < 7) {
          currentWeek.push({ day: 0, empty: true });
        }
        const weekNum = this.getISOWeekNumber(date);
        weeks.push({ days: currentWeek, weekNumber: weekNum });
        currentWeek = [];
      }
    }

    return weeks;
  }

  /* ──────────────── CRUD Horarios ──────────────── */

  editar(horario) {
    this.horario = horario;
    this.nuevo = true;
  }

  borrar(horario) {
    Swal.fire({
      title: '¿Seguro que quieres eliminar este horario?',
      showCancelButton: true,
      confirmButtonText: 'Confimar',
      confirmButtonColor: '#3ec487',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarHorario(horario);
        setTimeout(() => {
          Swal.fire({
            text: this.api.mensaje.mensaje,
            icon: this.api.mensaje.icon,
            timer: 5000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            timerProgressBar: true,
          });
        }, 500);
      }
    });
  }

  setDefault(horarioSeleccionado) {
    this.api.horarios.forEach((horario) => {
      horario.default = horario === horarioSeleccionado;
    });
    this.api.guardarHorarios(horarioSeleccionado);
  }

  /* ──────────────── Año ──────────────── */

  selectYear(year: number): void {
    this.currentYear = year;
  }

  /* ──────────────── Calendario: días no laborales ──────────────── */

  isNonLaboral(month: number, day: number): boolean {
    const calendario_actual = this.api.calendario.find(
      (calendario) => calendario.year === this.currentYear,
    );
    if (calendario_actual) {
      return calendario_actual.dias.some(
        (dia) => dia.month === month && dia.day === day && !dia.laboral,
      );
    }
    return false;
  }

  getMotivo(month: number, day: number): string {
    const calendario_actual = this.api.calendario.find(
      (calendario) => calendario.year === this.currentYear,
    );
    if (calendario_actual) {
      const dia = calendario_actual.dias.find(
        (dia) => dia.month === month && dia.day === day,
      );
      return dia ? dia.motivo : '';
    }
    return '';
  }

  toggleDaySelection(month: number, day: number): void {
    const no_laboral = this.isNonLaboral(month, day);

    if (no_laboral) {
      Swal.fire({
        title: '¿Desmarcar este día como no laboral?',
        text: 'Este día ya está marcado como no laboral. ¿Quieres volver a marcarlo como laboral?',
        showCancelButton: true,
        confirmButtonText: 'Sí, desmarcar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#48c78e',
        cancelButtonColor: '#f03a5f',
      }).then((result) => {
        if (result.isConfirmed) {
          this.removeNonWorkingDay(month, day);
        }
      });
    } else {
      Swal.fire({
        title: '¿Marcar este día como no laboral?',
        input: 'text',
        inputPlaceholder: 'Escriba el motivo',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#48c78e',
        cancelButtonColor: '#f03a5f',
        preConfirm: (motivo) => {
          if (!motivo) {
            Swal.showValidationMessage('El motivo es obligatorio');
          }
          return motivo;
        },
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const motivo = result.value;
          this.saveNonWorkingDay(month, day, motivo);
        }
      });
    }
  }

  removeNonWorkingDay(month: number, day: number) {
    const nonWorkingDay = {
      month,
      day,
      year: this.currentYear,
      laboral: true,
    };

    this.api.guardarCalendario(nonWorkingDay);

    Swal.fire({
      icon: 'success',
      title: 'Día no laboral eliminado',
      text: `El día ${day}/${this.months[month]} ha sido marcado como laboral nuevamente.`,
      showConfirmButton: false,
      timer: 5000,
      toast: true,
      timerProgressBar: true,
      position: 'top-end',
    });
  }

  saveNonWorkingDay(month: number, day: number, motivo: string) {
    const nonWorkingDay = {
      month,
      day,
      year: this.currentYear,
      motivo,
      laboral: false,
    };

    this.api.guardarCalendario(nonWorkingDay);
    this.ajustarOrdenesPorNoLaboral(month, day);
  }

  /**
   * Recorre las órdenes de producción y ajusta fechas
   * cuando se marca un día como no laboral.
   */
  private ajustarOrdenesPorNoLaboral(month: number, day: number): void {
    let color = 0;
    const date = new Date(`${this.currentYear}-${month + 1}-${day}`);
    let first = -1;

    for (const orden of this.order.orden) {
      color++;

      for (let i = 0; i < orden.fases.length; i++) {
        const fase = orden.fases[i];
        const inicio = new Date(fase.fases[0].fecha);
        const final = new Date(fase.fases[0].final);

        if (date >= inicio && date <= final) {
          if (first === -1) {
            first = i;
            if (date <= inicio) {
              const nuevaFechaInicio = new Date(inicio);
              nuevaFechaInicio.setDate(nuevaFechaInicio.getDate() + 1);
              orden.fases[i].fases[0].fecha = nuevaFechaInicio;
            } else {
              const nuevaFechaFinal = new Date(final);
              nuevaFechaFinal.setDate(nuevaFechaFinal.getDate() + 1);
            }
          } else {
            if (i > first) {
              orden.fases[i].fases[0].fecha = new Date(
                orden.fases[i].fases[0].fecha.setDate(
                  orden.fases[i].fases[0].fecha.getDate() + 1,
                ),
              );
              orden.fases[i].fases[0].final = new Date(
                orden.fases[i].fases[0].final.setDate(
                  orden.fases[i].fases[0].final.getDate() + 1,
                ),
              );
            }
          }
        }
      }

      this.order.EditarOrden_(orden);
    }

    Swal.fire({
      icon: 'success',
      title: 'Día no laboral guardado',
      text: `El día ${day}/${this.months[month]} ha sido marcado como no laboral.`,
      showConfirmButton: false,
      timer: 5000,
      toast: true,
      timerProgressBar: true,
      position: 'top-end',
    });
  }

  marcarDiaDeLaSemanaNoLaboral(diaSemana: any): void {
    diaSemana = Number(diaSemana);

    const calendario_actual = this.api.calendario.find(
      (calendario) => calendario.year === this.currentYear,
    );

    const diasMarcados = calendario_actual.dias.some(
      (dia) =>
        new Date(this.currentYear, dia.month - 1, dia.day).getDay() === diaSemana && !dia.laboral,
    );

    if (diasMarcados) {
      console.log(`Los días ${diaSemana} ya están marcados como no laborales.`);
      return;
    }

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(this.currentYear, month + 1, 0).getDate();
      const firstDay = new Date(this.currentYear, month, 1).getDay();

      for (let i = 0; i < daysInMonth; i++) {
        const dayOfWeek = (firstDay + i) % 7;

        if (dayOfWeek === diaSemana) {
          this.saveNonWorkingDay(month, i + 1, `Día de descanso semanal (día ${diaSemana})`);
        }
      }
    }

    console.log(`Se marcaron todos los días ${diaSemana} como no laborales.`);
  }
}

interface Dia {
  month: number;
  day: number;
  motivo: string;
  laboral: boolean;
}
