import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Producto } from 'src/app/compras/models/modelos-compra';
import { ClientesService } from 'src/app/services/clientes.service';
import { MaquinasService } from 'src/app/services/maquinas.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { ProductosService } from 'src/app/services/productos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-producto',
  standalone: false,
  templateUrl: './nuevo-producto.component.html',
  styleUrls: ['./nuevo-producto.component.scss'],
})
export class NuevoProductoComponent {
  constructor(
    public clientes: ClientesService,
    public materiales: MaterialesService,
    public maquinas: MaquinasService,
    public api: ProductosService,
  ) {}

  @Input() nuevo: any;
  @Input() producto!: Producto;
  @Output() onCloseModal = new EventEmitter();

  public guardando = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['nuevo']?.currentValue === true) {
      this.guardando = false;
      this.currentStep = 1;
      this.seleccion_tinta = false;
    }
  }

  // --- Step wizard ---
  public currentStep = 1;
  public steps = [
    { num: 1, label: 'Identificación', icon: 'fa-id-card' },
    { num: 2, label: 'Dimensiones', icon: 'fa-ruler' },
    { num: 3, label: 'Materia prima', icon: 'fa-boxes' },
    { num: 4, label: 'Pre-impresión', icon: 'fa-film' },
    { num: 5, label: 'Impresión', icon: 'fa-print' },
    { num: 6, label: 'Post-impresión', icon: 'fa-box' },
  ];
  get totalSteps(): number {
    return this.steps.length;
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

  get progressPercentage(): number {
    let filled = 0;
    let total = 0;
    const p = this.producto;
    // Step 1
    total += 3;
    if (p.cliente) filled++;
    if (p.producto) filled++;
    if (p.codigo) filled++;
    // Step 2
    total += 3;
    if (p.tamano_desplegado?.length) filled++;
    if (p.tamano_cerrado?.length) filled++;
    if (p.diseno) filled++;
    // Step 3
    total += 3;
    if (p.sustrato?.length) filled++;
    if (p.tintas?.length) filled++;
    if (p.barnices?.length) filled++;
    // Step 4
    total += 2;
    if (p.archivo_diseno) filled++;
    if (p.tipo_plancha) filled++;
    // Step 5
    total += 2;
    if (p.maquinas?.length) filled++;
    if (p.tamano_sustrato_imprimir?.length) filled++;
    // Step 6
    total += 3;
    if (p.troqueladora?.length) filled++;
    if (p.guillotina?.length) filled++;
    if (p.caja?.length) filled++;
    return total ? Math.round((filled / total) * 100) : 0;
  }

  // --- Input helpers ---
  sustrato_selected = '';
  maquina_selected = '';
  troqueladora_selected = '';
  guillotina_selected = '';
  pegadora_selected = '';
  tinta_selected = { tinta: '', cantidad: 0 };
  barniz_selected = { barniz: '', cantidad: 0 };
  seleccion_tinta = false;

  Impresion_(maquina, fase_) {
    return maquina.fases?.some((fase) => fase.nombre === fase_) || false;
  }

  notificar() {
    if (!this.seleccion_tinta) {
      Swal.fire({
        icon: 'info',
        title: 'Cuidado con el orden',
        text: 'Para la creación del producto es necesario señalar las tintas en el orden en el que fueron codificados los colores, la "Cantidad" de tinta necesaria para este producto debe ser indicada por cada 1.000 hojas',
        confirmButtonText: 'DE ACUERDO',
        confirmButtonColor: '#48c78e',
      });
      this.seleccion_tinta = true;
    }
  }

  // --- Storage methods ---
  almacenarElemento(tipo: string, elemento: any, propiedad: string) {
    if (elemento && !this.producto[propiedad].includes(elemento)) {
      this.producto[propiedad].push(elemento);
    }
    this[tipo] = '';
  }

  AlmacenarSustrato() {
    if (this.sustrato_selected && !this.producto.sustrato.includes(this.sustrato_selected)) {
      this.producto.sustrato.push(this.sustrato_selected);
    }
    this.sustrato_selected = '';
  }

  AlmacenaTinta() {
    if (this.tinta_selected.tinta) {
      const idx = this.producto.tintas.findIndex((t) => t.tinta === this.tinta_selected.tinta);
      if (idx === -1) this.producto.tintas.push({ ...this.tinta_selected });
      this.tinta_selected = { tinta: '', cantidad: 0 };
    }
  }

  AlmacenarBarniz() {
    if (this.barniz_selected.barniz) {
      const idx = this.producto.barnices.findIndex((b) => b.barniz === this.barniz_selected.barniz);
      if (idx === -1) this.producto.barnices.push({ ...this.barniz_selected });
      this.barniz_selected = { barniz: '', cantidad: 0 };
    }
  }

  AlmacenarMaquina() {
    if (this.maquina_selected && !this.producto.maquinas.includes(this.maquina_selected)) {
      this.producto.maquinas.push(this.maquina_selected);
    }
    this.maquina_selected = '';
  }

  AlmacenarTroqueladora() {
    if (this.troqueladora_selected && !this.producto.troqueladora.includes(this.troqueladora_selected)) {
      this.producto.troqueladora.push(this.troqueladora_selected);
    }
    this.troqueladora_selected = '';
  }

  AlmacenarGuillotina() {
    if (this.guillotina_selected && !this.producto.guillotina.includes(this.guillotina_selected)) {
      this.producto.guillotina.push(this.guillotina_selected);
    }
    this.guillotina_selected = '';
  }

  AlmacenarPegadora() {
    if (this.pegadora_selected && !this.producto.pegadora.includes(this.pegadora_selected)) {
      this.producto.pegadora.push(this.pegadora_selected);
    }
    this.pegadora_selected = '';
  }

  // --- Delete confirmations ---
  confirmarEliminar(arr: any[], index: number, nombre: string) {
    Swal.fire({
      title: `¿Eliminar ${nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((r) => {
      if (r.isConfirmed) {
        arr.splice(index, 1);
        Swal.fire({
          toast: true,
          timer: 2000,
          icon: 'success',
          text: `${nombre} eliminado`,
          showConfirmButton: false,
          position: 'top-end',
        });
      }
    });
  }

  getNombreSustrato(id): string {
    const m = this.materiales.materiales?.find((x) => x._id === id);
    return m ? `${m.nombre} (${m.fabricante?.alias}) ${m.gramaje}g cal:${m.calibre}` : id;
  }

  getNombreTinta(id): string {
    const m = this.materiales.materiales?.find((x) => x._id === id);
    return m ? `${m.nombre} (${m.fabricante?.alias})` : id;
  }

  getNombreMaquina(id): string {
    const m = this.maquinas.maquinas?.find((x) => x._id === id);
    return m?.nombre || id;
  }

  // --- Save ---
  cerrar() {
    if (this.guardando) return;
    this.onCloseModal.emit();
  }

  get editando(): boolean {
    return !!this.producto?._id;
  }

  private toNested(p: Producto) {
    const s = (v: any) => v?.toString() ?? '';
    const nested: any = {
      identificacion: {
        cliente: p.cliente || '',
        producto: p.producto || '',
        codigo: p.codigo || '',
        version: '1',
        codigo_cliente: p.codigo_cliente || '',
      },
      dimensiones: {
        desplegado: {
          ancho: s(p.tamano_desplegado?.[0]),
          largo: s(p.tamano_desplegado?.[1]),
          tolerancia: s(p.tamano_desplegado?.[2]),
        },
        cerrado: {
          ancho: s(p.tamano_cerrado?.[0]),
          largo: s(p.tamano_cerrado?.[1]),
          alto: '',
          tolerancia: s(p.tamano_cerrado?.[2]),
        },
        diseno: p.diseno || '',
      },
      materia_prima: {
        sustrato: p.sustrato || [],
        tintas: p.tintas || [],
        barnices: p.barnices || [],
      },
      pre_impresion: {
        diseno: p.archivo_diseno || '',
        montajes: (p.archivo_montaje?.[1]?.trim()) ? '2' : '1',
        nombre_montajes: (p.archivo_montaje || []).filter((n) => n),
        tamano_sustrato: {
          montajes: [
            { ancho: s(p.tamano_sustrato_imprimir?.[0]), largo: s(p.tamano_sustrato_imprimir?.[1]), ejemplares: s(p.tamano_sustrato_imprimir?.[2]) },
            { ancho: s(p.tamano_sustrato_imprimir?.[3]), largo: s(p.tamano_sustrato_imprimir?.[4]), ejemplares: s(p.tamano_sustrato_imprimir?.[5]) },
          ],
          margenes: [
            { inferior: '', superior: '', izquierdo: '', derecho: '' },
            { inferior: '', superior: '', izquierdo: '', derecho: '' },
          ],
        },
        plancha: { tipo: p.tipo_plancha || '', marca: '', tiempo_exposicion: s(p.tiempo_exposicion) },
        pelicula: [],
      },
      impresion: {
        impresoras: p.maquinas || [],
        secuencia: [],
        pinzas: [],
        fuentes: [],
      },
      post_impresion: {
        otros: [],
        troqueladora: p.troqueladora || [],
        henidura: { alto: '', ancho: '' },
        guillotina: p.guillotina || [],
        pegadora: p.pegadora || [],
        pegamento: p.pegamento || [],
        caja: { nombre: p.caja?.[0] || '', cabida: p.unidades_por_caja ? [s(p.unidades_por_caja)] : [] },
        distribucion: {
          aerea: p.vista_aerea || '',
          v3d: p.vista_3d || '',
          peso_cajas: p.peso_cajas || '',
          estibas: s(p.cantidad_estibas),
          paletizado: p.paletizado || '',
        },
      },
    };
    if (p._id) nested._id = p._id;
    return nested;
  }

  GuardarProducto() {
    this.guardando = true;
    const data = this.toNested(this.producto);
    this.api.GuardarProducto(data);
    const label = data._id ? 'actualizado' : 'creado';
    setTimeout(() => {
      this.guardando = false;
      Swal.fire({
        icon: this.api.mensaje?.icon || 'success',
        text: this.api.mensaje?.mensaje || `Producto ${label} correctamente`,
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
      this.onCloseModal.emit();
    }, 1000);
  }
}
