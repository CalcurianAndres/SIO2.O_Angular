import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { multiply } from 'lodash';
import { DefectosService } from 'src/app/services/defectos.service';
import { LoginService } from 'src/app/services/login.service';
import { OproduccionService } from 'src/app/services/oproduccion.service';
import { TrabajadoresService } from 'src/app/services/trabajadores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-gestion',
  standalone: false,
  templateUrl: './nueva-gestion.component.html',
  styleUrls: ['./nueva-gestion.component.scss'],
})
export class NuevaGestionComponent {
  @Input() gestion: any;
  @Input() orden: any;
  @Input() fase: any;
  @Output() onCloseModal = new EventEmitter();

  public api = inject(OproduccionService);
  public login = inject(LoginService);
  public defectos = inject(DefectosService);
  public trabajadores = inject(TrabajadoresService);

  public tipo = '';
  public hojas: boolean = true;
  public productos: boolean = true;
  paletas = 0;

  p_yellow = 3;
  p_selected;

  public data: any = {
    orden: '',
    fase: 0,
    usuario: '',
    fecha: '',
    inicio: '',
    fin: '',
    hojas: 0,
    productos: 0,
    paletas: 0,
    team: [],
    defectos: [{ paleta: 0, defectos: [] }],
    observaciones: '',
  };

  public add_defecto: boolean = false;
  public defectos_: any = [];
  public searchText = '';

  defectos_agregados: any = [];

  public identificacion = '';
  public responsable = '';
  public supervisor = '';
  public analista = '';
  public accion = '';

  public causa = '';
  public accion_a_tomar = '';
  public comentario = '';
  public ticket_amarillo: any = [];
  public tipo_defecto = '';

  GuardarDefectos() {
    // console.error(this.orden.fases, '-', this.fase, '-', this.orden.fases[this.fase])

    this.data.defectos.push({
      paleta: this.p_selected,
      defectos: this.defectos_agregados,
    });

    this.ticket_amarillo = {
      op: this.orden._id,
      fase: `${this.orden.fases[this.fase].nombre} (${this.orden.fases[this.fase].maquina.nombre} ${this.orden.fases[this.fase].maquina.modelo})`,
      defectos: this.defectos_agregados,
      causa: this.causa,
      identificacion: this.identificacion,
      accion: this.accion_a_tomar,
      responsable: this.responsable,
      area_accion: this.accion,
      otro: this.comentario,
      supervisor: this.supervisor,
      analista: this.analista,
      paleta: this.p_selected,
      tipo: this.tipo_defecto,
    };

    this.defectos_agregados = [];
    this.defectos_ = [];
    this.gestion = true;
    this.add_defecto = false;
    (this.causa = ''), (this.accion_a_tomar = ''), (this.comentario = '');
    this.tipo_defecto = '';
  }

  FindDefecto(paleta: number) {
    let verificacion = this.data.defectos.find((x) => x.paleta === paleta);

    if (verificacion) {
      return {
        amarillo: true,
        defectos: verificacion.defectos,
      };
    } else {
      return {
        amarillo: false,
      };
    }
  }

  CalcularProductos(e: any) {
    this.data.productos = e.value * this.orden.ejemplares;
  }

  CalcularHojas(e: any) {
    this.data.hojas = e.value / this.orden.ejemplares;
  }

  agregarDefecto(e: any) {
    // Verifica si el defecto ya está en el array
    let agregado = this.defectos_agregados.some((defecto) => defecto === e.value);

    // Si no está agregado, añádelo
    if (!agregado) {
      this.defectos_agregados.push(e.value);
    }
  }

  GuardarData = async () => {
    this.data.orden = this.orden._id;
    this.data.fase = this.fase;
    this.data.usuario = `${this.login.usuario.Nombre} ${this.login.usuario.Apellido}`;
    this.api.NuevaGestion(this.data);
    this.orden;
    this.data = {
      orden: '',
      fase: 0,
      usuario: '',
      fecha: '',
      inicio: '',
      fin: '',
      hojas: 0,
      productos: 0,
      paletas: 0,
      team: [],
      defectos: [{ paleta: 0, defectos: [] }],
      observaciones: '',
    };

    this.api.nuevoTicketAmarillo(this.ticket_amarillo);
    this.ticket_amarillo = [];

    this.onCloseModal.emit();
    setTimeout(() => {
      Swal.fire({
        text: this.api.mensaje.mensaje,
        icon: this.api.mensaje.icon,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        timerProgressBar: true,
      });
    }, 1000);
  };

  cerrar() {
    this.onCloseModal.emit();
  }

  SeleccionarPaleta(n) {
    this.p_selected = n;
  }

  seleccionarTipo(tipo: any) {
    if (tipo.value === 'Hojas') {
      this.hojas = false;
      this.productos = true;
    } else {
      this.productos = false;
      this.hojas = true;
    }
  }

  filteredEmployees() {
    if (!this.searchText) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText.toLowerCase());

      const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);

      return searchMatch && !nombreEnTeam;
    });
  }

  public searchText_ = '';
  filteredEmployees_() {
    if (!this.searchText_) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText_.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText_.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText_.toLowerCase());

      const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);
      return searchMatch && !nombreEnTeam;
    });
  }

  public searchText__ = '';
  filteredEmployees__() {
    if (!this.searchText__) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText__.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText__.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText__.toLowerCase());

      const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);

      return searchMatch && !nombreEnTeam;
    });
  }

  public searchText___ = '';
  filteredEmployees___() {
    if (!this.searchText___) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText___.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText___.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText___.toLowerCase());

      const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);

      return searchMatch && !nombreEnTeam;
    });
  }

  public searchText____ = '';
  filteredEmployees____() {
    if (!this.searchText____) {
      return [];
    }

    return this.trabajadores.trabajador.filter((trabajador) => {
      const nombreCompleto = `${trabajador.datos_personales.nombres} ${trabajador.datos_personales.apellidos}`;
      const searchMatch =
        trabajador.datos_personales.nombres.toLowerCase().includes(this.searchText____.toLowerCase()) ||
        trabajador.datos_personales.apellidos.toLowerCase().includes(this.searchText____.toLowerCase()) ||
        trabajador.contratacion.cargo.nombre.toLowerCase().includes(this.searchText____.toLowerCase());

      const nombreEnTeam = this.data.team.find((empleado: string) => empleado === nombreCompleto);

      return searchMatch && !nombreEnTeam;
    });
  }

  agregarEmpleado(nombre: any, apellido: any) {
    let existe = this.data.team.find((empleado: string) => empleado === `${nombre} ${apellido}`);
    if (!existe) {
      this.data.team.push(`${nombre} ${apellido}`);
    }
  }

  buscarDefectos() {
    this.defectos_ = this.defectos.buscarPorClienteYCategoria(
      this.orden.cliente._id,
      this.orden.producto[0].identificacion.categoria,
    ).defectos;

    console.log(this.defectos_);
  }

  addNew = async () => {
    const defecto_ = this.defectos.buscarPorClienteYCategoria(
      this.orden.cliente._id,
      this.orden.producto[0].identificacion.categoria,
    );

    console.log(defecto_);

    let data = {
      menores: {},
      mayores: {},
    };

    for (let i = 0; i < defecto_.defectos.menores.defectos.length; i++) {
      this.defectos_.push(defecto_.defectos.menores.defectos[i]);
    }

    for (let i = 0; i < defecto_.defectos.mayores.defectos.length; i++) {
      this.defectos_.push(defecto_.defectos.mayores.defectos[i]);
    }

    this.add_defecto = true;
    this.gestion = false;
  };
}
