import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { Fabricante, Fabricante_populated, Grupo, Origenes, Proveedores } from '../../models/modelos-compra';
import { FabricantesService } from 'src/app/services/fabricantes.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { PaisesService } from 'src/app/services/paises.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-nuevo-fabricante',
  standalone: false,
  templateUrl: './nuevo-fabricante.component.html',
  styleUrls: ['./nuevo-fabricante.component.scss'],
})
export class NuevoFabricanteComponent implements OnInit, OnChanges {
  @Input() nuevo: any;
  @Input() data!: Fabricante_populated;
  @Input() editar: any;
  @Input() cargando!: boolean;
  @Output() onCloseModal = new EventEmitter();
  @Output() onCloseModal_ = new EventEmitter();

  nombre: string = '';
  alias: string = '';
  identificacion_fiscal: string = '';
  pais: string = '';
  estado: string = '';
  estados: string[] = [];
  cargandoEstados: boolean = false;
  grupo: string = '';
  proveedor_directo: boolean = false;

  p_nombre: string = '';
  p_telefono: string = '';
  p_correo: string = '';
  p_contacto: any = [];
  p_direccion: string = '';
  p_rif: string = '';
  p_cargo: string = '';

  proveedor_directo_selected: any;
  proveedor_directo_abierto: boolean = false;

  public origenes: Array<Origenes> = [];
  public grupos: Array<Grupo> = [];

  public guardando: boolean = false;
  public correo_valido = false;

  public edicionGrupo: boolean[] = [];

  get formValido(): boolean {
    if (this.guardando) return false;
    if (this.nuevo) {
      if (!this.nombre || !this.alias) return false;
      if (this.origenes.length === 0) return false;
      if (this.grupos.length === 0) return false;
      if (this.proveedor_directo) {
        if (!this.p_direccion || !this.p_rif) return false;
        if (this.p_contacto.length === 0) return false;
      }
    } else {
      if (!this.data?.nombre || !this.data?.alias) return false;
      if (!this.data?.origenes || this.data.origenes.length === 0) return false;
      if (!this.data?.grupo || this.data.grupo.length === 0) return false;
      if (this.proveedor_directo_abierto && this.proveedor_directo_selected?.[0]) {
        const p = this.proveedor_directo_selected[0];
        if (!p.direccion || !p.rif) return false;
        if (!p.contactos || p.contactos.length === 0) return false;
      }
    }
    return true;
  }

  constructor(
    public api: FabricantesService,
    public proveedor_service: ProveedoresService,
    private paisesService: PaisesService,
  ) {}

  public listaPaises: { nombre: string; nombreEn: string }[] = [];
  public cargandoPaises: boolean = true;

  ngOnInit(): void {
    this.paisesService.getPaises().subscribe((paises) => {
      this.listaPaises = paises;
      this.cargandoPaises = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nuevo'] && changes['nuevo'].currentValue) {
      this.guardando = false;
    }
    if (changes['editar'] && changes['editar'].currentValue) {
      this.guardando = false;
      this.proveedor_directo_abierto = false;
      this.proveedor_directo_selected = null;
    }
  }

  AgregarContacto() {
    this.p_contacto.push({
      nombre: this.p_nombre,
      numero: this.p_telefono,
      email: this.p_correo,
      cargo: this.p_cargo,
    });
    this.p_nombre = '';
    this.p_telefono = '';
    this.p_correo = '';
    this.p_cargo = '';
  }

  AgregarContacto_() {
    this.proveedor_directo_selected[0].contactos.push({
      nombre: this.p_nombre,
      numero: this.p_telefono,
      email: this.p_correo,
      cargo: this.p_cargo,
    });
    this.p_nombre = '';
    this.p_telefono = '';
    this.p_correo = '';
    this.p_cargo = '';
  }

  addGuion() {
    if (this.p_rif.length === 1) {
      this.p_rif = this.p_rif + '-';
    }
    if (this.proveedor_directo_selected?.rif === 1) {
      this.proveedor_directo_selected.rif + '-';
    }
  }

  checkValidity(email: any) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateEmail(correo: any) {
    this.correo_valido = this.checkValidity(correo);
  }

  deletecontacto(index: number) {
    this.p_contacto.splice(index, 1);
  }

  deletecontacto_(index: number) {
    this.proveedor_directo_selected[0].contactos.splice(index, 1);
  }

  proveedor(e: any) {
    this.proveedor_directo = e.checked;
  }

  cerrar() {
    this.onCloseModal.emit();
  }

  cerrar_() {
    this.onCloseModal_.emit();
  }

  onPaisChange() {
    this.estado = '';
    this.estados = [];
    const pais = this.pais;
    if (!pais) return;
    this.cargandoEstados = true;
    const paisObj = this.listaPaises.find((p) => p.nombre === pais);
    const paisApi = paisObj?.nombreEn || pais;
    this.paisesService.getEstados(paisApi).pipe(take(1)).subscribe((states) => {
      this.estados = states;
      this.cargandoEstados = false;
    });
  }

  onPaisChange_() {
    this.estado = '';
    this.estados = [];
    const pais = this.pais;
    if (!pais) return;
    this.cargandoEstados = true;
    const paisObj = this.listaPaises.find((p) => p.nombre === pais);
    const paisApi = paisObj?.nombreEn || pais;
    this.paisesService.getEstados(paisApi).pipe(take(1)).subscribe((states) => {
      this.estados = states;
      this.cargandoEstados = false;
    });
  }

  addOrigen() {
    const busqueda = this.origenes.find((x) => x.pais === this.pais && x.estado === this.estado);
    if (!busqueda) {
      this.origenes.push({ pais: this.pais, estado: this.estado });
      this.estado = '';
    }
  }

  deleteOrigen(i: number) {
    this.origenes.splice(i, 1);
  }

  deleteGrupo(i: number) {
    this.grupos.splice(i, 1);
  }

  deleteOrigen_(i: number) {
    this.data.origenes.splice(i, 1);
  }

  deleteGrupo_(i: number) {
    this.data.grupo.splice(i, 1);
  }

  addOrigen_() {
    const busqueda = this.data.origenes.find((x) => x.pais === this.pais && x.estado === this.estado);
    if (!busqueda) {
      this.data.origenes.push({ pais: this.pais, estado: this.estado });
      this.estado = '';
    }
  }

  addGrupo_() {
    const s_ = this.grupo.split('*');
    const nombre = s_[0];
    const id = s_[1];
    const busqueda = this.data.grupo.find((x) => x._id === id && x.nombre === nombre);
    if (!busqueda) {
      this.data.grupo.push({ _id: id, nombre });
      this.grupo = '';
    }
  }

  editGrupo(i) {
    this.edicionGrupo[i] = true;
  }

  editarGrupoEspec(index: any) {
    const data_actual: any = this.data.grupo[index];
    data_actual.split('*');
    const nombre = data_actual.split('*')[0];
    const _id = data_actual.split('*')[1];
    this.data.grupo[index] = { _id, nombre };
    this.edicionGrupo[index] = false;
  }

  addGrupo() {
    const s_ = this.grupo.split('*');
    const nombre = s_[0];
    const id = s_[1];
    const busqueda = this.grupos.find((x) => x._id === id && x.nombre === nombre);
    if (!busqueda) {
      this.grupos.push({ _id: id, nombre });
      this.grupo = '';
    }
  }

  guardarFabricante(): void {
    this.guardando = true;

    const { nombre, alias, origenes, grupos, identificacion_fiscal } = this;
    const nuevoFabricante: Fabricante = {
      nombre,
      alias,
      origenes,
      proveedor: this.proveedor_directo,
      grupo: grupos.map((grupo) => grupo._id),
      _id: '',
      identificacion_fiscal: identificacion_fiscal || undefined,
    };
    this.api.agregarFabricante(nuevoFabricante);

    if (this.proveedor_directo) {
      setTimeout(() => {
        const { nombre, p_contacto, p_direccion, p_rif, identificacion_fiscal } = this;
        const proveedor: Proveedores = {
          fabricantes: '',
          nombre,
          contactos: p_contacto,
          direccion: p_direccion,
          rif: p_rif,
          identificacion_fiscal: identificacion_fiscal || undefined,
        };
        this.proveedor_service.nuevoProveedor(proveedor);
        this.onCloseModal.emit();
        this.limpiarFormulario();
      }, 1000);
    }
    this.onCloseModal.emit();
  }

  BuscarProveedor() {
    if (!this.proveedor_directo_abierto) {
      this.proveedor_directo_selected = this.proveedor_service.seleccionarUnProveedor(this.data.nombre);
      this.proveedor_directo_abierto = true;
    } else {
      this.proveedor_directo_abierto = false;
    }
  }

  editarFabricante() {
    this.guardando = true;
    this.api.editarFabricante(this.data);

    if (this.proveedor_directo_selected) {
      setTimeout(() => {
        this.proveedor_service.editarProveedores(this.proveedor_directo_selected[0]);
        this.onCloseModal.emit();
      }, 1000);
    }
    this.onCloseModal.emit();
  }

  private limpiarFormulario() {
    this.nombre = '';
    this.alias = '';
    this.identificacion_fiscal = '';
    this.pais = '';
    this.estado = '';
    this.grupo = '';
    this.proveedor_directo = false;

    this.p_nombre = '';
    this.p_telefono = '';
    this.p_correo = '';
    this.p_contacto = [];
    this.p_direccion = '';
    this.p_rif = '';
    this.p_cargo = '';
    this.origenes = [];
    this.grupos = [];
    this.guardando = false;
  }
}
