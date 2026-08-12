import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';
import * as moment from 'moment';

interface DiaGantt {
  fecha: moment.Moment;
  esFeriado: boolean;
  esFinDeSemana: boolean;
  esHoy: boolean;
  nombreDia: string;
  numDia: string;
  label: string;
  motivo: string | null;
}

interface SegmentoDia {
  fecha: string;
  inicio: string;
  fin: string;
  esFeriado: boolean;
  expandido: boolean;
}

interface PlanGantt {
  startDate: string;
  endDate: string;
  startDayIndex: number;
  durationDays: number;
  leftPx: number;
  widthPx: number;
  segments: SegmentoDia[];
}

interface BloqueoOcupado {
  leftPx: number;
  widthPx: number;
  label: string;
  fechaInicio: string;
  fechaFin: string;
}

interface RenglonGantt {
  maquina: any;
  fase: any;
  color: string;
  plan: PlanGantt;
  colision: boolean;
  bloqueos: BloqueoOcupado[];
  minLeftPx: number;
}

@Component({
  selector: 'app-gantt-planificador',
  standalone: false,
  templateUrl: './gantt-planificador.component.html',
  styleUrls: ['./gantt-planificador.component.scss'],
})
export class GanttPlanificadorComponent implements OnInit, OnChanges {
  @Input() maquinas: any[] = [];
  @Input() horarioDefault: any;
  @Input() calendario: any[] = [];
  @Input() ordenes: any[] = [];
  @Input() totalHojas: number = 0;
  @Input() colores: string[] = [];
  @Output() planChange = new EventEmitter<any[]>();

  readonly PX_DIA = 110;
  readonly DIAS_A_MOSTRAR = 30;

  dias: DiaGantt[] = [];
  renglones: RenglonGantt[] = [];
  dragDisabled = false;

  private readonly paleta = [
    '#3b82f6',
    '#48c78e',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#06b6d4',
    '#84cc16',
  ];

  ngOnInit(): void {
    moment.locale('es');
    this.generarTimeline();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['maquinas'] && this.maquinas && this.maquinas.length > 0) {
      this.inicializarPlan();
    }
  }

  generarTimeline(): void {
    this.dias = [];
    const inicio = moment().startOf('day');
    const totalDias = this.DIAS_A_MOSTRAR + 15;
    for (let i = 0; i < totalDias; i++) {
      const fecha = moment(inicio).add(i, 'day');
      const motivo = this.buscarMotivoFeriado(fecha);
      const esFeriado = motivo !== null;
      const esFinDeSemana = fecha.day() === 0 || fecha.day() === 6;
      this.dias.push({
        fecha,
        esFeriado,
        esFinDeSemana,
        esHoy: fecha.isSame(moment(), 'day'),
        nombreDia: fecha.format('dd'),
        numDia: fecha.format('D'),
        label: fecha.format('dd D/M'),
        motivo,
      });
    }
  }

  buscarMotivoFeriado(fecha: moment.Moment): string | null {
    const year = fecha.year();
    const month = fecha.month();
    const day = fecha.date();
    const cal = this.calendario?.find((c) => c.year === year);
    if (!cal) return null;
    const feriado = cal.dias?.find((d) => d.month === month && d.day === day);
    return feriado ? feriado.motivo || 'Feriado' : null;
  }

  esFeriado(fecha: moment.Moment): boolean {
    return this.buscarMotivoFeriado(fecha) !== null;
  }

  horasTrabajoPorDia(): number {
    if (!this.horarioDefault) return 8;
    const inicio = moment(this.horarioDefault.de, 'HH:mm');
    const fin = moment(this.horarioDefault.a, 'HH:mm');
    let horas = fin.diff(inicio, 'hours');
    if (horas > 6) horas -= 1;
    return Math.max(horas, 1);
  }

  inicializarPlan(): void {
    this.renglones = [];

    const horasTrabajo = this.horasTrabajoPorDia();
    const hoy = moment().startOf('day');

    const ultimaFechaPorMaquina: { [key: string]: moment.Moment } = {};
    const bloqueosPorMaquina: { [key: string]: BloqueoOcupado[] } = {};

    this.ordenes?.forEach((op) => {
      const opLabel = op.numero_op || 'OP';
      op.fases?.forEach((fase) => {
        const maqId = fase.maquina?._id || fase.maquina;
        const fechaStr = fase.fases?.[0]?.fecha;
        const finStr = fase.fases?.[0]?.final || fase.fases?.[0]?.fecha;
        if (finStr && fechaStr) {
          const inicio = moment(fechaStr);
          const fin = moment(finStr);

          if (inicio.isValid() && fin.isValid()) {
            if (!ultimaFechaPorMaquina[maqId] || fin.isAfter(ultimaFechaPorMaquina[maqId])) {
              ultimaFechaPorMaquina[maqId] = fin;
            }

            const leftPx = Math.max(0, inicio.diff(hoy, 'days')) * this.PX_DIA;
            const widthPx = Math.max(this.PX_DIA, (fin.diff(inicio, 'days') + 1) * this.PX_DIA);

            if (!bloqueosPorMaquina[maqId]) bloqueosPorMaquina[maqId] = [];
            bloqueosPorMaquina[maqId].push({
              leftPx,
              widthPx,
              label: opLabel,
              fechaInicio: inicio.format('YYYY-MM-DD'),
              fechaFin: fin.format('YYYY-MM-DD'),
            });
          }
        }
      });
    });

    let colorIdx = 0;

    this.maquinas.forEach((maquina, maqIdx) => {
      const color = this.colores && this.colores[colorIdx]
        ? this.colores[colorIdx]
        : this.paleta[colorIdx % this.paleta.length];
      colorIdx++;

      const maqId = maquina._id;
      const bloqueosMaquina = bloqueosPorMaquina[maqId] || [];

      let inicioBase = ultimaFechaPorMaquina[maqId]
        ? moment(ultimaFechaPorMaquina[maqId]).add(1, 'day')
        : moment().startOf('day');

      while (this.esFeriado(inicioBase) || inicioBase.day() === 0) {
        inicioBase.add(1, 'day');
      }

      const minLeftPx = Math.max(0, inicioBase.diff(hoy, 'days')) * this.PX_DIA;

      const produccionDiaria = Math.max((maquina.trabajo || 1) * horasTrabajo, 1);
      const hojasTotales = Math.max(this.totalHojas, 1);
      let diasLaboralesNecesarios = Math.ceil(hojasTotales / produccionDiaria);
      diasLaboralesNecesarios = Math.max(diasLaboralesNecesarios, 1);

      const startDayIndex = Math.max(0, inicioBase.diff(moment().startOf('day'), 'days'));

      const segments: SegmentoDia[] = [];
      const cursor = moment(inicioBase);
      let diasValidos = 0;

      while (diasValidos < diasLaboralesNecesarios) {
        const feriado = this.esFeriado(cursor);
        const domingo = cursor.day() === 0;

        segments.push({
          fecha: cursor.format('YYYY-MM-DD'),
          inicio: feriado || domingo ? '' : this.horarioDefault?.de || '08:00',
          fin: feriado || domingo ? '' : this.horarioDefault?.a || '17:00',
          esFeriado: feriado || domingo,
          expandido: false,
        });

        if (!feriado && !domingo) {
          diasValidos++;
        }
        cursor.add(1, 'day');
        if (diasValidos > 200) break;
      }

      const totalDiasCalendario = segments.length;
      const endDate = moment(segments[totalDiasCalendario - 1].fecha);

      const plan: PlanGantt = {
        startDate: inicioBase.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        startDayIndex,
        durationDays: totalDiasCalendario,
        leftPx: startDayIndex * this.PX_DIA,
        widthPx: totalDiasCalendario * this.PX_DIA,
        segments,
      };

      maquina.fases?.forEach((fase) => {
        this.renglones.push({
          maquina,
          fase,
          color,
          plan: this.clonarPlan(plan),
          colision: false,
          bloqueos: bloqueosMaquina,
          minLeftPx,
        });
      });
    });

    this.detectarColisiones();
    this.emitirPlan();
  }

  clonarPlan(plan: PlanGantt): PlanGantt {
    return {
      ...plan,
      segments: plan.segments.map((s) => ({ ...s })),
    };
  }

  get totalDiasTimeline(): number {
    return this.dias.length;
  }

  onBarDragEnd(event: CdkDragEnd, renglonIndex: number): void {
    const renglon = this.renglones[renglonIndex];
    const dragPos = event.source.getFreeDragPosition();
    const currentLeft = renglon.plan.leftPx;

    let newLeft = currentLeft + Math.round(dragPos.x / this.PX_DIA) * this.PX_DIA;
    newLeft = Math.max(renglon.minLeftPx, newLeft);

    const maxLeft = (this.totalDiasTimeline - renglon.plan.durationDays) * this.PX_DIA;
    if (newLeft > maxLeft) newLeft = Math.max(renglon.minLeftPx, maxLeft);

    const blocked = this.calcularBloqueos(renglonIndex);
    if (blocked.length > 0) {
      newLeft = this.resolverColisionArrastre(newLeft, renglon.plan.widthPx, blocked);
    }

    renglon.plan.leftPx = newLeft;
    renglon.plan.startDayIndex = newLeft / this.PX_DIA;

    const nuevaFechaInicio = moment().startOf('day').add(renglon.plan.startDayIndex, 'days');
    renglon.plan.startDate = nuevaFechaInicio.format('YYYY-MM-DD');

    this.reconstruirSegmentos(renglon);

    event.source.setFreeDragPosition({ x: 0, y: 0 });

    this.detectarColisiones();
    this.emitirPlan();
  }

  onBarResizeEnd(event: ResizeEvent, renglonIndex: number): void {
    this.dragDisabled = true;
    const renglon = this.renglones[renglonIndex];

    if (event.rectangle.width) {
      let newWidth = Math.round(event.rectangle.width / this.PX_DIA) * this.PX_DIA;
      newWidth = Math.max(this.PX_DIA, newWidth);

      const maxRight = this.totalDiasTimeline * this.PX_DIA;
      if (renglon.plan.leftPx + newWidth > maxRight) {
        newWidth = maxRight - renglon.plan.leftPx;
      }

      const blocked = this.calcularBloqueos(renglonIndex);
      if (blocked.length > 0) {
        newWidth = this.resolverColisionResize(renglon.plan.leftPx, newWidth, blocked);
      }

      renglon.plan.widthPx = newWidth;
      const nuevosDias = Math.round(newWidth / this.PX_DIA);
      renglon.plan.durationDays = nuevosDias;

      const fechaFin = moment(renglon.plan.startDate).add(nuevosDias - 1, 'days');
      renglon.plan.endDate = fechaFin.format('YYYY-MM-DD');

      this.reconstruirSegmentos(renglon);
    }

    this.dragDisabled = false;
    this.detectarColisiones();
    this.emitirPlan();
  }

  calcularBloqueos(renglonIndex: number): { leftPx: number; widthPx: number }[] {
    const renglon = this.renglones[renglonIndex];
    const maqId = renglon.maquina._id || renglon.maquina.nombre;
    const bloqueos: { leftPx: number; widthPx: number }[] = [];

    renglon.bloqueos?.forEach((b) => bloqueos.push({ leftPx: b.leftPx, widthPx: b.widthPx }));

    this.renglones.forEach((r, idx) => {
      if (idx !== renglonIndex) {
        const rMaqId = r.maquina._id || r.maquina.nombre;
        if (rMaqId === maqId) {
          bloqueos.push({ leftPx: r.plan.leftPx, widthPx: r.plan.widthPx });
        }
      }
    });

    return bloqueos;
  }

  resolverColisionArrastre(newLeft: number, width: number, bloqueos: { leftPx: number; widthPx: number }[]): number {
    let resolved = newLeft;
    let changed = true;
    let iterations = 0;

    while (changed && iterations < 50) {
      changed = false;
      for (const b of bloqueos) {
        const bEnd = b.leftPx + b.widthPx;
        const rEnd = resolved + width;
        if (resolved < bEnd && b.leftPx < rEnd) {
          resolved = bEnd;
          changed = true;
        }
      }
      iterations++;
    }

    return resolved;
  }

  resolverColisionResize(leftPx: number, width: number, bloqueos: { leftPx: number; widthPx: number }[]): number {
    let resolved = width;
    let changed = true;
    let iterations = 0;

    while (changed && iterations < 50) {
      changed = false;
      for (const b of bloqueos) {
        const bEnd = b.leftPx + b.widthPx;
        const rEnd = leftPx + resolved;
        if (leftPx < bEnd && b.leftPx < rEnd) {
          resolved = Math.max(this.PX_DIA, b.leftPx - leftPx);
          changed = true;
        }
      }
      iterations++;
    }

    return resolved;
  }

  reconstruirSegmentos(renglon: RenglonGantt): void {
    const fechaInicio = moment(renglon.plan.startDate);
    const nuevosSegments: SegmentoDia[] = [];
    const cursor = moment(fechaInicio);

    for (let i = 0; i < renglon.plan.durationDays; i++) {
      const feriado = this.esFeriado(cursor);
      const domingo = cursor.day() === 0;
      const existente = renglon.plan.segments.find((s) => s.fecha === cursor.format('YYYY-MM-DD'));

      nuevosSegments.push({
        fecha: cursor.format('YYYY-MM-DD'),
        inicio: feriado || domingo ? '' : existente?.inicio || this.horarioDefault?.de || '08:00',
        fin: feriado || domingo ? '' : existente?.fin || this.horarioDefault?.a || '17:00',
        esFeriado: feriado || domingo,
        expandido: existente?.expandido || false,
      });
      cursor.add(1, 'day');
    }

    renglon.plan.segments = nuevosSegments;
  }

  detectarColisiones(): void {
    const porMaquina: { [key: string]: RenglonGantt[] } = {};
    this.renglones.forEach((r) => {
      const id = r.maquina._id || r.maquina.nombre;
      if (!porMaquina[id]) porMaquina[id] = [];
      porMaquina[id].push(r);
    });

    this.renglones.forEach((r) => (r.colision = false));

    Object.values(porMaquina).forEach((grupo) => {
      for (let i = 0; i < grupo.length; i++) {
        for (let j = i + 1; j < grupo.length; j++) {
          const a = grupo[i].plan;
          const b = grupo[j].plan;
          const aEnd = a.leftPx + a.widthPx;
          const bEnd = b.leftPx + b.widthPx;
          if (a.leftPx < bEnd && b.leftPx < aEnd) {
            grupo[i].colision = true;
            grupo[j].colision = true;
          }
        }
      }
    });
  }

  toggleSegmento(renglonIndex: number, segIndex: number): void {
    const seg = this.renglones[renglonIndex].plan.segments[segIndex];
    if (!seg.esFeriado) {
      seg.expandido = !seg.expandido;
    }
  }

  actualizarHorario(renglonIndex: number, segIndex: number, inicio: string, fin: string): void {
    const seg = this.renglones[renglonIndex].plan.segments[segIndex];
    seg.inicio = inicio;
    seg.fin = fin;
    seg.expandido = false;
    this.emitirPlan();
  }

  resetearHorario(renglonIndex: number, segIndex: number): void {
    const seg = this.renglones[renglonIndex].plan.segments[segIndex];
    seg.inicio = this.horarioDefault?.de || '08:00';
    seg.fin = this.horarioDefault?.a || '17:00';
    seg.expandido = false;
    this.emitirPlan();
  }

  emitirPlan(): void {
    const resultado = this.renglones.map((r) => ({
      maquina: r.maquina,
      nombre: r.fase?.nombre || r.maquina.fases?.[0]?.nombre || '',
      fases: [
        {
          width: `${r.plan.widthPx}px`,
          fecha: r.plan.startDate,
          final: r.plan.endDate,
          inicio: r.plan.segments.map((s) => s.inicio),
          fin: r.plan.segments.map((s) => s.fin),
          date: r.plan.segments.map((s) => s.expandido),
        },
      ],
    }));
    this.planChange.emit(resultado);
  }

  get anchoTimeline(): number {
    let maxRight = this.DIAS_A_MOSTRAR * this.PX_DIA;
    this.renglones.forEach((r) => {
      const right = r.plan.leftPx + r.plan.widthPx;
      if (right > maxRight) maxRight = right;
    });
    return maxRight;
  }

  get anchoTimelinePx(): number {
    return this.anchoTimeline + this.PX_DIA;
  }

  get hayColision(): boolean {
    return this.renglones.some((r) => r.colision);
  }

  get horasTrabajoLabel(): string {
    const h = this.horasTrabajoPorDia();
    return `${h}h/día`;
  }
}
