import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { Proveedores } from '../../models/modelos-compra';
import { PaisesService } from 'src/app/services/paises.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-nuevo-proveedor',
  standalone: false,
  templateUrl: './nuevo-proveedor.component.html',
  styleUrls: ['./nuevo-proveedor.component.scss'],
})
export class NuevoProveedorComponent implements OnInit, OnChanges {
  @Input() nuevo!: boolean;
  @Input() editar!: boolean;
  @Input() proveedor!: Proveedores;
  @Input() api: any;
  @Input() cargando!: boolean;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();

  public nombre: string = '';
  public direccion: string = '';
  public rif: string = '';
  public identificacion_fiscal: string = '';
  public pais: string = '';
  public estado: string = '';
  public estados: string[] = [];
  public cargandoEstados: boolean = false;
  public contacto_nombre: string = '';
  public contacto_numero: string = '';
  public contacto_email: string = '';
  public contacto_cargo: string = '';
  public fabricante: any;
  public contactos: any = [];
  public fabricantes_array: any = [];
  public fabricantes_array_name: any = [];
  public guardando: boolean = false;

  get formValido(): boolean {
    if (this.guardando) return false;
    if (this.nuevo) {
      if (!this.nombre || !this.direccion || !this.pais) return false;
      if (!this.estado) return false;
      if (!this.rif && !this.identificacion_fiscal) return false;
      if (this.contactos.length === 0) return false;
      if (this.fabricantes_array.length === 0) return false;
    } else {
      if (!this.proveedor?.nombre || !this.proveedor?.direccion || !this.proveedor?.pais) return false;
      if (!this.proveedor?.estado) return false;
      if (!this.proveedor?.rif && !this.proveedor?.identificacion_fiscal) return false;
      if (!this.proveedor?.contactos || (this.proveedor.contactos as any[]).length === 0) return false;
      if (!this.proveedor?.fabricantes || this.proveedor.fabricantes.length === 0) return false;
    }
    return true;
  }

  public listaPaises: { nombre: string; nombreEn: string }[] = [];
  public cargandoPaises: boolean = true;

  constructor(
    public fabricantes: FabricantesService,
    private paisesService: PaisesService,
  ) {}

  ngOnInit(): void {
    this.guardando = false;
    this.paisesService.getPaises().subscribe((paises) => {
      this.listaPaises = paises;
      this.cargandoPaises = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nuevo']?.currentValue) {
      this.guardando = false;
      this.nombre = '';
      this.direccion = '';
      this.rif = '';
      this.identificacion_fiscal = '';
      this.pais = '';
      this.estado = '';
      this.estados = [];
      this.contactos = [];
      this.fabricantes_array = [];
      this.fabricantes_array_name = [];
    }
    if (changes['editar']?.currentValue) {
      this.guardando = false;
    }
  }

  onPaisChange() {
    this.estado = '';
    this.estados = [];
    const pais = this.pais || this.proveedor?.pais;
    if (!pais) return;
    this.cargandoEstados = true;
    const paisObj = this.listaPaises.find((p) => p.nombre === pais);
    const paisApi = paisObj?.nombreEn || pais;
    this.paisesService.getEstados(paisApi).pipe(take(1)).subscribe((states) => {
      this.estados = states;
      this.cargandoEstados = false;
    });
  }

  cerrar() {
    this.nombre = '';
    this.direccion = '';
    this.rif = '';
    this.identificacion_fiscal = '';
    this.pais = '';
    this.estado = '';
    this.estados = [];
    this.contactos = [];
    this.fabricantes_array = [];
    this.fabricantes_array_name = [];
    this.onCloseModal.emit();
  }

  cerrar_() {
    this.nombre = '';
    this.direccion = '';
    this.rif = '';
    this.identificacion_fiscal = '';
    this.pais = '';
    this.estado = '';
    this.estados = [];
    this.contactos = [];
    this.fabricantes_array = [];
    this.fabricantes_array_name = [];
    this.onCloseModal_.emit();
  }

  EliminarContacto(i: number) {
    this.contactos.splice(i, 1);
  }

  formatRif(event: any) {
    const regex = /^[JVGC]-?\d{0,8}-?\d{0,1}$/;
    const newValue = event.target.value.toUpperCase();
    if (!regex.test(newValue)) {
      this.rif = newValue.substring(0, newValue.length - 1);
    } else {
      const formattedValue = newValue.replace(/(\d{0})(\d{8})(\d{1})/, '$1-$2-$3');
      this.rif = formattedValue;
    }
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  addFabricante() {
    if (!this.fabricantes_array.includes(this.fabricantes.fabricantes[this.fabricante]._id)) {
      this.fabricantes_array.push(this.fabricantes.fabricantes[this.fabricante]._id);
      this.fabricantes_array_name.push(this.fabricantes.fabricantes[this.fabricante].alias);
      this.fabricante = '';
    }
  }

  addFabricante_() {
    if (!this.proveedor.fabricantes.includes(this.fabricantes.fabricantes[this.fabricante])) {
      this.proveedor.fabricantes.push(this.fabricantes.fabricantes[this.fabricante]);
      this.fabricante = '';
    }
  }

  EliminarFabricante(i: number) {
    this.fabricantes_array.splice(i, 1);
    this.fabricantes_array_name.splice(i, 1);
  }

  fabricante_selected(e: any | null) {
    if (e.value != '#') {
      this.fabricante = e.value;
    }
  }

  getFabricanteNames(fabricantes: any[]): string[] {
    return fabricantes?.map((f: any) => f.alias || f.nombre) || [];
  }

  NuevoContacto() {
    this.contactos.push({
      nombre: this.contacto_nombre,
      numero: this.contacto_numero,
      email: this.contacto_email,
      cargo: this.contacto_cargo,
    });
    this.contacto_email = '';
    this.contacto_nombre = '';
    this.contacto_numero = '';
    this.contacto_cargo = '';
  }

  NuevoContacto_() {
    this.proveedor.contactos.push({
      nombre: this.contacto_nombre,
      numero: this.contacto_numero,
      email: this.contacto_email,
      cargo: this.contacto_cargo,
    });
    this.contacto_email = '';
    this.contacto_nombre = '';
    this.contacto_numero = '';
    this.contacto_cargo = '';
  }

  GuardarProveedor() {
    this.guardando = true;
    const data: Proveedores = {
      fabricantes: this.fabricantes_array,
      nombre: this.nombre,
      direccion: this.direccion,
      rif: this.rif,
      contactos: this.contactos,
      pais: this.pais || undefined,
      estado: this.estado || undefined,
      identificacion_fiscal: this.identificacion_fiscal || undefined,
    };
    this.api.nuevoProveedor(data);
    this.cerrar();
  }

  EditarProveedor() {
    this.guardando = true;
    this.proveedor.fabricantes = this.proveedor.fabricantes.map((e: any) => e._id);
    this.api.editarProveedores(this.proveedor);
    this.cerrar();
  }
}
