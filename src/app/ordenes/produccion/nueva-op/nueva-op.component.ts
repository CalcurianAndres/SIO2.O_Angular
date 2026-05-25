import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ClientesService } from 'src/app/services/clientes.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import { OcompraService } from 'src/app/services/ocompra.service';
import {
  CdkDragDrop,
  CdkDragEnd,
  CdkDragMove,
  CdkDragStart,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';
import * as moment from 'moment';
import { AlmacenService } from 'src/app/services/almacen.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { HorariosService } from 'src/app/services/horarios.service';
import Swal from 'sweetalert2';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-nueva-op',
  standalone: false,
  templateUrl: './nueva-op.component.html',
  styleUrls: ['./nueva-op.component.scss'],
})
export class NuevaOPComponent implements OnInit, OnChanges {
  ngOnInit(): void {
    this.currentDate = moment().format('YYYY-MM-DD');
  }

  public currentStep = 1;
  public guardando = false;
  public steps = [
    { num: 1, label: 'Identificación', icon: 'fa-id-card' },
    { num: 2, label: 'Sustrato', icon: 'fa-layer-group' },
    { num: 3, label: 'Tintas', icon: 'fa-palette' },
    { num: 4, label: 'Barniz', icon: 'fa-fill-drip' },
    { num: 5, label: 'Embalaje', icon: 'fa-box' },
    { num: 6, label: 'Máquinas', icon: 'fa-cogs' },
    { num: 7, label: 'Planificación', icon: 'fa-calendar-alt' },
  ];

  get totalSteps(): number {
    return this.steps.length;
  }

  get progressPercentage(): number {
    let filled = 0,
      total = 0;
    total += 6; // Step 1: cliente, oc, producto, solicitud, montaje, cantidad
    if (this.OP.cliente) filled++;
    if (this.OP.oc) filled++;
    if (this.id_producto) filled++;
    if (this.OP.solicitud) filled++;
    if (this.OP.montaje !== '') filled++;
    if (this.OP.cantidad > 0) filled++;
    total += 1; // Step 2: sustrato
    if (this.OP.sustrato.sustrato) filled++;
    total += 1; // Step 3: al menos una tinta
    if (this.OP.tinta.some((t) => t.tinta)) filled++;
    total += 2; // Step 4: barniz + pega
    if (this.OP.barniz.barniz) filled++;
    if (this.OP.pega.pega) filled++;
    total += 2; // Step 7: al menos una máquina + planificación
    if (this.maquinasDestino.length > 0) filled++;
    if (this.medidas && this.medidas.length > 0) filled++;
    return total ? Math.round((filled / total) * 100) : 0;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }
  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }
  goToStep(n: number) {
    if (n >= 1 && n <= this.totalSteps) this.currentStep = n;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['nueva']?.currentValue === true) {
      this.guardando = false;
      this.currentStep = 1;
    }
  }

  despachoForm: FormGroup;
  error: string = '';

  constructor(
    public clientes: ClientesService,
    public oc: OcompraService,
    public maquinas: MaquinasService,
    public almacen: AlmacenService,
    public materiales: MaterialesService,
    public horarios: HorariosService,
    public api: OproduccionService,
    private fb: FormBuilder,
  ) {
    this.despachoForm = this.fb.group({
      despachos: this.fb.array([]),
    });
  }

  get despachos() {
    return this.despachoForm.get('despachos') as FormArray;
  }

  crearDespacho(): FormGroup {
    return this.fb.group({
      lugar: ['', Validators.required],
      fecha: ['', Validators.required],
      oc: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
    });
  }

  agregarDespacho() {
    const cantidades = this.despachos.controls.reduce((total, control) => {
      return total + (control.get('cantidad')?.value || 0);
    }, 0);

    if (this.despachos.length < 3) {
      this.despachos.push(this.crearDespacho());
    }
  }

  eliminarDespacho(index: number) {
    this.despachos.removeAt(index);
    this.validarCantidad();
  }

  validarCantidad() {
    const totalDespachado = this.despachos.value.reduce((sum, d) => sum + d.cantidad, 0);
    if (totalDespachado > this.OP.cantidad) {
      this.error = `La cantidad total no puede exceder ${this.OP.cantidad}`;
    } else {
      this.error = '';
    }
  }

  @Input() nueva: any;
  @Output() onCloseModal = new EventEmitter();

  public almacenado = 0;
  public producto: any;
  public OP: any = {
    cliente: '',
    oc: '',
    solicitud: '',
    montaje: '',
    ejemplares: 0,
    cantidad: 0,
    demasia: 0,
    sustrato: {
      sustrato: '',
      cantidad: 0,
    },
    tinta: [
      {
        tinta: '',
        cantidad: 0,
      },
    ],
    barniz: {
      barniz: '',
      cantidad: 0,
    },
    pega: {
      pega: '',
      cantidad: 0,
    },

    producto: {
      materia_prima: {
        sustrato: [],
      },
    },
    hojas: 0,
  };

  public color_selected;
  public tintas_added: any = [];

  public Ordenes: any;
  public productos: any;
  public colorIndex = 0;
  public paletaVinotinto = [
    '#ffe4e1', // Rosa pastel
    '#d8f8e1', // Verde menta
    '#fcb7af', // Melocotón suave
    '#b0f2c2', // Azul cielo
    '#b0c2f2', // Lila delicado
    '#fabfb7', // Rosa empolvado
    '#fdf9c4', // Amarillo pálido
    '#c5c6c8', // Gris perla
    '#b2e2f2', // Azul celeste
    '#ddcdce', // Beige suave
  ];
  public Trabajos: any;
  public Tintas: any;
  public id_producto: any;
  public demasia = 0;
  maquinasOrigen: any = this.maquinas.maquinas;
  maquinasDestino: any = [];
  faseEliminada: any = {};
  maquina: any = [];
  fase: any = [];
  cards = [
    { title: 'Identificación del producto', content: 'Contenido 1' },
    { title: 'Sustrato', content: 'Contenido 1' },
    { title: 'Tintas', content: 'Contenido 1' },
    { title: 'Barniz', content: 'Contenido 1' },
    { title: 'Embalaje', content: 'Contenido 1' },
    { title: 'Maquinas', content: 'Contenido 1' },
    { title: 'Planificación', content: 'Contenido 1' },
    { title: 'Adicional', content: 'Contenido 1' },
    // Agrega más tarjetas según sea necesario
  ];
  currentIndex = 0;

  public coloresHex = {
    A: '#FFFF00', // Amarillo
    M: '#FF00FF', // Magenta
    C: '#00FFFF', // Cyan
    K: '#000000', // Negro
  };

  public colores = [
    'rgba(255, 87, 51, 1)', // Rojo
    'rgba(199, 0, 57, 1)', // Rojo oscuro
    'rgba(144, 12, 63, 1)', // Morado oscuro
    'rgba(88, 24, 69, 1)', // Morado
    'rgba(28, 28, 28, 1)', // Negro
    'rgba(46, 204, 113, 1)', // Verde
    'rgba(255, 195, 0, 1)', // Amarillo
    'rgba(218, 247, 166, 1)', // Verde claro
    'rgba(88, 24, 69, 1)', // Morado
    'rgba(255, 87, 51, 1)', // Rojo
  ];

  public ShowInfo: any;

  public width_resized = {
    width: '110px',
  };

  public medidas: any;

  public dragDisabled = false;

  public width_tal = 110;
  public position = 0;

  public feriados: number[] = [];

  selectedIdea: any;

  test1 = '2024-06-11';
  test2 = '2024-06-12';

  mostrarTooltip: boolean = false;

  currentDate!: string;

  agregarColor() {
    this.tintas_added.push(this.producto.materia_prima.tintas[this.color_selected]);
    console.log(this.tintas_added);
  }

  selectedTintas: { [key: string]: boolean } = {};

  onTintaChange(tintaId: string, event: any) {
    const selected = (event.target as HTMLSelectElement).value !== '#';
    this.selectedTintas[tintaId] = selected;

    const value = event.target.value;

    const n = value.split('_');

    if (!this.OP.tinta[n[0]]) {
      this.OP.tinta[n[0]] = {
        tinta: '',
        cantidad: 0,
      };
    }

    this.OP.tinta[n[0]].tinta = n[1];
    this.OP.tinta[n[0]].cantidad = Number(this.Necesario(n[2]).toFixed(2));

    console.log(this.OP);
  }

  public barniz_selected;
  CalcularBarniz(e) {
    if (e.value != '#') {
      this.barniz_selected = this.producto.materia_prima.barnices[e.value];

      this.OP.barniz.barniz = this.barniz_selected.barniz._id;
      this.OP.barniz.cantidad = Number(this.Necesario(this.barniz_selected.cantidad).toFixed(2));

      console.log(this.OP);
    }
  }

  public pega_selected;
  CalcularPega(e) {
    if (e.value != '#') {
      this.pega_selected = this.producto.post_impresion.pegamento[e.value];

      this.OP.pega.pega = this.pega_selected.pega._id;
      this.OP.pega.cantidad = Number(this.Necesario(this.pega_selected.cantidad).toFixed(2));

      console.log(this.OP);
    }
  }

  calcularCajas(cabida) {
    return Math.ceil(this.OP.cantidad / cabida);
  }

  BuscarEnAlmacen(e) {
    this.almacenado = this.almacen.BuscarCantidadEnAlmacen(e.value);

    this.OP.sustrato.cantidad = this.OP.hojas + this.OP.demasia;
    console.log(this.OP);
  }

  buscarEnAlmacenDirecto(e) {
    return this.almacen.BuscarCantidadEnAlmacen(e);
  }

  isDisabled(tinta: any): boolean {
    const necesario = this.Necesario(tinta.cantidad);
    const enAlmacen = this.buscarEnAlmacenDirecto(tinta.tinta._id);
    return necesario > enAlmacen;
  }

  Necesario(cantidad) {
    return (cantidad / 1000) * (this.OP.hojas + this.OP.demasia);
  }

  ToNumber_(number) {
    return Number(number);
  }

  calcularHojas() {
    console.log(this.producto, ' - ', this.OP.cantidad);
    console.log(this.producto.pre_impresion.tamano_sustrato.montajes[this.OP.montaje].ejemplares);
    this.OP.ejemplares = this.producto.pre_impresion.tamano_sustrato.montajes[this.OP.montaje].ejemplares;
    this.OP.hojas = Math.ceil(this.OP.cantidad / this.OP.ejemplares);
  }

  calcularHojas_() {
    this.OP.hojas = Math.ceil(this.OP.cantidad / this.OP.ejemplares);
  }

  Absolute(n) {
    return Math.abs(n);
  }

  calcularTinta(cantidad) {
    const hojas_totales = Number(this.OP.hojas) + Number(this.OP.demasia);
    let total = (hojas_totales * cantidad) / 1000;
    total = Number(total.toFixed(2));
    return total;
  }

  calcularDesmasia() {
    const porcentajeDemasia = (this.OP.demasia / this.OP.hojas) * 100;
    return porcentajeDemasia.toFixed(2); // Retorna el porcentaje de demasía
  }

  ShowLetter(i) {
    return String.fromCharCode(65 + i);
  }

  // Función para convertir el color Hex a RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Eliminar el signo # si está presente
    hex = hex.replace(/^#/, '');

    // Si es un color hexadecimal de 3 dígitos, se convierte a 6 dígitos
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }

  // Función para decidir el color del texto en base al Hex
  getTextColorFromHex(hex: string): string {
    const { r, g, b } = this.hexToRgb(hex); // Convertir Hex a RGB

    // Cálculo de luminosidad percibida
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Si la luminosidad es alta, el texto será negro, de lo contrario será blanco
    return luminance > 186 ? 'black' : 'white';
  }

  toggleTooltip() {
    this.mostrarTooltip = !this.mostrarTooltip;
  }

  ShowToolTip(maquina, fase, date, inicio?, fin?) {
    if (!this.medidas[maquina].fases[fase].date[date]) {
      this.medidas[maquina].fases[fase].date[date] = true;
    } else {
      const old_inicio = moment(this.medidas[maquina].fases[fase].inicio[date], 'hh:mm');
      const old_fin = moment(this.medidas[maquina].fases[fase].fin[date], 'hh:mm');

      const inicio_ = moment(inicio, 'hh:mm');
      const fin_ = moment(fin, 'hh:mm');

      // Calculamos la duración en horas para ambos intervalos
      const duracion_old = moment.duration(old_fin.diff(old_inicio)).asHours();
      const duracion_nueva = moment.duration(fin_.diff(inicio_)).asHours();

      // Determinamos el cambio de horas
      const diferencia = duracion_nueva - duracion_old;

      if (diferencia > 0) {
        Swal.fire({
          icon: 'question',
          title: `Se agregaron ${diferencia} horas al horario.`,
          text: '¿Quieres descontarlas al final del proceso?',
          confirmButtonText: 'Descontar',
          showDenyButton: true,
          showCancelButton: false,
          denyButtonText: 'No descontar',
          confirmButtonColor: '#48c78e',
        }).then((result) => {
          if (result.isConfirmed) {
            console.log(this.medidas[maquina].fases[fase].width);
            console.log(parseInt(this.medidas[maquina].fases[fase].width) / 110);

            const largo = parseInt(this.medidas[maquina].fases[fase].width) / 110;

            const finActual = moment(this.medidas[maquina].fases[fase].fin[largo - 1], 'HH:mm');
            const inicioActual = moment(this.medidas[maquina].fases[fase].inicio[largo - 1], 'HH:mm');

            // Calcula la diferencia entre fin[largo-1] e inicio[largo-1] en horas
            const diferenciaMaxima = finActual.diff(inicioActual, 'hours');

            console.log(diferenciaMaxima);

            if (diferencia >= diferenciaMaxima) {
              // Si la diferencia excede el tiempo entre fin[largo-1] e inicio[largo-1]

              // Descontamos solo el tiempo necesario para igualar a inicio[largo-1]
              const newWidth = parseInt(this.medidas[maquina].fases[fase].width) - 110;
              this.medidas[maquina].fases[fase].width = `${newWidth}px`;

              // Calcula el tiempo restante y descuéntalo de fin[largo-2]
              const tiempoRestante = diferencia - diferenciaMaxima;

              if (largo - 2 != date) {
                this.medidas[maquina].fases[fase].fin[largo - 2] = moment(
                  this.medidas[maquina].fases[fase].fin[largo - 2],
                  'HH:mm',
                )
                  .subtract(tiempoRestante, 'hours')
                  .format('HH:mm');
              }
            } else {
              // Si la diferencia no excede el tiempo entre fin[largo-1] e inicio[largo-1], resta directamente
              this.medidas[maquina].fases[fase].fin[largo - 1] = moment(
                this.medidas[maquina].fases[fase].fin[largo - 1],
                'HH:mm',
              )
                .subtract(diferencia, 'hours')
                .format('HH:mm');
            }
          }
        });
        console.log(`Se agregaron ${diferencia} horas al horario.`);
      } else if (diferencia < 0) {
        Swal.fire({
          icon: 'question',
          title: `Se quitaron ${Math.abs(diferencia)} horas del horario.`,
          text: '¿Quieres agregarlos al proximo dia laboral?',
          confirmButtonText: 'Agregar',
          showDenyButton: true,
          showCancelButton: false,
          denyButtonText: 'No agregar',
          confirmButtonColor: '#48c78e',
        }).then((result) => {
          if (result.isConfirmed) {
            console.log(this.medidas[maquina].fases[fase].width);
            console.log(parseInt(this.medidas[maquina].fases[fase].width) / 110);
            const horarioDefault = this.horarios.horarios.find((x) => x.default == true);

            const largo = parseInt(this.medidas[maquina].fases[fase].width) / 110;

            const finActual = moment(this.medidas[maquina].fases[fase].fin[largo - 1], 'HH:mm');
            const inicioActual = moment(horarioDefault.a, 'HH:mm');

            // Calcula la diferencia entre fin[largo-1] e inicio[largo-1] en horas
            const diferenciaMaxima = inicioActual.diff(finActual, 'hours');

            console.log(Math.abs(diferencia), '<>', diferenciaMaxima);

            if (Math.abs(diferencia) >= diferenciaMaxima) {
              // Si la diferencia excede el tiempo entre fin[largo-1] e inicio[largo-1]

              // Descontamos solo el tiempo necesario para igualar a inicio[largo-1]
              this.medidas[maquina].fases[fase].fin[largo - 1] = horarioDefault.a;
              const newWidth = parseInt(this.medidas[maquina].fases[fase].width) + 110;
              this.medidas[maquina].fases[fase].width = `${newWidth}px`;

              // Calcula el tiempo restante y descuéntalo de fin[largo-2]
              const tiempoRestante = Math.abs(diferencia) - diferenciaMaxima;

              this.medidas[maquina].fases[fase].inicio[largo] = moment(horarioDefault.de, 'HH:mm').format('HH:mm');
              this.medidas[maquina].fases[fase].fin[largo] = moment(
                this.medidas[maquina].fases[fase].inicio[largo],
                'HH:mm',
              )
                .add(tiempoRestante, 'hours')
                .format('HH:mm');
            } else {
              // Si la diferencia no excede el tiempo entre fin[largo-1] e inicio[largo-1], resta directamente
              this.medidas[maquina].fases[fase].fin[largo - 1] = moment(
                this.medidas[maquina].fases[fase].fin[largo - 1],
                'HH:mm',
              )
                .add(Math.abs(diferencia), 'hours')
                .format('HH:mm');
            }

            // if(!this.NoCaeFeriado(this.CalcularPosicion(maquina,fase,date+1))){
            //   let fin =  moment((this.medidas[maquina].fases[fase].fin[date+2]), 'HH:mm')
            //   this.medidas[maquina].fases[fase].fin[date+2] = fin.add(Math.abs(diferencia), 'hours').format('HH:mm')
            // }else{
            //   this.medidas[maquina].fases[fase].fin[date+1] = moment(this.medidas[maquina].fases[fase].fin[date+1]).subtract(diferencia, 'hours').format('HH:mm')
            // }
          }
        });
        console.log(`Se quitaron ${Math.abs(diferencia)} horas del horario.`);
      }

      this.medidas[maquina].fases[fase].inicio[date] = inicio;
      this.medidas[maquina].fases[fase].fin[date] = fin;
      this.medidas[maquina].fases[fase].date[date] = false;
    }
  }

  showHideItem(i) {
    if (!this.ShowInfo[i]) {
      this.ShowInfo[i] = true;
    } else {
      this.ShowInfo[i] = false;
    }
  }

  getColor(index: number): string {
    const color = this.paletaVinotinto[this.colorIndex % this.paletaVinotinto.length];
    this.colorIndex++;
    return color;
  }

  findOC() {
    this.Ordenes = this.oc.buscarPorCliente(this.OP.cliente);
  }

  public OC_SELECTED;

  findProducts() {
    const orden = this.Ordenes.find((x: any) => x._id === this.OP.oc);
    this.OC_SELECTED = orden;

    const agrupados = new Map();

    for (const item of orden.pedido) {
      const id = item.producto._id;
      if (agrupados.has(id)) {
        agrupados.get(id).cantidad += Number(item.cantidad);
      } else {
        // Clonar el objeto para no modificar el original
        agrupados.set(id, {
          ...item,
          cantidad: Number(item.cantidad),
        });
      }
    }

    this.productos = Array.from(agrupados.values());
  }

  onDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      // Mover dentro del mismo arreglo
      moveItemInArray(this.maquinasDestino, event.previousIndex, event.currentIndex);
    } else {
      // Mover entre arreglos
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    setTimeout(() => {
      this.crearLargos(this.maquinasDestino);
    }, 1000);
  }

  crearLargos(maquinasDestino) {
    const result = this.medidas || [];

    const hoy = moment().format('yyyy-MM-DD');

    const horarioDefault = this.horarios.horarios.find((x) => x.default == true);

    const inicioHorario = moment(horarioDefault.de, 'HH:mm');
    const finHorario = moment(horarioDefault.a, 'HH:mm');
    let horas_trabajo = finHorario.diff(inicioHorario, 'hours');
    horas_trabajo = horas_trabajo - 1;

    maquinasDestino.forEach((maquina) => {
      let maquinaObj = result.find((m) => m.maquina === maquina);

      const produccion_diaria = maquina.trabajo * horas_trabajo;
      let diasNecesarios = Math.ceil((this.OP.hojas + this.OP.demasia) / produccion_diaria);

      const horas_necesarias = (this.OP.hojas + this.OP.demasia) / maquina.trabajo;

      const horas_restantes = horas_necesarias % horas_trabajo;

      console.log(horas_restantes);

      for (let i = 0; i < diasNecesarios; i++) {
        if (this.formatearFecha_(moment().add(i, 'days').format('yyyy-MM-DD')) === 'No laboral') {
          diasNecesarios++;
        }
      }

      const largo = 110 * diasNecesarios;
      if (!maquinaObj) {
        maquinaObj = {
          maquina: maquina,
          fases: [],
        };
        result.push(maquinaObj);
      }

      maquina.fases.forEach(() => {
        const faseArray = {
          width: `${largo}px`,
          fecha: hoy,
          final: hoy,
          inicio: [horarioDefault.de],
          fin: [horarioDefault.a],
          date: [false],
        };

        faseArray.final = moment(faseArray.fecha)
          .add(diasNecesarios - 1, 'days')
          .format('yyyy-MM-DD');

        for (let i = diasNecesarios - 1; i >= 0; i--) {
          if (i === diasNecesarios - 1) {
            if (!faseArray.inicio[i]) {
              faseArray.inicio[i] = horarioDefault.de;
            }

            if (!faseArray.fin[i]) {
              const horaInicial = moment(horarioDefault.de, 'HH:mm');

              faseArray.fin[i] = horaInicial.add(horas_restantes, 'hours').format('HH:mm');
            }
          } else {
            if (!faseArray.inicio[i]) {
              faseArray.inicio[i] = horarioDefault.de;
            }

            if (!faseArray.fin[i]) {
              faseArray.fin[i] = horarioDefault.a;
            }
          }
        }

        if (!maquinaObj.fases.some((fase) => fase.width)) {
          maquinaObj.fases.push(faseArray);
        }
      });
    });

    this.medidas = result;
  }

  eliminarFase(maquinaIndex: number, faseIndex: number): void {
    if (!this.maquinasDestino[maquinaIndex].fases[faseIndex].borrado) {
      this.maquinasDestino[maquinaIndex].fases[faseIndex].borrado = true;
    } else {
      this.maquinasDestino[maquinaIndex].fases[faseIndex].borrado = false;
    }

    // Verificar si todas las fases están marcadas como borradas
    const todasFasesBorradas = this.maquinasDestino[maquinaIndex].fases.every((fase) => fase.borrado);

    // Si todas las fases están borradas, establecer la primera fase como no borrada
    if (todasFasesBorradas) {
      this.maquinasDestino[maquinaIndex].fases[0].borrado = false;
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
    }
  }

  CalcularMetros(nombre) {
    const cinta = this.materiales.buscarCajasYmetros(nombre).cinta;
    return cinta;
  }

  mostrarProducto(e) {
    const cantidades_tal = this.OC_SELECTED.pedido.filter(
      (p) => p.producto._id === this.productos[e.value].producto._id,
    );

    for (let i = 0; i < cantidades_tal.length; i++) {
      console.warn(this.OC_SELECTED.orden);

      this.despachos.push(
        this.fb.group({
          lugar: [cantidades_tal[i].entrega, Validators.required],
          fecha: [cantidades_tal[i].solicitud, Validators.required],
          oc: [this.OC_SELECTED.orden, Validators.required],
          cantidad: [Number(cantidades_tal[i].cantidad), [Validators.required, Validators.min(1)]],
        }),
      );
    }

    this.producto = this.productos[e.value].producto;
    this.OP.producto = this.producto;

    const TintasPorColor = {};
    // Recorremos el arreglo original
    this.producto.materia_prima.tintas.forEach((tintas) => {
      const { color } = tintas.tinta;

      // Si el proveedor no existe en el objeto, lo creamos
      if (!TintasPorColor[color]) {
        TintasPorColor[color] = [];
      }

      // Agregamos el material al proveedor correspondiente
      TintasPorColor[color].push(tintas.tinta);
    });

    // Convertimos el objeto en un arreglo de proveedores
    const arregloCategorizado: any = Object.entries(TintasPorColor);
    this.Tintas = arregloCategorizado;

    console.log(this.Tintas);

    this.OP.cantidad = this.productos[e.value].cantidad;
    this.calcularHojas();
  }

  Limitar(inicio, fin) {}

  validate(event) {
    return true; // return false to prevent the resize
  }

  onResizeStart(event: any) {
    this.dragDisabled = true;
  }
  async onResizeEnd(event: ResizeEvent, maquina: number, fase: number): Promise<void> {
    this.dragDisabled = true;

    const horarioDefault = this.horarios.horarios.find((x) => x.default == true);

    if (event.rectangle.width) {
      let newWidth = Math.round(event.rectangle.width / 110) * 110;

      if (newWidth > 1540) {
        newWidth = 1540;
      }

      this.width_tal = newWidth;

      if (this.position + this.width_tal > 1540) {
        newWidth = 1540 - this.position;
      }

      await new Promise((resolve) => setTimeout(resolve, 0)); // Simulate an asynchronous operation

      this.medidas[maquina].fases[fase].width = `${newWidth}px`;
      // Calculate this.test2 based on newWidth
      const daysToAdd = Math.floor(newWidth / 110); // Calculate number of days to add based on newWidth
      this.medidas[maquina].fases[fase].final = moment(this.medidas[maquina].fases[fase].fecha)
        .add(daysToAdd - 1, 'days')
        .format('yyyy-MM-DD'); // Add days to test1 and assign to test2

      for (let i = daysToAdd - 1; i >= 0; i--) {
        if (!this.medidas[maquina].fases[fase].inicio[i]) {
          this.medidas[maquina].fases[fase].inicio[i] = horarioDefault.de;
        }

        if (!this.medidas[maquina].fases[fase].fin[i]) {
          this.medidas[maquina].fases[fase].fin[i] = horarioDefault.a;
        }
      }
    }

    this.dragDisabled = false;
  }

  onDragEnd(event: CdkDragEnd, maquina, fase) {
    const hoy = moment().format('yyyy-MM-DD');
    const currentYPosition = event.source.getFreeDragPosition().y;
    let newPositionX = Math.round(event.source.getFreeDragPosition().x / 110) * 110;
    if (newPositionX < 0) {
      newPositionX = 0;
    } else if (newPositionX > 1430) {
      newPositionX = 1430;
    }

    this.position = newPositionX;

    if (this.position + this.width_tal > 1540) {
      this.width_tal = 1540 - this.position;
      this.medidas[maquina].fases[fase].width = `${this.width_tal}px`;
    }

    console.log(this.position);

    // Calculate this.test2 based on newWidth
    const daysToAdd = Math.floor(this.position / 110); // Calculate number of days to add based on newWidth
    this.medidas[maquina].fases[fase].fecha = moment(hoy).add(daysToAdd, 'days').format('YYYY-MM-DD'); // Add days to test1 and assign to test1
    const widthString = this.medidas[maquina].fases[fase].width; // '330px'
    const widthNumber = parseInt(widthString, 10); // 330
    const daysToAdd2 = Math.floor(widthNumber / 110);
    this.medidas[maquina].fases[fase].final = moment(this.medidas[maquina].fases[fase].fecha)
      .add(daysToAdd2 - 1, 'days')
      .format('YYYY-MM-DD'); // Add days to test1 and assign to test2

    event.source.setFreeDragPosition({ x: newPositionX, y: currentYPosition });
  }

  CalcularPosicion(x, i, n) {
    const hoy = moment().format('yyyy-MM-DD');
    const fin = moment(this.medidas[x].fases[i].fecha);

    // console.log(hoy,'-',fin)

    return fin.diff(hoy, 'days') + n;
  }

  onDragStarted(event: CdkDragStart) {
    this.dragDisabled = false;
  }

  formatearFecha(fecha) {
    moment.locale('es');
    const Calendario = this.horarios.calendario.find((x) => x.year === Number(moment(fecha).format('yyyy')));
    const feriado = Calendario.dias.find(
      (x) => x.month === Number(moment(fecha).format('M')) - 1 && x.day === Number(moment(fecha).format('D')),
    );

    if (feriado) {
      return moment(fecha).format('dddd D/M');
    } else {
      return moment(fecha).format('dddd D/M');
    }
  }

  formatearFecha_(fecha) {
    moment.locale('es');
    const Calendario = this.horarios.calendario.find((x) => x.year === Number(moment(fecha).format('yyyy')));
    const feriado = Calendario.dias.find(
      (x) => x.month === Number(moment(fecha).format('M')) - 1 && x.day === Number(moment(fecha).format('D')),
    );

    if (feriado) {
      const hoy = moment().format('yyyy-MM-DD');
      const fin = moment(fecha);

      this.feriados.push(fin.diff(hoy, 'days'));

      return `No laboral`;
    } else {
      return moment(fecha).format('dddd D/M');
    }
  }

  selectIdea(idea): void {
    if (this.selectedIdea === idea) {
      this.selectedIdea = null;
    } else {
      this.selectedIdea = idea;
    }
  }

  DropMaquina(maquina, fase: number, maquina_?) {
    // Clonar profundamente el objeto que se pasa
    const maquinaToAdd = JSON.parse(JSON.stringify(maquina_));

    // Crear un nuevo array con solo la fase específica
    maquinaToAdd.fases = [maquinaToAdd.fases[fase]];

    // Agregar la máquina modificada a maquinasDestino
    this.maquinasDestino.push(maquinaToAdd);

    // Llamar a la función para crear largos
    this.crearLargos(this.maquinasDestino);
  }

  deleteFromUsar(i) {
    this.maquinasDestino.splice(i, 1);
  }

  ExtraerMedida(medida) {
    const numero: number = parseFloat(medida.match(/\d+/)[0]);
    return numero / 110;
  }

  ShowTime(e) {
    console.log(e.value);
  }

  convertFrom24To12Format(time: string): string {
    const [hour, min] = time.split(':');
    let formattedHour = parseInt(hour);
    const part = formattedHour >= 12 ? 'pm' : 'am';

    if (formattedHour === 0) {
      formattedHour = 12;
    } else if (formattedHour > 12) {
      formattedHour -= 12;
    }

    const formattedMin = min.padStart(2, '0');
    return `${formattedHour}:${formattedMin} ${part}`;
  }

  generateDates(): string[] {
    const dates: any = [];
    for (let i = 1; i <= 14; i++) {
      const nextDate = moment(this.currentDate).add(i, 'days').format('YYYY-MM-DD');
      dates.push(nextDate);
    }
    return dates;
  }

  GuardarTrabajo = async () => {
    this.guardando = true;
    this.OP.fases = [];
    this.OP.fases = this.medidas;

    for (let i = 0; i < this.OP.fases.length; i++) {
      if (!this.OP.fases[i].nombre) {
        this.OP.fases[i].nombre = this.OP.fases[i].maquina.fases[0].nombre;
      }
    }

    const requisicion = {
      status: 'Por Asignar',
      materiales: [
        {
          material: this.OP.sustrato.sustrato,
          cantidad: this.OP.sustrato.cantidad,
        },
        {
          material: this.OP.barniz.barniz,
          cantidad: this.OP.barniz.cantidad,
        },
        {
          material: this.OP.pega.pega,
          cantidad: this.OP.pega.cantidad,
        },
        // Agregar las tintas
        ...this.OP.tinta.map((tinta) => ({
          material: tinta.tinta,
          cantidad: tinta.cantidad,
        })),
      ].filter((m) => m !== null), // Filtrar los null,
      motivo: 'Nueva orden de producción',
    };

    await this.api.guardarOrdenProduccion(this.OP, requisicion);

    this.guardando = false;
    this.OP = {
      cliente: '',
      oc: '',
      solicitud: '',
      montaje: '',
      ejemplares: 0,
      cantidad: 0,
      demasia: 0,
      sustrato: {
        sustrato: '',
        cantidad: 0,
      },
      tinta: [
        {
          tinta: '',
          cantidad: 0,
        },
      ],
      barniz: {
        barniz: '',
        cantidad: 0,
      },
      pega: {
        pega: '',
        cantidad: 0,
      },

      producto: {
        materia_prima: {
          sustrato: [],
        },
      },
      hojas: 0,
    };

    this.onCloseModal.emit();
  };

  returnData(x, y, z) {
    this.medidas[x].fases[y].inicio[z] = '';
    this.medidas[x].fases[y].fin[z] = '';
  }

  NoCaeFeriado(n) {
    const Feriado = this.feriados.find((dia) => dia === n);
    // console.log(Feriado);
    if (!Feriado && Feriado !== 0) {
      // para manejar el caso cuando Feriado es 0
      return true;
    } else {
      return false;
    }
  }
}
