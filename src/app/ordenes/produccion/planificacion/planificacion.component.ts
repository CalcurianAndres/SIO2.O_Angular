import { Component } from '@angular/core';
import * as moment from 'moment';
import { AlmacenService } from 'src/app/services/almacen.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { HorariosService } from 'src/app/services/horarios.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { OcompraService } from 'src/app/services/ocompra.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';
import { isUndefined } from 'lodash';

@Component({
  selector: 'app-planificacion',
  standalone: false,
  templateUrl: './planificacion.component.html',
  styleUrls: ['./planificacion.component.scss']
})
export class PlanificacionComponent {
  machines: string[] = ['Máquina 1', 'Máquina 2', 'Máquina 3']; // Lista de máquinas
  days: number[] = []; // Lista de días del mes

  maquinasOrigen: any = this.maquinas.maquinas;
  maquinasDestino: any = this.maquinas.maquinas;
  faseEliminada: any = {}
  maquina: any = [];
  fase: any = []
  public dragDisabled: boolean = false;
  public width = ['55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px'];
  public width_2 = ['55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px'];
  public margin_left_1 = ['55px', '110px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px'];
  public margin_left = ['55px', '110px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px', '55px'];
  Colors = [
    "rgba(255, 255, 255, 0)",
    "rgb(163, 163, 163)",
    "rgba(255, 87, 51, .8)", // Rojo    
    "rgba(199, 0, 57, .8)", // Rojo oscuro    
    "rgba(144, 12, 63, .8)", // Morado oscuro    
    "rgba(88, 24, 69, .8)", // Morado    
    "rgba(28, 28, 28, .8)", // Negro    
    "rgba(46, 204, 113, .8)", // Verde    
    "rgba(255, 195, 0, .8)", // Amarillo    
    "rgba(218, 247, 166, .8)", // Verde claro    
    "rgba(88, 24, 69, .8)", // Morado    
    "rgba(255, 87, 51, .8)"  // Rojo
  ];

  Colors2 = [
    "rgba(255, 255, 255, 0)",
    "rgb(255, 0, 0)",
    "rgba(255, 87, 51, 1)", // Rojo    
    "rgba(199, 0, 57, 1)", // Rojo oscuro    
    "rgba(144, 12, 63, 1)", // Morado oscuro    
    "rgba(88, 24, 69, 1)", // Morado    
    "rgba(28, 28, 28, 1)", // Negro    
    "rgba(46, 204, 113, 1)", // Verde    
    "rgba(255, 195, 0, 1)", // Amarillo    
    "rgba(218, 247, 166, 1)", // Verde claro    
    "rgba(88, 24, 69, 1)", // Morado    
    "rgba(255, 87, 51, 1)"  // Rojo
  ];



  // NEW MODEL
  mes: number = 2; // Mes en formato numérico (1 = enero, 2 = febrero, etc.)
  año: number = 2025; // Año actual
  semanas: number[][] = [];
  semanasRevertidas: boolean[] = [];
  Semana_selected = 0
  // FINAL NEW MODE

  ngOnInit(): void {
    this.generarSemanas()
  }

  constructor(
    public clientes: ClientesService,
    public oc: OcompraService,
    public maquinas: MaquinasService,
    public almacen: AlmacenService,
    public materiales: MaterialesService,
    public horarios: HorariosService,
    public api: OproduccionService,
    public calendario: HorariosService
  ) { }

  isDateInRange(date_: string, fases: any[], index: number): number {
    let date = new Date(date_.split(' ')[1]);
    let dateStr = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // Verifica si la fecha está dentro de algún rango de fases
    let index_ = fases.findIndex(fase => {
      let inicio = new Date(fase.fases[0].fecha);
      let final = new Date(fase.fases[0].final);
      return date >= inicio && date <= final;
    });
    
    let enRango = index_ !== -1;

    // Verifica si la fecha está en el calendario (día festivo)
    // Verifica si la fecha está en el calendario (día festivo)
    let enCalendario = this.calendario.calendario.some(calendario => {
      return calendario.dias.some(dias => {
        let month = (dias.month + 1).toString().padStart(2, '0');
        let day = dias.day.toString().padStart(2, '0');
        let fecha = `${dias.year}-${month}-${day}`
        return date_.split(' ')[1] === fecha;
      });
    });

    if (enCalendario) {
      return 1;
    } else if (enRango) {
      return index_ + 2;
    } else {
      return 0;
    }
  }

  BuscarFeriado(date_: string) {
    let motivo = null;  // Inicializamos la variable para almacenar el motivo
  
    this.calendario.calendario.some(calendario => {
      return calendario.dias.some(dias => {
        let month = (dias.month + 1).toString().padStart(2, '0');
        let day = dias.day.toString().padStart(2, '0');
        let fecha = `${dias.year}-${month}-${day}`;
  
        // Verificamos si la fecha coincide
        if (date_.split(' ')[1] === fecha) {
          motivo = dias.motivo; // Si hay coincidencia, almacenamos el motivo
          return true;  // Termina el ciclo de búsqueda
        }
  
        return false; // Continuar con el siguiente día
      });
    });
  
    return motivo; // Retorna el motivo encontrado o null si no se encontró
  }
  
  BuscarFeriado_(date_: string) {
    let motivo = null;  // Inicializamos la variable para almacenar el motivo
  
    this.calendario.calendario.some(calendario => {
      return calendario.dias.some(dias => {
        let month = (dias.month + 1).toString().padStart(2, '0');
        let day = dias.day.toString().padStart(2, '0');
        let fecha = `${dias.year}-${month}-${day}`;
  
        // Verificamos si la fecha coincide
        if (date_.split(' ')[1] === fecha) {
          motivo = dias.motivo; // Si hay coincidencia, almacenamos el motivo
          return true;  // Termina el ciclo de búsqueda
        }
  
        return false; // Continuar con el siguiente día
      });
    });
  
    console.log(motivo)
    return motivo; // Retorna el motivo encontrado o null si no se encontró
  }

  isDateInRangeMachine(date_: string, maquina:string): number {
    let date = new Date(date_.split(' ')[1]);
    let color = 0;

    let enCalendario = this.calendario.calendario.some(calendario => {
      return calendario.dias.some(dias => {
        let month = (dias.month + 1).toString().padStart(2, '0');
        let day = dias.day.toString().padStart(2, '0');
        let fecha = `${dias.year}-${month}-${day}`
        return date_.split(' ')[1] === fecha;
      });
    });

    if(enCalendario){
      return 1
    }
  
    // Iteramos sobre las órdenes
    for (let orden of this.api.orden) {
      color++; // Contamos las órdenes
  
      // Buscar el índice de la fase que esté en el rango de fechas
      let index_ = orden.fases.findIndex(fase => {
        let inicio = new Date(fase.fases[0].fecha);
        let final = new Date(fase.fases[0].final);
        return date >= inicio && date <= final && fase.maquina._id === maquina;
      });
  
      // Si encontramos un índice válido, sumamos 2 a color y devolvemos
      if (index_ !== -1) {
        return color + 1;
      }
    }
  
    // Si no se encuentra ninguna fase en el rango
    return 0;
  }



  getWidth(op: any): string {
    const startDate = new Date(op.fases[0].fases[0].fecha);
    const endDate = new Date(op.fases[0].fases[0].final);

    // Obtener el primer día real de la semana seleccionada
    const firstDayOfWeek = this.getRealDate(this.semanas[this.Semana_selected][0]);
    const lastDayOfWeek = this.getRealDate(this.semanas[this.Semana_selected][6]);

    // Ajustar el rango de la OP dentro de la semana
    const effectiveStart = startDate < firstDayOfWeek ? firstDayOfWeek : startDate;
    const effectiveEnd = endDate > lastDayOfWeek ? lastDayOfWeek : endDate;

    // Días que dura dentro de la semana
    const durationDays = (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24) + 1;

    return `${durationDays * 110}px`;
  }

  getMarginLeft(op: any): string {
    const startDate = new Date(op.fases[0].fases[0].fecha);
    const firstDayOfWeek = this.getRealDate(this.semanas[this.Semana_selected][0]);

    if (startDate < firstDayOfWeek) {
      return '0px'; // Si empieza antes de la semana, no necesita margen
    }

    const offsetDays = (startDate.getTime() - firstDayOfWeek.getTime()) / (1000 * 60 * 60 * 24);
    return `${offsetDays * 110}px`;
  }

  // 🟢 Esta función toma un día de `semanas` y lo convierte en una fecha real
  getRealDate(day: number): Date {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // Mes actual (0 = enero, 1 = febrero...)

    return new Date(currentYear, currentMonth, day);
  }



  ExisteEnLaSemana(op: any, old_op: any, maquina: any) {
    let inicio = op.fases[0].fases[0].fecha.split('-')[2];;
    let final = op.fases[0].fases[0].final.split('-')[2]; // Extraemos solo el día
    let inicioNumero = parseInt(inicio, 10); // Convertimos a número
    let finalNumero = parseInt(final, 10); // Convertimos a número

    let existeFinal = this.semanas[this.Semana_selected].includes(finalNumero);
    let existeInicio = this.semanas[this.Semana_selected].includes(inicioNumero);
    let posicion = this.semanas[this.Semana_selected].indexOf(inicioNumero); // Buscamos la posición dentro del array
    let wd = finalNumero - inicioNumero;
    wd += 1;

    let m_l = 0;
    if (old_op === 0) {
      m_l = inicioNumero - this.semanas[this.Semana_selected][0]
    } else {
      let final_viejo = this.buscarFase(maquina)[old_op - 1].fases[0].fases[0].final.split('-')[2]
      final_viejo = parseInt(final_viejo, 10);
      let existeFinal_viejo = this.semanas[this.Semana_selected].includes(final_viejo);
      if (existeFinal_viejo) {
        m_l = inicioNumero - final_viejo
      } else {
        m_l = inicioNumero - this.semanas[this.Semana_selected][0]
      }
    }

    if (existeFinal && !existeInicio) {
      wd = (finalNumero - this.semanas[this.Semana_selected][0]);
      wd += 1
      if (old_op === 0) {
        m_l = 0
      } else {
        let final_viejo = this.buscarFase(maquina)[old_op - 1].fases[0].fases[0].final.split('-')[2]
        final_viejo = parseInt(final_viejo, 10);
        let existeFinal_viejo = this.semanas[this.Semana_selected].includes(final_viejo);
        if (existeFinal_viejo) {
          m_l = inicioNumero - final_viejo
          m_l += 1;
        } else {
          m_l = 0
        }
      }
    } else if (!existeFinal && existeInicio) {
      wd = (this.semanas[this.Semana_selected][6] - inicioNumero) + 1;
      if (old_op > 0) {
        let final_viejo = this.buscarFase(maquina)[old_op - 1].fases[0].fases[0].final.split('-')[2]
        final_viejo = parseInt(final_viejo, 10);
        let existeFinal_viejo = this.semanas[this.Semana_selected].includes(final_viejo);
        if (existeFinal_viejo) {
          m_l = inicioNumero - final_viejo
          m_l -= 1;
        }
      }
    }


    // console.log(existe)
    if (existeFinal || existeInicio) {
      return {
        show: true,
        width: `${wd * 110}px`,
        ml: `${m_l * 110}px`
      }

    } else {
      return {
        show: false,
        width: '0px',
        ml: '0px'
      }
    }
  }

  generarSemanas() {
    const fecha = new Date(this.año, this.mes - 1, 1); // Primer día del mes
    const diasEnMes = new Date(this.año, this.mes, 0).getDate(); // Número de días en el mes
    let dias: number[] = [];

    // Obtener el primer día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const primerDiaSemana = fecha.getDay();

    // Rellenar con ceros si el mes no empieza en domingo
    if (primerDiaSemana !== 0) {
      for (let i = 0; i < primerDiaSemana; i++) {
        dias.push(0); // Agrega 0 al inicio
      }
    }

    // Agregar los días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(i);
    }

    // Dividir los días en semanas
    this.semanas = [];
    let semana: number[] = [];

    for (let i = 0; i < dias.length; i++) {
      semana.push(dias[i]);
      if (semana.length === 7) {
        this.semanas.push(semana);
        semana = [];
      }
    }

    // Si la última semana tiene menos de 7 días, rellenar con ceros
    if (semana.length > 0 && semana.length < 7) {
      while (semana.length < 7) {
        semana.push(0);
      }
      this.semanas.push(semana);
    }

    // Marcar semanas para alternar entre dirección izquierda y derecha
    this.semanasRevertidas = this.semanas.map((_, index) => index % 2 !== 0);
  }


  // Función para navegar entre semanas
  navegar(direccion: 'izquierda' | 'derecha') {
    if (direccion === 'izquierda') {
      this.semanas.reverse();
      this.semanasRevertidas.reverse();
    } else {
      this.semanas.reverse();
      this.semanasRevertidas.reverse();
    }
  }



  public feriados: number[] = []

  generateDates(): string[] {
    const dates: any = [];
    const firstDayOfMonth = moment().startOf('month');
    const daysInMonth = moment().daysInMonth();

    for (let i = 0; i < daysInMonth; i++) {
      const currentDate = moment(firstDayOfMonth).add(i, 'days');
      const dayLetter = currentDate.format('dd').toUpperCase(); // Obtiene la primera letra del día
      const formattedDate = `${dayLetter} ${currentDate.format('YYYY-MM-DD')}`;
      dates.push(formattedDate);
    }

    // console.log(dates);
    return dates;
  }

  buscarFase(idMaquina) {
    const fasesFiltradas = this.api.orden
      .map(orden => ({
        numero_op: orden.numero_op, // Agrega el número de la orden
        fases: orden.fases.filter(fase => fase.maquina._id === idMaquina)
      }))
      .filter(orden => orden.fases.length > 0); // Filtra solo las órdenes que tienen fases coincidentes
    return fasesFiltradas; // Devuelve solo la primera coincidencia
  }

  calcularMargen(fecha: string, index: number) {
    if (index > 0) {
      return '0px'
    }
    let dia = fecha.split('-')[2]
    let px = (Number(dia) - 1) * 55;
    return `${px}px`
  }

  calcularWith(fechaI: string, fechaF: string) {

    let inicio = fechaI.split('-')[2]
    let Final = fechaF.split('-')[2]
    let px = ((Number(Final) - Number(inicio)) + 1) * 55;

    return `${px}px`

  }


  formatearFecha(fecha) {
    moment.locale('es');
    const fechaMoment = moment(fecha.split(' ')[1]); // Tomamos la parte "YYYY-MM-DD" de la fecha
    const year = fechaMoment.year();
    const month = fechaMoment.month(); // El mes en moment es 0-indexed (enero es 0, diciembre es 11)
    const day = fechaMoment.date();

    let Calendario = this.horarios.calendario.find(x => x.year === year);
    let feriado = Calendario.dias.find(x => x.month === month && x.day === day);

    if (feriado) {
      return 'X';
    } else {
      return fechaMoment.format('DD');
    }
  }

  formatearFecha_(fecha) {
    moment.locale('es');
    let Calendario = this.horarios.calendario.find(x => x.year === Number(moment(fecha).format('yyyy')))
    let feriado = Calendario.dias.find(x => x.month === (Number(moment(fecha).format('M')) - 1) && x.day === Number(moment(fecha).format('D')))

    if (feriado) {
      let hoy = moment().format('yyyy-MM-DD');
      let fin = moment(fecha)

      this.feriados.push(fin.diff(hoy, 'days'))

      return `No laboral`
    } else {
      return moment(fecha).format('D');
    }
  }


  currentML = ''
  onResizeStart(event: any, i: number) {
    this.dragDisabled = true;
  }

  async onResizeEnd(event: ResizeEvent, i: number): Promise<void> {
    // this.dragDisabled = true;
    //   let w = event.rectangle.width;
    //   if(w != undefined){
    //     w = Math.round(w / 55) * 55;

    //     if(w < 55){
    //       w = 55
    //     }

    //     let width_actual = Number(this.width[i].replace("px", ""));

    //     if(w > width_actual){
    //       let diferencia = w - width_actual;
    //       console.log(diferencia)
    //       let number = Number(this.margin_left[i].replace("px", ""));

    //       let new_margin = number - diferencia;

    //       if(new_margin < 0){
    //         new_margin = 0
    //       }

    //       this.margin_left[i] = `${new_margin}px`;

    //     }

    //     this.width[i] =`${w}px`;
    //     this.dragDisabled = false
    //   }

  }

  onResizeStart2(event: any, i: number) {
    this.dragDisabled = true;
  }

  async onResizeEnd2(event: ResizeEvent, i: number): Promise<void> {
    this.dragDisabled = true;
    let w = event.rectangle.width;
    if (w != undefined) {
      w = Math.round(w / 55) * 55;

      if (w < 55) {
        w = 55
      }

      let width_actual = Number(this.width[i].replace("px", ""));

      if (w > width_actual) {
        let diferencia = w - width_actual;
        let number = Number(this.margin_left[i].replace("px", ""));

        let new_margin = number - diferencia;

        if (new_margin < 0) {
          new_margin = 0
        }

      }

      this.width_2[i] = `${w}px`;
      this.dragDisabled = false
    }

  }

  dragStartX: number = 0;
  onDragStart(event: any) {
    this.dragStartX = event.source.getFreeDragPosition().x; // Guarda la posición inicial del drag
  }

  onDragEnd(event: any, i: number) {
    let currentX = event.source.getFreeDragPosition().x; // Obtiene la posición final
    let deltaX = currentX - this.dragStartX; // Calcula cuánto se movió

    // Redondea a múltiplos de 55px
    let steps = Math.round(deltaX / 55);
    let newMargin = Math.max((parseInt(this.margin_left_1[i] || "0") + steps * 55), 0);

    this.margin_left_1[i] = `${newMargin}px`; // Aplica el nuevo margin-left

    // Ajusta la posición para que sea la misma que al principio pero con el nuevo margin-left
    event.source.setFreeDragPosition({ x: this.dragStartX, y: 0 });
  }

  onDragStart2(event: any) {
    this.dragStartX = event.source.getFreeDragPosition().x; // Guarda la posición inicial del drag
  }

  onDragStart_(event: any, op: any) {
    // console.log(op)
    this.dragStartX = event.source.getFreeDragPosition().x;
  }

  _onDragEnd_(event: any, op: any) {
    console.log(op, 'Numero op');

    // Obtener la diferencia de posición en el eje X
    let movementX = event.distance.x; // Asumiendo que event.distance.x contiene el desplazamiento total en px

    // Calcular cuántos pasos de 110px se han movido
    let daysToMove = Math.round(movementX / 110); // Se redondea para asegurar precisión

    // Función para modificar una fecha sumando o restando días
    function modifyDate(dateString: string, days: number): string {
      // let lastnumber = Number(dateString.split('-')[2])
      // lastnumber += days
      // return `${dateString.split('-')[0]}-${dateString.split('-')[1]}-${lastnumber}`
      let date = new Date(dateString);
      let dataActual = new Date(op.fases[0].fases[0].fecha)

      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0]; // Convertimos la fecha de nuevo a 'yyyy-mm-dd'
    }

    // Filtrar todas las órdenes con numero_op mayor al de la orden actual
    let ordersToUpdate = this.api.orden.filter(x => Number(x.numero_op) >= Number(op.numero_op));

    // Actualizar fechas en todas las órdenes afectadas
    ordersToUpdate.forEach(order => {
      let maquina = false;
      order.fases.forEach(fase => {
        if (fase.maquina._id === op.fases[0].maquina._id) {
          maquina = true;
        }
        let date = new Date(fase.fases[0].fecha);
        let dataActual = new Date(op.fases[0].fases[0].fecha)

        if (dataActual <= date && maquina) {
          if (fase.fases[0].fecha) {
            fase.fases[0].fecha = modifyDate(fase.fases[0].fecha, daysToMove);
          }
          if (fase.fases[0].final) {
            fase.fases[0].final = modifyDate(fase.fases[0].final, daysToMove);
          }
        }
      });
      // Ajusta la posición para que sea la misma que al principio pero con el nuevo margin-left
      event.source.setFreeDragPosition({ x: this.dragStartX, y: 0 });
      console.log(`Orden: ${order.numero_op} - Nueva fecha inicio: ${order.fases[0].fecha}, Nueva fecha final: ${order.fases[0].final}`);
    });

    // También actualizar la orden que fue movida
    if (op.fases[0].fecha) {
      op.fases[0].fecha = modifyDate(op.fases[0].fecha, daysToMove);
    }
    if (op.fases[0].final) {
      op.fases[0].final = modifyDate(op.fases[0].final, daysToMove);
    }

    console.log(`Orden original: ${op.numero_op} - Nueva fecha inicio: ${op.fases[0].fecha}, Nueva fecha final: ${op.fases[0].final}`);
  }



  trackByFn(index: number, item: any): any {
    return item.id; // O la propiedad que identifique de forma única a cada 'op'
  }

  onDragEnd2(event: any, i: number) {
    let currentX = event.source.getFreeDragPosition().x; // Obtiene la posición final
    let deltaX = currentX - this.dragStartX; // Calcula cuánto se movió

    // Redondea a múltiplos de 55px
    let steps = Math.round(deltaX / 55);
    let newMargin = Math.max((parseInt(this.margin_left[i] || "0") + steps * 55), 0);

    this.margin_left[i] = `${newMargin}px`; // Aplica el nuevo margin-left

    // Ajusta la posición para que sea la misma que al principio pero con el nuevo margin-left
    event.source.setFreeDragPosition({ x: this.dragStartX, y: 0 });
  }

}